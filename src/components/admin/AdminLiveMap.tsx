"use client";

import { useEffect, useRef, useState } from "react";

type LiveBus = {
  id: string;
  bus_number: string;
  latitude: number;
  longitude: number;
  driverName: string | null;
  routeName: string | null;
};

type AdminLiveMapProps = {
  buses: LiveBus[];
};

export default function AdminLiveMap({
  buses,
}: AdminLiveMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const infoWindowRef = useRef<any>(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");

  // --------------------------------------------------
  // LOAD GOOGLE MAPS
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadGoogleMaps = () => {
      try {
        const apiKey =
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          setMapError(
            "Google Maps API key is missing. Please check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY."
          );
          return;
        }

        // Google Maps already loaded
        if ((window as any).google?.maps) {
          if (!cancelled) {
            setMapReady(true);
          }
          return;
        }

        // Check if script is already loading
        const existingScript = document.querySelector(
          'script[data-google-maps="true"]'
        );

        if (existingScript) {
          existingScript.addEventListener("load", () => {
            if (!cancelled) {
              setMapReady(true);
            }
          });

          existingScript.addEventListener("error", () => {
            if (!cancelled) {
              setMapError(
                "Google Maps failed to load."
              );
            }
          });

          return;
        }

        // Create Google Maps script
        const script = document.createElement("script");

        script.src =
          `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;

        script.async = true;
        script.defer = true;
        script.dataset.googleMaps = "true";

        script.onload = () => {
          if (!cancelled) {
            setMapReady(true);
          }
        };

        script.onerror = () => {
          if (!cancelled) {
            setMapError(
              "Google Maps could not be loaded. Check your API key and Google Maps settings."
            );
          }
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error(
          "Google Maps loading error:",
          error
        );

        if (!cancelled) {
          setMapError(
            "Unable to initialize Google Maps."
          );
        }
      }
    };

    loadGoogleMaps();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // INITIALIZE MAP + UPDATE MARKERS
  // --------------------------------------------------

  useEffect(() => {
    if (!mapReady) return;
    if (!mapRef.current) return;

    const google = (window as any).google;

    if (!google?.maps) return;

    // ------------------------------------------------
    // CREATE MAP
    // ------------------------------------------------

    if (!mapInstance.current) {
      mapInstance.current =
        new google.maps.Map(mapRef.current, {
          center: {
            lat: 22.8046,
            lng: 86.2029,
          },

          zoom: 13,

          mapTypeControl: false,

          streetViewControl: false,

          fullscreenControl: true,

          zoomControl: true,

          gestureHandling: "greedy",
        });

      infoWindowRef.current =
        new google.maps.InfoWindow();
    }

    const map = mapInstance.current;
    const markers = markersRef.current;

    // ------------------------------------------------
    // CURRENT BUS IDS
    // ------------------------------------------------

    const currentBusIds = new Set(
      buses.map((bus) => bus.id)
    );

    // ------------------------------------------------
    // REMOVE OLD MARKERS
    // ------------------------------------------------

    markers.forEach((marker, busId) => {
      if (!currentBusIds.has(busId)) {
        marker.setMap(null);
        markers.delete(busId);
      }
    });

    // ------------------------------------------------
    // MAP BOUNDS
    // ------------------------------------------------

    const bounds =
      new google.maps.LatLngBounds();

    // ------------------------------------------------
    // CREATE / UPDATE BUS MARKERS
    // ------------------------------------------------

    buses.forEach((bus) => {
      const latitude = Number(bus.latitude);
      const longitude = Number(bus.longitude);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return;
      }

      const position = {
        lat: latitude,
        lng: longitude,
      };

      bounds.extend(position);

      let marker = markers.get(bus.id);

      // ----------------------------------------------
      // CREATE MARKER
      // ----------------------------------------------

      if (!marker) {
        marker =
          new google.maps.Marker({
            position,
            map,
            title: `Bus ${bus.bus_number}`,

            label: {
              text: bus.bus_number,
              color: "#ffffff",
              fontWeight: "700",
            },

            animation:
              google.maps.Animation.DROP,
          });

        // --------------------------------------------
        // MARKER CLICK
        // --------------------------------------------

        marker.addListener(
          "click",
          () => {
            const content = `
              <div
                style="
                  min-width:230px;
                  padding:8px;
                  font-family:Arial,sans-serif;
                "
              >

                <div
                  style="
                    font-size:18px;
                    font-weight:800;
                    color:#005BAC;
                    margin-bottom:10px;
                  "
                >
                  🚌 Bus ${bus.bus_number}
                </div>

                <div
                  style="
                    font-size:13px;
                    margin-bottom:7px;
                    color:#374151;
                  "
                >
                  <strong>Driver:</strong>
                  ${bus.driverName || "Not assigned"}
                </div>

                <div
                  style="
                    font-size:13px;
                    margin-bottom:7px;
                    color:#374151;
                  "
                >
                  <strong>Route:</strong>
                  ${bus.routeName || "Not assigned"}
                </div>

                <div
                  style="
                    font-size:13px;
                    margin-bottom:7px;
                    color:#374151;
                  "
                >
                  <strong>Latitude:</strong>
                  ${latitude.toFixed(6)}
                </div>

                <div
                  style="
                    font-size:13px;
                    margin-bottom:7px;
                    color:#374151;
                  "
                >
                  <strong>Longitude:</strong>
                  ${longitude.toFixed(6)}
                </div>

                <div
                  style="
                    margin-top:10px;
                    color:#16a34a;
                    font-size:12px;
                    font-weight:800;
                  "
                >
                  ● LIVE GPS
                </div>

              </div>
            `;

            if (infoWindowRef.current) {
              infoWindowRef.current.setContent(
                content
              );

              infoWindowRef.current.open({
                map,
                anchor: marker,
              });
            }
          }
        );

        markers.set(bus.id, marker);
      }

      // ----------------------------------------------
      // UPDATE EXISTING MARKER
      // ----------------------------------------------

      else {
        marker.setPosition(position);
        marker.setMap(map);

        marker.setTitle(
          `Bus ${bus.bus_number}`
        );
      }
    });

    // ------------------------------------------------
    // FIT MAP TO BUSES
    // ------------------------------------------------

    if (
      buses.length > 0 &&
      !bounds.isEmpty()
    ) {
      map.fitBounds(bounds);

      // Keep single bus from zooming too far
      if (buses.length === 1) {
        const listener =
          google.maps.event.addListenerOnce(
            map,
            "bounds_changed",
            () => {
              if (map.getZoom() > 16) {
                map.setZoom(16);
              }
            }
          );

        setTimeout(() => {
          google.maps.event.removeListener(
            listener
          );
        }, 1000);
      }
    }

    // ------------------------------------------------
    // NO LIVE BUSES
    // ------------------------------------------------

    else {
      map.setCenter({
        lat: 22.8046,
        lng: 86.2029,
      });

      map.setZoom(13);
    }
  }, [mapReady, buses]);

  // --------------------------------------------------
  // MAP ERROR
  // --------------------------------------------------

  if (mapError) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-2xl bg-slate-100 p-6 text-center">
        <div>
          <div className="text-5xl">
            🗺️
          </div>

          <h3 className="mt-4 text-lg font-black text-slate-800">
            Map unavailable
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-red-600">
            {mapError}
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN MAP
  // --------------------------------------------------

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200">

      {/* MAP LOADING */}
      {!mapReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100">
          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              🗺️
            </div>

            <p className="mt-4 text-sm font-bold text-slate-700">
              Loading Google Maps...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Preparing live bus tracking
            </p>

          </div>
        </div>
      )}

      {/* GOOGLE MAP */}
      <div
        ref={mapRef}
        className="h-[500px] w-full"
      />

      {/* LIVE COUNTER */}
      <div className="absolute left-4 top-4 z-20 rounded-xl bg-white px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">

          <span className="h-3 w-3 animate-pulse rounded-full bg-green-500" />

          <span className="text-sm font-black text-slate-800">
            {buses.length}{" "}
            {buses.length === 1
              ? "Bus"
              : "Buses"}{" "}
            Live
          </span>

        </div>
      </div>

      {/* LIVE STATUS */}
      {mapReady && buses.length > 0 && (
        <div className="absolute right-4 top-4 z-20 rounded-xl bg-white px-4 py-3 shadow-lg">

          <div className="flex items-center gap-2">

            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />

            <span className="text-xs font-black text-green-700">
              REAL-TIME GPS
            </span>

          </div>

        </div>
      )}

      {/* EMPTY STATE */}
      {mapReady && buses.length === 0 && (
        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white px-7 py-6 text-center shadow-xl">

          <div className="text-4xl">
            🚌
          </div>

          <p className="mt-3 font-black text-slate-800">
            No buses are live
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Driver GPS will appear here when
            tracking starts.
          </p>

        </div>
      )}

    </div>
  );
}