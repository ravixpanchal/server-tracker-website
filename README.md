# AAI Aviation Server Location Tracker & Monitoring Dashboard

> **✅ Project Status: COMPLETE** — This project has been fully built and deployed.

## 📖 What is this Project?
The **AAI Server Tracker** is an AI-powered, full-stack monitoring web application designed specifically for the **Airports Authority of India (AAI)**. It acts as a centralized dashboard to track the health, latency, and status of critical aviation servers—such as Air Traffic Control (ATC), CNS Radar, and Digi Yatra nodes—distributed across major airports in India. 

## 🎯 Why We Made It
Aviation IT infrastructure is highly complex and geographically scattered. Relying on manual checks or disconnected monitoring tools creates the risk of undetected system degradation, which can severely impact airport operations. We built this platform to unify all incoming server telemetry into a single, highly visual, and modern "pane of glass" that is specifically tailored for aviation administrators.

## 🛠️ Problems Resolved by this Website
- **Unexpected Downtime:** Utilizes an integrated AI engine to detect anomalies and predict server failures *before* they lead to a complete crash.
- **Geographic Fragmentation:** Features an interactive real-time map of India, making it effortless to see exactly *where* the physical infrastructure is experiencing issues.
- **Reactive Maintenance:** Shifts IT management from reactive (fixing broken servers) to proactive (servicing degrading servers) through AI Insights and weighted Health Scores.
- **Alert Fatigue:** Replaces overwhelming raw terminal logs with intuitive, severity-coded visual alerts and actionable metric recommendations.

## 🚀 Features Inside This Project

- **Real-time Server Monitoring** — Heartbeat mechanism with 8-second intervals
- **AI-Based Failure Detection** — Isolation Forest anomaly detection with failure prediction
- **Interactive Map Dashboard** — Leaflet map showing 16 Indian airport servers
- **Alert System** — Severity-coded alerts (Low / Medium / Critical)
- **Dashboard Analytics** — Uptime trends, latency charts, failure frequency
- **Data Export** — CSV and Excel (.xlsx) download
- **Dark/Light Theme** — Aviation-style IndiGo-inspired UI
- **JWT Authentication** — Admin and Operator roles
- **WebSocket Live Updates** — Real-time dashboard without page refresh
- **Incident History** — Timeline view of all outages
- **AI Insights** — Predictive maintenance recommendations

## 📸 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Recharts, Leaflet |
| Backend | Python FastAPI, SQLAlchemy |
| Database | SQLite (easily switchable to PostgreSQL) |
| AI Module | scikit-learn (Isolation Forest) |
| Real-time | WebSockets |
| Auth | JWT + bcrypt |

## 🏗️ Project Structure

```
Code/
├── backend/          # FastAPI backend
│   ├── main.py       # App entry point
│   ├── models.py     # Database models
│   ├── simulator.py  # Server heartbeat simulator
│   ├── ai_engine.py  # Anomaly detection AI
│   └── routers/      # API endpoints
├── frontend/         # React + Vite frontend
│   └── src/
│       ├── pages/        # Route pages
│       ├── components/   # UI components
│       ├── contexts/     # Auth & Theme
│       └── hooks/        # WebSocket hook
├── legacy/           # Previous prototype code
└── device_log.csv    # Historical device log data
```

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux

# Run the server
uvicorn main:app --reload --port 8000
```

The backend will:
1. Initialize the SQLite database
2. Create default admin/operator users
3. Seed 16 Indian airport servers
4. Start the server simulator (heartbeats every 8s)
5. Start the AI anomaly detection engine

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs at `http://localhost:5173` with API proxy to backend.

### Default Login Credentials

| Role | Username | Password |
|---|---|---|
| Admin | admin | admin123 |
| Operator | operator | operator123 |

**Admin** can add/edit/delete servers. **Operator** has read-only monitoring access.

## 🗺️ Monitored Servers

16 servers across major Indian airports:

| Code | Airport | Servers |
|---|---|---|
| VNS | Lal Bahadur Shastri (Varanasi) | ATC, CNS Radar, Digi Yatra |
| DEL | Indira Gandhi International | ATC, CNS Comm, Digi Yatra |
| BOM | CSIA Mumbai | ATC, Digi Yatra |
| BLR | Kempegowda International | ATC |
| MAA | Chennai International | CNS Radar |
| CCU | NSCBI Kolkata | ATC |
| HYD | RGIA Hyderabad | ATC |
| AMD | SVPI Ahmedabad | Digi Yatra |
| JAI | Jaipur International | CNS Comm |
| LKO | CCS Lucknow | ATC |
| GOI | Manohar International Goa | CNS Radar |

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | JWT login |
| GET | /api/servers | List all servers |
| POST | /api/servers | Add server (Admin) |
| GET | /api/status | Live server status |
| GET | /api/alerts | Fetch alerts |
| GET | /api/analytics/summary | Dashboard metrics |
| GET | /api/analytics/ai-insights | AI predictions |
| GET | /api/export/csv | Download CSV |
| GET | /api/export/excel | Download Excel |
| WS | /ws | WebSocket real-time updates |

## 🧠 AI Module

The AI engine uses **Isolation Forest** for anomaly detection:

- **Features**: latency, packet loss, CPU usage, memory usage, response time
- **Training**: Auto-trained on accumulated server metrics
- **Predictions**: Estimates time-to-failure based on degradation trends
- **Recommendations**: Generates actionable maintenance suggestions
- **Health Score**: 0-100 score per server based on weighted metrics

## 🎨 Design

- **IndiGo-inspired** clean blue/white aviation theme
- **Dark mode** with smooth transitions
- **Glassmorphism** card effects
- **Animated pulse** indicators for server status
- **Responsive** layout with collapsible sidebar
- **Google Inter** font family

## 📦 Deployment

### Frontend → Vercel/Netlify
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend → Render/Railway
```bash
# Set environment variables on platform
# Use: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Database → Supabase/Neon
Update `DATABASE_URL` in `.env` to PostgreSQL connection string.

## 🔮 Future Roadmap (What We Will Add)

- **Automated Remediation:** Allow the AI engine to not just alert operators, but automatically trigger scripts to restart services or reroute network traffic from failing nodes.
- **Advanced Role-Based Access (RBAC):** Introduce region-specific permissions (e.g., an Admin who can exclusively manage Southern India or specific airport terminal servers).
- **Native Mobile Application:** Deploy a dedicated mobile app (via PWA or React Native) to push critical high-severity outage notifications directly to operator smartphones.
- **Extended Log Integrations:** Direct data integration with hardware switches and Air Traffic Services Interfacility Data Communications (AIDC) logs for deeper operational context.
- **Automated PDF Reports:** Auto-generated weekly and monthly PDF summaries detailing uptime history, AI prediction accuracy, and incident post-mortems for AAI stakeholders.

## 📬 Contact

Have questions, suggestions, or want to collaborate? Feel free to reach out!

**Ravi Panchal**
📧 [ravi.panchal.kaithi@gmail.com](mailto:ravi.panchal.kaithi@gmail.com)

---

## 📄 License

Built as an internship project for AAI server monitoring.