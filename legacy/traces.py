
#............................................................................................................................
import streamlit as st
import pandas as pd
import pydeck as pdk

# ---------- Configuration ----------
st.set_page_config(page_title="AAI Server Tracker", layout="wide")
st.title("🛰️ AAI Banaras Airport - Server Location Tracker")

# ---------- Intro ----------
st.markdown("""
This dashboard shows server placements at **Banaras Airport** with real-time interaction.

**Map Legend:**
- 🟢 Active Servers  
- 🔴 Inactive Servers  
- 🟡 Under Maintenance  
- ✈️ Airport Location
""")

# ---------- Initial Server Data ----------
if 'server_data' not in st.session_state:
    st.session_state.server_data = pd.DataFrame({
        'Server Name': ['Server 1', 'Server 2', 'Server 3', 'Server 4', 'Server 5'],
        'latitude': [25.4522, 25.4530, 25.4510, 25.4538, 25.4546],
        'longitude': [82.8598, 82.8610, 82.8585, 82.8605, 82.8622],
        'Status': ['Active', 'Active', 'Inactive', 'Active', 'Inactive']
    })

server_data = st.session_state.server_data

# ---------- Icon Mapping ----------
def get_icon_url(status):
    return {
        'Active': "https://cdn-icons-png.flaticon.com/512/190/190411.png",       # Green
        'Inactive': "https://cdn-icons-png.flaticon.com/512/1828/1828665.png",    # Red
    }.get(status, "")

server_data["icon_data"] = server_data["Status"].apply(lambda status: {
    "url": get_icon_url(status),
    "width": 512,
    "height": 512,
    "anchorY": 512
})

# ---------- AAI Banaras Airport Location ----------
aai_location = pd.DataFrame({
    'name': ['AAI Banaras Airport'],
    'lat': [25.4520],
    'lon': [82.8590],
    'icon_data': [{
        "url": "https://cdn-icons-png.flaticon.com/512/723/723749.png",  # airplane icon
        "width": 512,
        "height": 512,
        "anchorY": 512
    }]
})

# ---------- Map Layers ----------
# Airport icon layer
airport_layer = pdk.Layer(
    "IconLayer",
    data=aai_location,
    get_icon="icon_data",
    get_size=4,
    size_scale=10,
    get_position='[lon, lat]',
    pickable=True
)

# Server icon layer
server_icon_layer = pdk.Layer(
    "IconLayer",
    data=server_data,
    get_icon="icon_data",
    get_size=4,
    size_scale=8,
    get_position='[longitude, latitude]',
    pickable=True
)

# ---------- View State ----------
view_state = pdk.ViewState(
    latitude=25.4525,
    longitude=82.8600,
    zoom=16,
    pitch=30
)

# ---------- Render Map ----------
st.pydeck_chart(pdk.Deck(
    layers=[airport_layer, server_icon_layer],
    initial_view_state=view_state,
    tooltip={"text": "📡 {Server Name}\nStatus: {Status}"}
))

# ---------- Server Management Form ----------
st.markdown("### ➕ Add / 🗑️ Remove / 🖊️ Update Server")

with st.form("server_form", clear_on_submit=True):
    server_name = st.text_input("Server Name")
    latitude = st.number_input("Latitude", format="%.6f")
    longitude = st.number_input("Longitude", format="%.6f")
    status = st.selectbox("Status", ['Active', 'Inactive', 'Maintenance'])
    action = st.radio("Action", ["Add", "Update", "Remove"])
    submitted = st.form_submit_button("Submit")

    if submitted:
        if action == "Add":
            if server_name in server_data['Server Name'].values:
                st.warning(f"Server '{server_name}' already exists.")
            else:
                new_row = pd.DataFrame({
                    'Server Name': [server_name],
                    'latitude': [latitude],
                    'longitude': [longitude],
                    'Status': [status],
                    'icon_data': [{
                        "url": get_icon_url(status),
                        "width": 512,
                        "height": 512,
                        "anchorY": 512
                    }]
                })
                st.session_state.server_data = pd.concat([server_data, new_row], ignore_index=True)
                st.success(f"Added '{server_name}' successfully.")

        elif action == "Update":
            index = server_data[server_data['Server Name'] == server_name].index
            if not index.empty:
                st.session_state.server_data.loc[index[0], ['latitude', 'longitude', 'Status']] = [latitude, longitude, status]
                st.session_state.server_data.at[index[0], 'icon_data'] = {
                    "url": get_icon_url(status),
                    "width": 512,
                    "height": 512,
                    "anchorY": 512
                }
                st.success(f"Updated '{server_name}' successfully.")
            else:
                st.warning(f"Server '{server_name}' not found.")

        elif action == "Remove":
            index = server_data[server_data['Server Name'] == server_name].index
            if not index.empty:
                st.session_state.server_data = server_data.drop(index)
                st.success(f"Removed '{server_name}' successfully.")
            else:
                st.warning(f"Server '{server_name}' not found.")

# ---------- Styled Server Table ----------
st.markdown("### 📋 Server Status Table")

def format_status(status):
    return {
        'Active': "🟢 Active",
        'Inactive': "🔴 Inactive",
        'Maintenance': "🟡 Maintenance"
    }.get(status, status)

display_table = st.session_state.server_data.copy()
display_table['Status'] = display_table['Status'].apply(format_status)
display_table = display_table[['Server Name', 'latitude', 'longitude', 'Status']]

st.write(
    display_table.style.set_table_styles([
        {'selector': 'th', 'props': [('text-align', 'center'), ('background-color', '#f0f2f6')]},
        {'selector': 'td', 'props': [('text-align', 'center')]}
    ]).hide(axis='index'),
    unsafe_allow_html=True
)
