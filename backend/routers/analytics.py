"""
Analytics and metrics endpoints.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db
from models import Server, ServerMetric, Alert, Incident
from schemas import AnalyticsSummary
from ai_engine import ai_engine

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(db: Session = Depends(get_db)):
    total = db.query(Server).count()
    active = db.query(Server).filter(Server.status == "active").count()
    down = db.query(Server).filter(Server.status == "down").count()
    warning = db.query(Server).filter(Server.status == "warning").count()
    maintenance = db.query(Server).filter(Server.status == "maintenance").count()

    # Average uptime and latency from latest metrics
    avg_uptime = 0.0
    avg_latency = 0.0
    servers = db.query(Server).all()
    if servers:
        uptimes = []
        latencies = []
        for server in servers:
            metric = (
                db.query(ServerMetric)
                .filter(ServerMetric.server_id == server.id)
                .order_by(ServerMetric.timestamp.desc())
                .first()
            )
            if metric:
                uptimes.append(metric.uptime_percent)
                latencies.append(metric.latency_ms)
        if uptimes:
            avg_uptime = sum(uptimes) / len(uptimes)
        if latencies:
            avg_latency = sum(latencies) / len(latencies)

    total_alerts = db.query(Alert).count()
    critical_alerts = db.query(Alert).filter(Alert.severity == "critical", Alert.is_read == False).count()

    return AnalyticsSummary(
        total_servers=total,
        active_count=active,
        down_count=down,
        warning_count=warning,
        maintenance_count=maintenance,
        avg_uptime=round(avg_uptime, 2),
        avg_latency=round(avg_latency, 2),
        total_alerts=total_alerts,
        critical_alerts=critical_alerts,
    )


@router.get("/uptime-trend")
def uptime_trend(hours: int = Query(default=24, le=168), db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(hours=hours)
    servers = db.query(Server).all()

    # Get metrics grouped by time buckets (every 5 minutes)
    metrics = (
        db.query(ServerMetric)
        .filter(ServerMetric.timestamp >= since)
        .order_by(ServerMetric.timestamp.asc())
        .all()
    )

    # Group by 5-minute buckets
    buckets = {}
    for m in metrics:
        bucket_key = m.timestamp.strftime("%Y-%m-%d %H:%M")
        # Round to nearest 5 minutes
        minute = (m.timestamp.minute // 5) * 5
        bucket_key = m.timestamp.strftime(f"%Y-%m-%d %H:{minute:02d}")

        if bucket_key not in buckets:
            buckets[bucket_key] = {"uptimes": [], "total": 0, "active": 0}
        buckets[bucket_key]["uptimes"].append(m.uptime_percent)
        buckets[bucket_key]["total"] += 1
        if m.uptime_percent > 50:
            buckets[bucket_key]["active"] += 1

    result = []
    total_servers = len(servers) if servers else 1
    for ts, data in sorted(buckets.items()):
        avg_up = sum(data["uptimes"]) / len(data["uptimes"]) if data["uptimes"] else 0
        result.append({
            "timestamp": ts,
            "uptime_percent": round(avg_up, 2),
            "active_count": data["active"],
            "total_count": total_servers,
        })

    return result


@router.get("/latency-trend")
def latency_trend(hours: int = Query(default=24, le=168), db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(hours=hours)

    metrics = (
        db.query(ServerMetric)
        .filter(ServerMetric.timestamp >= since)
        .order_by(ServerMetric.timestamp.asc())
        .all()
    )

    buckets = {}
    for m in metrics:
        minute = (m.timestamp.minute // 5) * 5
        bucket_key = m.timestamp.strftime(f"%Y-%m-%d %H:{minute:02d}")

        if bucket_key not in buckets:
            buckets[bucket_key] = []
        buckets[bucket_key].append(m.latency_ms)

    result = []
    for ts, lats in sorted(buckets.items()):
        result.append({
            "timestamp": ts,
            "avg_latency": round(sum(lats) / len(lats), 2),
            "max_latency": round(max(lats), 2),
            "min_latency": round(min(lats), 2),
        })

    return result


@router.get("/failure-frequency")
def failure_frequency(db: Session = Depends(get_db)):
    servers = db.query(Server).all()
    result = []
    for server in servers:
        count = db.query(Incident).filter(Incident.server_id == server.id).count()
        last_incident = (
            db.query(Incident)
            .filter(Incident.server_id == server.id)
            .order_by(Incident.started_at.desc())
            .first()
        )
        result.append({
            "server_name": server.name,
            "server_id": server.id,
            "failure_count": count,
            "last_failure": str(last_incident.started_at) if last_incident else None,
        })

    result.sort(key=lambda x: x["failure_count"], reverse=True)
    return result


@router.get("/incidents")
def get_incidents(limit: int = Query(default=50, le=200), db: Session = Depends(get_db)):
    incidents = (
        db.query(Incident)
        .order_by(Incident.started_at.desc())
        .limit(limit)
        .all()
    )

    result = []
    for inc in incidents:
        server = db.query(Server).filter(Server.id == inc.server_id).first()
        result.append({
            "id": inc.id,
            "server_id": inc.server_id,
            "server_name": server.name if server else "Unknown",
            "started_at": str(inc.started_at),
            "resolved_at": str(inc.resolved_at) if inc.resolved_at else None,
            "duration_seconds": inc.duration_seconds,
            "description": inc.description,
        })
    return result


@router.get("/ai-insights")
def get_ai_insights():
    return ai_engine.get_latest_insights()
