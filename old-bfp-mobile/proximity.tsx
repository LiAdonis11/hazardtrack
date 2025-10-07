import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

// Conditional import for react-native-maps
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

try {
  const RNM = require('react-native-maps');
  MapView = RNM.default || RNM.MapView;
  Marker = RNM.Marker;
  PROVIDER_GOOGLE = RNM.PROVIDER_GOOGLE;
} catch (error) {
  console.warn('react-native-maps not available on this platform');
}

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type MapViewType = any; // For conditional import
import { apiGetAllReports } from '../../lib/api';
import { getUserToken } from '../../lib/storage';
import { YStack, XStack, Text, Card, Spinner, Input } from 'tamagui';
import { ArrowLeft, MapPin, Navigation, Clock, AlertTriangle, Flame, Zap, Home } from '@tamagui/lucide-icons';
import * as Location from 'expo-location';

interface Report {
  id: number;
  hazardType: string;
  location: string;
  status: string;
  priority: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  icon?: string;
  distance?: string;
}

const { width, height } = Dimensions.get('window');

const nearbyReportsData: Report[] = [
  {
    id: 1,
    hazardType: 'Fire Hazard',
    icon: 'flame',
    location: 'Barangay Poblacion, Quezon City',
    distance: '0.3 km',
    priority: 'High',
    status: 'New',
    timestamp: '2 mins ago',
    latitude: 14.6760,
    longitude: 121.0437,
  },
  {
    id: 2,
    hazardType: 'Electrical Hazard',
    icon: 'zap',
    location: 'Manila Avenue, Quezon City',
    distance: '0.8 km',
    priority: 'Medium',
    status: 'Valid',
    timestamp: '15 mins ago',
    latitude: 14.6800,
    longitude: 121.0487,
  },
  {
    id: 3,
    hazardType: 'Building Safety',
    icon: 'home',
    location: 'Commonwealth Avenue, QC',
    distance: '1.2 km',
    priority: 'Low',
    status: 'In-Progress',
    timestamp: '1 hour ago',
    latitude: 14.6850,
    longitude: 121.0537,
  },
];

const priorityColors = {
  "High": "#B71C1C",
  "Medium": "#FFA000",
  "Low": "#388E3C"
};

const statusColors = {
  "New": "#FFA000",
  "Valid": "#388E3C",
  "In-Progress": "#0D47A1",
  "Resolved": "#6B7280"
};

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case 'flame':
      return Flame;
    case 'zap':
      return Zap;
    case 'home':
      return Home;
    default:
      return AlertTriangle;
  }
};

export default function NearbyInspectionsScreen() {
  const [reports, setReports] = useState<Report[]>(nearbyReportsData);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const mapRef = useRef<MapViewType>(null);
  const router = useRouter();

  useEffect(() => {
    const setup = async () => {
      await requestLocationPermission();
      await fetchReports();
      setLoading(false);
    };
    setup();
  }, []);

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location);
  };

  const fetchReports = async () => {
    try {
      const token = await getUserToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required.');
        return;
      }
      const res = await apiGetAllReports(token);
      if (res.status === 'success' && res.reports) {
        // Transform to match design
        const transformed = res.reports.slice(0, 5).map((r: any) => ({
          id: r.id,
          hazardType: r.title,
          location: r.location_address || 'Unknown',
          status: r.status === 'pending' ? 'New' : r.status,
          priority: r.priority === 'high' ? 'High' : r.priority === 'medium' ? 'Medium' : 'Low',
          timestamp: new Date(r.created_at).toLocaleString(),
          latitude: r.latitude,
          longitude: r.longitude,
          icon: r.category_name?.toLowerCase().includes('fire') ? 'flame' : 'home'
        }));
        setReports(transformed.length > 0 ? transformed : nearbyReportsData);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const handleViewReport = (report: Report) => {
    const reportString = JSON.stringify(report);
    router.push({
      pathname: '/ReportDetails',
      params: { report: reportString },
    });
  };

  const zoomIn = () => {
    mapRef.current?.animateToRegion({
      ...mapRegion!,
      latitudeDelta: mapRegion!.latitudeDelta / 2,
      longitudeDelta: mapRegion!.longitudeDelta / 2,
    });
  };

  const zoomOut = () => {
    mapRef.current?.animateToRegion({
      ...mapRegion!,
      latitudeDelta: mapRegion!.latitudeDelta * 2,
      longitudeDelta: mapRegion!.longitudeDelta * 2,
    });
  };

  const centerOnUser = () => {
    if (userLocation) {
      mapRef.current?.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0421,
      });
    }
  };

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="#FAFAFA">
        <Spinner size="large" color="#B71C1C" />
        <Text marginTop="$3" color="#202124">Loading Map...</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="#FAFAFA">
      {/* Header */}
      <YStack backgroundColor="white" paddingHorizontal="$4" paddingVertical="$4" paddingTop="$6" borderBottomWidth={1} borderBottomColor="#E5E7EB">
        <XStack alignItems="center" space="$3" marginBottom="$4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={20} color="#202124" />
          </TouchableOpacity>
          <YStack>
            <Text fontSize={20} fontWeight="600" color="#202124">Nearby Inspections</Text>
            <Text fontSize={14} color="#9E9E9E">Reports within 2km radius</Text>
          </YStack>
        </XStack>

        <XStack alignItems="center" space="$2">
          <Navigation size={16} color="#B71C1C" />
          <Text fontSize={14} color="#6B7280">Your Location: Quezon City Fire Station</Text>
        </XStack>
      </YStack>

      <View style={{ flex: 1 }}>
        {MapView && userLocation ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
              latitudeDelta: 0.0422,
              longitudeDelta: 0.0421,
            }}
            onRegionChangeComplete={setMapRegion}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {/* Officer Location (Center) */}
            <Marker
              coordinate={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
              title="Your Location"
              pinColor="#0D47A1"
            />

            {/* Hazard Pins */}
            {reports.map(report => {
              if (report.latitude && report.longitude) {
                const IconComponent = getIcon(report.icon);
                return (
                  <Marker
                    key={report.id}
                    coordinate={{
                      latitude: report.latitude,
                      longitude: report.longitude,
                    }}
                    onPress={() => handleViewReport(report)}
                  >
                    <YStack
                      width={32}
                      height={32}
                      backgroundColor={priorityColors[report.priority as keyof typeof priorityColors]}
                      borderRadius={16}
                      alignItems="center"
                      justifyContent="center"
                      shadowColor="#000"
                      shadowOpacity={0.3}
                      shadowRadius={4}
                      shadowOffset={{ width: 0, height: 2 }}
                      elevation={4}
                    >
                      <IconComponent size={16} color="white" />
                    </YStack>
                  </Marker>
                );
              }
              return null;
            })}
          </MapView>
        ) : (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <MapPin size={48} color="#B71C1C" />
            <Text marginTop="$3" color="#B71C1C">{MapView ? 'Loading Map...' : 'Map not available on web'}</Text>
          </YStack>
        )}

        {/* Map Controls */}
        <YStack position="absolute" top={20} right={16} space="$2">
          <TouchableOpacity
            onPress={centerOnUser}
            style={{
              width: 40,
              height: 40,
              backgroundColor: 'white',
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 4,
            }}
          >
            <Navigation size={20} color="#6B7280" />
          </TouchableOpacity>
        </YStack>

        {/* Reports in Area */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
          style={{
            position: 'absolute',
            bottom: 100,
            left: 0,
            right: 0,
            maxHeight: 200,
          }}
        >
          <YStack space="$3">
            <Text fontSize={16} fontWeight="600" color="#202124">Reports in Area</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack space="$3">
                {reports.map((report) => {
                  const IconComponent = getIcon(report.icon);
                  return (
                    <TouchableOpacity key={report.id} onPress={() => handleViewReport(report)}>
                      <Card
                        width={200}
                        padding="$3"
                        borderRadius={12}
                        backgroundColor="white"
                        shadowColor="#000"
                        shadowOpacity={0.1}
                        shadowRadius={4}
                        shadowOffset={{ width: 0, height: 1 }}
                        elevation={2}
                      >
                        <YStack space="$2">
                          <XStack alignItems="center" justifyContent="space-between">
                            <XStack alignItems="center" space="$2">
                              <YStack width={32} height={32} backgroundColor="#B71C1C20" borderRadius={8} alignItems="center" justifyContent="center">
                                <IconComponent size={16} color="#B71C1C" />
                              </YStack>
                              <YStack>
                                <Text fontSize={14} fontWeight="600" color="#202124" numberOfLines={1}>{report.hazardType}</Text>
                                <XStack alignItems="center" space="$1">
                                  <MapPin size={12} color="#9E9E9E" />
                                  <Text fontSize={12} color="#9E9E9E">{report.distance || '1.2 km'}</Text>
                                </XStack>
                              </YStack>
                            </XStack>
                            <YStack width={10} height={10} borderRadius={5} backgroundColor={priorityColors[report.priority as keyof typeof priorityColors]} />
                          </XStack>

                          <Text fontSize={12} color="#6B7280" numberOfLines={2}>{report.location}</Text>

                          <XStack alignItems="center" justifyContent="space-between">
                            <Text
                              fontSize={11}
                              fontWeight="500"
                              color={statusColors[report.status as keyof typeof statusColors]}
                              backgroundColor={`${statusColors[report.status as keyof typeof statusColors]}20`}
                              paddingHorizontal="$2"
                              paddingVertical="$1"
                              borderRadius={4}
                            >
                              {report.status}
                            </Text>
                            <TouchableOpacity
                              style={{
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                backgroundColor: '#F3F4F6',
                                borderRadius: 4,
                              }}
                            >
                              <Navigation size={12} color="#6B7280" />
                            </TouchableOpacity>
                          </XStack>
                        </YStack>
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </XStack>
            </ScrollView>
          </YStack>
        </ScrollView>

        {/* Quick Actions */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 20,
            left: 16,
            right: 16,
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text fontSize={16} fontWeight="600" color="#202124" textAlign="center" marginBottom="$2">Quick Actions</Text>
          <YStack space="$2">
            <TouchableOpacity
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: '#F9FAFB',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <XStack alignItems="center" space="$2">
                <Clock size={16} color="#6B7280" />
                <Text fontSize={14} color="#202124">Mark Current Location for Inspection</Text>
              </XStack>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: '#F9FAFB',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <XStack alignItems="center" space="$2">
                <AlertTriangle size={16} color="#6B7280" />
                <Text fontSize={14} color="#202124">Report New Hazard at Current Location</Text>
              </XStack>
            </TouchableOpacity>
          </YStack>
        </TouchableOpacity>
      </View>

      {/* Bottom Stats */}
      <XStack
        backgroundColor="white"
        borderTopWidth={1}
        borderTopColor="#E5E7EB"
        paddingHorizontal="$4"
        paddingVertical="$3"
        justifyContent="space-around"
      >
        <YStack alignItems="center">
          <Text fontSize={16} fontWeight="600" color="#B71C1C">{reports.length}</Text>
          <Text fontSize={12} color="#9E9E9E">Nearby Reports</Text>
        </YStack>
        <YStack alignItems="center">
          <Text fontSize={16} fontWeight="600" color="#B71C1C">1.2km</Text>
          <Text fontSize={12} color="#9E9E9E">Average Distance</Text>
        </YStack>
        <YStack alignItems="center">
          <Text fontSize={16} fontWeight="600" color="#B71C1C">2</Text>
          <Text fontSize={12} color="#9E9E9E">High Priority</Text>
        </YStack>
      </XStack>
    </YStack>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
