// import React, { useCallback, useEffect, useState, useMemo, memo, useRef } from "react"
// // import MapView, { Marker, Callout, Region, UrlTile } from "react-native-maps"

// // Map tile configuration with fallback
// /*
// const MAP_CONFIG = {
//   stadia: {
//     urlTemplate: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png?api_key=fd9bcec2-f10a-4e89-b14f-8fff70040184",
//     maximumZ: 20,
//   },
//   arcgis: {
//     urlTemplate: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
//     maximumZ: 20,
//   }
// }
// */
// import {
//   ScrollView,
//   RefreshControl,
//   Dimensions,
//   TouchableOpacity,
//   StyleSheet,
//   View as RNView,
//   Linking,
//   Platform,
//   Modal,
//   Alert,
// } from "react-native"
// import { YStack, XStack, Text, View, Card, Button } from "tamagui"
// import { Flame, Zap, Home, MapPin, ArrowLeft, Filter, Navigation } from "@tamagui/lucide-icons"
// import { LinearGradient } from "expo-linear-gradient"
// import { MotiView } from "moti"
// import * as Location from 'expo-location';
// import { useQuery } from '@tanstack/react-query'
// import { apiGetNearbyReports } from "../../lib/api"
// import { getUserToken } from "../../lib/storage"
// import { useRouter } from "expo-router"
// import { colors, touchTargetSize, getResponsiveValue } from "../../lib/responsive"
// import _ from "lodash"

// const { height, width } = Dimensions.get("window")

// type ReportItem = {
//   id: number
//   title?: string
//   category_name?: string | null
//   status?: string
//   latitude?: string
//   longitude?: string
//   location_address?: string | null
//   created_at?: string
//   priority?: string | null
//   distance_km?: number
// }

// const ICON_SIZE = getResponsiveValue({ xs: 24, sm: 28, md: 32 }, 24)

// const STATUS_META: Record<string, { bg: string; text: string }> = {
//   Pending: { bg: "#FFF8E1", text: "#F57C00" },
//   "In-Progress": { bg: "#FFE0B2", text: "#E65100" },
//   Resolved: { bg: "#E8F5E9", text: "#2E7D32" },
//   Rejected: { bg: "#FFEBEE", text: "#D32F2F" },
//   Closed: { bg: "#F3E5F5", text: "#7B1FA2" },
// }

// const getNormalizedStatus = (status?: string | null) => {
//   if (!status) return "Pending"
//   const s = status.toLowerCase()
//   if (s === "pending" || s === "new" || s === "submitted") return "Pending"
//   if (s === "in_progress" || s === "in-progress" || s === "ongoing") return "In-Progress"
//   if (s === "resolved" || s === "completed") return "Resolved"
//   if (s === "verified_valid" || s === "valid" || s === "verified") return "Resolved"
//   if (s === "verified_false" || s === "invalid") return "Resolved"
//   if (s === "closed") return "Closed"
//   return "Pending"
// }

// const getStatusBadge = (status?: string | null) => {
//   const normalized = getNormalizedStatus(status)
//   return STATUS_META[normalized] || { bg: "#EEEEEE", text: "#555" }
// }

// // Navigation handler hook with modal confirmation - SIMPLIFIED VERSION
// const useNavigationHandler = () => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [pendingDestination, setPendingDestination] = useState<{
//     lat: number
//     lng: number
//     label?: string
//   } | null>(null);

//   const openExternalNavigation = useCallback(
//     async (lat?: string | number | null, lng?: string | number | null, label?: string | null | undefined) => {
//       console.log('Opening navigation for:', { lat, lng, label });

//       if (lat == null || lng == null) {
//         Alert.alert('Location unavailable', 'Coordinates are missing.');
//         return;
//       }

//       const latNum = typeof lat === 'string' ? parseFloat(lat) : (typeof lat === 'number' ? lat : NaN);
//       const lngNum = typeof lng === 'string' ? parseFloat(lng) : (typeof lng === 'number' ? lng : NaN);

//       if (isNaN(latNum) || isNaN(lngNum)) {
//         Alert.alert('Invalid location', 'The provided coordinates are not valid.');
//         return;
//       }

//       console.log('Setting destination and showing modal');
//       setPendingDestination({
//         lat: latNum,
//         lng: lngNum,
//         label: label || 'Unknown location'
//       });
//       setModalVisible(true);
//     },
//     []
//   );

//   const confirmNavigation = useCallback(async () => {
//     console.log('Confirming navigation');
//     if (!pendingDestination) {
//       console.log('No pending destination');
//       return;
//     }

//     const { lat, lng, label } = pendingDestination;
//     const encodedLabel = label ? encodeURIComponent(label) : '';

//     let appUrl;
//     if (Platform.OS === 'ios') {
//       appUrl = `maps://?daddr=${lat},${lng}&dirflg=d`;
//     } else {
//       appUrl = `google.navigation:q=${lat},${lng}`;
//     }

//     const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

//     console.log('Attempting to open URL:', appUrl);

//     try {
//       const supported = await Linking.canOpenURL(appUrl);
//       console.log('Can open app URL:', supported);

//       if (supported) {
//         await Linking.openURL(appUrl);
//       } else {
//         console.log('Opening web URL instead');
//         await Linking.openURL(webUrl);
//       }
//     } catch (error) {
//       console.error('Navigation error:', error);
//       Alert.alert('Navigation failed', 'Unable to open map application.');
//     } finally {
//       console.log('Closing modal');
//       setModalVisible(false);
//       setPendingDestination(null);
//     }
//   }, [pendingDestination]);

//   const cancelNavigation = useCallback(() => {
//     console.log('Canceling navigation');
//     setModalVisible(false);
//     setPendingDestination(null);
//   }, []);

//   return {
//     openExternalNavigation,
//     modalVisible,
//     pendingDestination,
//     confirmNavigation,
//     cancelNavigation
//   };
// };

// // Separate NavigationModal component
// const NavigationModal = memo(({
//   modalVisible,
//   pendingDestination,
//   onConfirm,
//   onCancel
// }: {
//   modalVisible: boolean
//   pendingDestination: { lat: number; lng: number; label?: string } | null
//   onConfirm: () => void
//   onCancel: () => void
// }) => {
//   if (!modalVisible || !pendingDestination) {
//     return null;
//   }

//   return (
//     <Modal
//       transparent
//       animationType="fade"
//       visible={modalVisible}
//       onRequestClose={onCancel}
//       statusBarTranslucent
//     >
//       <RNView
//         style={{
//           flex: 1,
//           backgroundColor: 'rgba(0,0,0,0.6)',
//           justifyContent: 'center',
//           alignItems: 'center',
//           padding: 20,
//         }}
//       >
//         <RNView
//           style={{
//             backgroundColor: 'white',
//             borderRadius: 16,
//             padding: 24,
//             width: '100%',
//             maxWidth: 400,
//             shadowColor: '#000',
//             shadowOffset: {
//               width: 0,
//               height: 2,
//             },
//             shadowOpacity: 0.25,
//             shadowRadius: 4,
//             elevation: 5,
//           }}
//         >
//           <Text
//             fontSize={20}
//             fontWeight="700"
//             textAlign="center"
//             marginBottom={8}
//             color={colors.darkGray}
//           >
//             Navigate to Location?
//           </Text>

//           <Text
//             fontSize={16}
//             textAlign="center"
//             marginBottom={12}
//             color={colors.mutedFg}
//           >
//             {pendingDestination.label}
//           </Text>

//           <Text
//             fontSize={14}
//             textAlign="center"
//             marginBottom={20}
//             color={colors.mutedFg}
//           >
//             ({pendingDestination.lat.toFixed(6)}, {pendingDestination.lng.toFixed(6)})
//           </Text>

//           <XStack gap={12}>
//             <Button
//               flex={1}
//               theme="light"
//               onPress={onCancel}
//               backgroundColor="#f5f5f5"
//               borderColor="#e0e0e0"
//               borderWidth={1}
//             >
//               <Text color={colors.darkGray}>Cancel</Text>
//             </Button>

//             <Button
//               flex={1}
//               theme="red"
//               onPress={onConfirm}
//               backgroundColor={colors.fireRed}
//             >
//               <Text color="white">Navigate</Text>
//             </Button>
//           </XStack>
//         </RNView>
//       </RNView>
//     </Modal>
//   );
// });

// NavigationModal.displayName = 'NavigationModal'

// // Optimized Marker Component to prevent re-renders
// const OptimizedReportMarker = memo(({ 
//   report, 
//   onPress, 
//   onDetailsPress, 
//   onNavigatePress 
// }: { 
//   report: ReportItem
//   onPress: () => void
//   onDetailsPress: (id: number) => void
//   onNavigatePress: (lat?: string | null, lng?: string | null, label?: string | null) => void
// }) => {
//   if (!report.latitude || !report.longitude) {
//     console.log('Missing coordinates for report:', report.id);
//     return null;
//   }
  
//   const lat = parseFloat(report.latitude);
//   const lng = parseFloat(report.longitude);
  
//   if (isNaN(lat) || isNaN(lng)) {
//     console.log('Invalid coordinates for report:', report.id, report.latitude, report.longitude);
//     return null;
//   }

//   const getIconComp = () => {
//     const c = (report.category_name || '').toLowerCase()
//     if (c.includes('fire')) return Flame
//     if (c.includes('electrical') || c.includes('elec')) return Zap
//     if (c.includes('building') || c.includes('house') || c.includes('structure')) return Home
//     return Flame
//   }

//   const getStatusColor = () => {
//     const status = getNormalizedStatus(report.status)
//     switch (status) {
//       case 'Pending': return '#F57C00' // Orange
//       case 'In-Progress': return '#E65100' // Dark orange
//       case 'Resolved': return '#2E7D32' // Green
//       case 'Rejected': return '#D32F2F' // Red
//       case 'Closed': return '#7B1FA2' // Purple
//       default: return '#F57C00' // Default orange
//     }
//   }

//   const getPriorityColor = () => {
//     if (!report.priority) return colors.fireRed
//     const p = report.priority.toLowerCase()
//     if (p.includes('high') || p.includes('emergency')) return colors.fireRed
//     if (p.includes('medium')) return colors.warningOrange
//     if (p.includes('low')) return colors.successGreen
//     return colors.fireRed
//   }

//   const IconComp = getIconComp()
//   const statusColor = getStatusColor()
//   const priorityColor = getPriorityColor()

//   console.log('Rendering marker for report:', report.id, 'at:', lat, lng);

//   return (
//     <Marker
//       coordinate={{ latitude: lat, longitude: lng }}
//       title={report.category_name || report.title || "Hazard"}
//       description={report.location_address || `Distance: ${report.distance_km?.toFixed(1)} km`}
//       onPress={onPress}
//       pinColor={statusColor}
//     >
//       <Callout tooltip onPress={() => onDetailsPress(report.id)}>
//         <RNView style={styles.calloutContainer}>
//           <YStack>
//             <Text fontWeight="700" fontSize={14} color={colors.darkGray}>
//               {report.category_name || report.title || "Hazard"}
//             </Text>
//             {report.location_address && (
//               <Text fontSize={12} color={colors.mutedFg} marginTop={6}>
//                 {report.location_address}
//               </Text>
//             )}
//             {report.distance_km && (
//               <Text fontSize={11} color={colors.mutedFg} marginTop={2}>
//                 {report.distance_km.toFixed(1)} km away
//               </Text>
//             )}
//             <View style={[styles.statusBadge, { backgroundColor: getStatusBadge(report.status).bg }]}>
//               <Text fontSize={12} color={getStatusBadge(report.status).text}>
//                 {getNormalizedStatus(report.status)}
//               </Text>
//             </View>

//             <XStack gap="$2" marginTop={8}>
//               <TouchableOpacity
//                 style={[styles.calloutButton, { flex: 1 }]}
//                 activeOpacity={0.8}
//                 onPress={() => onDetailsPress(report.id)}
//               >
//                 <Text fontSize={12} fontWeight="700" color={colors.fireRed}>
//                   View Details
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.calloutButton, { flex: 1 }]}
//                 activeOpacity={0.8}
//                 onPress={() => onNavigatePress(report.latitude, report.longitude, report.category_name || report.title)}
//               >
//                 <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
//                   <Navigation size={12} color={colors.fireRed} />
//                   <Text fontSize={12} fontWeight="700" color={colors.fireRed} marginLeft={4}>
//                     Navigate
//                   </Text>
//                 </RNView>
//               </TouchableOpacity>
//             </XStack>
//           </YStack>
//         </RNView>
//       </Callout>
//     </Marker>
//   )
// })

// OptimizedReportMarker.displayName = 'OptimizedReportMarker'

// const NearbyInspectionsScreenOptimized = memo(() => {
//   const router = useRouter()
//   // const mapRef = useRef<MapView>(null)
//   const { openExternalNavigation, modalVisible, pendingDestination, confirmNavigation, cancelNavigation } = useNavigationHandler()
//   // const [region, setRegion] = useState<Region>({
//   //   latitude: 14.5995, // Default to Manila area
//   //   longitude: 120.9842,
//   //   latitudeDelta: 0.05,
//   //   longitudeDelta: 0.05,
//   // })
//   const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null)
//   const [locationGranted, setLocationGranted] = useState(false)
//   const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null)
//   const [filterPriority, setFilterPriority] = useState<string>('all')
//   // const [mapReady, setMapReady] = useState(false); // Track when map is ready
//   // const [mapLoading, setMapLoading] = useState(true); // Track map loading state
//   // const [mapTileProvider, setMapTileProvider] = useState<'stadia' | 'arcgis'>('stadia')

//   // Get user location
//   useEffect(() => {
//     const getLocation = async () => {
//       try {
//         console.log('Requesting location permission...');
//         let { status } = await Location.requestForegroundPermissionsAsync();
//         console.log('Location permission status:', status);
        
//         if (status !== 'granted') {
//           console.warn('Location permission denied');
//           return;
//         }
        
//         setLocationGranted(true);
//         console.log('Getting current position...');
//         let location = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.Balanced,
//         });
        
//         console.log('Current location:', location.coords);
        
//         const newRegion = {
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//           latitudeDelta: 0.02, // Smaller delta for closer zoom
//           longitudeDelta: 0.02,
//         };
        
//         console.log('Setting region to:', newRegion);
//         // setRegion(newRegion);
//         setCurrentLocation({
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//         });

//         // Use animateToRegion instead of forcing re-render
//         // if (mapRef.current) {
//         //   mapRef.current.animateToRegion(newRegion, 1000);
//         // }
        
//       } catch (error) {
//         console.error('Error getting location:', error);
//       }
//     };
    
//     getLocation();
//   }, []);

//   // Use React Query for data fetching
//   const { data: reports = [], isLoading, refetch, isRefetching } = useQuery({
//     queryKey: ['nearby-reports', currentLocation?.latitude, currentLocation?.longitude],
//     queryFn: async (): Promise<ReportItem[]> => {
//       if (!currentLocation) {
//         console.log('No current location, skipping API call');
//         return []
//       }
      
//       const token = await getUserToken()
//       if (!token) {
//         console.log('No user token, skipping API call');
//         return []
//       }

//       console.log('Fetching nearby reports for location:', currentLocation);
//       try {
//         const res = await apiGetNearbyReports(token, currentLocation.latitude, currentLocation.longitude, 2.0) // 2km radius
//         console.log('API response:', res);
        
//         if (res?.status === "success" && Array.isArray(res.reports)) {
//           console.log('Found reports:', res.reports.length);
//           // Log coordinates for debugging
//           res.reports.forEach((report: ReportItem) => {
//             console.log(`Report ${report.id}: lat=${report.latitude}, lng=${report.longitude}`);
//           });
//           return res.reports;
//         } else {
//           console.log('No valid reports in response');
//           return [];
//         }
//       } catch (error) {
//         console.error('Error fetching reports:', error);
//         return [];
//       }
//     },
//     staleTime: 1000 * 60 * 2, // 2 minutes cache
//     enabled: !!currentLocation, // Only fetch when we have location
//   })

//   const onRefresh = useCallback(() => {
//     console.log('Refreshing data...');
//     refetch()
//   }, [refetch])

//   // Memoized filtered and sorted reports
//   const filteredReports = useMemo(() => {
//     console.log('Filtering and sorting reports. Total:', reports.length, 'Filter:', filterPriority);
//     let filtered = reports;
//     if (filterPriority !== 'all') {
//       filtered = reports.filter(r => {
//         const priority = (r.priority || '').toLowerCase()
//         return filterPriority === 'high' ? priority.includes('high') || priority.includes('emergency') :
//                filterPriority === 'medium' ? priority.includes('medium') :
//                priority.includes('low')
//       })
//     }
//     // Sort by distance (closest first)
//     filtered = filtered.sort((a, b) => {
//       const distA = parseFloat(String(a.distance_km || 0));
//       const distB = parseFloat(String(b.distance_km || 0));
//       return distA - distB;
//     });
//     console.log('Filtered and sorted reports count:', filtered.length);
//     return filtered;
//   }, [reports, filterPriority])

//   // Memoized stats calculations
//   const stats = useMemo(() => ({
//     total: filteredReports.length,
//     ongoing: filteredReports.filter(r => (r.status || '').toLowerCase() === 'ongoing').length,
//     completed: filteredReports.filter(r => (r.status || '').toLowerCase() === 'completed').length,
//     pending: filteredReports.filter(r => (r.status || '').toLowerCase() === 'pending').length,
//     highPriority: filteredReports.filter(r =>
//       (r.priority || '').toLowerCase().includes('high') ||
//       (r.priority || '').toLowerCase().includes('emergency')
//     ).length,
//     avgDistance: filteredReports.length > 0
//       ? (filteredReports.reduce((sum, r) => sum + parseFloat(String(r.distance_km || 0)), 0) / filteredReports.length).toFixed(1)
//       : '0'
//   }), [filteredReports])

//   const openDetails = useCallback((id: number | string) => {
//     router.push(`/(bfp)/details?id=${id}`)
//   }, [router])

//   const handleMarkerPress = useCallback((id: number) => {
//     setSelectedMarkerId(id)
//   }, [])

//   const handleMapPress = useCallback(() => {
//     setSelectedMarkerId(null)
//   }, [])

//   const handleNavigatePress = useCallback((lat?: string | null, lng?: string | null, label?: string | null) => {
//     // Dismiss callouts before opening modal to prevent conflicts
//     setSelectedMarkerId(null)
//     setTimeout(() => {
//       openExternalNavigation(lat ?? undefined, lng ?? undefined, label ?? undefined)
//     }, 100)
//   }, [openExternalNavigation])

//   const COLORS = {
//     primary: colors.fireRed,
//     background: '#F4F4F4',
//     card: '#FFFFFF',
//     mutedText: colors.mutedFg,
//     heading: colors.darkGray,
//     border: colors.border,
//   }

//   // Responsive map height
//   const mapHeight = getResponsiveValue(
//     { xs: height * 0.32, sm: height * 0.35, md: height * 0.4 },
//     height * 0.32
//   )

//   // Get valid markers with proper coordinates
//   const validMarkers = useMemo(() => {
//     const valid = filteredReports.filter(report => {
//       if (!report.latitude || !report.longitude) return false;
//       const lat = parseFloat(report.latitude);
//       const lng = parseFloat(report.longitude);
//       return (
//         !isNaN(lat) &&
//         !isNaN(lng) &&
//         Math.abs(lat) <= 90 &&
//         Math.abs(lng) <= 180 &&
//         lat !== 0 &&
//         lng !== 0
//       );
//     });
//     console.log('Valid markers count:', valid.length);
//     return valid.slice(0, 30); // Limit for performance
//   }, [filteredReports]);

//   console.log('Current location state:', currentLocation);
//   console.log('Region state:', region);
//   console.log('Total reports:', reports.length);
//   console.log('Valid markers:', validMarkers.length);

//   return (
//     <YStack flex={1} backgroundColor="#F4F4F4">
//       {/* Header */}
//       <YStack backgroundColor="#FFF" paddingHorizontal="$4" paddingVertical={12} borderBottomWidth={1} borderBottomColor="#E0E0E0">
//         <XStack alignItems="center" gap="$3" paddingTop={30}>
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={{
//               width: touchTargetSize,
//               height: touchTargetSize,
//               borderRadius: 8,
//               borderWidth: 1,
//               borderColor: COLORS.border,
//               backgroundColor: 'transparent',
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//           >
//             <ArrowLeft size={20} color={COLORS.heading} />
//           </TouchableOpacity>

//           <YStack flex={1}>
//             <Text color={colors.fireRed} fontSize={18} fontWeight="700">Nearby Inspections</Text>
//             <Text fontSize={13} color={colors.mutedFg} marginTop={6}>
//               Reports within 2km radius • {currentLocation ? `Lat: ${currentLocation.latitude.toFixed(4)}, Lng: ${currentLocation.longitude.toFixed(4)}` : 'Getting location...'}
//             </Text>
//           </YStack>
//         </XStack>

//         <XStack alignItems="center" gap={8} marginTop={8}>
//           <MapPin size={16} color={colors.fireRed} />
//           <Text fontSize={13} color={colors.mutedFg}>
//             Your Location: {locationGranted ? 'Current Position' : 'Location access needed'}
//           </Text>
//           {currentLocation && (
//             <TouchableOpacity
//               activeOpacity={0.8}
//               onPress={() => handleNavigatePress(
//                 currentLocation.latitude.toString(),
//                 currentLocation.longitude.toString(),
//                 'BFP Location'
//               )}
//               style={styles.navigateButton}
//             >
//               <Navigation size={14} color={colors.fireRed} />
//               <Text fontSize={13} fontWeight="700" color={colors.fireRed} marginLeft={4}>Navigate</Text>
//             </TouchableOpacity>
//           )}
//         </XStack>

//         {/* Priority Filter */}
//         {/* <XStack gap="$2" marginTop={12}>
//           {[
//             { key: 'all', label: 'All', count: stats.total },
//             { key: 'high', label: 'High', count: stats.highPriority },
//             { key: 'medium', label: 'Medium', count: filteredReports.filter(r => (r.priority || '').toLowerCase().includes('medium')).length },
//             { key: 'low', label: 'Low', count: filteredReports.filter(r => (r.priority || '').toLowerCase().includes('low')).length },
//           ].map(({ key, label, count }) => (
//             <TouchableOpacity
//               key={key}
//               onPress={() => setFilterPriority(key)}
//               style={[
//                 styles.filterButton,
//                 filterPriority === key && styles.filterButtonActive
//               ]}
//             >
//               <Text style={[
//                 styles.filterButtonText,
//                 filterPriority === key && styles.filterButtonTextActive
//               ]}>
//                 {label} ({count})
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </XStack> */}
//       </YStack>

//       {/* Scrollable content including map */}
//       <ScrollView
//         refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Map card with gradient overlay */}
//         <View padding="$4">
//           <Card borderRadius={12} padding={0} elevation={2} backgroundColor="#fff">
//             <View height={mapHeight} width="100%">
//               {/* Loading overlay */}
//               {mapLoading && (
//                 <RNView
//                   style={{
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     backgroundColor: '#f8f8f8',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     zIndex: 10,
//                   }}
//                 >
//                   <RNView style={{ alignItems: 'center' }}>
//                     <RNView
//                       style={{
//                         width: 40,
//                         height: 40,
//                         borderRadius: 20,
//                         borderWidth: 3,
//                         borderColor: colors.fireRed,
//                         borderTopColor: 'transparent',
//                         marginBottom: 12,
//                       }}
//                       // Add rotation animation if needed
//                     />
//                     <Text fontSize={14} color={colors.mutedFg} fontWeight="600">
//                       Loading map...
//                     </Text>
//                   </RNView>
//                 </RNView>
//               )}

//               <MapView
//                 ref={mapRef}
//                 style={{ flex: 1 }}
//                 region={region}
//                 onRegionChangeComplete={_.debounce(setRegion, 500)}
//                 onMapReady={() => {
//                   setMapReady(true);
//                   setMapLoading(false);
//                 }}
//                 showsUserLocation={false}
//                 showsMyLocationButton={false}
//                 onPress={handleMapPress}
//                 scrollEnabled={true}
//                 zoomEnabled={true}
//                 rotateEnabled={false}
//                 pitchEnabled={false}
//                 showsCompass={false}
//                 cacheEnabled={true}
//                 moveOnMarkerPress={false}
//                 loadingEnabled={false} // Disable built-in loading since we have custom overlay
//                 liteMode={Platform.OS === 'android'}
//                 provider={undefined} // Disable Google Maps SDK
//               >
//                 <UrlTile
//                   key="map-tiles" // Stable key to prevent unnecessary re-mounting
//                   urlTemplate={MAP_CONFIG[mapTileProvider].urlTemplate}
//                   maximumZ={MAP_CONFIG[mapTileProvider].maximumZ}
//                   flipY={false}
//                 />
//                 {/* Only render markers when map is ready */}
//                 {mapReady && (
//                   <>
//                     {/* BFP Location Marker - Only show if we have current location */}
//                     {currentLocation && (
//                       <Marker
//                         coordinate={{
//                           latitude: currentLocation.latitude,
//                           longitude: currentLocation.longitude
//                         }}
//                         title="BFP Location"
//                         description="Your current position"
//                         onPress={() => setSelectedMarkerId(-1)}
//                       >
//                         <RNView
//                           style={{
//                             width: getResponsiveValue({ xs: 36, sm: 40, md: 44 }, 36),
//                             height: getResponsiveValue({ xs: 36, sm: 40, md: 44 }, 36),
//                             borderRadius: 18,
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             backgroundColor: 'rgba(33,150,243,0.1)',
//                             borderWidth: 2,
//                             borderColor: '#2196F3',
//                           }}
//                         >
//                           <Home size={ICON_SIZE} color="#2196F3" />
//                         </RNView>
//                         <Callout tooltip>
//                           <RNView style={styles.calloutContainer}>
//                             <YStack>
//                               <Text fontWeight="700" fontSize={14} color={colors.darkGray}>
//                                 BFP Location
//                               </Text>
//                               <Text fontSize={12} color={colors.mutedFg} marginTop={6}>
//                                 Your current position
//                               </Text>
//                               <Text fontSize={11} color={colors.mutedFg} marginTop={2}>
//                                 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
//                               </Text>
//                               <TouchableOpacity
//                                 style={styles.calloutButton}
//                                 activeOpacity={0.8}
//                                 onPress={() => handleNavigatePress(
//                                   currentLocation.latitude.toString(),
//                                   currentLocation.longitude.toString(),
//                                   'BFP Location'
//                                 )}
//                               >
//                                 <Navigation size={12} color={colors.fireRed} />
//                                 <Text fontSize={12} fontWeight="700" color={colors.fireRed} marginLeft={4}>
//                                   Navigate Here
//                                 </Text>
//                               </TouchableOpacity>
//                             </YStack>
//                           </RNView>
//                         </Callout>
//                       </Marker>
//                     )}

//                     {/* Report Markers */}
//                     {validMarkers.map((report, index) => (
//                       <OptimizedReportMarker
//                         key={`${report.id}-${index}`}
//                         report={{
//                           ...report,
//                           longitude: (parseFloat(report.longitude!) + (Math.random() * 0.00001)).toString(), // Small offset for overlapping
//                         }}
//                         onPress={() => handleMarkerPress(report.id)}
//                         onDetailsPress={openDetails}
//                         onNavigatePress={handleNavigatePress}
//                       />
//                     ))}
//                   </>
//                 )}
//               </MapView>

//               {/* Gradient overlay */}
//               <LinearGradient
//                 colors={["rgba(224,243,255,0.08)", "transparent"]}
//                 style={styles.gradientOverlay}
//               />

//               {/* Map instruction label */}
//               <View position="absolute" bottom={8} left={12} right={12} alignItems="center">
//                 <Text fontSize={13} color={colors.mutedFg}>
//                   {validMarkers.length > 0
//                     ? `Tap markers to view ${validMarkers.length} report details`
//                     : 'No reports with valid coordinates found'
//                   }
//                 </Text>
//               </View>

//               {/* Map provider toggle for fallback */}
//               <View position="absolute" top={8} right={8}>
//                 <TouchableOpacity
//                   onPress={() => setMapTileProvider(prev => prev === 'stadia' ? 'arcgis' : 'stadia')}
//                   style={{
//                     backgroundColor: 'rgba(255,255,255,0.9)',
//                     paddingVertical: 6,
//                     paddingHorizontal: 12,
//                     borderRadius: 6,
//                     borderWidth: 1,
//                     borderColor: colors.border,
//                   }}
//                 >
//                   <Text fontSize={11} color={colors.fireRed} fontWeight="600">
//                     Switch to {mapTileProvider === 'stadia' ? 'ArcGIS World Street Map' : 'Stadia Maps'}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </Card>
//         </View>

//         {/* Reports list header */}
//         <YStack paddingHorizontal="$4" paddingTop={8}>
//           <Text color={colors.mutedFg} fontSize={16} fontWeight="600">
//             Reports in Area ({filteredReports.length})
//             {validMarkers.length !== filteredReports.length && 
//               ` • ${validMarkers.length} with valid coordinates`
//             }
//           </Text>
//         </YStack>

//         <YStack padding="$4" gap={12} paddingBottom={140}>
//           {/* Reports list */}
//           {isLoading ? (
//             <Text textAlign="center" color={colors.mutedFg} marginTop={20}>
//               Loading nearby reports...
//             </Text>
//           ) : filteredReports.length === 0 ? (
//             <Text textAlign="center" color={colors.mutedFg} marginTop={20}>
//               No reports found in your area
//             </Text>
//           ) : (
//             filteredReports.map((r, i) => {
//               const getIconComp = () => {
//                 const c = (r.category_name || '').toLowerCase()
//                 if (c.includes('fire')) return Flame
//                 if (c.includes('electrical') || c.includes('elec')) return Zap
//                 if (c.includes('building') || c.includes('house') || c.includes('structure')) return Home
//                 return Flame
//               }

//               const getColor = () => {
//                 if (!r.priority) return colors.fireRed
//                 const p = r.priority.toLowerCase()
//                 if (p.includes('high') || p.includes('emergency')) return colors.fireRed
//                 if (p.includes('medium')) return colors.warningOrange
//                 if (p.includes('low')) return colors.successGreen
//                 return colors.fireRed
//               }

//               const IconComp = getIconComp()
//               const color = getColor()

//               return (
//                 <MotiView
//                   key={r.id}
//                   from={{ opacity: 0, translateY: 16 }}
//                   animate={{ opacity: 1, translateY: 0 }}
//                   transition={{ type: "timing", duration: 380, delay: i * 60 }}
//                 >
//                   <Card
//                     backgroundColor="#FFF"
//                     borderRadius={12}
//                     padding="$4"
//                     shadowColor="#000"
//                     shadowOpacity={0.08}
//                     shadowOffset={{ width: 0, height: 2 }}
//                     shadowRadius={6}
//                     onPress={() => openDetails(r.id)}
//                     pressStyle={{ scale: 0.98 }}
//                   >
//                     <XStack alignItems="flex-start" justifyContent="space-between">
//                       <XStack alignItems="center" gap={10} flex={1}>
//                         <View
//                           width={44}
//                           height={44}
//                           borderRadius={10}
//                           backgroundColor={`rgba(229,57,53,0.06)`}
//                           alignItems="center"
//                           justifyContent="center"
//                         >
//                           <IconComp size={20} color={color} />
//                         </View>

//                         <YStack flex={1}>
//                           <Text fontWeight="600" fontSize={15} color={colors.darkGray}>
//                             {r.category_name || r.title || "Hazard"}
//                           </Text>
//                           <XStack alignItems="center" gap={6} marginTop={6}>
//                             <MapPin size={14} color={colors.mutedFg} />
//                             <Text fontSize={13} color={colors.mutedFg}>
//                               {r.location_address || "No address available"}
//                             </Text>
//                           </XStack>
//                           {r.distance_km && (
//                             <Text fontSize={12} color={colors.mutedFg} marginTop={2}>
//                               {r.distance_km.toFixed(1)} km away
//                             </Text>
//                           )}
//                           {(!r.latitude || !r.longitude) && (
//                             <Text fontSize={11} color={colors.warningOrange} marginTop={2}>
//                               No coordinates available
//                             </Text>
//                           )}
//                         </YStack>
//                       </XStack>

//                       <XStack alignItems="center" gap={8}>
//                         <View style={{
//                           width: 10,
//                           height: 10,
//                           borderRadius: 5,
//                           backgroundColor: color,
//                         }} />

//                         <TouchableOpacity
//                           activeOpacity={0.8}
//                           onPress={() => handleNavigatePress(r.latitude, r.longitude, r.category_name || r.title)}
//                           style={styles.navigateButton}
//                         >
//                           <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
//                             <Navigation size={14} color={colors.fireRed} />
//                           </RNView>
//                         </TouchableOpacity>
//                       </XStack>
//                     </XStack>

//                     <XStack marginTop={10} justifyContent="space-between" alignItems="center">
//                       <View style={[styles.statusBadge, { backgroundColor: getStatusBadge(r.status).bg }]}>
//                         <Text fontSize={12} color={getStatusBadge(r.status).text}>
//                           {getNormalizedStatus(r.status)}
//                         </Text>
//                       </View>

//                       <Text fontSize={12} color={colors.mutedFg}>
//                         {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
//                       </Text>
//                     </XStack>
//                   </Card>
//                 </MotiView>
//               )
//             })
//           )}
//         </YStack>
//       </ScrollView>

//       {/* Bottom Stats */}
//       <View
//         position="absolute"
//         bottom={0}
//         left={0}
//         right={0}
//         backgroundColor="#FFF"
//         borderTopWidth={1}
//         borderTopColor="#E0E0E0"
//         paddingHorizontal="$4"
//         paddingVertical={10}
//       >
//         <XStack justifyContent="space-between" alignItems="center" paddingBottom={30}>
//           <YStack alignItems="center">
//             <Text fontSize={14} color={colors.fireRed} fontWeight="700">{stats.total}</Text>
//             <Text fontSize={12} color={colors.mutedFg}>Nearby Reports</Text>
//           </YStack>

//           <YStack alignItems="center">
//             <Text fontSize={14} color={colors.fireRed} fontWeight="700">
//               {stats.avgDistance} km
//             </Text>
//             <Text fontSize={12} color={colors.mutedFg}>Avg Distance</Text>
//           </YStack>

//           <YStack alignItems="center">
//             <Text fontSize={14} color={colors.fireRed} fontWeight="700">
//               {stats.highPriority}
//             </Text>
//             <Text fontSize={12} color={colors.mutedFg}>High Priority</Text>
//           </YStack>
//         </XStack>
//       </View>

//       <NavigationModal modalVisible={modalVisible} pendingDestination={pendingDestination} onConfirm={confirmNavigation} onCancel={cancelNavigation} />
//     </YStack>
//   )
// })

// NearbyInspectionsScreenOptimized.displayName = 'NearbyInspectionsScreenOptimized'

// export default NearbyInspectionsScreenOptimized

// /* Native styles for callout + small native buttons */
// const styles = StyleSheet.create({
//   calloutContainer: {
//     minWidth: getResponsiveValue({ xs: 200, sm: 240, md: 280 }, 200),
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.12,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   calloutButton: {
//     marginTop: 8,
//     alignSelf: "flex-start",
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     backgroundColor: "rgba(229,57,53,0.05)",
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   statusBadge: {
//     marginTop: 8,
//     borderRadius: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     alignSelf: "flex-start",
//   },
//   navigateButton: {
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//     borderWidth: 0,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   gradientOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     height: "100%",
//     opacity: 0.6,
//   },
//   filterButton: {
//     flex: 1,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: colors.border,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//     minHeight: touchTargetSize,
//   },
//   filterButtonActive: {
//     backgroundColor: colors.fireRed,
//     borderColor: colors.fireRed,
//   },
//   filterButtonText: {
//     fontSize: 12,
//     color: colors.mutedFg,
//     fontWeight: "600",
//   },
//   filterButtonTextActive: {
//     color: "#fff",
//   },
// })