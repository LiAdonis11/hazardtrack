// // app/(bfp)/NearbyInspectionsScreen.tsx
// import React, { useCallback, useEffect, useState } from "react"
// import MapView, { Marker, Callout, PROVIDER_GOOGLE, Region } from "react-native-maps"
// import {
//   ScrollView,
//   RefreshControl,
//   Dimensions,
//   TouchableOpacity,
//   StyleSheet,
//   View as RNView,
//   Linking,
//   Platform,
// } from "react-native"
// import { YStack, XStack, Text, View, Card } from "tamagui"
// import { Flame, Zap, Home, MapPin, ArrowLeft } from "@tamagui/lucide-icons"
// import { LinearGradient } from "expo-linear-gradient"
// import { MotiView } from "moti"
// import * as Location from 'expo-location';
// import { apiGetNearbyReports } from "../../lib/api"
// import { getUserToken } from "../../lib/storage"
// import { useRouter } from "expo-router"
// import { Button } from './ui/button';

// const { height } = Dimensions.get("window")

// type ReportItem = {
//   id: number
//   title?: string
//   category_name?: string
//   status?: string
//   latitude?: string
//   longitude?: string
//   location_address?: string | null
//   created_at?: string
//   priority?: string | null
//   distance_km?: number
// }

// const ICON_SIZE = 26

// export default function NearbyInspectionsScreen() {
//   const router = useRouter()
//   const [reports, setReports] = useState<ReportItem[]>([])
//   const [loading, setLoading] = useState(true)
//   const [refreshing, setRefreshing] = useState(false)
//   const [region, setRegion] = useState<Region>({
//     latitude: 15.132,
//     longitude: 120.585,
//     latitudeDelta: 0.03,
//     longitudeDelta: 0.03,
//   })
//   const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null)
//   const [locationGranted, setLocationGranted] = useState(false)
//   const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null)

//   useEffect(() => {
//     const getLocation = async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         console.warn('Location permission denied');
//         return;
//       }
//       setLocationGranted(true);
//       let location = await Location.getCurrentPositionAsync({});
//       setRegion({
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//         latitudeDelta: 0.03,
//         longitudeDelta: 0.03,
//       });
//       setCurrentLocation({
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//       });
//     };
//     getLocation();
//   }, []);

//   const fetchReports = useCallback(async () => {
//     try {
//       const token = await getUserToken()
//       if (!token) {
//         setReports([])
//         return
//       }
//       const res = await apiGetNearbyReports(token, region.latitude, region.longitude)
//       if (res?.status === "success" && Array.isArray(res.reports)) {
//         setReports(res.reports)
//       } else {
//         setReports(res?.reports || [])
//       }
//     } catch (error) {
//       console.warn("Fetch nearby reports failed", error)
//     } finally {
//       setLoading(false)
//       setRefreshing(false)
//     }
//   }, [region])

//   useEffect(() => {
//     fetchReports()
//   }, [fetchReports])

//   const onRefresh = useCallback(() => {
//     setRefreshing(true)
//     fetchReports()
//   }, [fetchReports])

//   const getCountByStatus = (status: string) =>
//     reports.filter((r) => (r.status || "").toLowerCase() === status.toLowerCase()).length

//   const total = reports.length
//   const ongoing = getCountByStatus("ongoing")
//   const completed = getCountByStatus("completed")
//   const pending = getCountByStatus("pending")

//   const openDetails = (id: number | string) => {
//     router.push(`/(bfp)/details?id=${id}`)
//   }

//   const openExternalNavigation = (lat?: string | number, lng?: string | number) => {
//     if (!lat || !lng) return
//     const url = Platform.OS === 'ios'
//       ? `maps://?daddr=${lat},${lng}`
//       : `google.navigation:q=${lat},${lng}`
//     Linking.openURL(url)
//   }

//   const getIconComponent = (category?: string) => {
//     const c = (category || "").toLowerCase()
//     if (c.includes("fire")) return Flame
//     if (c.includes("electrical") || c.includes("elec")) return Zap
//     if (c.includes("building") || c.includes("house") || c.includes("structure")) return Home
//     return Flame
//   }

//   const markerColorForPriority = (priority?: string) => {
//     if (!priority) return "#E53935"
//     const p = priority.toLowerCase()
//     if (p.includes("high") || p.includes("emergency")) return "#E53935"
//     if (p.includes("medium")) return "#FB8C00"
//     if (p.includes("low")) return "#43A047"
//     return "#E53935"
//   }

//   const handleMapPress = () => {
//     // close any callout when map pressed
//     setSelectedMarkerId(null)
//   }
//   const COLORS = {
//   primary: '#E53935',
//   background: '#F4F4F4',
//   card: '#FFFFFF',
//   mutedText: '#6B7280',
//   heading: '#111827',
//   border: '#E5E7EB',
// };

//   return (
//     <YStack flex={1} backgroundColor="#F4F4F4">
//       {/* Header / Location info (scrolls with content per your screenshot) */}
//       <YStack  backgroundColor="#FFF" paddingHorizontal={16} paddingVertical={12} borderBottomWidth={1} borderBottomColor="#E0E0E0">
//         <XStack alignItems="center" gap="$3" paddingTop={30}>
//           <Button
//             variant="outlined"
//             size="icon"
//             onPress={() => router.back()}
//             backgroundColor="transparent"
//             borderColor={COLORS.border}
//             borderRadius="$3"
//           >
//             <ArrowLeft size={20} color={COLORS.heading} />
//           </Button>

//           <YStack flex={1}>
//             <Text color="#E53935" fontSize={18} fontWeight="700">Nearby Inspections</Text>
//             <Text fontSize={13} color="#616161" marginTop={6}>Reports within 2km radius</Text>
//           </YStack>
//         </XStack>

//         <XStack alignItems="center" gap={8} marginTop={8}>
//           <MapPin size={16} color="#E53935" />
//           <Text fontSize={13} color="#616161">Your Location: {locationGranted ? 'Current Position' : 'Quezon City Fire Station'}</Text>
//           {currentLocation && (
//             <TouchableOpacity
//               activeOpacity={0.8}
//               onPress={() => openExternalNavigation(currentLocation.latitude, currentLocation.longitude)}
//               style={styles.navigateButton}
//             >
//               <Text fontSize={13} fontWeight="700" color="#E53935">Navigate</Text>
//             </TouchableOpacity>
//           )}
//         </XStack>
//       </YStack>

//       {/* Scrollable content including map */}
//       <ScrollView
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Map card with gradient overlay (rounded + shadow) */}
//         <View padding={12}>
//           <Card borderRadius={12} padding={0} elevation={2} backgroundColor="#fff" overflow="hidden">
//             <View height={height * 0.32} width="100%">
//               <MapView
//                 style={{ flex: 1 }}
//                 initialRegion={region}
//                 onRegionChangeComplete={(r: Region) => setRegion(r)}
//                 showsUserLocation
//                 provider={PROVIDER_GOOGLE}
//                 onPress={handleMapPress}
//                 scrollEnabled={false}
//               >
//                 {currentLocation && (
//                   <Marker
//                     coordinate={currentLocation}
//                     onPress={() => setSelectedMarkerId(-1)} // special id for BFP
//                   >
//                     <View width={36} height={36} borderRadius={18} alignItems="center" justifyContent="center" backgroundColor="transparent">
//                       <Home size={ICON_SIZE} color="#2196F3" />
//                     </View>
//                     <Callout tooltip>
//                       <RNView style={styles.calloutContainer}>
//                         <YStack>
//                           <Text fontWeight="700" fontSize={14} color="#212121">
//                             BFP Location
//                           </Text>
//                           <Text fontSize={12} color="#616161" marginTop={6}>
//                             Your current position
//                           </Text>
//                         </YStack>
//                       </RNView>
//                     </Callout>
//                   </Marker>
//                 )}
//                 {reports.map((r) => {
//                   if (!r.latitude || !r.longitude) return null
//                   const lat = parseFloat(r.latitude as any)
//                   const lng = parseFloat(r.longitude as any)
//                   const IconComp = getIconComponent(r.category_name)
//                   const color = markerColorForPriority(r.priority || undefined)
//                   return (
//                     <Marker
//                       key={r.id}
//                       coordinate={{ latitude: lat, longitude: lng }}
//                       onPress={() => setSelectedMarkerId(r.id)}
//                     >
//                       <View width={36} height={36} borderRadius={18} alignItems="center" justifyContent="center" backgroundColor="transparent">
//                         <IconComp size={ICON_SIZE} color={color} />
//                       </View>

//                       {/* Custom floating callout — builtin Callout used but styled */}
//                       <Callout tooltip onPress={() => openDetails(r.id)}>
//                         <RNView style={styles.calloutContainer}>
//                           <YStack>
//                             <Text fontWeight="700" fontSize={14} color="#212121">
//                               {r.category_name || r.title || "Hazard"}
//                             </Text>
//                             {r.location_address ? (
//                               <Text fontSize={12} color="#616161" marginTop={6}>
//                                 {r.location_address}
//                               </Text>
//                             ) : null}
//                             <View style={[
//                               styles.statusBadge,
//                               r.status === "completed" ? { backgroundColor: "#E8F5E9" } :
//                                 r.status === "ongoing" ? { backgroundColor: "#FFF3E0" } : { backgroundColor: "#FFF8E1" }
//                             ]}>
//                               <Text fontSize={12} color={
//                                 r.status === "completed" ? "#2E7D32" : r.status === "ongoing" ? "#FB8C00" : "#FBC02D"
//                               }>
//                                 {r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "Unknown"}
//                               </Text>
//                             </View>

//                             <TouchableOpacity style={styles.calloutButton} activeOpacity={0.8} onPress={() => openDetails(r.id)}>
//                               <Text fontSize={13} fontWeight="700" color="#E53935">View Details</Text>
//                             </TouchableOpacity>
//                           </YStack>
//                         </RNView>
//                       </Callout>
//                     </Marker>
//                   )
//                 })}
//               </MapView>

//               {/* Gradient overlay to match screenshot tint */}
//               <LinearGradient
//                 colors={["rgba(224,243,255,0.18)", "transparent"]}
//                 style={styles.gradientOverlay}
//               />

//               {/* "Tap a pin to view report details" label */}
//               <View position="absolute" bottom={8} left={12} right={12} alignItems="center">
//                 <Text fontSize={13} color="#616161">Tap a pin to view report details</Text>
//               </View>
//             </View>
//           </Card>
//         </View>

//         {/* Reports list header */}
//         <YStack paddingHorizontal={16} paddingTop={8}>
//           <Text color="#616161" fontSize={16} fontWeight="600">Reports in Area</Text>
//         </YStack>

//         <YStack padding={16} gap={12} paddingBottom={120}>
//           {/* Reports list */}
//           {loading ? (
//             <Text textAlign="center" color="#9E9E9E" marginTop={20}>Loading nearby reports...</Text>
//           ) : reports.length === 0 ? (
//             <Text textAlign="center" color="#9E9E9E" marginTop={20}>No reports found in your area</Text>
//           ) : (
//             reports.map((r, i) => {
//               const IconComp = getIconComponent(r.category_name)
//               const color = markerColorForPriority(r.priority || undefined)
//               return (
//                 <MotiView
//                   key={r.id}
//                   from={{ opacity: 0, translateY: 16 }}
//                   animate={{ opacity: 1, translateY: 0 }}
//                   transition={{ type: "timing", duration: 380, delay: i * 60 }}
//                 >
//                   <MotiView>
//                     <Card
//                       backgroundColor="#FFF"
//                       borderRadius={12}
//                       padding={12}
//                       shadowColor="#000"
//                       shadowOpacity={0.08}
//                       shadowOffset={{ width: 0, height: 2 }}
//                       shadowRadius={6}
//                       onPress={() => openDetails(r.id)}
//                     >
//                       <XStack alignItems="flex-start" justifyContent="space-between">
//                         <XStack alignItems="center" gap={10} flex={1}>
//                           <View width={44} height={44} borderRadius={10} backgroundColor={`rgba(229,57,53,0.06)`} alignItems="center" justifyContent="center">
//                             <IconComp size={20} color={color} />
//                           </View>

//                           <YStack flex={1}>
//                             <Text fontWeight="600" fontSize={15} color="#212121">{r.category_name || r.title || "Hazard"}</Text>
//                             <XStack alignItems="center" gap={6} marginTop={6}>
//                               <MapPin size={14} color="#9E9E9E" />
//                               <Text fontSize={13} color="#616161">
//                                 {r.location_address || "No address available"}
//                               </Text>
//                             </XStack>
//                           </YStack>
//                         </XStack>

//                         <XStack alignItems="center" gap={8}>
//                           <View style={{
//                             width: 10,
//                             height: 10,
//                             borderRadius: 5,
//                             backgroundColor: color,
//                           }} />

//                           <TouchableOpacity
//                             activeOpacity={0.8}
//                             onPress={() => openExternalNavigation(r.latitude, r.longitude)}
//                             style={styles.navigateButton}
//                           >
//                             <Text fontSize={13} fontWeight="700" color="#E53935">Navigate</Text>
//                           </TouchableOpacity>
//                         </XStack>
//                       </XStack>

//                       {/* status + small spacing */}
//                       <XStack marginTop={10} justifyContent="space-between" alignItems="center">
//                         <View style={[
//                           styles.statusBadge,
//                           r.status === "completed" ? { backgroundColor: "#E8F5E9" } :
//                             r.status === "ongoing" ? { backgroundColor: "#FFF3E0" } : { backgroundColor: "#FFF8E1" }
//                         ]}>
//                           <Text fontSize={12} color={r.status === "completed" ? "#2E7D32" : r.status === "ongoing" ? "#FB8C00" : "#FBC02D"}>
//                             {r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "Unknown"}
//                           </Text>
//                         </View>

//                         <Text fontSize={12} color="#9E9E9E">{r.created_at ? new Date(r.created_at).toLocaleString() : ""}</Text>
//                       </XStack>
//                     </Card>
//                   </MotiView>
//                 </MotiView>
//               )
//             })
//           )}

//           {/* Quick Actions */}
//           {/* <Card backgroundColor="#FFF" borderRadius={12} padding={12} shadowColor="#000" shadowOpacity={0.06} shadowOffset={{ width: 0, height: 2 }} shadowRadius={6}>
//             <YStack gap={10}>
//               <Text fontWeight="600" fontSize={15} color="#212121">Quick Actions</Text>

//               <XStack gap={10}>
//                 <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.8}>
//                   <Text fontSize={13} color="#212121">Mark Current Location for Inspection</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.8}>
//                   <Text fontSize={13} color="#212121">Report New Hazard at Current Location</Text>
//                 </TouchableOpacity>
//               </XStack>
//             </YStack>
//           </Card> */}
//         </YStack>
//       </ScrollView>

//       {/* Bottom Stats (fixed like screenshot bottom bar) */}
//       <View position="absolute" bottom={0} left={0} right={0} backgroundColor="#FFF" borderTopWidth={1} borderTopColor="#E0E0E0" paddingHorizontal={16} paddingVertical={10}>
//         <XStack justifyContent="space-between" alignItems="center" paddingBottom={30}>
//           <YStack alignItems="center">
//             <Text fontSize={14} color="#E53935" fontWeight="700">{total}</Text>
//             <Text fontSize={12} color="#616161">Nearby Reports</Text>
//           </YStack>

//           <YStack alignItems="center">
//             <Text fontSize={14} color="#E53935" fontWeight="700">
//               {reports.length > 0 ? (reports.reduce((sum, r) => sum + parseFloat(String(r.distance_km || 0)), 0) / reports.length).toFixed(1) + ' km' : '—'}
//             </Text>
//             <Text fontSize={12} color="#616161">Average Distance</Text>
//           </YStack>

//           <YStack alignItems="center">
//             <Text fontSize={14} color="#E53935" fontWeight="700">
//               {reports.filter(r => (r.priority || "").toLowerCase().includes("high") || (r.priority || "").toLowerCase().includes("emergency")).length}
//             </Text>
//             <Text fontSize={12} color="#616161">High Priority</Text>
//           </YStack>
//         </XStack>
//       </View>
//     </YStack>
//   )
// }

// /* Native styles for callout + small native buttons (Callout uses RN views, so we use StyleSheet) */
// const styles = StyleSheet.create({
//   calloutContainer: {
//     width: 220,
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
//   },
//   gradientOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     height: "100%",
//     opacity: 0.6,
//   },
//   quickActionBtn: {
//     flex: 1,
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// })
