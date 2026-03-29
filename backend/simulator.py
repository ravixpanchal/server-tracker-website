"""
Realistic server heartbeat simulator for aviation infrastructure.
Simulates 15+ airport servers across India with realistic failure patterns.
"""
import asyncio
import random
import logging
import math
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Server, ServerMetric, Alert, Incident
from websocket_manager import manager
from config import SIMULATOR_INTERVAL

logger = logging.getLogger(__name__)

# ─── Seed Data ───────────────────────────────────────────────────
AIRPORT_SERVERS = [
    {"name": "VNS-ATC-PRIME", "ip": "10.10.1.1", "lat": 25.4520, "lon": 82.8590,
     "location": "Varanasi (Banaras) Airport - ATC Tower", "code": "VNS",
     "desc": "Primary Air Traffic Control server at Lal Bahadur Shastri International Airport"},
    {"name": "VNS-CNS-RADAR", "ip": "10.10.1.2", "lat": 25.4525, "lon": 82.8600,
     "location": "Varanasi Airport - CNS Block", "code": "VNS",
     "desc": "Communication, Navigation & Surveillance radar system server"},
    {"name": "VNS-DIGI-YATRA", "ip": "10.10.1.3", "lat": 25.4518, "lon": 82.8585,
     "location": "Varanasi Airport - Terminal Building", "code": "VNS",
     "desc": "Digi Yatra biometric processing server"},
    {"name": "DEL-ATC-PRIME", "ip": "10.20.1.1", "lat": 28.5562, "lon": 77.1000,
     "location": "Delhi IGI Airport - ATC Complex", "code": "DEL",
     "desc": "Primary ATC server at Indira Gandhi International Airport"},
    {"name": "DEL-CNS-COMM", "ip": "10.20.1.2", "lat": 28.5565, "lon": 77.1005,
     "location": "Delhi IGI Airport - CNS Wing", "code": "DEL",
     "desc": "CNS communication relay server handling VHF/HF systems"},
    {"name": "DEL-DIGI-YATRA", "ip": "10.20.1.3", "lat": 28.5560, "lon": 77.0995,
     "location": "Delhi IGI Airport - Terminal 3", "code": "DEL",
     "desc": "Digi Yatra facial recognition server at Terminal 3"},
    {"name": "BOM-ATC-PRIME", "ip": "10.30.1.1", "lat": 19.0896, "lon": 72.8656,
     "location": "Mumbai CSIA - ATC Tower", "code": "BOM",
     "desc": "Primary ATC server at Chhatrapati Shivaji Maharaj International Airport"},
    {"name": "BOM-DIGI-YATRA", "ip": "10.30.1.2", "lat": 19.0900, "lon": 72.8660,
     "location": "Mumbai CSIA - Terminal 2", "code": "BOM",
     "desc": "Digi Yatra biometric server for Terminal 2 operations"},
    {"name": "BLR-ATC-PRIME", "ip": "10.40.1.1", "lat": 13.1986, "lon": 77.7066,
     "location": "Bangalore KIA - ATC Block", "code": "BLR",
     "desc": "Primary ATC server at Kempegowda International Airport"},
    {"name": "MAA-CNS-RADAR", "ip": "10.50.1.1", "lat": 12.9941, "lon": 80.1709,
     "location": "Chennai Airport - Radar Station", "code": "MAA",
     "desc": "Radar and surveillance systems server at Chennai International Airport"},
    {"name": "CCU-ATC-PRIME", "ip": "10.60.1.1", "lat": 22.6547, "lon": 88.4467,
     "location": "Kolkata NSCBI - ATC Tower", "code": "CCU",
     "desc": "Primary ATC server at Netaji Subhas Chandra Bose International Airport"},
    {"name": "HYD-ATC-PRIME", "ip": "10.70.1.1", "lat": 17.2403, "lon": 78.4294,
     "location": "Hyderabad RGIA - ATC Complex", "code": "HYD",
     "desc": "Primary ATC at Rajiv Gandhi International Airport"},
    {"name": "AMD-DIGI-YATRA", "ip": "10.80.1.1", "lat": 23.0772, "lon": 72.6347,
     "location": "Ahmedabad SVPI - Terminal", "code": "AMD",
     "desc": "Digi Yatra server at Sardar Vallabhbhai Patel International Airport"},
    {"name": "JAI-CNS-COMM", "ip": "10.90.1.1", "lat": 26.8242, "lon": 75.8122,
     "location": "Jaipur Airport - CNS Room", "code": "JAI",
     "desc": "CNS communication server at Jaipur International Airport"},
    {"name": "LKO-ATC-PRIME", "ip": "10.100.1.1", "lat": 26.7606, "lon": 80.8893,
     "location": "Lucknow CBA - ATC Tower", "code": "LKO",
     "desc": "ATC server at Chaudhary Charan Singh International Airport"},
    {"name": "GOI-CNS-RADAR", "ip": "10.110.1.1", "lat": 15.3808, "lon": 73.8310,
     "location": "Goa Manohar Intl - Radar Station", "code": "GOI",
     "desc": "Radar/surveillance server at Manohar International Airport, Goa"},
]


class ServerSimulator:
    """
    Simulates realistic server behavior:
    - Normal operation with minor fluctuations
    - Gradual degradation before failure
    - Sudden failures
    - Auto-recovery
    """

    def __init__(self):
        # Per-server state tracking
        self.server_states = {}  # server_id -> state dict
        self._running = False

    def _init_server_state(self, server_id: int):
        """Initialize simulation state for a server."""
        self.server_states[server_id] = {
            "base_latency": random.uniform(5, 30),
            "degradation_factor": 0.0,  # 0 = healthy, 1 = failing
            "is_degrading": False,
            "degradation_start": None,
            "recovery_countdown": 0,
            "failure_probability": random.uniform(0.002, 0.015),  # per tick
            "ticks_since_failure": 0,
        }

    def _simulate_heartbeat(self, server_id: int) -> dict:
        """
        Generate realistic metric data for one server tick.
        Returns dict with latency_ms, packet_loss, cpu_usage, memory_usage, uptime, response_time, status.
        """
        state = self.server_states.get(server_id)
        if not state:
            self._init_server_state(server_id)
            state = self.server_states[server_id]

        state["ticks_since_failure"] += 1

        # ── Decide if degradation should start ──
        if not state["is_degrading"] and state["recovery_countdown"] <= 0:
            # Higher failure chance for servers that haven't failed recently
            adjusted_prob = state["failure_probability"]
            if state["ticks_since_failure"] > 50:
                adjusted_prob *= 1.5
            if random.random() < adjusted_prob:
                state["is_degrading"] = True
                state["degradation_factor"] = 0.1
                state["degradation_start"] = datetime.utcnow()

        # ── Progress degradation ──
        if state["is_degrading"]:
            state["degradation_factor"] = min(1.0, state["degradation_factor"] + random.uniform(0.05, 0.15))

            if state["degradation_factor"] >= 1.0:
                # Server is fully down
                state["is_degrading"] = False
                state["recovery_countdown"] = random.randint(5, 15)  # ticks until recovery
                state["ticks_since_failure"] = 0

        # ── Handle recovery ──
        if state["recovery_countdown"] > 0:
            state["recovery_countdown"] -= 1
            if state["recovery_countdown"] <= 0:
                state["degradation_factor"] = 0.0

        # ── Calculate metrics based on degradation ──
        df = state["degradation_factor"]
        base_lat = state["base_latency"]

        # Normal jitter
        jitter = random.gauss(0, 2)

        latency = base_lat + jitter + (df * random.uniform(100, 500))
        latency = max(1.0, latency)

        packet_loss = df * random.uniform(10, 60) + random.uniform(0, 0.5)
        packet_loss = min(100, max(0, packet_loss))

        cpu_usage = 15 + random.uniform(-5, 10) + (df * random.uniform(30, 60))
        cpu_usage = min(100, max(0, cpu_usage))

        memory_usage = 30 + random.uniform(-5, 8) + (df * random.uniform(20, 40))
        memory_usage = min(100, max(0, memory_usage))

        # Uptime flickers when degrading
        if state["recovery_countdown"] > 0 and df >= 1.0:
            uptime = 0.0
        elif df > 0.5:
            uptime = random.uniform(50, 80)
        else:
            uptime = 100.0 - (df * random.uniform(0, 10))

        response_time = latency * random.uniform(1.0, 1.3)

        # Determine status
        if state["recovery_countdown"] > 0 and state["degradation_factor"] >= 0.9:
            status = "down"
        elif df > 0.6:
            status = "warning"
        elif df > 0.3:
            status = "warning"
        else:
            status = "active"

        # Health score (0-100)
        health = int(100 - (df * 80) - (packet_loss * 0.2) - max(0, (latency - 50) * 0.1))
        health = max(0, min(100, health))

        return {
            "latency_ms": round(latency, 2),
            "packet_loss": round(packet_loss, 2),
            "cpu_usage": round(cpu_usage, 2),
            "memory_usage": round(memory_usage, 2),
            "uptime_percent": round(uptime, 2),
            "response_time": round(response_time, 2),
            "status": status,
            "health_score": health,
        }

    async def run(self):
        """Main simulation loop."""
        self._running = True
        logger.info("Server simulator started")

        while self._running:
            try:
                db = SessionLocal()
                servers = db.query(Server).all()

                for server in servers:
                    if server.id not in self.server_states:
                        self._init_server_state(server.id)

                    metrics = self._simulate_heartbeat(server.id)
                    now = datetime.utcnow()

                    # Save metric
                    metric = ServerMetric(
                        server_id=server.id,
                        latency_ms=metrics["latency_ms"],
                        packet_loss=metrics["packet_loss"],
                        uptime_percent=metrics["uptime_percent"],
                        cpu_usage=metrics["cpu_usage"],
                        memory_usage=metrics["memory_usage"],
                        response_time=metrics["response_time"],
                        timestamp=now,
                    )
                    db.add(metric)

                    # Track status transitions
                    old_status = server.status
                    new_status = metrics["status"]

                    server.status = new_status
                    server.health_score = metrics["health_score"]
                    server.last_heartbeat = now

                    # Generate alerts on status change
                    if old_status != new_status:
                        if new_status == "down":
                            alert = Alert(
                                server_id=server.id,
                                severity="critical",
                                message=f"Server {server.name} is DOWN — no heartbeat received",
                                created_at=now,
                            )
                            db.add(alert)
                            # Create incident
                            incident = Incident(
                                server_id=server.id,
                                started_at=now,
                                description=f"Server {server.name} went offline",
                            )
                            db.add(incident)
                            db.flush()
                            await manager.send_new_alert({
                                "id": alert.id,
                                "server_id": server.id,
                                "server_name": server.name,
                                "severity": "critical",
                                "message": alert.message,
                                "created_at": str(now),
                            })

                        elif new_status == "warning" and old_status == "active":
                            alert = Alert(
                                server_id=server.id,
                                severity="medium",
                                message=f"Server {server.name} showing degraded performance — high latency: {metrics['latency_ms']}ms",
                                created_at=now,
                            )
                            db.add(alert)
                            db.flush()
                            await manager.send_new_alert({
                                "id": alert.id,
                                "server_id": server.id,
                                "server_name": server.name,
                                "severity": "medium",
                                "message": alert.message,
                                "created_at": str(now),
                            })

                        elif new_status == "active" and old_status in ("down", "warning"):
                            # Resolve open incidents
                            open_incident = (
                                db.query(Incident)
                                .filter(Incident.server_id == server.id, Incident.resolved_at.is_(None))
                                .first()
                            )
                            if open_incident:
                                open_incident.resolved_at = now
                                delta = (now - open_incident.started_at).total_seconds()
                                open_incident.duration_seconds = int(delta)

                            alert = Alert(
                                server_id=server.id,
                                severity="low",
                                message=f"Server {server.name} has recovered and is back ONLINE",
                                created_at=now,
                            )
                            db.add(alert)
                            db.flush()
                            await manager.send_new_alert({
                                "id": alert.id,
                                "server_id": server.id,
                                "server_name": server.name,
                                "severity": "low",
                                "message": alert.message,
                                "created_at": str(now),
                            })

                    # Broadcast status update
                    await manager.send_status_update({
                        "server_id": server.id,
                        "name": server.name,
                        "status": new_status,
                        "health_score": metrics["health_score"],
                        "latency_ms": metrics["latency_ms"],
                        "packet_loss": metrics["packet_loss"],
                        "cpu_usage": metrics["cpu_usage"],
                        "memory_usage": metrics["memory_usage"],
                        "uptime_percent": metrics["uptime_percent"],
                        "last_heartbeat": str(now),
                    })

                db.commit()
                db.close()

            except Exception as e:
                logger.error(f"Simulator error: {e}")
                try:
                    db.close()
                except Exception:
                    pass

            await asyncio.sleep(SIMULATOR_INTERVAL)

    def stop(self):
        self._running = False


def seed_servers(db: Session):
    """Seed the database with initial airport servers if empty."""
    existing = db.query(Server).count()
    if existing > 0:
        logger.info(f"Database already has {existing} servers, skipping seed.")
        return

    logger.info("Seeding database with airport servers...")
    for srv in AIRPORT_SERVERS:
        server = Server(
            name=srv["name"],
            ip_address=srv["ip"],
            latitude=srv["lat"],
            longitude=srv["lon"],
            location_name=srv["location"],
            airport_code=srv["code"],
            description=srv["desc"],
            status="active",
            health_score=100,
            last_heartbeat=datetime.utcnow(),
        )
        db.add(server)

    db.commit()
    logger.info(f"Seeded {len(AIRPORT_SERVERS)} servers.")


# Singleton
simulator = ServerSimulator()
