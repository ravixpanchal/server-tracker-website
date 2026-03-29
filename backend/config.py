"""
Application configuration loaded from environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aviation_tracker.db")

# JWT
JWT_SECRET = os.getenv("JWT_SECRET", "aai-aviation-tracker-secret-key-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

# CORS
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,https://aai-server-tracker-website.onrender.com"
).split(",")

# Simulator
SIMULATOR_INTERVAL = int(os.getenv("SIMULATOR_INTERVAL", "8"))  # seconds between heartbeats
SIMULATOR_ENABLED = os.getenv("SIMULATOR_ENABLED", "true").lower() == "true"

# AI Engine
AI_ANALYSIS_INTERVAL = int(os.getenv("AI_ANALYSIS_INTERVAL", "30"))  # seconds between AI runs

# Default admin credentials (for initial setup)
DEFAULT_ADMIN_USERNAME = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
