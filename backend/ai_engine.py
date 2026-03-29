"""
AI-powered anomaly detection engine using Isolation Forest.
Analyzes server metrics to predict failures and generate insights.
"""
import asyncio
import logging
import numpy as np
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sklearn.ensemble import IsolationForest
from database import SessionLocal
from models import Server, ServerMetric, Alert
from websocket_manager import manager
from config import AI_ANALYSIS_INTERVAL

logger = logging.getLogger(__name__)


class AIEngine:
    """
    Uses Isolation Forest to detect anomalous server behavior.
    Generates predictions and maintenance recommendations.
    """

    def __init__(self):
        self.models = {}  # server_id -> trained IsolationForest
        self._running = False
        self.insights = []  # Latest insights cache

    def _get_feature_matrix(self, metrics: List[ServerMetric]) -> Optional[np.ndarray]:
        """Convert metrics to feature matrix for ML."""
        if len(metrics) < 5:
            return None

        features = []
        for m in metrics:
            features.append([
                m.latency_ms,
                m.packet_loss,
                m.cpu_usage,
                m.memory_usage,
                m.response_time,
            ])

        return np.array(features)

    def _train_model(self, server_id: int, db: Session):
        """Train/retrain Isolation Forest for a server."""
        # Get last 200 metrics for training
        metrics = (
            db.query(ServerMetric)
            .filter(ServerMetric.server_id == server_id)
            .order_by(ServerMetric.timestamp.desc())
            .limit(200)
            .all()
        )

        X = self._get_feature_matrix(metrics)
        if X is None:
            return

        model = IsolationForest(
            n_estimators=100,
            contamination=0.1,
            random_state=42,
        )
        model.fit(X)
        self.models[server_id] = model

    def _predict_anomaly(self, server_id: int, latest_metrics: List[ServerMetric]) -> dict:
        """
        Analyze latest metrics for anomalies.
        Returns: {is_anomaly, score, confidence, trend}
        """
        model = self.models.get(server_id)
        if model is None or len(latest_metrics) < 3:
            return {"is_anomaly": False, "score": 0, "confidence": 0, "trend": "stable"}

        X = self._get_feature_matrix(latest_metrics)
        if X is None:
            return {"is_anomaly": False, "score": 0, "confidence": 0, "trend": "stable"}

        # Get anomaly scores (-1 = anomaly, 1 = normal)
        scores = model.decision_function(X)
        predictions = model.predict(X)

        # Analyze the latest few points
        latest_scores = scores[-3:]
        avg_score = float(np.mean(latest_scores))
        is_anomaly = int(np.sum(predictions[-3:] == -1)) >= 2

        # Determine trend
        if len(scores) >= 5:
            recent = np.mean(scores[-3:])
            older = np.mean(scores[-6:-3]) if len(scores) >= 6 else np.mean(scores[:3])
            if recent < older - 0.1:
                trend = "degrading"
            elif recent > older + 0.1:
                trend = "improving"
            else:
                trend = "stable"
        else:
            trend = "stable"

        confidence = min(1.0, max(0.0, 1.0 - (avg_score + 0.5)))

        return {
            "is_anomaly": is_anomaly,
            "score": round(float(avg_score), 4),
            "confidence": round(confidence, 2),
            "trend": trend,
        }

    def _calculate_failure_time(self, server_id: int, db: Session) -> Optional[int]:
        """
        Estimate minutes until failure based on degradation rate.
        Returns estimated minutes or None if no concern.
        """
        metrics = (
            db.query(ServerMetric)
            .filter(ServerMetric.server_id == server_id)
            .order_by(ServerMetric.timestamp.desc())
            .limit(10)
            .all()
        )

        if len(metrics) < 5:
            return None

        # Check latency trend
        latencies = [m.latency_ms for m in reversed(metrics)]
        if len(latencies) < 5:
            return None

        # Calculate rate of increase
        diffs = [latencies[i+1] - latencies[i] for i in range(len(latencies)-1)]
        avg_increase = np.mean(diffs)

        if avg_increase <= 0:
            return None

        # Estimate time to reach critical latency (>300ms)
        current_latency = latencies[-1]
        if current_latency >= 300:
            return 0  # Already critical

        remaining = 300 - current_latency
        ticks_to_failure = remaining / avg_increase if avg_increase > 0 else float('inf')
        minutes = int(ticks_to_failure * (AI_ANALYSIS_INTERVAL / 60))

        if minutes > 120:
            return None  # Too far out to predict
        return max(1, minutes)

    def _generate_recommendation(self, server, metrics_data, anomaly_result) -> str:
        """Generate actionable maintenance recommendation."""
        recs = []

        if metrics_data.get("avg_latency", 0) > 100:
            recs.append("Check network connectivity and bandwidth allocation")

        if metrics_data.get("avg_cpu", 0) > 70:
            recs.append("Investigate high CPU usage — possible runaway process")

        if metrics_data.get("avg_memory", 0) > 80:
            recs.append("Memory usage critical — consider restarting services or adding resources")

        if metrics_data.get("avg_packet_loss", 0) > 5:
            recs.append("High packet loss detected — inspect physical connections and switches")

        if anomaly_result["trend"] == "degrading":
            recs.append("Server showing degradation pattern — schedule preventive maintenance")

        if not recs:
            recs.append("Server operating within normal parameters")

        return "; ".join(recs)

    async def analyze(self):
        """Run one analysis cycle across all servers."""
        try:
            db = SessionLocal()
            servers = db.query(Server).all()
            new_insights = []

            for server in servers:
                # Train/retrain model periodically
                if server.id not in self.models:
                    self._train_model(server.id, db)

                # Get latest metrics for analysis
                recent_metrics = (
                    db.query(ServerMetric)
                    .filter(ServerMetric.server_id == server.id)
                    .order_by(ServerMetric.timestamp.desc())
                    .limit(20)
                    .all()
                )

                if len(recent_metrics) < 3:
                    continue

                # Run anomaly detection
                anomaly = self._predict_anomaly(server.id, recent_metrics)

                # Calculate averages
                avg_latency = np.mean([m.latency_ms for m in recent_metrics[:5]])
                avg_cpu = np.mean([m.cpu_usage for m in recent_metrics[:5]])
                avg_memory = np.mean([m.memory_usage for m in recent_metrics[:5]])
                avg_packet_loss = np.mean([m.packet_loss for m in recent_metrics[:5]])

                metrics_data = {
                    "avg_latency": avg_latency,
                    "avg_cpu": avg_cpu,
                    "avg_memory": avg_memory,
                    "avg_packet_loss": avg_packet_loss,
                }

                # Get failure prediction
                failure_minutes = self._calculate_failure_time(server.id, db)

                now_str = datetime.utcnow().isoformat()

                # Generate insights
                if anomaly["is_anomaly"]:
                    severity = "critical" if anomaly["confidence"] > 0.7 else "medium"
                    insight = {
                        "server_id": server.id,
                        "server_name": server.name,
                        "insight_type": "anomaly",
                        "message": f"Anomalous behavior detected — latency: {avg_latency:.0f}ms, packet loss: {avg_packet_loss:.1f}%, confidence: {anomaly['confidence']*100:.0f}%",
                        "severity": severity,
                        "confidence": anomaly["confidence"],
                        "timestamp": now_str,
                    }
                    new_insights.append(insight)

                    # Create alert if high confidence
                    if anomaly["confidence"] > 0.6:
                        alert = Alert(
                            server_id=server.id,
                            severity=severity,
                            message=f"AI detected anomaly on {server.name}: {insight['message']}",
                        )
                        db.add(alert)

                if failure_minutes is not None and failure_minutes < 60:
                    insight = {
                        "server_id": server.id,
                        "server_name": server.name,
                        "insight_type": "prediction",
                        "message": f"Server likely to fail in ~{failure_minutes} minutes based on degradation trend",
                        "severity": "critical" if failure_minutes < 10 else "medium",
                        "confidence": min(0.95, 0.5 + (1 - failure_minutes / 60) * 0.45),
                        "timestamp": now_str,
                    }
                    new_insights.append(insight)

                # Always generate a recommendation for degrading servers
                if anomaly["trend"] == "degrading" or server.health_score < 70:
                    rec = self._generate_recommendation(server, metrics_data, anomaly)
                    insight = {
                        "server_id": server.id,
                        "server_name": server.name,
                        "insight_type": "recommendation",
                        "message": rec,
                        "severity": "low" if server.health_score > 50 else "medium",
                        "confidence": 0.8,
                        "timestamp": now_str,
                    }
                    new_insights.append(insight)

            db.commit()
            db.close()

            # Update cached insights
            self.insights = new_insights

            # Broadcast insights via WebSocket
            if new_insights:
                await manager.send_ai_insight({
                    "insights": new_insights,
                    "analyzed_at": datetime.utcnow().isoformat(),
                })

        except Exception as e:
            logger.error(f"AI analysis error: {e}")
            try:
                db.close()
            except Exception:
                pass

    async def run(self):
        """Main AI analysis loop."""
        self._running = True
        logger.info("AI Engine started")

        # Wait for some data to accumulate
        await asyncio.sleep(20)

        while self._running:
            await self.analyze()
            # Retrain models every 10 cycles
            if random.random() < 0.1:
                try:
                    db = SessionLocal()
                    servers = db.query(Server).all()
                    for server in servers:
                        self._train_model(server.id, db)
                    db.close()
                    logger.info("AI models retrained")
                except Exception as e:
                    logger.error(f"Retrain error: {e}")

            await asyncio.sleep(AI_ANALYSIS_INTERVAL)

    def stop(self):
        self._running = False

    def get_latest_insights(self):
        return self.insights


# Need to import random at the top
import random

# Singleton
ai_engine = AIEngine()
