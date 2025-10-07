import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on status
const createCustomIcon = (status) => {
  const colors = {
    pending: '#F59E0B',     // Yellow/Orange
    verified: '#10B981',    // Green
    in_progress: '#3B82F6', // Blue
    resolved: '#8B5CF6'     // Purple
  };

  const color = colors[status] || '#6B7280';

  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    "></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Component to fit map bounds to markers
function FitBounds({ reports }) {
  const map = useMap();

  useEffect(() => {
    if (reports.length > 0) {
      const validReports = reports.filter(report =>
        report.latitude && report.longitude &&
        !isNaN(report.latitude) && !isNaN(report.longitude)
      );

      if (validReports.length > 0) {
        const bounds = L.latLngBounds(
          validReports.map(report => [report.latitude, report.longitude])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [reports, map]);

  return null;
}

export default function ReportsMap({ reports, loading = false }) {
  // Precise Tagudin, Ilocos Sur coordinates (Municipal Hall area)
  const mapCenter = [16.931, 120.449];
  const mapZoom = 14;

  // Filter reports with valid coordinates and within precise Tagudin municipality bounds
  const validReports = reports.filter(report =>
    report.latitude && report.longitude &&
    !isNaN(report.latitude) && !isNaN(report.longitude) &&
    // Precise bounds for Tagudin municipality
    report.latitude >= 16.881 && report.latitude <= 16.981 &&
    report.longitude >= 120.399 && report.longitude <= 120.499
  );

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      verified: 'Verified',
      in_progress: 'In Progress',
      resolved: 'Resolved'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-600">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Reports Map View</h3>
        <div className="text-sm text-gray-500">
          {validReports.length} of {reports.length} reports with location data
        </div>
      </div>

      <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <FitBounds reports={validReports} />

          {validReports.map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={createCustomIcon(report.status)}
            >
              <Popup>
                <div className="max-w-xs">
                  <h4 className="font-semibold text-gray-800 mb-2">{report.title}</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Status:</strong>
                      <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'verified' ? 'bg-green-100 text-green-800' :
                        report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'resolved' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(report.status)}
                      </span>
                    </p>
                    <p><strong>Category:</strong> {report.category_name}</p>
                    <p><strong>Reporter:</strong> {report.user_fullname}</p>
                    <p><strong>Date:</strong> {formatDate(report.created_at)}</p>
                    {report.location_address && (
                      <p><strong>Location:</strong> {report.location_address}</p>
                    )}
                    {report.description && (
                      <p className="mt-2 text-gray-600">
                        <strong>Description:</strong> {report.description.length > 100
                          ? `${report.description.substring(0, 100)}...`
                          : report.description}
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span>Verified</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
          <span>Resolved</span>
        </div>
      </div>
    </div>
  );
}
