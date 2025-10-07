import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { API_URL } from '../../config';

const HotspotMap = () => {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchHotspotData();
  }, [filterType]);

  const fetchHotspotData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const params = new URLSearchParams({
        type: filterType
      });

      const response = await fetch(`${API_URL}/hotspot_data.php?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setHotspots(data.data.hotspots);
        }
      }
    } catch (error) {
      console.error('Error fetching hotspot data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (intensity) => {
    if (intensity >= 10) return 'bg-red-600';
    if (intensity >= 7) return 'bg-orange-500';
    if (intensity >= 4) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  const getLeafletColor = (intensity) => {
    if (intensity >= 10) return '#dc2626'; // red-600
    if (intensity >= 7) return '#f97316'; // orange-500
    if (intensity >= 4) return '#eab308'; // yellow-400
    return '#22c55e'; // green-400
  };

  const getIntensityLabel = (intensity) => {
    if (intensity >= 10) return 'Critical';
    if (intensity >= 7) return 'High';
    if (intensity >= 4) return 'Medium';
    return 'Low';
  };

  return (
    <div className="hotspot-map">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 font-montserrat">Hazard Hotspot Map</h1>
            <p className="text-gray-600 mt-1">Identify recurring hazard areas in Tagudin.</p>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Hazards</option>
              <option value="fire">Fire</option>
              <option value="flood">Flood</option>
              <option value="earthquake">Earthquake</option>
              <option value="accident">Accident</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Tagudin Hazard Heatmap</h2>
            <div className="h-[500px] w-full rounded-lg overflow-hidden border">
              <MapContainer
                center={[16.931, 120.449]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                className="rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* Tagudin Municipal Center Marker */}
                <CircleMarker
                  center={[16.931, 120.449]}
                  radius={8}
                  fillColor="#000000"
                  color="#000000"
                  fillOpacity={0.9}
                  eventHandlers={{
                    click: () => setSelectedHotspot(null),
                  }}
                >
                  <Popup>
                    <div>
                      <h3>Tagudin Municipal Center</h3>
                      <p>Ilocos Sur, Philippines</p>
                      <p>Coordinates: 16.931°N, 120.449°E</p>
                    </div>
                  </Popup>
                </CircleMarker>
                {hotspots.map((hotspot) => (
                  <CircleMarker
                    key={hotspot.barangay}
                    center={[hotspot.lat, hotspot.lng]}
                    radius={Math.max(5, hotspot.intensity)}
                    fillColor={getLeafletColor(hotspot.intensity)}
                    color={getLeafletColor(hotspot.intensity)}
                    fillOpacity={0.8}
                    eventHandlers={{
                      click: () => setSelectedHotspot(hotspot),
                    }}
                  >
                    <Popup>
                      <div>
                        <h3>{hotspot.barangay}</h3>
                        <p>Reports: {hotspot.count}</p>
                        <p>Intensity: {getIntensityLabel(hotspot.intensity)}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center space-x-6">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-400 mr-2"></div>
                <span className="text-sm text-gray-600">Low (1-3)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-yellow-400 mr-2"></div>
                <span className="text-sm text-gray-600">Medium (4-6)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                <span className="text-sm text-gray-600">High (7-9)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-600 mr-2"></div>
                <span className="text-sm text-gray-600">Critical (10+)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hotspot Details */}
        <div className="space-y-6">
          {/* Selected Hotspot Info */}
          {selectedHotspot && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Hotspot Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Barangay</p>
                  <p className="font-medium">{selectedHotspot.barangay}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="font-medium">{selectedHotspot.count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Intensity Level</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedHotspot.intensity >= 10 ? 'bg-red-100 text-red-800' :
                    selectedHotspot.intensity >= 7 ? 'bg-orange-100 text-orange-800' :
                    selectedHotspot.intensity >= 4 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {getIntensityLabel(selectedHotspot.intensity)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Most Common Hazard</p>
                  <p className="font-medium">{selectedHotspot.primaryHazard}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Incident</p>
                  <p className="font-medium">{new Date(selectedHotspot.lastIncident).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Top Hotspots List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Top Hotspots</h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {hotspots.slice(0, 5).map((hotspot, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedHotspot?.barangay === hotspot.barangay ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedHotspot(hotspot)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{hotspot.barangay}</p>
                      <p className="text-sm text-gray-600">{hotspot.count} reports</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getIntensityColor(hotspot.intensity)}`}></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-4">Recommendations</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <p>Increase patrol frequency in high-intensity areas</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <p>Conduct community awareness programs in hotspot barangays</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <p>Install additional monitoring equipment in critical zones</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <p>Coordinate with barangay officials for preventive measures</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotspotMap;
