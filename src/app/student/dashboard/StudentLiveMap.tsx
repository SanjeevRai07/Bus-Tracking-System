"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

interface BusLocation {
  id: string;
  bus_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;

  bus?: {
    id: string;
    bus_number: string;
    driver_name: string;
    route: string;
    status: string;
  };
}

interface StudentLiveMapProps {
  locations: BusLocation[];
}

/* =========================================
   CUSTOM BUS ICON
========================================= */

const busIcon = new L.DivIcon({
  className: "custom-bus-marker",
  html: `
    <div style="
      width:48px;
      height:48px;
      border-radius:50%;
      background:linear-gradient(135deg,#0066cc,#004a99);
      border:4px solid white;
      box-shadow:0 5px 18px rgba(0,70,150,.35);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:25px;
    ">
      🚌
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -25],
});

/* =========================================
   MAP RESIZE
========================================= */

function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 400);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

/* =========================================
   MAP CENTER
========================================= */

function MapCenter({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 12, {
      animate: true,
    });
  }, [latitude, longitude, map]);

  return null;
}

/* =========================================
   MAIN COMPONENT
========================================= */

export default function StudentLiveMap({
  locations,
}: StudentLiveMapProps) {
  const firstBus = locations[0];

  const [center, setCenter] = useState<[number, number]>([
    firstBus?.latitude ?? 22.8046,
    firstBus?.longitude ?? 86.2029,
  ]);

  useEffect(() => {
    if (firstBus) {
      setCenter([
        firstBus.latitude,
        firstBus.longitude,
      ]);
    }
  }, [firstBus]);

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.10)]">

      {/* =================================
          TOP MAP HEADER
      ================================= */}

      <div className="absolute left-5 right-5 top-5 z-[1000] flex items-center justify-between">

        {/* LIVE STATUS */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl">
            🚌
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              Live Bus Tracking
            </p>

            <div className="mt-0.5 flex items-center gap-1.5">

              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

              <span className="text-xs font-semibold text-green-600">
                GPS Connected
              </span>

            </div>
          </div>

        </div>

        {/* BUS COUNT */}
        <div className="rounded-2xl border border-white/60 bg-white/95 px-5 py-3 text-center shadow-lg backdrop-blur">

          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Live Buses
          </p>

          <p className="text-2xl font-black text-[#005BAC]">
            {locations.length}
          </p>

        </div>

      </div>

      {/* =================================
          MAP
      ================================= */}

      <div className="h-[560px] w-full">

        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom={true}
          zoomControl={true}
          className="h-full w-full"
        >

          <MapResizeFix />

          {firstBus && (
            <MapCenter
              latitude={firstBus.latitude}
              longitude={firstBus.longitude}
            />
          )}

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* =================================
              BUS MARKERS
          ================================= */}

          {locations.map((location) => (

            <Marker
              key={location.id}
              position={[
                location.latitude,
                location.longitude,
              ]}
              icon={busIcon}
            >

              <Popup>

                <div className="min-w-[245px] overflow-hidden rounded-xl">

                  {/* POPUP HEADER */}

                  <div className="mb-3 flex items-center gap-3 border-b pb-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                      🚌
                    </div>

                    <div>

                      <h3 className="font-bold text-[#005BAC]">
                        {location.bus?.bus_number ?? "AJU Bus"}
                      </h3>

                      <p className="text-xs text-slate-500">
                        {location.bus?.route ?? "AJU Route"}
                      </p>

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="mb-3 flex items-center justify-between rounded-xl bg-green-50 px-3 py-2">

                    <span className="text-sm text-slate-600">
                      Status
                    </span>

                    <span className="flex items-center gap-1.5 text-sm font-bold text-green-600">

                      <span className="h-2 w-2 rounded-full bg-green-500" />

                      LIVE

                    </span>

                  </div>

                  {/* DETAILS */}

                  <div className="space-y-2 text-sm">

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Driver
                      </span>

                      <span className="font-semibold text-slate-700">
                        {location.bus?.driver_name ?? "Driver"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Latitude
                      </span>

                      <span className="font-mono text-xs font-semibold">
                        {location.latitude.toFixed(5)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Longitude
                      </span>

                      <span className="font-mono text-xs font-semibold">
                        {location.longitude.toFixed(5)}
                      </span>
                    </div>

                  </div>

                  {/* UPDATED */}

                  <div className="mt-3 border-t pt-3 text-center text-[11px] text-slate-400">

                    Updated{" "}
                    {new Date(
                      location.updated_at
                    ).toLocaleTimeString()}

                  </div>

                </div>

              </Popup>

            </Marker>

          ))}

        </MapContainer>

      </div>

      {/* =================================
          BOTTOM LEFT INFO
      ================================= */}

      <div className="absolute bottom-5 left-5 z-[1000]">

        <div className="rounded-2xl border border-white/70 bg-white/95 px-5 py-4 shadow-xl backdrop-blur">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
              📍
            </div>

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Tracking Status
              </p>

              <p className="font-bold text-green-600">
                All systems operational
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* =================================
          BOTTOM RIGHT
      ================================= */}

      <div className="absolute bottom-5 right-5 z-[1000]">

        <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-4 py-2.5 text-sm font-bold shadow-xl backdrop-blur">

          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />

          <span className="text-slate-700">
            GPS Live
          </span>

        </div>

      </div>

      {/* =================================
          NO BUSES
      ================================= */}

      {locations.length === 0 && (

        <div className="absolute inset-0 z-[900] flex items-center justify-center bg-slate-100/80 backdrop-blur-sm">

          <div className="mx-4 rounded-3xl bg-white px-10 py-8 text-center shadow-2xl">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 text-4xl">
              🚌
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-800">
              No Live Buses
            </h3>

            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Waiting for a driver to start GPS tracking.
            </p>

            <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-slate-400">

              <span className="h-2 w-2 rounded-full bg-slate-300" />

              Waiting for connection...

            </div>

          </div>

        </div>

      )}

    </div>
  );
}