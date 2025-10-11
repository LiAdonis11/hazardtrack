import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';

// Conditional import for react-native-maps
let MapView: any = null;
let Marker: any = null;
let Callout: any = null;

try {
  const RNM = require('react-native-maps');
  MapView = RNM.default || RNM.MapView;
  Marker = RNM.Marker;
  Callout = RNM.Callout;
} catch (error) {
  console.warn('react-native-maps not available on this platform');
}
import { apiGetAllReports } from '../lib/api';
import { getUserToken } from '../lib/storage';
import * as Location from 'expo-location';

interface Report {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

const BfpMap = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchReports();
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    })();
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
        setReports(res.reports);
      } else {
        Alert.alert('Error', 'Could not fetch reports.');
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      Alert.alert('Error', 'Failed to load reports.');
    }
  };

  const handleViewReport = (report: Report) => {
    const reportString = JSON.stringify(report);
    router.push({
      pathname: '/ReportDetails',
      params: { report: reportString },
    });
  };

  const handleInspectNearby = () => {
    if (!userLocation) {
      Alert.alert('Error', 'Could not determine your location.');
      return;
    }

    const nearbyReports = reports.filter(report => {
      if (report.latitude && report.longitude) {
        const distance = getDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          report.latitude,
          report.longitude
        );
        return distance < 5; // 5km radius
      }
      return false;
    });

    if (nearbyReports.length > 0) {
        const reportString = JSON.stringify(nearbyReports[0]);
        router.push({
            pathname: '/ReportDetails',
            params: { report: reportString },
        });
    } else {
        Alert.alert('No Nearby Reports', 'There are no reports within a 5km radius.');
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  return (
    <View style={styles.container}>
      {MapView && userLocation && userLocation.coords && typeof userLocation.coords.latitude === 'number' && typeof userLocation.coords.longitude === 'number' ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />
          {reports.map(report => (
            report.latitude && report.longitude && typeof report.latitude === 'number' && typeof report.longitude === 'number' && (
              <Marker
                key={report.id}
                coordinate={{ latitude: report.latitude, longitude: report.longitude }}
                title={report.title}
              >
                <Callout onPress={() => handleViewReport(report)}>
                  <View>
                    <Text style={{ fontWeight: 'bold' }}>{report.title}</Text>
                    <Text>{report.description}</Text>
                    <Text style={{ color: 'blue' }}>Tap to view details</Text>
                  </View>
                </Callout>
              </Marker>
            )
          ))}
        </MapView>
      ) : (
        <View style={styles.centered}>
          <Text>{MapView ? 'Loading Map...' : 'Map not available on web'}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.inspectButton} onPress={handleInspectNearby}>
        <Text style={styles.inspectButtonText}>Inspect Nearby Reports</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inspectButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#D50A0A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  inspectButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BfpMap;
