import streamlit as st
import pandas as pd
import random
from datetime import datetime
import plotly.express as px

# Streamlit page config
st.set_page_config(page_title="Device Monitor", layout="wide")
st.title("📡 Network Device Status Dashboard")

# Button to manually refresh
if st.button("🔄 Refresh Data"):
    st.experimental_rerun()

# Show current time
st.markdown(f"🕒 **Current Time:** `{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}`")

# Function to generate device data
def generate_devices():
    total_devices = 20
    online_count = int(total_devices * 0.8)

    devices = []
    for i in range(1, total_devices + 1):
        status = "ONLINE" if i <= online_count else "OFFLINE"
        location = random.choice([
            "ATC Block", "CNS Block", "Server Room", "Main Gate", "HR",
            "Radar Room", "Terminal Gate 1", "Director Room", "IT Incharge Room",
            "Fire Block", "Equipment Room", "Security Room"
        ])
        devices.append({
            "Device Name": f"Device {i}",
            "IP Address": f"192.168.1.{i}",
            "Location": location,
            "Status": status,
            "Last Checked": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })

    return pd.DataFrame(devices)

# Get the generated devices
df_devices = generate_devices()



# Metrics
col1, col2 = st.columns(2)
col1.metric("✅ Online Devices", df_devices[df_devices["Status"] == "ONLINE"].shape[0])
col2.metric("❌ Offline Devices", df_devices[df_devices["Status"] == "OFFLINE"].shape[0])

# Pie chart
st.markdown("### 📊 Device Status Distribution")
status_count = df_devices["Status"].value_counts().reset_index()
status_count.columns = ["Status", "Count"]
fig = px.pie(status_count, names="Status", values="Count", color="Status",
             color_discrete_map={"ONLINE": "green", "OFFLINE": "red"})
st.plotly_chart(fig, use_container_width=True)

# Status coloring
def highlight_status(val):
    return f"color: {'green' if val == 'ONLINE' else 'red'}; font-weight: bold"

st.markdown("### 🧾 Device Table")
st.dataframe(df_devices.style.applymap(highlight_status, subset=["Status"]), use_container_width=True)

# CSV download
csv = df_devices.to_csv(index=False).encode("utf-8")
st.download_button(
    label="⬇️ Download Device Status (CSV)",
    data=csv,
    file_name="device_status.csv",
    mime="text/csv"
)

