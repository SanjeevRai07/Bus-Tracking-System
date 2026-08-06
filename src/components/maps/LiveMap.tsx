"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

const busIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function LiveMap() {
  return (
    <div className="overflow-hidden rounded-3xl shadow-2xl">
      <MapContainer
        center={[22.8046, 86.2029]}
        zoom={15}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[22.8046, 86.2029]} icon={busIcon}>
          <Popup>ARKA JAIN University</Popup>
        </Marker>

        <Marker position={[22.807, 86.206]} icon={busIcon}>
          <Popup>AJU Bus 01</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}