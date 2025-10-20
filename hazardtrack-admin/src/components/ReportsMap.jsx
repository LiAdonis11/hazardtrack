import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  CircleMarker,
  LayersControl,
  ScaleControl,
  ZoomControl
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { API_URL, API_ENDPOINTS } from "../config.js";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ReportsMap = ({ reports: propReports = null }) => {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "all", // Default to all reports
    category: "all"
  });

  const activeStatuses = ['pending', 'in_progress', 'verified'];
  const inactiveStatuses = ['resolved', 'rejected', 'closed'];

  useEffect(() => {
    if (propReports) {
      // Use provided reports (for single report view)
      setReports(propReports);
      setLoading(false);
    } else {
      // Fetch all reports (for main map view)
      const fetchReports = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('authToken');
          if (!token) {
            setError("Authentication required");
            setLoading(false);
            return;
          }
          const response = await axios.get(`${API_URL}/api/get_all_reports.php`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setReports(response.data.reports);
          setError(null);
        } catch (error) {
          console.error("Error fetching reports:", error);
          setError("Failed to load hazard reports");
        } finally {
          setLoading(false);
        }
      };
      fetchReports();
    }
  }, [propReports]);

  // Filter reports based on selected filters
  const filteredReports = useMemo(() => {
    const filtered = reports.filter(report => {
      // Ensure coordinates are valid
      if (!report.latitude || !report.longitude) {
        return false;
      }
      // For single report view, don't apply filters
      if (propReports) {
        return true;
      }
      const statusMatch = filters.status === "all" || (filters.status === "active" && activeStatuses.includes(report.status.toLowerCase())) || report.status.toLowerCase() === filters.status.toLowerCase();
      const categoryMatch = filters.category === "all" || report.category === filters.category;
      return statusMatch && categoryMatch;
    });
    return filtered;
  }, [reports, filters, propReports]);

  const getColor = (status) => {
    const colors = {
      "pending": "#F59E0B",
      "in_progress": "#3B82F6",
      "verified": "#14B8A6",
      "resolved": "#8B5CF6",
      "rejected": "#EF4444",
      "closed": "#6B7280",
      "default": "#6B7280"
    };
    return colors[status.toLowerCase()] || colors.default;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Flood": "💧",
      "Fire": "🔥",
      "Earthquake": "🌋",
      "Landslide": "⛰️",
      "Accident": "🚨",
      "default": "⚠️"
    };
    return icons[category] || icons.default;
  };

  const createCustomIcon = (report, dim = false) => {
    return L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, ${getColor(report.status)} 0%, ${getColor(report.status)}dd 100%);
          border: 2px solid rgba(255,255,255,0.8);
          border-radius: 12px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);
          backdrop-filter: blur(10px);
          font-weight: bold;
          position: relative;
          opacity: ${dim ? 0.5 : 1};
        ">
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            background: #fff;
            border-radius: 50%;
            border: 1px solid ${getColor(report.status)};
          "></div>
          ${getCategoryIcon(report.category)}
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
      className: 'custom-marker'
    });
  };

  // Statistics for the info panel
  const stats = useMemo(() => {
    const total = reports.length;
    const byStatus = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {});
    
    const byCategory = reports.reduce((acc, report) => {
      acc[report.category] = (acc[report.category] || 0) + 1;
      return acc;
    }, {});

    return { total, byStatus, byCategory };
  }, [reports]);

  if (loading) {
    return (
      <div style={{ 
        height: "100vh", 
        width: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div style={{ 
          textAlign: "center", 
          color: "white",
          background: "rgba(255,255,255,0.1)",
          padding: "40px",
          borderRadius: "20px",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🗺️</div>
          <h3>Loading Hazard Reports...</h3>
          <p>Please wait while we fetch the latest data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: "100vh", 
        width: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <div style={{ textAlign: "center", color: "#E53935" }}>
          <h3>Error Loading Map</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              background: "#E53935",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {/* Header - Only show for main map view */}
      {!propReports && (
        <div style={{
          padding: "15px 20px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>🚨 Hazard Reports Map</h2>
            <p style={{ margin: "5px 0 0 0", opacity: 0.9, fontSize: "14px" }}>
              Real-time monitoring of community hazards
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>Total Reports</div>
            <div style={{ fontSize: "28px", fontWeight: "bold" }}>{stats.total}</div>
          </div>
        </div>
      )}

      {/* Filters Panel - Only show for main map view */}
      {!propReports && (
        <div style={{
          position: "absolute",
          top: "100px",
          left: "20px",
          background: "white",
          padding: "15px",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
          zIndex: 1000,
          minWidth: "200px"
        }}>
          <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>Filters</h4>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "5px", color: "#666" }}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px"
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="In-Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "5px", color: "#666" }}>
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px"
              }}
            >
              <option value="all">All Categories</option>
              <option value="Flood">Flood</option>
              <option value="Fire">Fire</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Landslide">Landslide</option>
              <option value="Accident">Accident</option>
            </select>
          </div>
        </div>
      )}

      {/* Statistics Panel - Only show for main map view */}
      {!propReports && (
        <div style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          background: "white",
          padding: "15px",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
          zIndex: 1000,
          minWidth: "250px"
        }}>
          <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>📊 Quick Stats</h4>
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
              padding: "5px 0",
              borderBottom: "1px solid #f0f0f0"
            }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: getColor(status),
                  marginRight: "8px"
                }}></div>
                <span style={{ fontSize: "14px" }}>{status}</span>
              </div>
              <span style={{ fontWeight: "bold", color: "#333" }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        center={propReports && propReports[0] && propReports[0].latitude && propReports[0].longitude ? [parseFloat(propReports[0].latitude), parseFloat(propReports[0].longitude)] : [16.9337, 120.4446]}
        zoom={propReports && propReports[0] && propReports[0].latitude && propReports[0].longitude ? 18 : 13}
        style={{ height: propReports ? "100%" : "calc(100% - 80px)", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Standard">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Dark">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {filteredReports.map((report) => (
          <Marker
            key={report.id}
            position={[parseFloat(report.latitude), parseFloat(report.longitude)]}
            icon={createCustomIcon(report, filters.status === "all" && inactiveStatuses.includes(report.status.toLowerCase()))}
            eventHandlers={{
              click: () => setSelected(report),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "8px",
                padding: "12px",
                minWidth: "220px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                fontSize: "12px",
                lineHeight: "1.5",
                color: "#333"
              }}>
                <div style={{ textAlign: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "18px" }}>⚠️</span>
                </div>
                <div style={{
                  marginBottom: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                  color: getColor(report.status)
                }}>
                  {report.title || report.category}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>📍 Location:</strong> {report.location_address || 'N/A'}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>👤 Reporter:</strong> {report.user_fullname || 'N/A'}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>📞 Contact:</strong> {report.phone || 'N/A'}
                </div>
                <div style={{
                  marginTop: "8px",
                  fontSize: "10px",
                  color: "#666",
                  textAlign: "center",
                  borderTop: "1px solid rgba(0,0,0,0.1)",
                  paddingTop: "6px"
                }}>
                  Reported on {new Date(report.created_at).toLocaleDateString()}
                </div>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {selected && (
          <Popup
            position={[parseFloat(selected.latitude), parseFloat(selected.longitude)]}
            onClose={() => setSelected(null)}
          >
            <div style={{ minWidth: "250px", fontSize: "14px", lineHeight: "1.5" }}>
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "24px" }}>⚠️</span>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong>📍 Location:</strong> {selected.location_address || 'N/A'}
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong>👤 Reporter:</strong> {selected.user_fullname}
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong>📞 Contact:</strong> {selected.phone}
              </div>

              <div style={{ marginTop: "10px", fontSize: "12px", color: "#666", textAlign: "center" }}>
                Reported on {new Date(selected.created_at).toLocaleDateString()}
              </div>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
};

export default ReportsMap;