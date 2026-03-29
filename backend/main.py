"""
FastAPI application entry point.
Initializes database, starts simulator and AI engine, registers routes.
"""
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS, SIMULATOR_ENABLED, DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD
from database import init_db, SessionLocal
from models import User
from auth import hash_password
from simulator import simulator, seed_servers
from ai_engine import ai_engine
from websocket_manager import manager

from routers import auth_router, servers, status, alerts, analytics, export

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    logger.info("=" * 60)
    logger.info("  AAI Aviation Server Tracker — Starting Up")
    logger.info("=" * 60)

    # Initialize database
    init_db()
    logger.info("Database initialized")

    # Create default admin user
    db = SessionLocal()
    admin = db.query(User).filter(User.username == DEFAULT_ADMIN_USERNAME).first()
    if not admin:
        admin = User(
            username=DEFAULT_ADMIN_USERNAME,
            password_hash=hash_password(DEFAULT_ADMIN_PASSWORD),
            role="admin",
        )
        db.add(admin)
        db.commit()
        logger.info(f"Default admin user created: {DEFAULT_ADMIN_USERNAME}")

    # Also create an operator user for demo
    operator = db.query(User).filter(User.username == "operator").first()
    if not operator:
        operator = User(
            username="operator",
            password_hash=hash_password("operator123"),
            role="operator",
        )
        db.add(operator)
        db.commit()
        logger.info("Default operator user created: operator")

    # Seed servers
    seed_servers(db)
    db.close()

    # Start background tasks
    tasks = []
    if SIMULATOR_ENABLED:
        sim_task = asyncio.create_task(simulator.run())
        tasks.append(sim_task)
        logger.info("Server simulator started")

    ai_task = asyncio.create_task(ai_engine.run())
    tasks.append(ai_task)
    logger.info("AI engine started")

    yield

    # Shutdown
    logger.info("Shutting down...")
    simulator.stop()
    ai_engine.stop()
    for task in tasks:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
    logger.info("Shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="AAI Aviation Server Tracker API",
    description="AI-powered aviation server monitoring and failure prediction system",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router.router)
app.include_router(servers.router)
app.include_router(status.router)
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(export.router)


# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, receive any client messages
            data = await websocket.receive_text()
            # Client can send ping messages to keep alive
            if data == "ping":
                await websocket.send_text('{"type":"pong"}')
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


# Health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AAI Aviation Server Tracker",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
