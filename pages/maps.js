import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { FaMapMarkerAlt, FaBars, FaTimes } from 'react-icons/fa';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function Maps() {
  // Refs for user marker and geolocation watch
  const userMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [pins, setPins] = useState(null);
  const markersRef = useRef([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch pin data
  useEffect(() => {
    fetch('/api/pins')
      .then((res) => res.json())
      .then((data) => setPins(data));
  }, []);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/positron",
      center: [110, -7],
      zoom: 4,
    });
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add markers and fit bounds when pins or map is ready
  useEffect(() => {
    if (!mapRef.current || !pins?.features?.length) return;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();

    pins.features.forEach((feature) => {
      const { coordinates } = feature.geometry;
      const props = feature.properties;
      // Use 'food' as title and 'place' as description if 'title'/'description' are missing
      const title = props.title || props.food || '';
      const description = props.description || props.place || '';
      const marker = new maplibregl.Marker()
        .setLngLat(coordinates)
        .setPopup(
          new maplibregl.Popup({ offset: 25 })
            .setHTML(`<h3>${title}</h3><p>${description}</p>`)
        )
        .addTo(mapRef.current);
      markersRef.current.push(marker);
      bounds.extend(coordinates);
    });

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, {
        padding: 60,
        maxZoom: 15,
        duration: 800,
      });
    }
  }, [pins]);

  // Handler to fly to pin
  const handleFlyTo = (coordinates) => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: coordinates, zoom: 16, speed: 1.2 });
    }
  };

  // Responsive styles
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
  const panelStyle = {
    position: 'absolute',
    top: isMobile ? 10 : 20,
    left: panelOpen ? (isMobile ? 10 : 20) : (isMobile ? -260 : -320),
    width: isMobile ? 240 : 300,
    maxHeight: isMobile ? '60vh' : '80vh',
    background: 'rgba(255,255,255,0.97)',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    zIndex: 10,
    transition: 'left 0.3s',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontSize: isMobile ? 13 : 15,
  };
  const listStyle = {
    overflowY: 'auto',
    flex: 1,
    padding: 0,
    margin: 0,
  };
  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 8 : 12,
    padding: isMobile ? '8px 10px' : '12px 16px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontSize: isMobile ? 13 : 15,
  };

  // Start tracking user location
  function startTracking() {
    if (!navigator.geolocation) return alert('Geolocation not supported');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = [longitude, latitude];

        if (!userMarkerRef.current) {
          userMarkerRef.current = new maplibregl.Marker({ color: '#1e90ff' })
            .setLngLat(coords)
            .addTo(mapRef.current);
        } else {
          userMarkerRef.current.setLngLat(coords);
        }

        mapRef.current.flyTo({
          center: coords,
          zoom: 16,
          speed: 1.2,
        });
      },
      (err) => console.error(err),
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
      }
    );
  }

  // Stop tracking user location
  function stopTracking() {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }
  const iconStyle = { color: '#e74c3c', fontSize: 20 };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Floating Panel */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #eee', background: '#fafafa' }}>
          <strong style={{ flex: 1 }}>Pin List</strong>
          <button onClick={() => setPanelOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }} title="Close"><FaTimes /></button>
        </div>
        {/* Search input */}
        <div style={{ padding: isMobile ? '8px 10px' : '12px 16px', borderBottom: '1px solid #eee', background: '#fafafa' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            style={{
              width: '100%',
              padding: isMobile ? '6px 8px' : '8px 12px',
              fontSize: isMobile ? 13 : 15,
              borderRadius: 6,
              border: '1px solid #ddd',
              outline: 'none',
              background: '#fff',
            }}
          />
        </div>
        <ul style={listStyle}>
          {pins?.features
            ?.filter((feature) => {
              const props = feature.properties;
              const title = (props.title || props.food || '').toLowerCase();
              const desc = (props.description || props.place || '').toLowerCase();
              return (
                title.includes(search.toLowerCase()) ||
                desc.includes(search.toLowerCase())
              );
            })
            .map((feature, idx) => {
              const props = feature.properties;
              const title = props.title || props.food || '';
              const desc = props.description || props.place || '';
              return (
                <li key={idx}>
                  <button style={itemStyle} onClick={() => handleFlyTo(feature.geometry.coordinates)}>
                    <FaMapMarkerAlt style={iconStyle} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                      <span style={{ fontWeight: 600, lineHeight: 1.2 }}>{title}</span>
                      <span style={{ color: '#888', fontSize: '0.95em', lineHeight: 1.2 }}>{desc}</span>
                    </div>
                  </button>
                </li>
              );
            })}
        </ul>
        {/* Tracking buttons moved to map bottom right for mobile-first */}
      </div>
      {/* Toggle Button */}
      {!panelOpen && (
        <div style={{ position: 'absolute', top: 30, left: 20, zIndex: 11, display: 'flex', gap: 8 }}>
          <button
            onClick={() => setPanelOpen(true)}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              cursor: 'pointer',
            }}
            title="Show Pins"
          >
            <FaBars />
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              cursor: 'pointer',
            }}
            title="Go Home"
          >
            <FaTimes />
          </button>
        </div>
      )}
      {/* Map Container */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {/* Tracking Buttons Floating Bottom Right */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? 16 : 32,
        right: isMobile ? 16 : 32,
        zIndex: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <button
          onClick={startTracking}
          style={{
            background: '#1e90ff',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: isMobile ? 35 : 54,
            height: isMobile ? 35 : 54,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? 22 : 28,
            boxShadow: '0 2px 8px rgba(30,144,255,0.15)',
            cursor: 'pointer',
          }}
          title="Start Tracking"
        >
          <FaMapMarkerAlt />
        </button>
        <button
          onClick={stopTracking}
          style={{
            background: '#eee',
            color: '#333',
            border: 'none',
            borderRadius: '50%',
            marginBottom: 70,
            width: isMobile ? 35 : 54,
            height: isMobile ? 35 : 54,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? 22 : 28,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            cursor: 'pointer',
          }}
          title="Stop Tracking"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
}
