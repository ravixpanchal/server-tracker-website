"""
Live server status endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Server, ServerMetric

router = APIRouter(prefix="/api/status", tags=["Status"])


@router.get("")
def get_all_status(db: Session = Depends(get_db)):
    servers = db.query(Server).all()
    result = []
    for server in servers:
        latest_metric = (
            db.query(ServerMetric)
            .filter(ServerMetric.server_id == server.id)
            .order_by(ServerMetric.timestamp.desc())
            .first()
        )
        entry = {
            "id": server.id,
            "name": server.name,
            "ip_address": server.ip_address,
            "latitude": server.latitude,
            "longitude": server.longitude,
            "location_name": server.location_name,
            "airport_code": server.airport_code,
            "status": server.status,
            "health_score": server.health_score,
            "last_heartbeat": str(server.last_heartbeat) if server.last_heartbeat else None,
        }
        if latest_metric:
            entry.update({
                "latency_ms": latest_metric.latency_ms,
                "packet_loss": latest_metric.packet_loss,
                "uptime_percent": latest_metric.uptime_percent,
                "cpu_usage": latest_metric.cpu_usage,
                "memory_usage": latest_metric.memory_usage,
                "response_time": latest_metric.response_time,
            })
        else:
            entry.update({
                "latency_ms": 0, "packet_loss": 0, "uptime_percent": 100,
                "cpu_usage": 0, "memory_usage": 0, "response_time": 0,
            })
        result.append(entry)
    return result


@router.get("/{server_id}")
def get_server_status(server_id: int, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        return {"error": "Server not found"}

    latest_metric = (
        db.query(ServerMetric)
        .filter(ServerMetric.server_id == server.id)
        .order_by(ServerMetric.timestamp.desc())
        .first()
    )

    result = {
        "id": server.id,
        "name": server.name,
        "ip_address": server.ip_address,
        "status": server.status,
        "health_score": server.health_score,
        "last_heartbeat": str(server.last_heartbeat) if server.last_heartbeat else None,
    }
    if latest_metric:
        result.update({
            "latency_ms": latest_metric.latency_ms,
            "packet_loss": latest_metric.packet_loss,
            "uptime_percent": latest_metric.uptime_percent,
            "cpu_usage": latest_metric.cpu_usage,
            "memory_usage": latest_metric.memory_usage,
        })
    return result
