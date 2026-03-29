from flask import Flask, render_template
from datetime import datetime

app = Flask(__name__)

@app.route("/")
def index():
    # Total 20 devices (16 online, 4 offline = 80:20 ratio)
    devices = [
        # Offline devices (Faulty / Network Break)
        {"name": "Device 1", "ip": "192.168.1.1", "location": "ATC Block", "status": "OFFLINE"},
        {"name": "Device 2", "ip": "192.168.1.2", "location": "CNS Block", "status": "OFFLINE"},
        {"name": "Device 3", "ip": "192.168.1.3", "location": "Main Gate", "status": "OFFLINE"},
        {"name": "Device 4", "ip": "192.168.1.4", "location": "Radar Room", "status": "OFFLINE"},

        # Online devices
        {"name": "Device 5", "ip": "192.168.1.5", "location": "IT Server Room", "status": "ONLINE"},
        {"name": "Device 6", "ip": "192.168.1.6", "location": "HR Department", "status": "ONLINE"},
        {"name": "Device 7", "ip": "192.168.1.7", "location": "Security Room", "status": "ONLINE"},
        {"name": "Device 8", "ip": "192.168.1.8", "location": "Fire Block", "status": "ONLINE"},
        {"name": "Device 9", "ip": "192.168.1.9", "location": "Director Room", "status": "ONLINE"},
        {"name": "Device 10", "ip": "192.168.1.10", "location": "Conference Room", "status": "ONLINE"},
        {"name": "Device 11", "ip": "192.168.1.11", "location": "Terminal Gate-1", "status": "ONLINE"},
        {"name": "Device 12", "ip": "192.168.1.12", "location": "Terminal Gate-2", "status": "ONLINE"},
        {"name": "Device 13", "ip": "192.168.1.13", "location": "Equipment Room", "status": "ONLINE"},
        {"name": "Device 14", "ip": "192.168.1.14", "location": "IT Incharge Room", "status": "ONLINE"},
        {"name": "Device 15", "ip": "192.168.1.15", "location": "Reception", "status": "ONLINE"},
        {"name": "Device 16", "ip": "192.168.1.16", "location": "Network Hub", "status": "ONLINE"},
        {"name": "Device 17", "ip": "192.168.1.17", "location": "Backup Room", "status": "ONLINE"},
        {"name": "Device 18", "ip": "192.168.1.18", "location": "IT Operation Room", "status": "ONLINE"}
    ]

    # Add timestamp to each device
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    for device in devices:
        device["timestamp"] = timestamp

    return render_template("index.html", devices=devices)

if __name__ == "__main__":
    app.run(debug=True)
