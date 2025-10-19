import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
// Conditionally import react-leaflet for web
let MapContainer: any = null;
let TileLayer: any = null;
let Marker: any = null;
let Popup: any = null;

try {
  const leaflet = require('react-leaflet');
  MapContainer = leaflet.MapContainer;
  TileLayer = leaflet.TileLayer;
  Marker = leaflet.Marker;
  Popup = leaflet.Popup;
} catch (error) {
  console.warn('react-leaflet not available');
}
import { Text, YStack, H4 } from 'tamagui';
import { useRouter } from 'expo-router';
import { apiGetAllReports } from '../lib/api';
import { getUserToken, getUserData } from '../lib/storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const BfpMap = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const initialRegion = {
    latitude: 17.5675, // Centered on Tagudin
    longitude: 120.4431,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  useEffect(() => {
    const checkUserRoleAndFetchReports = async () => {
      const userData = await getUserData();
      if (userData?.role !== 'bfp_personnel' && userData?.role !== 'inspector') {
        setLoading(false);
        return;
      }
      fetchReports();
    }
    checkUserRoleAndFetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = await getUserToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required.');
        return;
      }
      const res = await apiGetAllReports(token);
      if (res.status === 'success' && res.reports) {
        const reportsWithCoords = res.reports.filter(
          (report: any) => report.latitude && report.longitude
        );
        setReports(reportsWithCoords);
      } else {
        Alert.alert('Error', 'Could not fetch reports for map.');
      }
    } catch (error) {
      console.error('Failed to fetch reports for map:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'in_progress': return 'blue';
      case 'resolved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const handleViewDetails = (report: any) => {
    const reportString = JSON.stringify(report);
    router.push({
      pathname: '/ReportDetails',
      params: { report: reportString },
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text marginTop={10}>Loading Map...</Text>
      </View>
    );
  }

  if (!MapContainer) {
    return (
      <View style={styles.centered}>
        <Text>Map library not loaded.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapContainer
        center={[17.5675, 120.4431]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.arcgis.com/">Esri</a> &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
        />
        {reports.map((report: any) => (
          <Marker
            key={report.id}
            position={[parseFloat(report.latitude), parseFloat(report.longitude)]}
          >
            <Popup>
              <div style={{ fontFamily: 'sans-serif', maxWidth: '250px' }}>
                <h4>{report.title}</h4>
                <p>Status: <strong>{report.status.toUpperCase()}</strong></p>
                <p>{report.description.substring(0, 100)}...</p>
                <button
                  onClick={() => handleViewDetails(report)}
                  style={{
                    backgroundColor: '#1E40AF',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  calloutContainer: { 
    width: 250, 
    backgroundColor: 'white', 
    borderRadius: 10, 
    padding: 10, 
    boxShadow: '0 2px 4px rgba(0,0,0,0.25)', 
    elevation: 5, 
  },
  calloutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E40AF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginTop: 10, },
  calloutButtonText: { color: 'white', fontWeight: 'bold', },
});

export default BfpMap;