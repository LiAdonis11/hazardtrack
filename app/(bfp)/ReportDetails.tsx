// // BFP ReportDetails.tsx - Modified from resident version for BFP inspectors
// import React, { useEffect, useState, useCallback } from 'react'
// import {
//   ScrollView,
//   Image,
//   Alert,
//   TouchableOpacity,
//   View as RNView,
//   Linking,
//   Pressable,
// } from 'react-native'
// // import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps'
// import { YStack, XStack, View, Separator } from 'tamagui'
// import { TextInput } from 'react-native'
// import { Text } from './ui/text'
// import { Button } from './ui/button'
// import { Card } from './ui/card'
// import { Badge, BadgeText } from './ui/badge'
// import {
//   ArrowLeft,
//   MapPin,
//   Clock,
//   User,
//   Camera,
//   Phone,
//   MessageSquare,
//   Mail,
//   CheckCircle,
//   XCircle,
//   AlertTriangle,
// } from '@tamagui/lucide-icons'
// import { useRouter, useLocalSearchParams } from 'expo-router'
// import {
//   apiGetAllReports,
//   apiUpdateReportStatus,
// } from '../../lib/api'
// import { getUserToken } from '../../lib/storage'
// import { API_URL } from '../../lib/config'

// /**
//  * Visual design / color tokens (kept near top so it's easy to tweak)
//  */
// const COLORS = {
//   primary: '#E53935', // red accent
//   subtlePrimary: '#FEEDEE',
//   cardBg: '#FFFFFF',
//   pageBg: '#F6F7F8',
//   mutedText: '#6B7280',
//   heading: '#111827',
//   border: '#E8E8E8',
//   softBlue: '#E8F0FF',
//   verifiedBlue: '#3B82F6',
//   pillBlueBg: '#EEF6FF',
//   pillBlueBorder: '#D5E9FF',
// }

// const getStatusColors = (status: string) => {
//   switch ((status || '').toLowerCase()) {
//     case 'pending':
//     case 'new':
//       return { bg: '#FBC02D33', color: '#F57C00' }
//     case 'in_progress':
//     case 'in-progress':
//       return { bg: '#E3F2FD', color: '#1976D2' }
//     case 'resolved':
//       return { bg: '#C8E6C9', color: '#388E3C' }
//     case 'verified':
//     case 'valid':
//       return { bg: '#C8E6C9', color: '#388E3C' }
//     case 'rejected':
//       return { bg: '#FFEBEE', color: '#D32F2F' }
//     case 'closed':
//       return { bg: '#F3E5F5', color: '#7B1FA2' }
//     default:
//       return { bg: '#EEEEEE', color: '#555' }
//   }
// }

// const getPriorityColor = (priority?: string) => {
//   if (!priority) return '#6B7280'
//   switch (priority.toLowerCase()) {
//     case 'high':
//     case 'emergency':
//       return '#DC2626'
//     case 'medium':
//       return '#F59E0B'
//     case 'low':
//       return '#10B981'
//     default:
//       return '#6B7280'
//   }
// }

// const getRelativeTime = (dateStr?: string) => {
//   if (!dateStr) return ''
//   const now = new Date()
//   const date = new Date(dateStr)
//   const diffMs = now.getTime() - date.getTime()
//   const diffMin = Math.floor(diffMs / 60000)
//   if (diffMin < 1) return 'just now'
//   if (diffMin === 1) return '1 min ago'
//   if (diffMin < 60) return `${diffMin} mins ago`
//   const diffH = Math.floor(diffMin / 60)
//   if (diffH === 1) return '1 hour ago'
//   if (diffH < 24) return `${diffH} hours ago`
//   const diffD = Math.floor(diffH / 24)
//   return `${diffD} day${diffD > 1 ? 's' : ''} ago`
// }

// const getProgressSteps = (status?: string) => {
//   const currentStatus = (status || '').toLowerCase()
//   return [
//     {
//       id: 1,
//       title: 'Report Submitted',
//       description: 'Report received and queued for review',
//       completed: true, // Always completed if report exists
//       active: currentStatus === 'pending'
//     },
//     {
//       id: 2,
//       title: 'Under Review',
//       description: 'BFP personnel are reviewing the report',
//       completed: ['verified', 'rejected', 'in_progress', 'resolved', 'closed'].includes(currentStatus),
//       active: ['verified', 'rejected'].includes(currentStatus)
//     },
//     {
//       id: 3,
//       title: 'In Progress',
//       description: 'BFP is actively working to resolve the issue',
//       completed: ['resolved', 'closed'].includes(currentStatus),
//       active: currentStatus === 'in_progress'
//     },
//     {
//       id: 4,
//       title: 'Completed',
//       description: 'Issue has been resolved or closed',
//       completed: ['resolved', 'closed'].includes(currentStatus),
//       active: ['resolved', 'closed'].includes(currentStatus)
//     }
//   ]
// }

// export default function BFPReportDetailsScreen() {
//   const router = useRouter()
//   const params = useLocalSearchParams()
//   const reportParam = params.report as string
//   const [report, setReport] = useState<any | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [notes, setNotes] = useState('')
//   const [mapRegion, setMapRegion] = useState<Region | null>(null)
//   const [editableTitle, setEditableTitle] = useState('')
//   const [editableDescription, setEditableDescription] = useState('')
//   const [editableLocation, setEditableLocation] = useState('')

//   useEffect(() => {
//     let mounted = true
//     const loadReport = () => {
//       if (reportParam) {
//         try {
//           const parsed = JSON.parse(reportParam)
//           if (mounted) {
//             setReport(parsed)
//             setNotes(parsed.admin_notes || parsed.bfp_notes || '')
//             setEditableTitle(parsed.title || '')
//             setEditableDescription(parsed.description || '')
//             setEditableLocation(parsed.location_address || '')
//             if (parsed.latitude && parsed.longitude) {
//               setMapRegion({
//                 latitude: Number(parsed.latitude),
//                 longitude: Number(parsed.longitude),
//                 latitudeDelta: 0.0015, // Zoomed in
//                 longitudeDelta: 0.0015,
//               })
//             }
//           }
//         } catch (e) {
//           console.warn('Failed to parse report', e)
//         }
//       }
//       setLoading(false)
//     }
//     loadReport()
//     return () => {
//       mounted = false
//     }
//   }, [reportParam])

//   const getServerStatus = (status: string) => {
//     const map: Record<string, string> = {
//       Valid: 'verified',
//       Invalid: 'rejected',
//       New: 'pending',
//       'In-Progress': 'in_progress',
//       Resolved: 'resolved',
//       Verified: 'verified',
//       Submitted: 'pending',
//     }
//     return map[status] || status.toLowerCase().replace('-', '_')
//   }



//   const handleSaveNotes = useCallback(async () => {
//     if (!report) return
//     try {
//       const token = await getUserToken()
//       if (!token) return
//       // Assuming update_report_details accepts admin_notes
//       const res = await fetch(`${API_URL}/update_report_details.php`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           report_id: report.id,
//           admin_notes: notes,
//         }),
//       })
//       const data = await res.json()
//       if (data.status === 'success') {
//         setReport((prev: any) => (prev ? { ...prev, admin_notes: notes, bfp_notes: notes } : prev))
//         Alert.alert('Notes saved', 'Inspector notes saved.')
//       } else {
//         Alert.alert('Error', 'Failed to save notes.')
//       }
//     } catch (err) {
//       console.warn('handleSaveNotes', err)
//       Alert.alert('Error', 'Failed to save notes.')
//     }
//   }, [notes, report])

//   const handleSaveDetails = useCallback(async () => {
//     if (!report) return
//     try {
//       const token = await getUserToken()
//       if (!token) return
//       const res = await fetch(`${API_URL}/update_report_details.php`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           report_id: report.id,
//           title: editableTitle,
//           description: editableDescription,
//           location_address: editableLocation,
//         }),
//       })
//       const data = await res.json()
//       if (data.status === 'success') {
//         setReport((prev: any) => (prev ? { ...prev, title: editableTitle, description: editableDescription, location_address: editableLocation } : prev))
//         Alert.alert('Details updated', 'Report details updated successfully.')
//       } else {
//         Alert.alert('Error', 'Failed to update details.')
//       }
//     } catch (err) {
//       console.warn('handleSaveDetails', err)
//       Alert.alert('Error', 'Failed to update details.')
//     }
//   }, [editableTitle, editableDescription, editableLocation, report])

//   if (loading) {
//     return (
//       <YStack flex={1} backgroundColor={COLORS.pageBg} padding="$4" justifyContent="center" alignItems="center">
//         <Text fontSize={16} color={COLORS.mutedText}>
//           Loading...
//         </Text>
export default function ReportDetails() {
  return null
}

//   if (!report) {
//     return (
//       <YStack flex={1} backgroundColor={COLORS.pageBg} padding="$4" justifyContent="center" alignItems="center">
//         <Text fontSize={16} color={COLORS.mutedText}>
//           Report not found.
//         </Text>
//       </YStack>
//     )
//   }

//   const images = report.image_path ? [report.image_path] : []

//   const priorityColor = getPriorityColor(report.priority)
//   const statusColor = getStatusColors(report.status)

//   return (
//     <YStack flex={1} backgroundColor={COLORS.pageBg}>
//       {/* Top bar */}
//       <YStack backgroundColor={COLORS.cardBg} paddingHorizontal={16} paddingVertical={12} borderBottomWidth={1} borderBottomColor={COLORS.border}>
//         <XStack alignItems="center" gap={12} marginTop={35}>
//           <Pressable onPress={() => router.back()}>
//             <ArrowLeft size={20} color={COLORS.heading} />
//           </Pressable>
//           <YStack>
//             <Text fontSize={18} fontWeight="700" color={COLORS.primary}>BFP Report Details</Text>
//             <Text fontSize={12} color={COLORS.mutedText}>#{report.id}</Text>
//           </YStack>
//         </XStack>
//       </YStack>

//       <ScrollView showsVerticalScrollIndicator={false}>
//         <YStack padding="$4" gap="$4" paddingBottom={160}>
//           {/* Hazard type + verified pill */}
//           <Card
//             backgroundColor={COLORS.cardBg}
//             borderRadius={12}
//             padding={12}
//             style={{
//               borderWidth: 1,
//               borderColor: COLORS.border,
//               shadowColor: '#000',
//               shadowOpacity: 0.05,
//               shadowOffset: { width: 0, height: 4 },
//               shadowRadius: 10,
//               elevation: 3,
//             }}
//           >
//             <XStack justifyContent="space-between" alignItems="center" marginBottom={6}>
//               <Text fontSize={16} fontWeight="700" color={COLORS.heading}>
//                 {report.hazard_type || report.category_name || 'Hazard'}
//               </Text>
//               <Badge backgroundColor={statusColor.bg} borderRadius={8} paddingHorizontal={12} paddingVertical={8}>
//                 <BadgeText color={statusColor.color} fontSize={12} fontWeight="700">
//                   {(report.status || 'Unknown').toString()}
//                 </BadgeText>
//               </Badge>
//             </XStack>
//             {report.summary || report.title ? (
//               <Text fontSize={13} color={COLORS.mutedText}>{report.summary || report.title}</Text>
//             ) : null}
//           </Card>

//           {/* Progress Tracker */}
//           <Card
//             backgroundColor={COLORS.cardBg}
//             borderRadius={12}
//             padding={12}
//             style={{
//               borderWidth: 1,
//               borderColor: COLORS.border,
//               shadowColor: '#000',
//               shadowOpacity: 0.04,
//               shadowOffset: { width: 0, height: 4 },
//               shadowRadius: 10,
//               elevation: 2,
//             }}
//           >
//             <Text fontSize={16} fontWeight="700" marginBottom={8}>Progress Tracker</Text>

//             <YStack gap={12}>
//               {getProgressSteps(report.status).map((step) => (
//                 <XStack key={step.id} gap={10} alignItems="flex-start">
//                   <XStack
//                     width={28}
//                     height={28}
//                     alignItems="center"
//                     justifyContent="center"
//                     borderRadius={14}
//                     backgroundColor={step.completed ? "#FEEFEF" : step.active ? "#FFF4E6" : "#FFFFFF"}
//                     borderWidth={1}
//                     borderColor={step.completed ? "#F2D5D5" : step.active ? "#FFE0B2" : COLORS.border}
//                   >
//                     {step.completed ? (
//                       <Text fontSize={12} color={COLORS.primary} fontWeight="700">✓</Text>
//                     ) : (
//                       <Text fontSize={12} color={step.active ? COLORS.primary : COLORS.mutedText}>
//                         {step.id}
//                       </Text>
//                     )}
//                   </XStack>
//                   <YStack>
//                     <Text fontWeight="700" color={step.active ? COLORS.primary : COLORS.heading}>
//                       {step.title}
//                     </Text>
//                     <Text fontSize={13} color={COLORS.mutedText}>{step.description}</Text>
//                   </YStack>
//                 </XStack>
//               ))}
//             </YStack>
//           </Card>

//           {/* Report Information */}
//           <Card
//             backgroundColor={COLORS.cardBg}
//             borderRadius={12}
//             padding={12}
//             style={{
//               borderWidth: 1,
//               borderColor: COLORS.border,
//               shadowColor: '#000',
//               shadowOpacity: 0.04,
//               shadowOffset: { width: 0, height: 4 },
//               shadowRadius: 10,
//               elevation: 2,
//             }}
//           >
//             <Text fontSize={16} fontWeight="700" marginBottom={8}>Report Information</Text>

//             <YStack gap={10}>
//               <XStack gap={8} alignItems="center">
//                 <MapPin size={16} color={COLORS.mutedText} />
//                 <Text color={COLORS.mutedText}>{report.location_address || report.location || 'Location not set'}</Text>
//               </XStack>

//               <XStack gap={8} alignItems="center">
//                 <Clock size={16} color={COLORS.mutedText} />
//                 <Text color={COLORS.mutedText}>Reported {getRelativeTime(report.created_at || report.timestamp)}</Text>
//               </XStack>

//               {/* <XStack gap={8} alignItems="center">
//                 <AlertTriangle size={16} color={getPriorityColor(report.priority)} />
//                 <Text color={COLORS.mutedText}>Priority: <Text fontWeight="700" color={getPriorityColor(report.priority)}>{report.priority || 'N/A'}</Text></Text>
//               </XStack> */}
//             </YStack>
//           </Card>

//           {/* Description */}
//           <Card
//             backgroundColor={COLORS.cardBg}
//             borderRadius={12}
//             padding={12}
//             style={{
//               borderWidth: 1,
//               borderColor: COLORS.border,
//               shadowColor: '#000',
//               shadowOpacity: 0.04,
//               shadowOffset: { width: 0, height: 4 },
//               shadowRadius: 10,
//               elevation: 2,
//             }}
//           >
//             <Text fontSize={16} fontWeight="700" marginBottom={8}>Description</Text>
//             <Text fontSize={14} color={COLORS.mutedText}>{report.description || 'No description provided.'}</Text>
//           </Card>





//           {/* Update Report */}
//           <Card
//             backgroundColor={COLORS.cardBg}
//             borderRadius={12}
//             padding={12}
//             style={{
//               borderWidth: 1,
//               borderColor: COLORS.border,
//               shadowColor: '#000',
//               shadowOpacity: 0.04,
//               shadowOffset: { width: 0, height: 4 },
//               shadowRadius: 10,
//               elevation: 2,
//             }}
//           >
//             <Text fontSize={16} fontWeight="700" marginBottom={8}>Update Report</Text>
//             <Text fontSize={13} color={COLORS.mutedText} marginBottom={12}>
//               Update the report details and add inspection notes.
//             </Text>
//             <YStack gap={12}>
//               <TextInput
//                 value={editableTitle}
//                 onChangeText={setEditableTitle}
//                 placeholder="Report Title"
//                 style={{
//                   borderWidth: 1,
//                   borderColor: COLORS.border,
//                   borderRadius: 8,
//                   padding: 12,
//                   fontSize: 14,
//                   backgroundColor: '#FAFAFA',
//                 }}
//               />
//               <TextInput
//                 value={editableDescription}
//                 onChangeText={setEditableDescription}
//                 placeholder="Report Description"
//                 multiline
//                 numberOfLines={3}
//                 style={{
//                   borderWidth: 1,
//                   borderColor: COLORS.border,
//                   borderRadius: 8,
//                   padding: 12,
//                   fontSize: 14,
//                   backgroundColor: '#FAFAFA',
//                   textAlignVertical: 'top',
//                 }}
//               />
//               <TextInput
//                 value={editableLocation}
//                 onChangeText={setEditableLocation}
//                 placeholder="Location Address"
//                 style={{
//                   borderWidth: 1,
//                   borderColor: COLORS.border,
//                   borderRadius: 8,
//                   padding: 12,
//                   fontSize: 14,
//                   backgroundColor: '#FAFAFA',
//                 }}
//               />
//               <TextInput
//                 value={notes}
//                 onChangeText={setNotes}
//                 placeholder="Add inspection notes..."
//                 multiline
//                 numberOfLines={4}
//                 style={{
//                   borderWidth: 1,
//                   borderColor: COLORS.border,
//                   borderRadius: 8,
//                   padding: 12,
//                   fontSize: 14,
//                   backgroundColor: '#FAFAFA',
//                   textAlignVertical: 'top',
//                 }}
//               />
//               <Button
//                 onPress={async () => {
//                   await handleSaveDetails()
//                   await handleSaveNotes()
//                   Alert.alert('Report Updated', 'Report details and notes have been updated.')
//                 }}
//                 style={{
//                   backgroundColor: COLORS.primary,
//                   borderRadius: 8,
//                   paddingVertical: 12,
//                   paddingHorizontal: 14,
//                   alignItems: 'center',
//                 }}
//               >
//                 <Text color="#fff" fontWeight="700" fontSize={14}>Update Report</Text>
//               </Button>
//             </YStack>
//           </Card>

//           {/* GPS Location (visual) */}
//           <Card
//             backgroundColor={COLORS.cardBg}
//             borderRadius={12}
//             padding={12}
//             style={{
//               borderWidth: 1,
//               borderColor: COLORS.border,
//               shadowColor: '#000',
//               shadowOpacity: 0.04,
//               shadowOffset: { width: 0, height: 4 },
//               shadowRadius: 10,
//               elevation: 2,
//             }}
//           >
//             <Text fontSize={16} fontWeight="700" marginBottom={8}>GPS Location</Text>

//             <View style={{ backgroundColor: '#EFEFF1', height: 120, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
//               {mapRegion ? (
//                 <MapView
//                   provider={PROVIDER_GOOGLE}
//                   style={{ width: '100%', height: '100%' }}
//                   initialRegion={mapRegion}
//                   scrollEnabled={false}
//                   zoomEnabled={false}
//                 >
//                   <Marker
//                     coordinate={{
//                       latitude: Number(report.latitude) || mapRegion.latitude,
//                       longitude: Number(report.longitude) || mapRegion.longitude,
//                     }}
//                   />
//                 </MapView>
//               ) : (
//                 <Text color={COLORS.mutedText}>Coordinates unavailable</Text>
//               )}
//             </View>

//             <Text fontSize={12} color={COLORS.mutedText} marginTop={8}>
//               {report.latitude && report.longitude
//                 ? `${Number(report.latitude).toFixed(3)}°N, ${Number(report.longitude).toFixed(3)}°E`
//                 : 'No coordinates'}
//             </Text>
//           </Card>
//         </YStack>
//       </ScrollView>

//       <YStack
//               position="absolute"
//               bottom={0}
//               left={0}
//               right={0}
//               backgroundColor={COLORS.card}
//               borderTopWidth={1}
//               borderTopColor={COLORS.border}
//               paddingHorizontal={16}
//               paddingVertical={12}
//             >
//               <XStack gap="$3" marginBottom={30}>
//                 <Button
//                   flex={1}
//                   onPress={() => router.push(`/(bfp)/communication?id=${report.id}&mode=call`)}
//                   backgroundColor="#F5F5F6"
//                   borderColor="#E5E7EB"
//                   paddingHorizontal="$3"
//                   paddingVertical="$3"
//                   borderRadius={10}
//                 >
//                   <Phone size={16} color={COLORS.heading} />
//                   <Text marginLeft="$2" color={COLORS.heading}>Call Resident</Text>
//                 </Button>
      
//                 <Button
//                   flex={1}
//                   onPress={() => router.push(`/(bfp)/communication?id=${report.id}&mode=message`)}
//                   backgroundColor={COLORS.primary}
//                   paddingHorizontal="$3"
//                   paddingVertical="$3"
//                   borderRadius={10}
//                 >
//                   <MessageSquare size={16} color="white" />
//                   <Text marginLeft="$2" color="white">Message</Text>
//                 </Button>
//               </XStack>
//             </YStack>
//     </YStack>
//   )
// }
