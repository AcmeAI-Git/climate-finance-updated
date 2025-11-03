import React, { useState, useEffect, useRef, memo } from "react";
import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { area, centroid, bbox } from "@turf/turf";

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
        isDrawingEnabled = false,
        onDrawingToggle,
        onDrawingChange,
    }) => {
        const mapContainer = useRef(null);
        const map = useRef(null);
        const draw = useRef(null);
        const [mapLoaded, setMapLoaded] = useState(false);
        const [drawingMode, setDrawingMode] = useState("pan");
        const [geojsonLoaded, setGeojsonLoaded] = useState(false);

        const normalizeRegionName = (shapeName) => {
            const cleanName = shapeName
                .replace(" Division", "")
                .replace("Rajshani", "Rajshahi")
                .trim();

            for (const [canonical, variants] of Object.entries(
                REGION_NAME_MAP
            )) {
                if (
                    variants.some(
                        (v) => v.toLowerCase() === cleanName.toLowerCase()
                    )
                ) {
                    return canonical;
                }
            }
            return cleanName;
        };

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

                // Initialize Draw
                draw.current = new MapboxDraw({
                    displayControlsDefault: false,
                    controls: { polygon: true, point: true, trash: true },
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
        }, []);

        const handleDrawingChange = () => {
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
        };

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

        const loadDivisionBoundaries = async () => {
            if (!map.current) return;

            try {
                const response = await fetch("/geoBoundaries-BGD-ADM1.geojson");
                if (!response.ok) throw new Error("Failed to load boundaries");
                const geojson = await response.json();

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

                setGeojsonLoaded(true);
            } catch (error) {
                console.error("Error loading boundaries:", error);
            }
        };

        const addDataLayers = (geojson) => {
            const regionData = {};
            data.forEach((item) => {
                if (item.region) {
                    regionData[item.region.toLowerCase()] = item;
                }
            });

            const features = geojson.features.map((feature) => {
                const normalizedName = normalizeRegionName(
                    feature.properties.shapeName
                );
                const variants = REGION_NAME_MAP[normalizedName] || [
                    normalizedName,
                ];
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

            // Add colored layer based on data
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

            // Add hover effects
            map.current.on("mouseenter", "data-fill", () => {
                map.current.getCanvas().style.cursor = "pointer";
            });

            map.current.on("mouseleave", "data-fill", () => {
                map.current.getCanvas().style.cursor = "";
            });

            map.current.on("click", "data-fill", (e) => {
                if (e.features[0]) {
                    const feature = e.features[0];
                    const props = feature.properties;
                    const popup = new maplibregl.Popup({
                        closeButton: true,
                        closeOnClick: false,
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

                    // Style the close button to make it larger
                    const closeButton = document.querySelector(
                        ".maplibregl-popup-close-button"
                    );
                    if (closeButton) {
                        closeButton.style.fontSize = "28px";
                        closeButton.style.width = "32px";
                        closeButton.style.height = "32px";
                        closeButton.style.padding = "0";
                        closeButton.style.display = "flex";
                        closeButton.style.alignItems = "center";
                        closeButton.style.justifyContent = "center";
                    }
                }
            });
        };

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
        }, [mapStyle, mapLoaded]);

        useEffect(() => {
            if (draw.current && map.current && drawingMode === "pan") {
                draw.current.changeMode("simple_select");
                map.current.dragPan.enable();
                map.current.getCanvasContainer().style.cursor = "grab";
            } else if (draw.current && drawingMode === "polygon") {
                draw.current.changeMode("draw_polygon");
                map.current.dragPan.disable();
                map.current.getCanvasContainer().style.cursor = "crosshair";
            }
        }, [drawingMode]);

        const getButtonStyle = (isActive) => {
            if (isActive) return "bg-orange-500 text-white";
            return viewMode === "dark"
                ? "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300";
        };

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
