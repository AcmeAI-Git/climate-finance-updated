import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Normalize division names for data lookup
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

const BangladeshMapComponent = ({
    data = [],
    title = "Regional Distribution Map",
    height = 400,
}) => {
    const [hoveredFeature, setHoveredFeature] = useState(null);
    const [geojson, setGeojson] = useState(null);
    const [countryGeojson, setCountryGeojson] = useState(null);

    useEffect(() => {
        console.log(data);
        // Load division boundaries
        fetch("/geoBoundaries-BGD-ADM1.geojson")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load ADM1");
                return res.json();
            })
            .then(setGeojson)
            .catch((err) => console.error("GeoJSON ADM1 load error:", err));

        // Load country boundary for white fill
        fetch("/geoBoundaries-BGD-ADM0.geojson")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load ADM0");
                return res.json();
            })
            .then(setCountryGeojson)
            .catch((err) => console.error("GeoJSON ADM0 load error:", err));
    }, []);

    const regionData = {};
    data.forEach((item) => {
        if (item.region) {
            regionData[item.region.toLowerCase()] = item;
        }
    });

    const normalizeRegionName = (shapeName) => {
        const cleanName = shapeName
            .replace(" Division", "")
            .replace("Rajshani", "Rajshahi")
            .trim();

        for (const [canonical, variants] of Object.entries(REGION_NAME_MAP)) {
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

    const getDivisionData = (canonicalName) => {
        const variants = REGION_NAME_MAP[canonicalName] || [canonicalName];
        for (const variant of variants) {
            const key = variant.toLowerCase();
            if (regionData[key]) return regionData[key];
        }
        return null;
    };

    const countryStyle = () => ({
        fillColor: "#FFFFFF",
        weight: 0,
        opacity: 0,
        color: "transparent",
        fillOpacity: 0.3,
    });

    const style = (feature) => {
        const isHovered = hoveredFeature === feature;
        return {
            fillColor: isHovered ? "#C4B5FD" : "#F3F4F6",
            weight: isHovered ? 4 : 2,
            opacity: 1,
            color: "#7C3AED",
            fillOpacity: isHovered ? 0.3 : 0.1,
        };
    };

    const onEachFeature = (feature, layer) => {
        const rawName = feature.properties.shapeName || "Unknown";
        const normalizedName = normalizeRegionName(rawName);
        const data = getDivisionData(normalizedName);

        layer.on({
            mouseover: (e) => {
                setHoveredFeature(feature);
                const layer = e.target;
                layer.setStyle({
                    weight: 4,
                    fillOpacity: 0.3,
                });
                layer.bringToFront();
            },
            mouseout: (e) => {
                setHoveredFeature(null);
                const layer = e.target;
                layer.setStyle(style(feature));
            },
            click: () => {
                // Optional: zoom to feature
            },
        });

        const displayName = normalizedName;

        if (data) {
            layer.bindPopup(`
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 200px;">
                  <div style="font-weight: 600; font-size: 16px; color: #1F2937; margin-bottom: 8px; border-bottom: 2px solid #7C3AED; padding-bottom: 4px;">
                    ${displayName}
                  </div>
                  <div style="margin-bottom: 6px;">
                    <span style="color: #059669; font-weight: 500;">Active Projects:</span>
                    <span style="color: #374151; margin-left: 4px;">${
                        data.active || 0
                    }</span>
                  </div>
                  <div style="margin-bottom: 6px;">
                    <span style="color: #6366F1; font-weight: 500;">Completed Projects:</span>
                    <span style="color: #374151; margin-left: 4px;">${
                        data.completed || 0
                    }</span>
                  </div>
                  <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #E5E7EB;">
                    <span style="color: #7C3AED; font-weight: 600; font-size: 14px;">Total Projects:</span>
                    <span style="color: #1F2937; font-weight: 600; margin-left: 4px;">
                      ${
                          data.total ||
                          (data.active || 0) + (data.completed || 0)
                      }
                    </span>
                  </div>
                </div>
            `);
        } else {
            layer.bindPopup(`
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 150px;">
                  <div style="font-weight: 600; font-size: 16px; color: #1F2937; margin-bottom: 8px; border-bottom: 2px solid #7C3AED; padding-bottom: 4px;">
                    ${displayName}
                  </div>
                  <div style="color: #6B7280; font-style: italic;">
                    No data available
                  </div>
                </div>
            `);
        }
    };

    // Map center and bounds
    const center = [23.685, 90.3563];
    const maxBounds = [
        [20.0, 88.0],
        [27.0, 93.0],
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 select-none">
                {title}
            </h3>
            <div style={{ width: "100%", height: height, minHeight: 350 }}>
                <MapContainer
                    center={center}
                    zoom={6}
                    style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "12px",
                        minHeight: 350,
                    }}
                    scrollWheelZoom={false}
                    maxBounds={maxBounds}
                    maxBoundsViscosity={1.0}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {countryGeojson && (
                        <GeoJSON data={countryGeojson} style={countryStyle} />
                    )}
                    {geojson && (
                        <GeoJSON
                            data={geojson}
                            style={style}
                            onEachFeature={onEachFeature}
                        />
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default BangladeshMapComponent;
