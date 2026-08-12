"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  LayersControl,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";

/* =====================================================
   TYPES
===================================================== */

interface LiveLocation {
  id: string;
  bus_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
}

interface Bus {
  id: string;
  bus_number: string;
  driver_name: string;
  route: string;
  status: string;
}

interface BusLocation extends LiveLocation {
  bus?: Bus;
}

/* =====================================================
   BUS ICON
===================================================== */

const busIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -20],
});

/* =====================================================
   MAP RESIZE FIX
===================================================== */

function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

/* =====================================================
   MAP CENTER
===================================================== */

function MapCenter({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 15, {
      animate: true,
    });
  }, [latitude, longitude, map]);

  return null;
}

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function LiveMapInner() {
  const [locations, setLocations] = useState<BusLocation[]>([]);
  const [loading, setLoading] = useState(true);

  /* ===================================================
     FETCH LIVE LOCATIONS
  =================================================== */

  async function fetchLocations() {
    try {
      const { data, error } = await supabase
        .from("live_locations")
        .select(`
          id,
          bus_id,
          latitude,
          longitude,
          updated_at,
          buses (
            id,
            bus_number,
            driver_name,
            route,
            status
          )
        `);

      console.log("LIVE LOCATIONS:", data);
      console.log("LIVE LOCATION ERROR:", error);

      if (error) {
        console.error(
          "Failed to load live locations:",
          error
        );

        setLoading(false);
        return;
      }

      if (data) {
        const formatted: BusLocation[] = data.map(
          (item: any) => ({
            id: item.id,
            bus_id: item.bus_id,
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            updated_at: item.updated_at,
            bus: Array.isArray(item.buses)
              ? item.buses[0]
              : item.buses,
          })
        );

        setLocations(formatted);
      }
    } catch (error) {
      console.error(
        "Unexpected GPS error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===================================================
     INITIAL LOAD + REALTIME GPS
  =================================================== */

  useEffect(() => {
    fetchLocations();

    const channel = supabase
      .channel("live_locations_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_locations",
        },
        () => {
          console.log("GPS LOCATION UPDATED");

          fetchLocations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ===================================================
     FIRST LOCATION
  =================================================== */

  const firstLocation = locations[0];

  const defaultLatitude =
    firstLocation?.latitude ?? 22.8046;

  const defaultLongitude =
    firstLocation?.longitude ?? 86.2029;

  /* ===================================================
     RETURN
  =================================================== */

  return (
    <div className="relative h-full w-full overflow-hidden">

      {/* ===============================================
          LOADING
      =============================================== */}

      {loading && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-slate-100/90">
          <div className="rounded-2xl bg-white px-6 py-4 shadow-xl">
            <p className="font-semibold text-[#005BAC]">
              Loading live buses...
            </p>
          </div>
        </div>
      )}

      {/* ===============================================
          MAP
      =============================================== */}

      <MapContainer
        center={[
          defaultLatitude,
          defaultLongitude,
        ]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{
          height: "100%",
          width: "100%",
        }}
      >

        <MapResizeFix />

        {/* CENTER ON BUS */}

        {firstLocation && (
          <MapCenter
            latitude={firstLocation.latitude}
            longitude={firstLocation.longitude}
          />
        )}

        {/* =============================================
            MAP LAYERS
        ============================================= */}

        <LayersControl position="topright">

          {/* STREET MAP */}

          <LayersControl.BaseLayer
            checked
            name="🗺️ Street Map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* SATELLITE */}

          <LayersControl.BaseLayer
            name="🛰️ Satellite"
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

        </LayersControl>

        {/* =============================================
            BUS MARKERS
        ============================================= */}

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

              <div className="min-w-[230px]">

                <h3 className="text-lg font-bold text-[#005BAC]">
                  🚌{" "}
                  {location.bus?.bus_number ??
                    "AJU Bus"}
                </h3>

                <div className="mt-3 space-y-2 text-sm">

                  <p>
                    <strong>Driver:</strong>{" "}
                    {location.bus?.driver_name ??
                      "Unknown"}
                  </p>

                  <p>
                    <strong>Route:</strong>{" "}
                    {location.bus?.route ??
                      "Unknown"}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="font-semibold text-green-600">
                      ●{" "}
                      {location.bus?.status ??
                        "Running"}
                    </span>
                  </p>

                  <p>
                    <strong>Latitude:</strong>{" "}
                    {location.latitude.toFixed(6)}
                  </p>

                  <p>
                    <strong>Longitude:</strong>{" "}
                    {location.longitude.toFixed(6)}
                  </p>

                  <p className="pt-1 text-xs text-slate-400">
                    Last updated:{" "}
                    {new Date(
                      location.updated_at
                    ).toLocaleTimeString()}
                  </p>

                </div>

              </div>

            </Popup>

          </Marker>
        ))}

      </MapContainer>

      {/* ===============================================
          LIVE BUS COUNTER
      =============================================== */}

      <div className="absolute bottom-5 left-5 z-[1000] rounded-2xl bg-white px-5 py-3 shadow-xl">

        <p className="text-sm text-slate-500">
          Live Buses
        </p>

        <p className="text-2xl font-bold text-[#005BAC]">
          {locations.length}
        </p>

      </div>

      {/* ===============================================
          GPS LIVE
      =============================================== */}

      <div className="absolute bottom-5 right-5 z-[1000] flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-xl">

        <span className="h-3 w-3 animate-pulse rounded-full bg-green-500" />

        <span className="text-green-600">
          GPS Live
        </span>

      </div>

    </div>
  );
}