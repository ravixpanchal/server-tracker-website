# How the AAI Aviation Server Tracker works

The AAI Aviation Server Tracker is a demonstration of an airport infrastructure monitoring dashboard. It brings a server inventory, health indicators, alerts, incidents, maps, and reports into one interface. The backend generates airport server telemetry, stores its history, and analyzes it for unusual behavior. The app models air traffic control, CNS radar and communications, and Digi Yatra systems using seeded records.

## What problems it addresses

| Monitoring problem | How the tracker helps |
|---|---|
| Server information is scattered across locations and tools | The registry and location map link server names, addresses, airport locations, and status. |
| It is hard to decide which problem to investigate first | The overview groups healthy, degraded, and critical conditions. The Alerts page adds severity filters and acknowledgment controls. |
| A drop in performance can be easy to miss | Simulated heartbeats track latency, packet loss, resource use, and uptime over time. The anomaly engine looks for unusual combinations of measurements. |
| An outage is difficult to review after it happens | The Incidents page puts events in a timeline, and Analytics summarizes which servers have recurring failures. |
| Teams need data for reporting and handover | CSV and Excel exports make stored telemetry available for spreadsheets and offline review. |
| Operators and administrators have different responsibilities | Both can use the dashboard. Server creation, editing, and deletion require an administrator. |

## How data moves through the system

1. **Startup.** FastAPI reads its environment settings, initializes SQLite, creates the demo accounts, and seeds the airport server inventory when needed.
2. **Telemetry.** The simulator emits heartbeats at a configurable interval, eight seconds by default. It generates latency, packet loss, CPU and memory use, response time, and uptime readings. It updates server status and health scores and records alerts or incidents for relevant state changes.
3. **Analysis.** The AI engine periodically reads stored metrics, trains a per-server Isolation Forest when enough readings exist, and evaluates unusual behavior. It can calculate a heuristic time-to-failure estimate and generate a recommendation. These outputs are derived from simulated data.
4. **Delivery.** REST endpoints give the frontend snapshots and history. The backend broadcasts status and alert events over `/ws`. It can also broadcast AI insight events. The dashboard combines periodic API refreshes with the status messages it handles.
5. **Presentation.** React renders the screens. Recharts draws charts, Leaflet draws markers and popups, and CARTO supplies the basemap tiles. Map markers come from the app's location data. The CARTO key enables the background tiles.

## Every screen and its components

### Sign in — `/login`

- **Brand panel** identifies the tracker and gives users a short description.
- **Sign-in form** collects a username and password and submits them to the backend. It shows loading and error states.
- **Password visibility button** changes whether the password is visible in the input.
- **Demo credentials panel** shows the locally seeded accounts. These credentials are intended for local demonstrations.
- **Session handling** stores the access token and user information in the browser. Protected routes send signed-out visitors to sign in, and the API client clears the session on a 401 response.

### Dashboard — `/`

- **Overview banner** introduces the monitoring scope.
- **Summary cards** show the reported total, healthy, warning, and critical counts and link to relevant screens. The dashboard includes placeholder counts and a fixed percentage in the healthy card.
- **Airport server table** combines name, address, status, resource bars, a percentage labeled uptime, and location. When available, backend status supplies the server rows. CPU and memory values are generated in the browser, and the displayed uptime percentage uses a health score.
- **Network Nodes and Locations Map shortcuts** open the dedicated topology and map screens. The server list shortcut opens the registry.
- **Active Incidents panel** shows a prewritten example outage and sample terminal output. Its acknowledgment is local to the dashboard. The separate Alerts page sends acknowledgment requests to the API.

### Servers — `/servers`

- **Server details header and status badge** show the selected server's identity, location, and displayed state.
- **Telemetry cards** summarize device and connection information. Some values are illustrative.
- **CPU, memory, disk I/O, and network traffic charts** show a time series generated in the frontend. The backend also exposes a stored metrics API for a server, which these chart panels currently do not use.
- **SSH Connect** opens an embedded terminal with a sample service status transcript. The close button dismisses the simulated session.
- **Restart Services** shows a simulated progress state. It performs no remote restart.
- **Server Registry & Inventory** fetches backend server records and refreshes them periodically. Search filters the list. Selecting a row changes the detail panel.
- **Add, Edit, and Delete actions** manage backend records for administrators. The add/edit modal takes the name, IP address, location, and airport code. These operations are persisted through the server API.

### Network Topology — `/topology`

- **Scrollable network diagram** illustrates an Internet connection, firewall, switches, and sample endpoints.
- **Connections and legend** identify healthy, degraded, and failed links visually.
- **Node detail panel** shows the selected example device's status, IP and MAC addresses, uptime, link speed, and recent events.
- **Ping control** displays a simulated result for the selected node. The diagram and node details are predefined examples.

### Infrastructure Locations — `/locations`

- **Leaflet map and zoom controls** let users explore station locations across India.
- **CARTO Positron tile layer** provides the light map background and shows provider attribution. It reads the frontend CARTO key configured through `VITE_CARTO_BASEMAP_KEY`.
- **Markers and popups** show a server's name, location, IP, and status. The page loads the registry once when mounted. It starts with sample locations and can fall back to sample coordinates when a record lacks coordinates.
- **Registered Stations panel** lists the same servers beside or below the map, depending on screen width.

### Live Logs — `/logs`

- **Server selector, severity filters, and search** narrow the visible lines by source, level, or matching text.
- **Terminal output** starts with example logs and adds a browser-generated entry about every three seconds while unpaused. It retains a bounded recent history in memory.
- **Auto-scroll** follows new entries. **Pause/Resume** stops or restarts the simulated stream.
- **Download Logs** saves the currently filtered entries as a plain-text `.log` file. This export is separate from the stored telemetry exports in Analytics.

### Incidents — `/incidents`

- **Incident timeline** loads recent incident records from the analytics API and shows severity, descriptions, and available timing details.
- **Status and severity styling** helps users scan for significant events and distinguish incident states.
- **Sample timeline** can appear when the API returns no records or the request fails. It demonstrates the layout independently of stored incidents.

### Analytics — `/analytics`

- **Server Health Distribution** displays fleet health counts in a donut chart with a responsive legend.
- **Anomaly Frequency** ranks servers by reported failure counts using a horizontal bar chart. The page has example data for empty or unavailable responses.
- **Export CSV and Export Excel** download telemetry assembled by the backend from stored server records and recent metric samples. These downloads contain structured measurements such as latency, packet loss, uptime, CPU, and memory.

### Alerts — `/alerts`

- **Severity filters** request alerts by category from the backend.
- **Alert cards** display server name, severity, message, and time. Sample alerts can appear when there are no API records to display.
- **Acknowledge and mark-all action** update the visible read state and send requests to the backend. The header queries the unread count periodically.

### Settings — `/settings`

- **Account panel** displays the signed-in username and role.
- **Auto-refresh, audio alert, and polling interval controls** demonstrate configuration options. The form keeps these values in local component state. Saving shows a confirmation without persisting preferences, changing telemetry timing, or enabling sound.

## Shared frontend components

| Component | Responsibility |
|---|---|
| [App and route guards](frontend/src/App.jsx) | Defines routes, handles loading during session restoration, and redirects between public and protected screens. |
| [Dashboard layout](frontend/src/components/layout/DashboardLayout.jsx) | Wraps the signed-in pages, manages the drawer and compact navigation, and passes telemetry connection state to pages. |
| [Sidebar](frontend/src/components/layout/Sidebar.jsx) | Provides navigation, active route styling, a collapsible desktop rail, the mobile drawer, and sign-out. |
| [Header](frontend/src/components/layout/Header.jsx) | Shows the page title, server search shortcut, connection status, unread alert badge, settings access, and an IST clock where space permits. |
| [Terminal panel](frontend/src/components/layout/TerminalPanel.jsx) | Gives Live Logs and simulated SSH a shared indigo surface, title bar, window dots, and typography. |
| [Authentication context](frontend/src/contexts/AuthContext.jsx) | Manages sign-in, session restoration, sign-out, and the administrator flag used by the UI. |
| [API client](frontend/src/services/api.js) | Calls FastAPI, attaches the bearer token when available, and handles unauthorized responses. |
| [WebSocket hook](frontend/src/hooks/useWebSocket.js) | Opens the telemetry connection, tracks connection state, sends keepalive messages, and reconnects after a disconnect. |
| [Basemap configuration](frontend/src/lib/basemap.js) | Provides the CARTO tile URL and attribution for both map components. |
| [Theme and styles](frontend/src/index.css) | Defines the shared palette, surfaces, status indicators, map popups, terminal styling, and reduced-motion rules. |
| [Formatting utilities](frontend/src/lib/utils.js) | Share formatting and presentation helpers such as date and status formatting. |

The source tree also contains reusable dashboard widgets that are separate from the current routed screens. [StatsCards](frontend/src/components/dashboard/StatsCards.jsx) renders summary metrics and a loading skeleton. [AlertPanel](frontend/src/components/dashboard/AlertPanel.jsx) formats recent alerts. [AIInsights](frontend/src/components/dashboard/AIInsights.jsx) presents anomaly and prediction details. [ServerMap](frontend/src/components/dashboard/ServerMap.jsx) displays color-coded server markers, a legend, and popups. [LatencyChart](frontend/src/components/dashboard/LatencyChart.jsx) and [UptimeChart](frontend/src/components/dashboard/UptimeChart.jsx) render time-series data passed in by their callers.

## Backend components

| Component | Responsibility |
|---|---|
| [Application entry point](backend/main.py) | Initializes the database, starts and stops background tasks, configures CORS and routes, and serves `/api/health` and `/ws`. |
| [Configuration](backend/config.py) | Reads the database URL, JWT settings, allowed origins, demo administrator credentials, and simulator and AI intervals. |
| [Database](backend/database.py) | Creates the SQLAlchemy engine and provides sessions to routes and background jobs. |
| [Models](backend/models.py) | Define servers, time-stamped metrics, alerts, incidents, and user accounts. |
| [Schemas](backend/schemas.py) | Define validation and response shapes for API data. |
| [Authentication](backend/auth.py) | Hashes and verifies passwords, issues and decodes JWTs, resolves the signed-in user, and checks the administrator role. |
| [Authentication routes](backend/routers/auth_router.py) | Provide login, profile lookup, and administrator-only account registration. |
| [Server routes](backend/routers/servers.py) | List servers, return details and metric history, and handle administrator-only inventory changes. |
| [Status routes](backend/routers/status.py) | Return current status for the fleet or an individual server. |
| [Alert routes](backend/routers/alerts.py) | List and filter alerts, count unread alerts, mark alerts as read, and expose an alert deletion endpoint. |
| [Analytics routes](backend/routers/analytics.py) | Return fleet summaries, uptime and latency trends, failure frequency, incident history, and AI insights. |
| [Export routes](backend/routers/export.py) | Create CSV and Excel downloads from stored telemetry. |
| [Heartbeat simulator](backend/simulator.py) | Seeds example infrastructure, generates metric samples and state changes, and publishes status and alert updates. |
| [AI engine](backend/ai_engine.py) | Trains Isolation Forest models from stored samples, evaluates anomalies, estimates possible degradation, and prepares recommendations. |
| [WebSocket manager](backend/websocket_manager.py) | Tracks connected clients and distributes events from the simulator and AI engine. |

## What the demo shows today

The backend runs real database writes, sign-in, inventory management, exports, and analysis on simulated telemetry. The browser also includes examples for SSH, restart, ping, logs, some charts, and empty-data views. Treat displayed sample values as demonstration data. A production rollout would require a real telemetry source, verified server metrics, persistent storage, and authentication for any exposed telemetry endpoints. The current WebSocket accepts connections without authenticating subscribers.

For setup and deployment instructions, see the [README](README.md).
