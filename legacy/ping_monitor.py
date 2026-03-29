import csv
import threading
import time
from datetime import datetime
import subprocess
import random

status_data = []
log_file = "device_log.csv"

devices = [
    {"name": "Server Room Switch", "ip": "192.168.0.1", "location": "Server Room"},
    {"name": "Check-in Counter 1", "ip": "192.168.0.10", "location": "Terminal A"},
    {"name": "WiFi AP Gate 3", "ip": "192.168.0.50", "location": "Gate 3"},
    {"name": "Fake Router", "ip": "10.255.255.1", "location": "Maintenance Closet"},
]

def ping(ip):
    if ip == "10.255.255.1":
        return False

    if random.random() < 0.2:
        return False

    try:
        output = subprocess.check_output(
            ["ping", "-n", "1", "-w", "1000", ip],
            stderr=subprocess.DEVNULL,
            universal_newlines=True
        )
        return "TTL=" in output
    except subprocess.CalledProcessError:
        return False

def monitor_devices():
    global status_data

    while True:
        status_data = []

        for device in devices:
            is_online = ping(device["ip"])
            status = "ONLINE ✅" if is_online else "OFFLINE ❌"
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            with open(log_file, mode="a", newline="", encoding="utf-8") as file:
                writer = csv.writer(file)
                writer.writerow([timestamp, device["name"], device["ip"], device["location"], status])

            status_data.append({
                "name": device["name"],
                "ip": device["ip"],
                "location": device["location"],
                "status": status,
                "timestamp": timestamp
            })

        time.sleep(10)

def start_monitoring():
    monitor_thread = threading.Thread(target=monitor_devices, daemon=True)
    monitor_thread.start()
