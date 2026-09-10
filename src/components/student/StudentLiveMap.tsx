"use client";

import { useEffect, useRef, useState } from "react";

type StudentLiveBus = {
  id: string;
  bus_number: string;
  latitude: number;
  longitude: number;
  driverName: string | null;
  routeName: string | null;
};

type StudentLiveMapProps = {
  buses: StudentLiveBus[];
};

export default function StudentLiveMap({
  buses,
}: StudentLiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const googleRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      try {
        setLoading(true);
        setError("");

        const apiKey =
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          throw new Error(
            "Google Maps API key is missing."
          );
        }

        if (!mapContainerRef.current) {
          return;
        }

        if (
          typeof window !== "undefined" &&
          (window as any).google?.maps
        ) {
          googleRef.current = (window as any).google;
          createMap();
          return;
        }

        const existingScript = document.querySelector(
          'script[data-student-google-maps="true"]'
        );

        if (existingScript) {
          await waitForGoogleMaps();

          if (!cancelled) {
            googleRef.current = (window as any).google;
            createMap();
          }

          return;
        }

        const script = document.createElement("script");

        script.src =
          `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
            apiKey
          )}`;

        script.async = true;
        script.defer = true;

        script.setAttribute(
          "data-student-google-maps",
          "true"
        );

        const loaded = new Promise<void>(
          (resolve, reject) => {
            script.onload = () => resolve();

            script.onerror = () =>
              reject(
                new Error(
                  "Google Maps failed to load."
                )
              );
          }
        );

        document.head.appendChild(script);

        await loaded;

        if (cancelled) {
          return;
        }

        if (!(window as any).google?.maps) {
          throw new Error(
            "Google Maps loaded incorrectly."
          );
        }

        googleRef.current = (window as any).google;

        createMap();
      } catch (err) {
        console.error("Student map error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load Google Maps."
          );

          setLoading(false);
        }
      }
    }

    function waitForGoogleMaps(): Promise<void> {
      return new Promise((resolve, reject) => {
        let attempts = 0;

        const interval = window.setInterval(() => {
          attempts++;

          if ((window as any).google?.maps) {
            window.clearInterval(interval);
            resolve();
          }

          if (attempts > 100) {
            window.clearInterval(interval);

            reject(
              new Error(
                "Google Maps took too long to load."
              )
            );
          }
        }, 100);
      });
    }

    function createMap() {
      const google = googleRef.current;

      if (!google || !mapContainerRef.current) {
        return;
      }

      if (!mapRef.current) {
        mapRef.current = new google.maps.Map(
          mapContainerRef.current,
          {
            center: {
              lat: 22.8046,
              lng: 86.2029,
            },
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            clickableIcons: false,
            gestureHandling: "greedy",
          }
        );
      }

      setLoading(false);
      updateMarkers();
    }

    loadMap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    updateMarkers();
  }, [buses]);

  function updateMarkers() {
    const google = googleRef.current;
    const map = mapRef.current;

    if (!google || !map) {
      return;
    }

    const currentIds = new Set(
      buses.map((bus) => bus.id)
    );

    Object.keys(markersRef.current).forEach(
      (id) => {
        if (!currentIds.has(id)) {
          markersRef.current[id]?.setMap(null);
          delete markersRef.current[id];
        }
      }
    );

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

      let marker = markersRef.current[bus.id];

      if (!marker) {
        marker = new google.maps.Marker({
          map,
          position,
          title: `Bus ${bus.bus_number}`,
        });

        const infoWindow =
          new google.maps.InfoWindow({
            content: `
              <div style="padding:10px;min-width:200px;font-family:Arial">
                <div style="font-size:11px;color:#64748b;font-weight:bold">
                  AJU SMART BUS
                </div>

                <div style="font-size:20px;font-weight:800;color:#005BAC;margin-top:5px">
                  🚌 ${escapeHtml(bus.bus_number)}
                </div>

                <div style="margin-top:10px;font-size:13px">
                  <strong>Driver:</strong>
                  ${escapeHtml(
                    bus.driverName || "Not assigned"
                  )}
                </div>

                <div style="margin-top:6px;font-size:13px">
                  <strong>Route:</strong>
                  ${escapeHtml(
                    bus.routeName || "Not assigned"
                  )}
                </div>

                <div style="margin-top:10px;color:#16a34a;font-size:12px;font-weight:bold">
                  ● LIVE
                </div>
              </div>
            `,
          });

        marker.addListener("click", () => {
          infoWindow.open({
            map,
            anchor: marker,
          });
        });

        markersRef.current[bus.id] = marker;
      } else {
        marker.setPosition(position);
        marker.setMap(map);
      }
    });

    if (buses.length > 0) {
      const bounds =
        new google.maps.LatLngBounds();

      let valid = 0;

      buses.forEach((bus) => {
        const lat = Number(bus.latitude);
        const lng = Number(bus.longitude);

        if (
          Number.isFinite(lat) &&
          Number.isFinite(lng)
        ) {
          bounds.extend({
            lat,
            lng,
          });

          valid++;
        }
      });

      if (valid > 0) {
        map.fitBounds(bounds);

        if (valid === 1) {
          const zoom = map.getZoom() ?? 12;

          if (zoom > 16) {
            map.setZoom(16);
          }
        }
      }
    }
  }

  function escapeHtml(value: string) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-3xl bg-slate-100">
      <div
        ref={mapContainerRef}
        className="h-full w-full"
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="rounded-3xl bg-white px-8 py-7 text-center shadow-lg">
            <div className="text-5xl">🗺️</div>

            <h3 className="mt-4 text-lg font-black text-[#005BAC]">
              Loading Live Map
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Connecting to Google Maps...
            </p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <div className="text-4xl">⚠️</div>

            <h3 className="mt-4 font-black text-slate-900">
              Map unavailable
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>
          </div>
        </div>
      )}

      {!loading &&
        !error &&
        buses.length === 0 && (
          <div className="absolute left-4 top-4 rounded-2xl bg-white/95 px-5 py-4 shadow-lg">
            <p className="text-sm font-black text-slate-800">
              No buses are currently live
            </p>

            <p className="mt-1 text-xs text-slate-500">
              The driver may not have started GPS tracking.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        buses.length > 0 && (
          <div className="absolute left-4 top-4 rounded-2xl bg-white/95 px-5 py-4 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-green-500" />

              <div>
                <p className="text-sm font-black text-slate-800">
                  {buses.length}{" "}
                  {buses.length === 1
                    ? "Bus"
                    : "Buses"}{" "}
                  Live
                </p>

                <p className="text-xs font-bold text-green-600">
                  Real-time tracking
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}