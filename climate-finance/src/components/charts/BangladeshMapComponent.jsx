import React, { useState, useEffect, useRef, memo } from "react";
import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { area, centroid } from "@turf/turf";

const REGION_NAME_MAP = {
    Dhaka: ["Dhaka"],
    Chattogram: ["Chattogram", "Chittagong"],
    Khulna: ["Khulna"],
    Barisal: ["Barisal", "Barishal"],
    Sylhet: ["Sylhet"],
    Rajshahi: ["Rajshahi"],
    Rangpur: ["Rangpur"],
    Mymensingh: ["Mymensingh"],
};

const BangladeshMapComponent = memo(
    ({
        data = [],
        title = "Regional Distribution Map",
        height = 400,
        viewMode = "light",
        mapStyle = "standard",
        onDrawingChange,
    }) => {
        const mapContainer = useRef(null);
        const map = useRef(null);
        const draw = useRef(null);
        const [mapLoaded, setMapLoaded] = useState(false);
        const currentPopup = useRef(null); // Track the currently open popup
        const touchStartPos = useRef(null); // Track touch start position

        const normalizeRegionName = React.useCallback((shapeName) => {
            const cleanName = shapeName
                .replace(" Division", "")
                .replace("Rajshani", "Rajshahi")
                .trim();
            for (const [canonical, variants] of Object.entries(REGION_NAME_MAP)) {
                if (variants.some((v) => v.toLowerCase() === cleanName.toLowerCase())) {
                    return canonical;
                }
            }
            return cleanName;
        }, []);

        const getMapStyle = (style) => {
            if (style === "satellite") {
                return {
                    version: 8,
                    sources: {
                        satellite: {
                            type: "raster",
                            tiles: [
                                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                            ],
                            tileSize: 256,
                            attribution: "© Esri, Maxar, GeoEye",
                        },
                    },
                    layers: [
                        {
                            id: "satellite-tiles",
                            type: "raster",
                            source: "satellite",
                            minzoom: 0,
                            maxzoom: 22,
                        },
                    ],
                };
            } else {
                return {
                    version: 8,
                    sources: {
                        osm: {
                            type: "raster",
                            tiles: [
                                "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                            ],
                            tileSize: 256,
                            attribution: "© OpenStreetMap contributors",
                        },
                    },
                    layers: [
                        {
                            id: "osm-tiles",
                            type: "raster",
                            source: "osm",
                            minzoom: 0,
                            maxzoom: 22,
                        },
                    ],
                };
            }
        };

        // Move handleDrawingChange and calculatePolygonProperties above useEffect
        const handleDrawingChange = React.useCallback(() => {
            if (draw.current && onDrawingChange) {
                const features = draw.current.getAll();
                const enhancedFeatures = features.features.map((feature) => {
                    const props = calculatePolygonProperties(feature);
                    return {
                        ...feature,
                        properties: {
                            ...feature.properties,
                            area_m2: props?.areaM2,
                            area_km2: props?.areaKm2,
                            centroid_lon: props?.centroid[0],
                            centroid_lat: props?.centroid[1],
                        },
                    };
                });
                onDrawingChange(enhancedFeatures);
            }
        }, [onDrawingChange]);

        const calculatePolygonProperties = (feature) => {
            try {
                if (feature.geometry?.type === "Polygon") {
                    const areaM2 = area(feature);
                    const areaKm2 = areaM2 / 1000000;
                    const centroidResult = centroid(feature);
                    return {
                        areaM2: Math.round(areaM2),
                        areaKm2: parseFloat(areaKm2.toFixed(6)),
                        centroid: centroidResult.geometry.coordinates,
                    };
                }
            } catch (error) {
                console.warn("Error calculating polygon properties:", error);
            }
            return null;
        };

        const addDataLayers = React.useCallback((geojson) => {
            const regionData = {};
            data.forEach((item) => {
                if (item.region) {
                    regionData[item.region.toLowerCase()] = item;
                }
            });
            const features = geojson.features.map((feature) => {
                const normalizedName = normalizeRegionName(feature.properties.shapeName);
                const variants = REGION_NAME_MAP[normalizedName] || [normalizedName];
                let itemData = null;
                for (const variant of variants) {
                    if (regionData[variant.toLowerCase()]) {
                        itemData = regionData[variant.toLowerCase()];
                        break;
                    }
                }
                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        displayName: normalizedName,
                        ...itemData,
                    },
                };
            });
            if (map.current.getSource("data-overlay")) {
                if (map.current.getLayer("data-fill")) {
                    map.current.removeLayer("data-fill");
                }
                map.current.removeSource("data-overlay");
            }
            map.current.addSource("data-overlay", {
                type: "geojson",
                data: { type: "FeatureCollection", features },
            });
            map.current.addLayer(
                {
                    id: "data-fill",
                    type: "fill",
                    source: "data-overlay",
                    paint: {
                        "fill-color": [
                            "case",
                            ["has", "active"],
                            [
                                "interpolate",
                                ["linear"],
                                ["get", "active"],
                                0,
                                "#fee5e5",
                                100,
                                "#dc2626",
                            ],
                            "#f3f4f6",
                        ],
                        "fill-opacity": 0.6,
                    },
                },
                "divisions-line"
            );
            // Helper function to show popup
            const showPopup = (e) => {
                if (e.features && e.features[0]) {
                    const feature = e.features[0];
                    const props = feature.properties;
                    // Close previous popup if open
                    if (currentPopup.current) {
                        currentPopup.current.remove();
                        currentPopup.current = null;
                    }
                    const popup = new maplibregl.Popup({
                        closeButton: true,
                        closeOnClick: false,
                        closeOnMove: false,
                    })
                        .setLngLat(e.lngLat)
                        .setHTML(
                            `<div style="font-family: system-ui; min-width: 200px;">
                            <h4 style="font-weight: 600; margin-bottom: 8px; border-bottom: 2px solid #7c3aed; padding-bottom: 4px;">
                                ${props.displayName}
                            </h4>
                            <p style="margin: 4px 0;"><span style="color: #059669; font-weight: 500;">Active:</span> ${
                                props.active || 0
                            }</p>
                            <p style="margin: 4px 0;"><span style="color: #6366f1; font-weight: 500;">Completed:</span> ${
                                props.completed || 0
                            }</p>
                            <p style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e5e7eb;">
                                <span style="color: #7c3aed; font-weight: 600;">Total:</span> ${
                                    props.total ||
                                    (props.active || 0) + (props.completed || 0)
                                }
                            </p>
                        </div>`
                        )
                        .addTo(map.current);
                    currentPopup.current = popup; // Track the new popup
                }
            };

            map.current.on("mouseenter", "data-fill", () => {
                map.current.getCanvas().style.cursor = "pointer";
            });
            map.current.on("mouseleave", "data-fill", () => {
                map.current.getCanvas().style.cursor = "";
            });
            
            // Handle click events (desktop and mobile after touch)
            map.current.on("click", "data-fill", showPopup);
            
            // Handle touch events (mobile) - track touch start to distinguish tap from pan
            map.current.on("touchstart", "data-fill", (e) => {
                if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length === 1) {
                    const touch = e.originalEvent.touches[0];
                    touchStartPos.current = {
                        x: touch.clientX,
                        y: touch.clientY,
                        time: Date.now(),
                    };
                }
            });
            
            map.current.on("touchend", "data-fill", (e) => {
                if (!touchStartPos.current) return;
                
                const touchEnd = e.originalEvent?.changedTouches?.[0];
                if (!touchEnd) return;
                
                const deltaX = Math.abs(touchEnd.clientX - touchStartPos.current.x);
                const deltaY = Math.abs(touchEnd.clientY - touchStartPos.current.y);
                const deltaTime = Date.now() - touchStartPos.current.time;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // Only trigger popup if it was a tap (not a pan/swipe)
                // Threshold: less than 10px movement and less than 300ms
                if (distance < 10 && deltaTime < 300 && e.features && e.features[0]) {
                    showPopup(e);
                }
                
                touchStartPos.current = null;
            });
        }, [data, normalizeRegionName]);

        const loadDivisionBoundaries = React.useCallback(async () => {
            if (!map.current) return;

            try {
                const response = await fetch("/geoBoundaries-BGD-ADM1.geojson");
                if (!response.ok) throw new Error("Failed to load boundaries");
                const geojson = await response.json();

                // Prevent duplicate source error
                if (map.current.getSource("divisions")) {
                    // Remove layers that use the source before removing the source
                    if (map.current.getLayer("divisions-fill")) {
                        map.current.removeLayer("divisions-fill");
                    }
                    if (map.current.getLayer("divisions-line")) {
                        map.current.removeLayer("divisions-line");
                    }
                    map.current.removeSource("divisions");
                }
                map.current.addSource("divisions", {
                    type: "geojson",
                    data: geojson,
                });

                map.current.addLayer({
                    id: "divisions-fill",
                    type: "fill",
                    source: "divisions",
                    paint: {
                        "fill-color":
                            viewMode === "dark" ? "#1e3a8a" : "#f3f4f6",
                        "fill-opacity": viewMode === "dark" ? 0.2 : 0.1,
                    },
                });

                map.current.addLayer({
                    id: "divisions-line",
                    type: "line",
                    source: "divisions",
                    paint: {
                        "line-color":
                            viewMode === "dark" ? "#60a5fa" : "#7c3aed",
                        "line-width": 2,
                        "line-opacity": 0.8,
                    },
                });

                // Add data overlay
                if (data.length > 0) {
                    addDataLayers(geojson);
                }
            } catch (error) {
                console.error("Error loading boundaries:", error);
            }
        }, [viewMode, data, addDataLayers]);

        useEffect(() => {
            if (map.current) return;

            if (mapContainer.current) {
                map.current = new maplibregl.Map({
                    container: mapContainer.current,
                    style: getMapStyle(mapStyle),
                    center: [90.3563, 23.69],
                    zoom: 2.5,
                    maxZoom: 18,
                    minZoom: 5,
                    maxBoundsViscosity: 1.0,
                });

                map.current.addControl(
                    new maplibregl.ScaleControl({
                        maxWidth: 100,
                        unit: "metric",
                    }),
                    "bottom-right"
                );

                map.current.addControl(
                    new maplibregl.NavigationControl({
                        showCompass: true,
                        showZoom: true,
                    }),
                    "bottom-right"
                );

                // Initialize Draw with custom styles to fix line-dasharray error
                draw.current = new MapboxDraw({
                    displayControlsDefault: false,
                    controls: { polygon: true, point: true, trash: true },
                    styles: [
                        // Fix for line-dasharray error
                        {
                            id: "gl-draw-line.cold",
                            type: "line",
                            filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
                            layout: { "line-cap": "round", "line-join": "round" },
                            paint: {
                                "line-color": "#3b9ddd",
                                "line-dasharray": ["literal", [0.2, 2]],
                                "line-width": 4,
                                "line-opacity": 0.7,
                            },
                        },
                        // You can add more custom styles for other draw layers if needed
                    ],
                });
                map.current.addControl(draw.current);

                map.current.on("load", () => {
                    setMapLoaded(true);
                    loadDivisionBoundaries();
                });

                map.current.on("draw.create", handleDrawingChange);
                map.current.on("draw.update", handleDrawingChange);
                map.current.on("draw.delete", handleDrawingChange);

                return () => {
                    if (map.current) {
                        map.current.remove();
                        map.current = null;
                    }
                };
            }
        }, [handleDrawingChange, loadDivisionBoundaries, mapStyle]);

        useEffect(() => {
            if (map.current && mapLoaded) {
                if (viewMode === "dark") {
                    map.current.getCanvas().style.filter =
                        "invert(0.9) hue-rotate(180deg) brightness(0.8)";
                } else {
                    map.current.getCanvas().style.filter = "none";
                }
            }
        }, [viewMode, mapLoaded]);

        useEffect(() => {
            if (map.current && mapLoaded) {
                map.current.setStyle(getMapStyle(mapStyle));
                map.current.once("styledata", () => {
                    loadDivisionBoundaries();
                });
            }
        }, [mapStyle, mapLoaded, loadDivisionBoundaries]);

        // Inject custom CSS for popup close button globally, only once
        useEffect(() => {
            if (!document.getElementById("custom-maplibre-popup-close-style")) {
                const style = document.createElement("style");
                style.id = "custom-maplibre-popup-close-style";
                style.innerHTML = `
                    .maplibregl-popup-close-button {
                        font-size: 28px !important;
                        width: 32px !important;
                        height: 32px !important;
                        padding: 0 !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        cursor: pointer !important;
                        background: #fff !important;
                        border-radius: 50% !important;
                        border: 1px solid #e5e7eb !important;
                        box-shadow: 0 1px 4px rgba(0,0,0,0.08);
                    }
                `;
                document.head.appendChild(style);
            }
        }, []);

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 select-none">
                    {title}
                </h3>
                <div
                    style={{
                        width: "100%",
                        height,
                        minHeight: 350,
                        position: "relative",
                    }}
                >
                    <div
                        ref={mapContainer}
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "12px",
                            touchAction: "pan-x pan-y",
                        }}
                    />

                    {/* Loading Indicator */}
                    {!mapLoaded && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading map...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

BangladeshMapComponent.displayName = "BangladeshMapComponent";

export default BangladeshMapComponent;
