"""
SQLAlchemy ORM models for the aviation server tracker.
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from database import Base
import enum


class ServerStatus(str, enum.Enum):
    ACTIVE = "active"
    DOWN = "down"
    WARNING = "warning"
    MAINTENANCE = "maintenance"
    DISCONNECTED = "disconnected"


class AlertSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    CRITICAL = "critical"


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    OPERATOR = "operator"


class Server(Base):
    __tablename__ = "servers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    ip_address = Column(String(45), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(200), nullable=False)
    airport_code = Column(String(10), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), default=ServerStatus.ACTIVE.value)
    health_score = Column(Integer, default=100)  # 0–100
    last_heartbeat = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    metrics = relationship("ServerMetric", back_populates="server", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="server", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="server", cascade="all, delete-orphan")


class ServerMetric(Base):
    __tablename__ = "server_metrics"

    id = Column(Integer, primary_key=True, index=True)
    server_id = Column(Integer, ForeignKey("servers.id", ondelete="CASCADE"), nullable=False)
    latency_ms = Column(Float, default=0.0)
    packet_loss = Column(Float, default=0.0)  # percentage 0–100
    uptime_percent = Column(Float, default=100.0)
    cpu_usage = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    response_time = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    server = relationship("Server", back_populates="metrics")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    server_id = Column(Integer, ForeignKey("servers.id", ondelete="CASCADE"), nullable=False)
    severity = Column(String(20), default=AlertSeverity.LOW.value)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    server = relationship("Server", back_populates="alerts")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    server_id = Column(Integer, ForeignKey("servers.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)

    server = relationship("Server", back_populates="incidents")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.OPERATOR.value)
    created_at = Column(DateTime, default=datetime.utcnow)
