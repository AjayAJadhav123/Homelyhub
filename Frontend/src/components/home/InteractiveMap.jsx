import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./InteractiveMap.css";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Custom markers for POIs
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const propertyIcon = createIcon("blue");
const collegeIcon = createIcon("green");
const hospitalIcon = createIcon("red");
const transitIcon = createIcon("orange");

// Map center updater component
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  
  // Fix the grey map rendering bug on initial load and resize
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [map]);
  return null;
};

// Helper: Calculate distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
};

// Simple Geocoding fallback for demo purposes based on Indian cities
const cityCoordinates = {
  mumbai: [19.0760, 72.8777],
  delhi: [28.7041, 77.1025],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  pune: [18.5204, 73.8567],
  hyderabad: [17.3850, 78.4867],
  default: [20.5937, 78.9629] // Center of India
};

const InteractiveMap = ({ properties }) => {
  const [activeProperty, setActiveProperty] = useState(null);
  const [mapCenter, setMapCenter] = useState(cityCoordinates.mumbai);
  const [poiType, setPoiType] = useState("all");

  // Assign rough coordinates to properties if missing
  const mappedProperties = useMemo(() => {
    return properties.map((p, index) => {
      let lat, lng;
      if (p.location?.lat && p.location?.lng) {
        lat = p.location.lat;
        lng = p.location.lng;
      } else {
        const cityKey = p.address?.city?.toLowerCase() || "";
        const baseCoord = cityCoordinates[cityKey] || cityCoordinates.default;
        // Add slight random offset to prevent overlap
        lat = baseCoord[0] + (Math.random() - 0.5) * 0.1;
        lng = baseCoord[1] + (Math.random() - 0.5) * 0.1;
      }
      return { ...p, mappedLat: lat, mappedLng: lng };
    });
  }, [properties]);

  // Generate some dummy POIs around the active map center
  const pois = useMemo(() => {
    const generatePOIs = (count, type, namePrefix, icon) => {
      return Array.from({ length: count }).map((_, i) => ({
        id: `${type}-${i}`,
        type,
        name: `${namePrefix} ${i + 1}`,
        lat: mapCenter[0] + (Math.random() - 0.5) * 0.05,
        lng: mapCenter[1] + (Math.random() - 0.5) * 0.05,
        icon
      }));
    };
    return [
      ...generatePOIs(3, "college", "University/College", collegeIcon),
      ...generatePOIs(2, "hospital", "City Hospital", hospitalIcon),
      ...generatePOIs(4, "transit", "Metro/Bus Station", transitIcon)
    ];
  }, [mapCenter]);

  const filteredPois = pois.filter(p => poiType === "all" || p.type === poiType);

  const handleCitySearch = (e) => {
    const city = e.target.value.toLowerCase();
    if (cityCoordinates[city]) {
      setMapCenter(cityCoordinates[city]);
    }
  };

  return (
    <div className="map-explorer-container">
      <div className="map-sidebar">
        <h3>📍 Explore Neighborhoods</h3>
        
        <div className="map-controls">
          <select onChange={handleCitySearch} className="city-select">
            <option value="">Jump to City...</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="bangalore">Bangalore</option>
            <option value="pune">Pune</option>
            <option value="chennai">Chennai</option>
          </select>

          <div className="poi-filters">
            <button className={poiType === "all" ? "active" : ""} onClick={() => setPoiType("all")}>All</button>
            <button className={poiType === "college" ? "active" : ""} onClick={() => setPoiType("college")}>🎓 Colleges</button>
            <button className={poiType === "hospital" ? "active" : ""} onClick={() => setPoiType("hospital")}>🏥 Hospitals</button>
            <button className={poiType === "transit" ? "active" : ""} onClick={() => setPoiType("transit")}>🚇 Transit</button>
          </div>
        </div>

        <div className="map-properties-list">
          {mappedProperties.map(p => {
             const dist = activeProperty 
                ? getDistance(activeProperty.mappedLat, activeProperty.mappedLng, p.mappedLat, p.mappedLng)
                : null;
                
             return (
              <div 
                key={p._id} 
                className={`map-prop-card ${activeProperty?._id === p._id ? 'active' : ''}`}
                onClick={() => {
                  setActiveProperty(p);
                  setMapCenter([p.mappedLat, p.mappedLng]);
                }}
              >
                <img src={p.images[0]?.url} alt={p.propertyName} />
                <div className="map-prop-info">
                  <h4>{p.propertyName}</h4>
                  <p>₹{p.price} / night</p>
                  {dist && p._id !== activeProperty?._id && (
                    <span className="dist-badge">{dist} km away</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="map-view-area">
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%", borderRadius: "12px" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={mapCenter} />
          
          {/* Properties */}
          {mappedProperties.map((p) => (
            <Marker 
              key={p._id} 
              position={[p.mappedLat, p.mappedLng]} 
              icon={propertyIcon}
              eventHandlers={{
                click: () => setActiveProperty(p)
              }}
            >
              <Popup>
                <div className="map-popup">
                  <img src={p.images[0]?.url} alt={p.propertyName} />
                  <h4>{p.propertyName}</h4>
                  <p>₹{p.price} / night</p>
                  <Link to={`/propertylist/${p._id}`}>View Details</Link>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* POIs */}
          {filteredPois.map(poi => (
            <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={poi.icon}>
              <Popup>
                <strong>{poi.name}</strong>
                {activeProperty && (
                  <p>Distance: {getDistance(activeProperty.mappedLat, activeProperty.mappedLng, poi.lat, poi.lng)} km</p>
                )}
              </Popup>
            </Marker>
          ))}

          {/* Search Radius Indicator */}
          <Circle center={mapCenter} radius={3000} pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.1 }} />
        </MapContainer>
      </div>
    </div>
  );
};

export default InteractiveMap;
