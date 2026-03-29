"""
Server CRUD endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
from models import Server, ServerMetric, User
from schemas import ServerCreate, ServerUpdate, ServerResponse, MetricResponse
from auth import get_current_user, require_admin

router = APIRouter(prefix="/api/servers", tags=["Servers"])


@router.get("", response_model=List[ServerResponse])
def list_servers(db: Session = Depends(get_db)):
    servers = db.query(Server).order_by(Server.name).all()
    return servers


@router.get("/{server_id}", response_model=ServerResponse)
def get_server(server_id: int, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    return server


@router.get("/{server_id}/metrics", response_model=List[MetricResponse])
def get_server_metrics(server_id: int, limit: int = 50, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    metrics = (
        db.query(ServerMetric)
        .filter(ServerMetric.server_id == server_id)
        .order_by(ServerMetric.timestamp.desc())
        .limit(limit)
        .all()
    )
    return metrics


@router.post("", response_model=ServerResponse, status_code=201)
def create_server(
    data: ServerCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    # Check for duplicate name
    existing = db.query(Server).filter(Server.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Server name already exists")

    server = Server(
        name=data.name,
        ip_address=data.ip_address,
        latitude=data.latitude,
        longitude=data.longitude,
        location_name=data.location_name,
        airport_code=data.airport_code,
        description=data.description,
        status="active",
        health_score=100,
        last_heartbeat=datetime.utcnow(),
    )
    db.add(server)
    db.commit()
    db.refresh(server)
    return server


@router.put("/{server_id}", response_model=ServerResponse)
def update_server(
    server_id: int,
    data: ServerUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(server, key, value)

    db.commit()
    db.refresh(server)
    return server


@router.delete("/{server_id}", status_code=204)
def delete_server(
    server_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    db.delete(server)
    db.commit()
