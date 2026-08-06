"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

const busIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
});

export default function LiveMap() {
  return (
    <div className="mt-10 rounded-3xl overflow-hidden shadow-xl">
      <MapContainer
        center={[22.8046, 86.2029]}
        zoom={15}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[22.8046, 86.2029]} icon={busIcon}>
          <Popup>
            AJU Bus 01 🚍
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}