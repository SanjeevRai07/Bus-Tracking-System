"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import {
  importLibrary,
  setOptions,
} from "@googlemaps/js-api-loader";

export type LiveMapBus = {
  id: string;

  // Supports both current dashboard formats.
  bus_number?: string;
  busNumber?: string;

  latitude: number;
  longitude: number;

  driverName?: string | null;
  routeName?: string | null;

  // Supports both naming styles.
  updated_at?: string;
  updatedAt?: string | null;
};

type LiveMapProps = {
  buses?: LiveMapBus[];

  followBusId?: string | null;

  heightClassName?: string;
};

type MapInstance = any;
type MarkerInstance = any;
type InfoWindowInstance = any;

const DEFAULT_CENTER = {
  lat: 22.8046,
  lng: 86.2029,
};

let mapsLoaderConfigured = false;

export default function LiveMap({
  buses = [],
  followBusId = null,
  heightClassName = "h-[620px]",
}: LiveMapProps) {
  const mapContainerRef =
    useRef<HTMLDivElement | null>(null);

  const mapRef =
    useRef<MapInstance>(null);

  const markerClassRef =
    useRef<any>(null);

  const infoWindowClassRef =
    useRef<any>(null);

  const markersRef =
    useRef<Record<string, MarkerInstance>>({});

  const infoWindowsRef =
    useRef<Record<string, InfoWindowInstance>>({});

  const lastPositionsRef =
    useRef<
      Record<
        string,
        {
          lat: number;
          lng: number;
        }
      >
    >({});

  const animationFramesRef =
    useRef<Record<string, number>>({});

  const centeredRef =
    useRef(false);

  const initializedRef =
    useRef(false);

  // ============================================================
  // GOOGLE MAP INITIALIZATION
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      if (
        initializedRef.current ||
        !mapContainerRef.current
      ) {
        return;
      }

      try {
        const apiKey =
          process.env
            .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          console.error(
            "Google Maps API key is missing."
          );
          return;
        }

        /*
         * @googlemaps/js-api-loader warns when setOptions()
         * is called more than once.
         *
         * This guard prevents repeated configuration.
         */
        if (!mapsLoaderConfigured) {
          setOptions({
            key: apiKey,
            v: "weekly",
          });

          mapsLoaderConfigured = true;
        }

        const maps =
          await importLibrary("maps");

        const marker =
          await importLibrary("marker");

        if (
          cancelled ||
          !mapContainerRef.current
        ) {
          return;
        }

        const MapClass =
          maps.Map;

        const InfoWindowClass =
          maps.InfoWindow;

        const AdvancedMarkerElement =
          marker.AdvancedMarkerElement;

        const map =
          new MapClass(
            mapContainerRef.current,
            {
              center:
                DEFAULT_CENTER,

              zoom: 14,

              mapId:
                "DEMO_MAP_ID",

              mapTypeId:
                "roadmap",

              mapTypeControl:
                true,

              mapTypeControlOptions: {
                mapTypeIds: [
                  "roadmap",
                  "satellite",
                  "hybrid",
                  "terrain",
                ],
              },

              zoomControl:
                true,

              fullscreenControl:
                true,

              streetViewControl:
                true,

              gestureHandling:
                "greedy",

              clickableIcons:
                true,
            }
          );

        mapRef.current =
          map;

        markerClassRef.current =
          AdvancedMarkerElement;

        infoWindowClassRef.current =
          InfoWindowClass;

        initializedRef.current =
          true;
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

      Object.values(
        animationFramesRef.current
      ).forEach((frameId) => {
        cancelAnimationFrame(
          frameId
        );
      });

      animationFramesRef.current =
        {};

      Object.values(
        markersRef.current
      ).forEach((marker) => {
        marker.map = null;
      });

      markersRef.current =
        {};

      infoWindowsRef.current =
        {};

      lastPositionsRef.current =
        {};

      mapRef.current =
        null;

      initializedRef.current =
        false;
    };
  }, []);

  // ============================================================
  // CREATE BUS MARKER
  // ============================================================

  function createBusMarkerElement(
    bus: LiveMapBus
  ) {
    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.style.position =
      "relative";

    wrapper.style.width =
      "68px";

    wrapper.style.height =
      "72px";

    wrapper.style.cursor =
      "pointer";

    const pulse =
      document.createElement(
        "div"
      );

    pulse.style.position =
      "absolute";

    pulse.style.left =
      "7px";

    pulse.style.top =
      "7px";

    pulse.style.width =
      "54px";

    pulse.style.height =
      "54px";

    pulse.style.borderRadius =
      "9999px";

    pulse.style.background =
      "rgba(14,165,233,.20)";

    pulse.style.animation =
      "ajuLiveBusPulse 1.8s ease-out infinite";

    const circle =
      document.createElement(
        "div"
      );

    circle.style.position =
      "absolute";

    circle.style.left =
      "8px";

    circle.style.top =
      "8px";

    circle.style.width =
      "52px";

    circle.style.height =
      "52px";

    circle.style.borderRadius =
      "50%";

    circle.style.border =
      "4px solid white";

    circle.style.background =
      "linear-gradient(135deg,#005BAC,#0EA5E9)";

    circle.style.boxShadow =
      "0 6px 20px rgba(0,0,0,.30)";

    circle.style.display =
      "flex";

    circle.style.alignItems =
      "center";

    circle.style.justifyContent =
      "center";

    circle.style.fontSize =
      "25px";

    circle.innerText =
      "🚌";

    const label =
      document.createElement(
        "div"
      );

    label.style.position =
      "absolute";

    label.style.top =
      "62px";

    label.style.left =
      "50%";

    label.style.transform =
      "translateX(-50%)";

    label.style.padding =
      "3px 9px";

    label.style.borderRadius =
      "9999px";

    label.style.border =
      "1px solid #dbeafe";

    label.style.background =
      "white";

    label.style.boxShadow =
      "0 2px 8px rgba(0,0,0,.15)";

    label.style.color =
      "#005BAC";

    label.style.fontFamily =
      "Arial,sans-serif";

    label.style.fontSize =
      "11px";

    label.style.fontWeight =
      "800";

    label.style.whiteSpace =
      "nowrap";

    label.innerText =
      getBusNumber(bus);

    wrapper.appendChild(
      pulse
    );

    wrapper.appendChild(
      circle
    );

    wrapper.appendChild(
      label
    );

    return wrapper;
  }

  // ============================================================
  // INFO WINDOW
  // ============================================================

  function createInfoContent(
    bus: LiveMapBus
  ) {
    const updatedValue =
      getUpdatedAt(bus);

    const updated =
      updatedValue
        ? new Date(
            updatedValue
          ).toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }
          )
        : "Unknown";

    return `
      <div
        style="
          min-width:250px;
          padding:6px;
          font-family:Arial,sans-serif;
        "
      >
        <div
          style="
            font-size:10px;
            color:#64748b;
            font-weight:800;
            letter-spacing:1px;
          "
        >
          AJU SMART BUS
        </div>

        <div
          style="
            margin-top:5px;
            font-size:20px;
            color:#005BAC;
            font-weight:800;
          "
        >
          🚌 ${escapeHtml(
            getBusNumber(bus)
          )}
        </div>

        <div
          style="
            margin-top:12px;
            display:grid;
            gap:8px;
          "
        >
          <div
            style="
              border-radius:10px;
              padding:9px;
              background:#f8fafc;
            "
          >
            <div
              style="
                color:#94a3b8;
                font-size:10px;
                font-weight:700;
              "
            >
              DRIVER
            </div>

            <div
              style="
                margin-top:3px;
                color:#0f172a;
                font-size:13px;
                font-weight:700;
              "
            >
              ${escapeHtml(
                bus.driverName ??
                  "Not assigned"
              )}
            </div>
          </div>

          <div
            style="
              border-radius:10px;
              padding:9px;
              background:#f8fafc;
            "
          >
            <div
              style="
                color:#94a3b8;
                font-size:10px;
                font-weight:700;
              "
            >
              ROUTE
            </div>

            <div
              style="
                margin-top:3px;
                color:#0f172a;
                font-size:13px;
                font-weight:700;
              "
            >
              ${escapeHtml(
                bus.routeName ??
                  "Not assigned"
              )}
            </div>
          </div>

          <div
            style="
              border-radius:10px;
              padding:9px;
              background:#f0fdf4;
            "
          >
            <div
              style="
                color:#16a34a;
                font-size:10px;
                font-weight:700;
              "
            >
              LAST GPS UPDATE
            </div>

            <div
              style="
                margin-top:3px;
                color:#15803d;
                font-size:13px;
                font-weight:800;
              "
            >
              ${updated}
            </div>
          </div>

          <div
            style="
              border-radius:10px;
              padding:9px;
              background:#eff6ff;
            "
          >
            <div
              style="
                color:#2563eb;
                font-size:10px;
                font-weight:700;
              "
            >
              LIVE LOCATION
            </div>

            <div
              style="
                margin-top:3px;
                color:#1e3a8a;
                font-size:12px;
                font-weight:700;
              "
            >
              ${bus.latitude.toFixed(
                6
              )},
              ${bus.longitude.toFixed(
                6
              )}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================================
  // UPDATE BUS MARKERS
  // ============================================================

  useEffect(() => {
    const map =
      mapRef.current;

    const AdvancedMarkerElement =
      markerClassRef.current;

    const InfoWindowClass =
      infoWindowClassRef.current;

    if (
      !map ||
      !AdvancedMarkerElement ||
      !InfoWindowClass
    ) {
      return;
    }

    const currentBusIds =
      new Set(
        buses.map(
          (bus) => bus.id
        )
      );

    // ----------------------------------------------------------
    // REMOVE MARKERS NO LONGER LIVE
    // ----------------------------------------------------------

    Object.keys(
      markersRef.current
    ).forEach((busId) => {
      if (
        !currentBusIds.has(
          busId
        )
      ) {
        markersRef.current[
          busId
        ].map = null;

        delete markersRef.current[
          busId
        ];

        delete infoWindowsRef.current[
          busId
        ];

        delete lastPositionsRef.current[
          busId
        ];

        if (
          animationFramesRef
            .current[busId]
        ) {
          cancelAnimationFrame(
            animationFramesRef
              .current[busId]
          );

          delete animationFramesRef
            .current[busId];
        }
      }
    });

    // ----------------------------------------------------------
    // CREATE / UPDATE MARKERS
    // ----------------------------------------------------------

    buses.forEach((bus) => {
      const target = {
        lat: Number(
          bus.latitude
        ),
        lng: Number(
          bus.longitude
        ),
      };

      if (
        !Number.isFinite(
          target.lat
        ) ||
        !Number.isFinite(
          target.lng
        )
      ) {
        return;
      }

      const existingMarker =
        markersRef.current[
          bus.id
        ];

      // --------------------------------------------------------
      // NEW MARKER
      // --------------------------------------------------------

      if (!existingMarker) {
        const element =
          createBusMarkerElement(
            bus
          );

        const marker =
          new AdvancedMarkerElement({
            map,

            position:
              target,

            title:
              `${getBusNumber(
                bus
              )} - LIVE`,

            content:
              element,
          });

        const infoWindow =
          new InfoWindowClass({
            content:
              createInfoContent(
                bus
              ),
          });

        marker.addListener(
          "click",
          () => {
            infoWindow.setContent(
              createInfoContent(
                bus
              )
            );

            infoWindow.open({
              map,
              anchor:
                marker,
            });
          }
        );

        markersRef.current[
          bus.id
        ] = marker;

        infoWindowsRef.current[
          bus.id
        ] = infoWindow;

        lastPositionsRef.current[
          bus.id
        ] = target;

        return;
      }

      // --------------------------------------------------------
      // SMOOTH MOVEMENT
      // --------------------------------------------------------

      const previous =
        lastPositionsRef.current[
          bus.id
        ] ?? target;

      const startLat =
        Number(
          previous.lat
        );

      const startLng =
        Number(
          previous.lng
        );

      if (
        animationFramesRef
          .current[bus.id]
      ) {
        cancelAnimationFrame(
          animationFramesRef
            .current[bus.id]
        );
      }

      const animationDuration =
        900;

      const startTime =
        performance.now();

      function animate(
        currentTime: number
      ) {
        const elapsed =
          currentTime -
          startTime;

        const progress =
          Math.min(
            elapsed /
              animationDuration,
            1
          );

        const eased =
          progress *
          progress *
          (3 -
            2 *
              progress);

        existingMarker.position = {
          lat:
            startLat +
            (target.lat -
              startLat) *
              eased,

          lng:
            startLng +
            (target.lng -
              startLng) *
              eased,
        };

        if (
          progress < 1
        ) {
          animationFramesRef
            .current[
              bus.id
            ] =
              requestAnimationFrame(
                animate
              );
        } else {
          lastPositionsRef
            .current[
              bus.id
            ] =
              target;

          delete animationFramesRef
            .current[
              bus.id
            ];
        }
      }

      animationFramesRef
        .current[
          bus.id
        ] =
        requestAnimationFrame(
          animate
        );

      existingMarker.title =
        `${getBusNumber(
          bus
        )} - LIVE`;

      const infoWindow =
        infoWindowsRef.current[
          bus.id
        ];

      if (infoWindow) {
        infoWindow.setContent(
          createInfoContent(
            bus
          )
        );
      }
    });

    // ----------------------------------------------------------
    // FOLLOW SELECTED BUS
    // ----------------------------------------------------------

    if (
      followBusId
    ) {
      const followed =
        buses.find(
          (bus) =>
            bus.id ===
            followBusId
        );

      if (followed) {
        map.panTo({
          lat:
            followed.latitude,
          lng:
            followed.longitude,
        });
      }
    }

    // ----------------------------------------------------------
    // CENTER ON FIRST LIVE BUS
    // ----------------------------------------------------------

    if (
      buses.length > 0 &&
      !centeredRef.current &&
      !followBusId
    ) {
      const firstBus =
        buses[0];

      map.panTo({
        lat:
          firstBus.latitude,
        lng:
          firstBus.longitude,
      });

      map.setZoom(16);

      centeredRef.current =
        true;
    }
  }, [
    buses,
    followBusId,
  ]);

  // ============================================================
  // RESET CENTER
  // ============================================================

  useEffect(() => {
    if (
      buses.length === 0
    ) {
      centeredRef.current =
        false;
    }
  }, [buses.length]);

  // ============================================================
  // UI
  // ============================================================

  const mapHeightStyle: CSSProperties = {
    minHeight: "500px",
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl ${heightClassName}`}
      style={mapHeightStyle}
    >
      <div
        ref={mapContainerRef}
        className="absolute inset-0 h-full w-full"
      />

      {/* No Live Bus overlay intentionally removed. */}

      <div className="pointer-events-none absolute bottom-4 left-4 z-10">
        <div className="rounded-2xl border border-white/60 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${
                buses.length > 0
                  ? "animate-pulse bg-green-500"
                  : "bg-slate-300"
              }`}
            />

            <div>
              <p className="text-sm font-black text-slate-800">
                {buses.length}{" "}
                {buses.length === 1
                  ? "Bus"
                  : "Buses"}{" "}
                Live
              </p>

              <p className="text-xs text-slate-500">
                Real-time GPS tracking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function getBusNumber(
  bus: LiveMapBus
) {
  return (
    bus.bus_number ??
    bus.busNumber ??
    `BUS ${bus.id.slice(0, 8)}`
  );
}

function getUpdatedAt(
  bus: LiveMapBus
) {
  return (
    bus.updated_at ??
    bus.updatedAt ??
    null
  );
}

function escapeHtml(
  value: string
) {
  return value
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}