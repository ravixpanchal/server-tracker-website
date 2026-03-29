"""
Alert management endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Alert, Server
from schemas import AlertResponse

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("/unread-count")
def unread_count(db: Session = Depends(get_db)):
    count = db.query(Alert).filter(Alert.is_read == False).count()
    return {"count": count}


@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Alert).filter(Alert.is_read == False).update({"is_read": True})
    db.commit()
    return {"status": "ok"}


@router.get("", response_model=List[AlertResponse])
def get_alerts(
    severity: Optional[str] = None,
    is_read: Optional[bool] = None,
    limit: int = Query(default=100, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Alert).join(Server)

    if severity:
        query = query.filter(Alert.severity == severity)
    if is_read is not None:
        query = query.filter(Alert.is_read == is_read)

    alerts = query.order_by(Alert.created_at.desc()).limit(limit).all()

    result = []
    for alert in alerts:
        server = db.query(Server).filter(Server.id == alert.server_id).first()
        result.append(AlertResponse(
            id=alert.id,
            server_id=alert.server_id,
            server_name=server.name if server else "Unknown",
            severity=alert.severity,
            message=alert.message,
            is_read=alert.is_read,
            created_at=alert.created_at,
        ))
    return result


@router.put("/{alert_id}/read")
def mark_alert_read(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_read = True
    db.commit()
    return {"status": "ok"}


@router.delete("/{alert_id}", status_code=204)
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
