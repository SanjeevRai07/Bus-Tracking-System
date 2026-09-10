"use client";

import { useEffect, useRef } from "react";
import {
  importLibrary,
  setOptions,
} from "@googlemaps/js-api-loader";

export type LiveMapBus = {
  id: string;
  busNumber: string;
  latitude: number;
  longitude: number;
  driverName?: string | null;
  routeName?: string | null;
  updatedAt?: string | null;
};

interface LiveMapProps {
  buses: LiveMapBus[];
  followBusId?: string | null;
  heightClassName?: string;
}

type MarkerRecord = {
  marker: any;
  position: {
    lat: number;
    lng: number;
  };
  animationFrame: number | null;
};

const DEFAULT_CENTER = {
  lat: 22.8046,
  lng: 86.2029,
};

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(Math.max(value, min), max);
}

function smoothStep(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function createBusMarkerElement(
  busNumber: string
) {
  const wrapper = document.createElement("div");

  wrapper.style.width = "70px";
  wrapper.style.height = "80px";
  wrapper.style.position = "relative";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.style.cursor = "pointer";

  const label = document.createElement("div");

  label.style.position = "absolute";
  label.style.top = "0";
  label.style.left = "50%";
  label.style.transform = "translateX(-50%)";
  label.style.padding = "4px 10px";
  label.style.borderRadius = "999px";
  label.style.background = "#ffffff";
  label.style.color = "#0f172a";
  label.style.fontSize = "11px";
  label.style.fontWeight = "800";
  label.style.whiteSpace = "nowrap";
  label.style.boxShadow =
    "0 3px 10px rgba(0,0,0,0.16)";
  label.style.border =
    "1px solid rgba(148,163,184,0.25)";
  label.textContent = busNumber;

  const circle = document.createElement("div");

  circle.style.position = "absolute";
  circle.style.top = "19px";
  circle.style.left = "50%";
  circle.style.transform =
    "translateX(-50%)";
  circle.style.width = "58px";
  circle.style.height = "58px";
  circle.style.borderRadius = "50%";
  circle.style.background =
    "linear-gradient(135deg,#0088e8 0%,#005bac 100%)";
  circle.style.border = "4px solid white";
  circle.style.boxShadow =
    "0 9px 25px rgba(0,0,0,0.28),0 3px 8px rgba(0,0,0,0.18)";
  circle.style.display = "flex";
  circle.style.alignItems = "center";
  circle.style.justifyContent = "center";
  circle.style.fontSize = "28px";
  circle.style.transition =
    "transform 180ms ease,box-shadow 180ms ease";

  circle.textContent = "🚌";

  const pointer = document.createElement("div");

  pointer.style.position = "absolute";
  pointer.style.left = "50%";
  pointer.style.bottom = "0";
  pointer.style.transform =
    "translateX(-50%)";
  pointer.style.width = "0";
  pointer.style.height = "0";
  pointer.style.borderLeft =
    "9px solid transparent";
  pointer.style.borderRight =
    "9px solid transparent";
  pointer.style.borderTop =
    "15px solid #005bac";

  wrapper.appendChild(label);
  wrapper.appendChild(circle);
  wrapper.appendChild(pointer);

  wrapper.addEventListener(
    "mouseenter",
    () => {
      circle.style.transform =
        "translateX(-50%) scale(1.08)";

      circle.style.boxShadow =
        "0 12px 30px rgba(0,0,0,0.34),0 4px 10px rgba(0,0,0,0.22)";
    }
  );

  wrapper.addEventListener(
    "mouseleave",
    () => {
      circle.style.transform =
        "translateX(-50%) scale(1)";

      circle.style.boxShadow =
        "0 9px 25px rgba(0,0,0,0.28),0 3px 8px rgba(0,0,0,0.18)";
    }
  );

  return wrapper;
}

export default function LiveMap({
  buses,
  followBusId = null,
  heightClassName = "h-[620px]",
}: LiveMapProps) {
  const mapElementRef =
    useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<any>(null);

  const infoWindowRef =
    useRef<any>(null);

  const markersRef =
    useRef<Map<string, MarkerRecord>>(
      new Map()
    );

  const initializedRef =
    useRef(false);

  /*
   * ============================================================
   * INITIALIZE GOOGLE MAP
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      if (
        !mapElementRef.current ||
        initializedRef.current
      ) {
        return;
      }

      const apiKey =
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

      if (!apiKey) {
        console.error(
          "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing."
        );

        return;
      }

      try {
        /*
         * Configure Google Maps loader.
         */
        setOptions({
          key: apiKey,
          v: "weekly",
        });

        /*
         * Load the Maps library.
         */
        const mapsLibrary =
          await importLibrary("maps");

        /*
         * Load marker library.
         */
        await importLibrary("marker");

        if (
          cancelled ||
          !mapElementRef.current
        ) {
          return;
        }

        /*
         * Get required classes from Maps library.
         */
        const MapClass =
          mapsLibrary.Map;

        const InfoWindowClass =
          mapsLibrary.InfoWindow;

        /*
         * Create map.
         */
        const map = new MapClass(
          mapElementRef.current,
          {
            center: DEFAULT_CENTER,

            zoom: 14,

            mapTypeId: "roadmap",

            /*
             * Google Maps map type selector:
             *
             * NORMAL
             * SATELLITE
             * HYBRID
             * TERRAIN
             */
            mapTypeControl: true,

            mapTypeControlOptions: {
              style: 0,

              mapTypeIds: [
                "roadmap",
                "satellite",
                "hybrid",
                "terrain",
              ],
            },

            zoomControl: true,

            fullscreenControl: true,

            streetViewControl: true,

            gestureHandling: "greedy",

            clickableIcons: true,

            /*
             * Required for AdvancedMarkerElement.
             */
            mapId: "DEMO_MAP_ID",
          }
        );

        mapRef.current = map;

        infoWindowRef.current =
          new InfoWindowClass({
            maxWidth: 320,
          });

        initializedRef.current = true;
      } catch (error) {
        console.error(
          "Google Maps initialization error:",
          error
        );
      }
    }

    initializeMap();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================================
   * OPEN BUS INFORMATION
   * ============================================================
   */

  const openBusInfo = (
    bus: LiveMapBus
  ) => {
    const map = mapRef.current;

    const infoWindow =
      infoWindowRef.current;

    if (!map || !infoWindow) {
      return;
    }

    const updatedText =
      bus.updatedAt
        ? new Date(
            bus.updatedAt
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "Just now";

    const driverText =
      bus.driverName?.trim() ||
      "Driver not assigned";

    const routeText =
      bus.routeName?.trim() ||
      "Route not assigned";

    const content =
      document.createElement("div");

    content.style.minWidth = "240px";

    content.style.padding = "4px";

    content.innerHTML = `
      <div
        style="
          font-family: Arial, sans-serif;
          color: #0f172a;
        "
      >

        <div
          style="
            font-size: 17px;
            font-weight: 800;
            margin-bottom: 12px;
          "
        >
          🚌 ${bus.busNumber}
        </div>

        <div
          style="
            font-size: 13px;
            line-height: 1.8;
            color: #475569;
          "
        >

          <div>
            <strong style="color:#0f172a;">
              Driver:
            </strong>

            ${driverText}
          </div>

          <div>
            <strong style="color:#0f172a;">
              Route:
            </strong>

            ${routeText}
          </div>

          <div>
            <strong style="color:#0f172a;">
              Latitude:
            </strong>

            ${bus.latitude.toFixed(6)}
          </div>

          <div>
            <strong style="color:#0f172a;">
              Longitude:
            </strong>

            ${bus.longitude.toFixed(6)}
          </div>

          <div>
            <strong style="color:#0f172a;">
              Updated:
            </strong>

            ${updatedText}
          </div>

        </div>

        <div
          style="
            display:inline-flex;
            align-items:center;
            gap:6px;
            margin-top:12px;
            padding:6px 11px;
            border-radius:999px;
            background:#dcfce7;
            color:#166534;
            font-size:11px;
            font-weight:800;
          "
        >
          <span style="font-size:9px;">
            ●
          </span>

          LIVE GPS
        </div>

      </div>
    `;

    infoWindow.setContent(content);

    infoWindow.setPosition({
      lat: bus.latitude,
      lng: bus.longitude,
    });

    infoWindow.open({
      map,
    });
  };

  /*
   * ============================================================
   * CREATE / UPDATE LIVE BUS MARKERS
   * ============================================================
   */

  useEffect(() => {
    const map = mapRef.current;

    if (
      !map ||
      !initializedRef.current
    ) {
      return;
    }

    let active = true;

    async function synchronizeMarkers() {
      try {
        /*
         * Load Advanced Marker library.
         */
        const markerLibrary =
          await importLibrary("marker");

        if (!active) {
          return;
        }

        const AdvancedMarkerElement =
          markerLibrary.AdvancedMarkerElement;

        const liveBusIds =
          new Set(
            buses.map(
              (bus) => bus.id
            )
          );

        /*
         * ========================================================
         * REMOVE BUSES THAT ARE NO LONGER LIVE
         * ========================================================
         */

        markersRef.current.forEach(
          (record, id) => {
            if (
              !liveBusIds.has(id)
            ) {
              if (
                record.animationFrame !==
                null
              ) {
                cancelAnimationFrame(
                  record.animationFrame
                );
              }

              record.marker.map =
                null;

              markersRef.current.delete(
                id
              );
            }
          }
        );

        /*
         * ========================================================
         * CREATE / UPDATE EACH BUS
         * ========================================================
         */

        for (
          const bus of buses
        ) {
          const latitude =
            Number(
              bus.latitude
            );

          const longitude =
            Number(
              bus.longitude
            );

          if (
            !Number.isFinite(
              latitude
            ) ||
            !Number.isFinite(
              longitude
            )
          ) {
            continue;
          }

          const newPosition = {
            lat: latitude,
            lng: longitude,
          };

          const existing =
            markersRef.current.get(
              bus.id
            );

          /*
           * ======================================================
           * NEW BUS
           * ======================================================
           */

          if (!existing) {
            const markerElement =
              createBusMarkerElement(
                bus.busNumber
              );

            const marker =
              new AdvancedMarkerElement(
                {
                  map,

                  position:
                    newPosition,

                  title:
                    `${bus.busNumber} — Live GPS`,

                  content:
                    markerElement,

                  gmpClickable: true,
                }
              );

            marker.addListener(
              "click",
              () => {
                openBusInfo(bus);
              }
            );

            markersRef.current.set(
              bus.id,
              {
                marker,

                position:
                  newPosition,

                animationFrame:
                  null,
              }
            );

            continue;
          }

          /*
           * ======================================================
           * EXISTING BUS
           * ======================================================
           */

          const startPosition =
            existing.position;

          const endPosition =
            newPosition;

          const unchanged =
            startPosition.lat ===
              endPosition.lat &&
            startPosition.lng ===
              endPosition.lng;

          if (unchanged) {
            existing.marker.position =
              endPosition;

            existing.position =
              endPosition;

            continue;
          }

          /*
           * Cancel previous animation.
           */
          if (
            existing.animationFrame !==
            null
          ) {
            cancelAnimationFrame(
              existing.animationFrame
            );

            existing.animationFrame =
              null;
          }

          /*
           * Smooth movement.
           */
          const startTime =
            performance.now();

          const duration =
            900;

          const animate = (
            currentTime: number
          ) => {
            const elapsed =
              currentTime -
              startTime;

            const rawProgress =
              elapsed /
              duration;

            const progress =
              smoothStep(
                rawProgress
              );

            const nextLat =
              startPosition.lat +
              (
                endPosition.lat -
                startPosition.lat
              ) *
                progress;

            const nextLng =
              startPosition.lng +
              (
                endPosition.lng -
                startPosition.lng
              ) *
                progress;

            existing.marker.position =
              {
                lat: nextLat,
                lng: nextLng,
              };

            if (
              rawProgress < 1
            ) {
              existing.animationFrame =
                requestAnimationFrame(
                  animate
                );
            } else {
              existing.animationFrame =
                null;

              existing.position =
                endPosition;
            }
          };

          existing.animationFrame =
            requestAnimationFrame(
              animate
            );
        }

        /*
         * ========================================================
         * FOLLOW SELECTED BUS
         * ========================================================
         */

        if (
          followBusId
        ) {
          const selectedBus =
            buses.find(
              (bus) =>
                bus.id ===
                followBusId
            );

          if (selectedBus) {
            map.panTo({
              lat:
                selectedBus.latitude,

              lng:
                selectedBus.longitude,
            });
          }
        }

        /*
         * ========================================================
         * ONE LIVE BUS
         * ========================================================
         */

        else if (
          buses.length === 1
        ) {
          const bus =
            buses[0];

          map.panTo({
            lat:
              bus.latitude,

            lng:
              bus.longitude,
          });
        }

        /*
         * ========================================================
         * MULTIPLE LIVE BUSES
         * ========================================================
         */

        else if (
          buses.length > 1
        ) {
          const firstBus =
            buses[0];

          const minLat =
            Math.min(
              ...buses.map(
                (bus) =>
                  Number(
                    bus.latitude
                  )
              )
            );

          const maxLat =
            Math.max(
              ...buses.map(
                (bus) =>
                  Number(
                    bus.latitude
                  )
              )
            );

          const minLng =
            Math.min(
              ...buses.map(
                (bus) =>
                  Number(
                    bus.longitude
                  )
              )
            );

          const maxLng =
            Math.max(
              ...buses.map(
                (bus) =>
                  Number(
                    bus.longitude
                  )
              )
            );

          /*
           * Center between all buses.
           */
          const centerLat =
            (minLat + maxLat) /
            2;

          const centerLng =
            (minLng + maxLng) /
            2;

          /*
           * Keep map centered on
           * live buses without requiring
           * additional Google namespace types.
           */
          map.setCenter({
            lat: centerLat,
            lng: centerLng,
          });

          /*
           * Use a slightly wider view
           * when buses are far apart.
           */
          if (
            Math.abs(
              maxLat - minLat
            ) > 0.01 ||
            Math.abs(
              maxLng - minLng
            ) > 0.01
          ) {
            map.setZoom(12);
          } else {
            map.setZoom(14);
          }

          /*
           * Avoid unused-variable warning.
           */
          void firstBus;
        }
      } catch (error) {
        console.error(
          "Live bus marker synchronization error:",
          error
        );
      }
    }

    synchronizeMarkers();

    return () => {
      active = false;
    };
  }, [
    buses,
    followBusId,
  ]);

  /*
   * ============================================================
   * CLEANUP
   * ============================================================
   */

  useEffect(() => {
    return () => {
      markersRef.current.forEach(
        (record) => {
          if (
            record.animationFrame !==
            null
          ) {
            cancelAnimationFrame(
              record.animationFrame
            );
          }

          record.marker.map =
            null;
        }
      );

      markersRef.current.clear();

      infoWindowRef.current =
        null;

      mapRef.current = null;

      initializedRef.current =
        false;
    };
  }, []);

  /*
   * ============================================================
   * LIVE BUS COUNT
   * ============================================================
   */

  const liveBusCount =
    buses.length;

  return (
    <div
      className={`
        relative
        w-full
        overflow-hidden
        rounded-[28px]
        border
        border-slate-200
        bg-slate-100
        shadow-inner
        ${heightClassName}
      `}
    >
      {/* ========================================================
          GOOGLE MAP
          ======================================================== */}

      <div
        ref={mapElementRef}
        className="
          absolute
          inset-0
        "
      />

      {/* ========================================================
          LIVE STATUS CARD
          BOTTOM LEFT
          ======================================================== */}

      <div
        className="
          absolute
          left-4
          bottom-4
          z-30
          rounded-2xl
          border
          border-white/70
          bg-white/95
          px-5
          py-4
          shadow-[0_12px_30px_rgba(15,23,42,0.18)]
          backdrop-blur-md
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          {/* LIVE DOT */}

          <span
            className="
              relative
              flex
              h-4
              w-4
              items-center
              justify-center
            "
          >
            <span
              className="
                absolute
                inline-flex
                h-full
                w-full
                animate-ping
                rounded-full
                bg-emerald-400
                opacity-40
              "
            />

            <span
              className="
                relative
                inline-flex
                h-3
                w-3
                rounded-full
                bg-emerald-500
              "
            />
          </span>

          <div>
            <p
              className="
                text-sm
                font-extrabold
                text-slate-900
              "
            >
              {liveBusCount}{" "}
              {liveBusCount === 1
                ? "Bus Live"
                : "Buses Live"}
            </p>

            <p
              className="
                mt-0.5
                text-xs
                font-medium
                text-slate-500
              "
            >
              Real-time GPS tracking
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          MAP LABEL
          ======================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          right-4
          bottom-4
          z-20
          rounded-full
          border
          border-white/70
          bg-white/90
          px-3
          py-1.5
          text-[11px]
          font-bold
          text-slate-600
          shadow-sm
          backdrop-blur-md
        "
      >
        Google Maps • Live
      </div>

      {/* ========================================================
          NO LIVE BUS
          ======================================================== */}

      {liveBusCount === 0 && (
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-20
            flex
            items-center
            justify-center
          "
        >
          <div
            className="
              rounded-2xl
              border
              border-white/70
              bg-white/95
              px-7
              py-6
              text-center
              shadow-[0_12px_35px_rgba(15,23,42,0.15)]
              backdrop-blur-md
            "
          >
            <div
              className="
                mb-3
                text-4xl
              "
            >
              🚌
            </div>

            <p
              className="
                text-sm
                font-extrabold
                text-slate-900
              "
            >
              No Live Bus
            </p>

            <p
              className="
                mt-1
                text-xs
                font-medium
                text-slate-500
              "
            >
              Start GPS tracking from
              the driver dashboard.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}