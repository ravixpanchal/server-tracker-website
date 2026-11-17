# AAI Aviation Server Location Tracker & Monitoring Dashboard

The AAI Aviation Server Tracker is an internship project that demonstrates monitoring for airport infrastructure across India. It uses simulated telemetry for air traffic control, CNS radar, and Digi Yatra nodes. The dashboard shows server health, latency, location, alerts, and incident history.

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
- **Interactive Map** — Leaflet with CARTO Positron tiles and airport server markers
- **Alert System** — Severity-coded alerts (Low / Medium / Critical)
- **Dashboard Analytics** — Uptime trends, latency charts, failure frequency
- **Data Export** — CSV and Excel (.xlsx) download
- **Responsive UI** — IndiGo-inspired blue and white styling with matching Live Logs and simulated SSH terminal panels
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

- Python 3.11, matching the backend Docker image
- Node.js 24 LTS and npm

### 1. Start the backend

From the repository root, run:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

On Windows PowerShell, use `py -3.11 -m venv venv`, `.\venv\Scripts\Activate.ps1`, and `Copy-Item .env.example .env`. If `.env` already exists, keep your existing settings.

The backend initializes SQLite, creates the demo accounts, seeds airport servers, and starts the telemetry simulator and anomaly detection engine. Check [API health](http://127.0.0.1:8000/api/health) or open the [interactive API documentation](http://127.0.0.1:8000/docs).

### 2. Configure the map and start the frontend

Request a [CARTO Basemaps API key](https://carto.com/basemaps/apikey/) and restrict it to the hostname you will use locally, such as `127.0.0.1`. In the Git-ignored `frontend/.env.local`, set:

```dotenv
VITE_CARTO_BASEMAP_KEY=your_local_carto_key
```

From the repository root, open a second terminal and run:

```bash
cd frontend
npm ci
npm run dev -- --host 127.0.0.1
```

Open [the local tracker](http://127.0.0.1:5173/). Vite proxies API requests and WebSockets to port `8000`. If you run the backend on another port, start Vite with `API_PROXY_TARGET` set to that backend origin. Restart Vite after changing `.env.local`.

### Local demo credentials

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
| GET | /api/health | Backend health check |
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

The app uses a blue and white aviation palette, a navigation drawer on phones and tablets, and a collapsible sidebar on desktop. Server tables and the topology diagram scroll inside their panels when space is limited. Live Logs and the simulated SSH panel share a deep-indigo terminal theme.

## 📦 Deploy a free demo

Use the same GitHub repository for a Render Free Web Service and a Vercel Hobby project. Vercel Hobby is for personal, non-commercial use. [Vercel Hobby](https://vercel.com/docs/plans/hobby) · [Render Free](https://render.com/docs/free)

**Before sharing a public deployment**, disable the hardcoded demo operator or configure a unique password for it, and remove demo credentials from the sign-in page. The telemetry WebSocket currently accepts unauthenticated connections. Use simulated data for the public demo.

### 1. Backend on Render

In Render, choose **New → Web Service** and select the GitHub repository and deployment branch.

| Setting | Value |
|---|---|
| Runtime | Docker |
| Root Directory | `backend` |
| Dockerfile Path | `./Dockerfile`, relative to the root directory |
| Docker Build Context Directory | `.` |
| Docker Command | Leave blank to use the Dockerfile's startup command |
| Instance Type | Free |
| Health Check Path | `/api/health` |

Set the following in the Render service's environment settings.

| Variable | Value |
|---|---|
| `PORT` | `8000` |
| `DATABASE_URL` | `sqlite:///./aviation_tracker.db` |
| `JWT_SECRET` | A fresh random value generated with `openssl rand -hex 32` |
| `DEFAULT_ADMIN_USERNAME` | Your chosen administrator username |
| `DEFAULT_ADMIN_PASSWORD` | A strong, unique password for the initial administrator |
| `SIMULATOR_ENABLED` | `true` |
| `CORS_ORIGINS` | Your exact Vercel HTTPS origin, with no trailing slash. Set it once Vercel assigns the URL. |

Deploy the service and check that `https://YOUR-SERVICE.onrender.com/api/health` returns `"status": "healthy"`. [Render Docker guide](https://render.com/docs/docker) · [Render monorepo settings](https://render.com/docs/monorepo-support)

### 2. Frontend on Vercel

Import the same repo in Vercel. Choose **Vite**, set the root directory to `frontend`, use Node.js 24.x, and set the build command to `npm run build` and output directory to `dist`.

| Variable | Value |
|---|---|
| `VITE_API_URL` | Render backend HTTPS origin, without `/api` or a trailing slash |
| `VITE_CARTO_BASEMAP_KEY` | A CARTO key restricted to the deployed Vercel hostname |

Add `frontend/vercel.json` with the following rewrite so refreshing routes like `/servers` and `/locations` works. [Vercel rewrites](https://vercel.com/docs/project-configuration/vercel-json#rewrites)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Once the Vercel URL is assigned, update `CORS_ORIGINS` in Render and redeploy Vercel if you changed either Vite environment variable. Verify sign-in, map tiles on `/locations`, and the **Telemetry live** indicator. Keep backend secrets in Render. Vite embeds its variables in the browser bundle, so restrict the browser-facing CARTO key by hostname.

### Free backend limits

Render spins down a free backend after 15 minutes without inbound traffic. The next request can take about a minute, and SQLite data is lost on sleep, restart, or redeploy. For persistent SQLite, use a paid service with a persistent disk and point `DATABASE_URL` at the mounted directory. [Render Free limits](https://render.com/docs/free) · [Persistent disks](https://render.com/docs/disks)

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
