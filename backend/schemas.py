"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6)
    role: str = "operator"


# ─── Server ──────────────────────────────────────────────────────
class ServerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    ip_address: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    location_name: str
    airport_code: Optional[str] = None
    description: Optional[str] = None

class ServerUpdate(BaseModel):
    name: Optional[str] = None
    ip_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    airport_code: Optional[str] = None
    description: Optional[str] = None

class ServerResponse(BaseModel):
    id: int
    name: str
    ip_address: str
    latitude: float
    longitude: float
    location_name: str
    airport_code: Optional[str]
    description: Optional[str]
    status: str
    health_score: int
    last_heartbeat: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Metric ──────────────────────────────────────────────────────
class MetricResponse(BaseModel):
    id: int
    server_id: int
    latency_ms: float
    packet_loss: float
    uptime_percent: float
    cpu_usage: float
    memory_usage: float
    response_time: float
    timestamp: datetime

    class Config:
        from_attributes = True


# ─── Alert ───────────────────────────────────────────────────────
class AlertResponse(BaseModel):
    id: int
    server_id: int
    server_name: Optional[str] = None
    severity: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Incident ───────────────────────────────────────────────────
class IncidentResponse(BaseModel):
    id: int
    server_id: int
    server_name: Optional[str] = None
    started_at: datetime
    resolved_at: Optional[datetime]
    duration_seconds: Optional[int]
    description: Optional[str]

    class Config:
        from_attributes = True


# ─── Analytics ───────────────────────────────────────────────────
class AnalyticsSummary(BaseModel):
    total_servers: int
    active_count: int
    down_count: int
    warning_count: int
    maintenance_count: int
    avg_uptime: float
    avg_latency: float
    total_alerts: int
    critical_alerts: int

class UptimeTrendPoint(BaseModel):
    timestamp: str
    uptime_percent: float
    active_count: int
    total_count: int

class LatencyTrendPoint(BaseModel):
    timestamp: str
    avg_latency: float
    max_latency: float
    min_latency: float

class FailureFrequency(BaseModel):
    server_name: str
    server_id: int
    failure_count: int
    last_failure: Optional[str]


# ─── AI Insights ─────────────────────────────────────────────────
class AIInsight(BaseModel):
    server_id: int
    server_name: str
    insight_type: str  # prediction, recommendation, anomaly
    message: str
    severity: str
    confidence: float
    timestamp: str


# ─── WebSocket Messages ─────────────────────────────────────────
class WSMessage(BaseModel):
    type: str  # status_update, new_alert, metric_update, ai_insight
    data: dict
