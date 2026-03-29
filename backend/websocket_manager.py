"""
WebSocket connection manager for real-time updates.
"""
import json
import logging
from typing import List
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections and broadcasts."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Send a message to all connected clients."""
        dead_connections = []
        message_str = json.dumps(message, default=str)

        for connection in self.active_connections:
            try:
                await connection.send_text(message_str)
            except Exception:
                dead_connections.append(connection)

        # Clean up dead connections
        for conn in dead_connections:
            self.disconnect(conn)

    async def send_status_update(self, server_data: dict):
        await self.broadcast({
            "type": "status_update",
            "data": server_data,
        })

    async def send_new_alert(self, alert_data: dict):
        await self.broadcast({
            "type": "new_alert",
            "data": alert_data,
        })

    async def send_metric_update(self, metric_data: dict):
        await self.broadcast({
            "type": "metric_update",
            "data": metric_data,
        })

    async def send_ai_insight(self, insight_data: dict):
        await self.broadcast({
            "type": "ai_insight",
            "data": insight_data,
        })


# Singleton instance
manager = ConnectionManager()
