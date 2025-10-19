// app/(resident)/ReportHazard.tsx
import React, { useCallback, useEffect, useState } from "react"
import {
  Platform,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image as RNImage,
  Dimensions,
  ScrollView,
  Linking,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import { useRouter } from "expo-router"

import {
  YStack,
  XStack,
  Text,
  View,
  Card,
  Input,
  Button,
  Paragraph,
  Sheet,
} from "tamagui"
import { Flame, MapPin, Camera, FileText, Phone } from "@tamagui/lucide-icons"
import { MotiView } from "moti"

import { getUserData, addOfflineReport, getOfflineReports, removeOfflineReport } from "../../lib/storage"
import { apiSubmitReport } from "../../lib/api"
import { useAuth } from '../../context/AuthContext'
import * as Network from 'expo-network'
import { API_URL } from '../../lib/config'

// visual tokens (match screenshot)
const HEADER_RED = "#D62828"
const SOFT_GREY = "#F6F7F8"
const CARD_BORDER = "rgba(0,0,0,0.04)"
const WINDOW = Dimensions.get("window")

export default function ReportHazard() {
  const router = useRouter()
  const { token } = useAuth()

  // form state
  const [category, setCategory] = useState<string>("")
  const [address, setAddress] = useState<string>("")
  const [barangay, setBarangay] = useState<string>("")
  const [useGPS, setUseGPS] = useState(false)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [description, setDescription] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)


  // user
  const [user, setUser] = useState<any>(null)

  // categories state
  const [categories, setCategories] = useState<any[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoryInput, setCategoryInput] = useState<string>("")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)

  // Sync offline reports when online
  const syncOfflineReports = useCallback(async () => {
    try {
      const networkState = await Network.getNetworkStateAsync()
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        return // Not online
      }

      const offlineReports = await getOfflineReports()
      if (offlineReports.length === 0) return

      for (const report of offlineReports) {
        if (!report.synced) {
          try {
            const res = await apiSubmitReport(report)
            if (res?.status === "success") {
              await removeOfflineReport(report.offlineId)
              console.log('Synced offline report:', report.offlineId)
            }
          } catch (error) {
            console.error('Failed to sync report:', report.offlineId, error)
          }
        }
      }
    } catch (error) {
      console.error('Error syncing offline reports:', error)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const u = await getUserData()
        setUser(u)
      } catch (e) {
        // ignore
      }
    })()

    // Fetch categories
    ;(async () => {
      try {
        setCategoriesLoading(true)
        console.log('Token for categories:', token)
        if (token) {
        console.log('Fetching categories...')
        const response = await fetch(`${API_URL}/get_categories.php`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          console.log('Response status:', response.status)
          const data = await response.json()
          console.log('Categories data:', data)
          if (data.status === 'success') {
            console.log('Setting categories:', data.categories.length)
            setCategories(data.categories)
          } else {
            console.warn('API returned error:', data.message)
            // Fallback categories if API fails
            setCategories([
              { id: 1, name: 'Undermined Electrical Wiring', description: 'Exposed, unstable, or unsafe electrical lines that may cause short circuits or fire', color: '#FACC15' },
              { id: 2, name: 'LPG Leak', description: 'Leaking or improperly handled LPG tanks that may cause fire or explosion', color: '#FB923C' },
              { id: 3, name: 'Blocked Fire Exit', description: 'Fire exits obstructed by furniture, locks, or debris', color: '#A78BFA' },
              { id: 4, name: 'Rubbish/Grass Fire', description: 'Piles of combustible materials such as paper, plastics, or waste stored unsafely', color: '#F87171' },
              { id: 5, name: 'Damaged Electrical Post / Transformer', description: 'Leaning or damaged electrical posts, exposed wires, or malfunctioning transformers', color: '#38BDF8' },
              { id: 6, name: 'Defective Fire Safety Equipment', description: 'Fire extinguishers, alarms, or detectors missing or not functional', color: '#34D399' },
              { id: 7, name: 'Other Fire-Related Hazard', description: 'Any other safety issue that poses a fire risk not listed above', color: '#9CA3AF' },
            ])
          }
        } else {
          console.warn('No token available for categories fetch')
          // Fallback categories if no token
          setCategories([
          { id: 1, name: 'Undermined Electrical Wiring', description: 'Exposed, unstable, or unsafe electrical lines that may cause short circuits or fire', color: '#FACC15' },
              { id: 2, name: 'LPG Leak', description: 'Leaking or improperly handled LPG tanks that may cause fire or explosion', color: '#FB923C' },
              { id: 3, name: 'Blocked Fire Exit', description: 'Fire exits obstructed by furniture, locks, or debris', color: '#A78BFA' },
              { id: 4, name: 'Flammable Clutter', description: 'Piles of combustible materials such as paper, plastics, or waste stored unsafely', color: '#F87171' },
              { id: 5, name: 'Damaged Electrical Post / Transformer', description: 'Leaning or damaged electrical posts, exposed wires, or malfunctioning transformers', color: '#38BDF8' },
              { id: 6, name: 'Defective Fire Safety Equipment', description: 'Fire extinguishers, alarms, or detectors missing or not functional', color: '#34D399' },
              { id: 7, name: 'Other Fire-Related Hazard', description: 'Any other safety issue that poses a fire risk not listed above', color: '#9CA3AF' },
          ])

        }
      } catch (e) {
        console.warn('Failed to fetch categories', e)
        // Fallback categories if fetch fails
        setCategories([
        { id: 1, name: 'Undermined Electrical Wiring', description: 'Exposed, unstable, or unsafe electrical lines that may cause short circuits or fire', color: '#FACC15' },
              { id: 2, name: 'LPG Leak', description: 'Leaking or improperly handled LPG tanks that may cause fire or explosion', color: '#FB923C' },
              { id: 3, name: 'Blocked Fire Exit', description: 'Fire exits obstructed by furniture, locks, or debris', color: '#A78BFA' },
              { id: 4, name: 'Flammable Clutter', description: 'Piles of combustible materials such as paper, plastics, or waste stored unsafely', color: '#F87171' },
              { id: 5, name: 'Damaged Electrical Post / Transformer', description: 'Leaning or damaged electrical posts, exposed wires, or malfunctioning transformers', color: '#38BDF8' },
              { id: 6, name: 'Defective Fire Safety Equipment', description: 'Fire extinguishers, alarms, or detectors missing or not functional', color: '#34D399' },
              { id: 7, name: 'Other Fire-Related Hazard', description: 'Any other safety issue that poses a fire risk not listed above', color: '#9CA3AF' },
        ])

      } finally {
        setCategoriesLoading(false)
      }
    })()

    // Sync offline reports on mount
    syncOfflineReports()
  }, [token, syncOfflineReports])



  // Image picker from gallery
  const pickImage = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted) {
        Alert.alert("Permissions required", "Allow photo access to attach images.")
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      })
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages((p) => [...p, result.assets[0].uri])
      }
    } catch (err) {
      console.warn("pickImage error", err)
    }
  }, [])

  // Take photo with camera
  const takePhoto = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync()
      if (!perm.granted) {
        Alert.alert("Permissions required", "Allow camera access to take photos.")
        return
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      })
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages((p) => [...p, result.assets[0].uri])
      }
    } catch (err) {
      console.warn("takePhoto error", err)
    }
  }, [])

  // Take current GPS
  const fillGPS = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Location permission", "Allow location to use GPS autofill.")
        return
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      setLatitude(pos.coords.latitude)
      setLongitude(pos.coords.longitude)
      setUseGPS(true)
      // optional: reverse geocode to fill address
    } catch (err) {
      console.warn("GPS error", err)
      Alert.alert("GPS error", "Unable to get current location.")
    }
  }, [])

  const validate = () => {
    if (!selectedCategory) {
      Alert.alert("Missing field", "Please select a hazard category.")
      return false
    }
    if (selectedCategory.name === 'Other Fire-Related Hazard' && !categoryInput.trim()) {
      Alert.alert("Missing field", "Please type your specific fire hazard.")
      return false
    }
    if (!address.trim() || !barangay.trim()) {
      if (!latitude || !longitude) {
        Alert.alert("Missing location", "Please fill in address and barangay or use GPS.")
        return false
      }
    }
    if (!description) {
      Alert.alert("Missing description", "Please describe the hazard.")
      return false
    }
    return true
  }

const handleSubmit = useCallback(async () => {
  if (!validate()) return
  setSubmitting(true)
  try {
    if (!token) {
      Alert.alert("Error", "Please login to submit a report")
      setSubmitting(false)
      return
    }

    // Determine category ID and name
    let categoryId: number
    let categoryName: string

    if (selectedCategory.name === 'Other Fire-Related Hazard') {
      categoryId = selectedCategory.id // Should be 9 for "Other Fire-Related Hazard"
      categoryName = categoryInput.trim()
    } else {
      categoryId = selectedCategory.id
      categoryName = selectedCategory.name
    }

    // Convert image to base64 if exists
    let imageData: string | null = null
    if (images.length > 0) {
      try {
        const response = await fetch(images[0])
        const blob = await response.blob()
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
        imageData = base64
      } catch (e) {
        console.warn("Failed to convert image to base64", e)
      }
    }

    // Combine address fields into full address
    const fullAddress = address.trim() ?
      `${address.trim()}, ${barangay.trim()}, Tagudin, Ilocos Sur` :
      `${barangay.trim()}, Tagudin, Ilocos Sur`

    const data = {
      token,
      category_id: categoryId,
      title: categoryName.substring(0, 50), // Use category name as title
      description,
      image: imageData,
      location_address: fullAddress,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      phone: user?.phone,
    }

    const res = await apiSubmitReport(data)
    if (res?.status === "success") {
      // show overlay success
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        router.push("/")
      }, 2000)
      // Try to sync offline reports after successful submission
      syncOfflineReports()
    } else {
      // Check if it's a network error
      const networkState = await Network.getNetworkStateAsync()
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        // Save to offline storage
        await addOfflineReport(data)
        Alert.alert("Saved Offline", "Report saved locally. It will be submitted when you're back online.")
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          router.push("/")
        }, 2000)
      } else {
        Alert.alert("Error", res?.message || "Submission failed")
      }
    }
  } catch (err) {
    console.error("submit error", err)
    // Check network status
    const networkState = await Network.getNetworkStateAsync()
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      // Save to offline storage
      const data = {
        token,
        category_id: selectedCategory?.id,
        title: selectedCategory?.name?.substring(0, 50),
        description,
        image: null, // Can't save image offline easily
        location_address: address.trim() ? `${address.trim()}, ${barangay.trim()}, Tagudin, Ilocos Sur` : `${barangay.trim()}, Tagudin, Ilocos Sur`,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        phone: user?.phone,
      }
      await addOfflineReport(data)
      Alert.alert("Saved Offline", "Report saved locally. It will be submitted when you're back online.")
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        router.push("/")
      }, 2000)
    } else {
      Alert.alert("Submission failed", "An error occurred while submitting.")
    }
  } finally {
    setSubmitting(false)
  }
  }, [selectedCategory, categoryInput, categories, address, barangay, latitude, longitude, description, images, router, user, token])

  useEffect(() => {
    ;(async () => {
      try {
        const u = await getUserData()
        setUser(u)
      } catch (e) {
        // ignore
      }
    })()

    // Fetch categories
    ;(async () => {
      try {
        setCategoriesLoading(true)
        console.log('Token for categories:', token)
        if (token) {
        console.log('Fetching categories...')
        const response = await fetch(`${API_URL}/get_categories.php`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          console.log('Response status:', response.status)
          const data = await response.json()
          console.log('Categories data:', data)
          if (data.status === 'success') {
            console.log('Setting categories:', data.categories.length)
            setCategories(data.categories)
          } else {
            console.warn('API returned error:', data.message)
            // Fallback categories if API fails
            setCategories([
            { id: 1, name: 'Undermined Electrical Wiring', description: 'Exposed, unstable, or unsafe electrical lines that may cause short circuits or fire', color: '#FACC15' },
              { id: 2, name: 'LPG Leak', description: 'Leaking or improperly handled LPG tanks that may cause fire or explosion', color: '#FB923C' },
              { id: 3, name: 'Blocked Fire Exit', description: 'Fire exits obstructed by furniture, locks, or debris', color: '#A78BFA' },
              { id: 4, name: 'Flammable Clutter', description: 'Piles of combustible materials such as paper, plastics, or waste stored unsafely', color: '#F87171' },
              { id: 5, name: 'Damaged Electrical Post / Transformer', description: 'Leaning or damaged electrical posts, exposed wires, or malfunctioning transformers', color: '#38BDF8' },
              { id: 6, name: 'Defective Fire Safety Equipment', description: 'Fire extinguishers, alarms, or detectors missing or not functional', color: '#34D399' },
              { id: 7, name: 'Other Fire-Related Hazard', description: 'Any other safety issue that poses a fire risk not listed above', color: '#9CA3AF' },
            ])

          }
        } else {
          console.warn('No token available for categories fetch')
          // Fallback categories if no token
          setCategories([
    { id: 1, name: 'Undermined Electrical Wiring', description: 'Exposed, unstable, or unsafe electrical lines that may cause short circuits or fire', color: '#FACC15' },
              { id: 2, name: 'LPG Leak', description: 'Leaking or improperly handled LPG tanks that may cause fire or explosion', color: '#FB923C' },
              { id: 3, name: 'Blocked Fire Exit', description: 'Fire exits obstructed by furniture, locks, or debris', color: '#A78BFA' },
              { id: 4, name: 'Rubbish/Grass Fire', description: 'Piles of combustible materials such as paper, plastics, or waste stored unsafely', color: '#F87171' },
              { id: 5, name: 'Damaged Electrical Post / Transformer', description: 'Leaning or damaged electrical posts, exposed wires, or malfunctioning transformers', color: '#38BDF8' },
              { id: 6, name: 'Defective Fire Safety Equipment', description: 'Fire extinguishers, alarms, or detectors missing or not functional', color: '#34D399' },
              { id: 7, name: 'Other Fire-Related Hazard', description: 'Any other safety issue that poses a fire risk not listed above', color: '#9CA3AF' },
          ])

        }
      } catch (e) {
        console.warn('Failed to fetch categories', e)
        // Fallback categories if fetch fails
        setCategories([
     { id: 1, name: 'Undermined Electrical Wiring', description: 'Exposed, unstable, or unsafe electrical lines that may cause short circuits or fire', color: '#FACC15' },
              { id: 2, name: 'LPG Leak', description: 'Leaking or improperly handled LPG tanks that may cause fire or explosion', color: '#FB923C' },
              { id: 3, name: 'Blocked Fire Exit', description: 'Fire exits obstructed by furniture, locks, or debris', color: '#A78BFA' },
              { id: 4, name: 'Rubbish/Grass Fire', description: 'Piles of combustible materials such as paper, plastics, or waste stored unsafely', color: '#F87171' },
              { id: 5, name: 'Damaged Electrical Post / Transformer', description: 'Leaning or damaged electrical posts, exposed wires, or malfunctioning transformers', color: '#38BDF8' },
              { id: 6, name: 'Defective Fire Safety Equipment', description: 'Fire extinguishers, alarms, or detectors missing or not functional', color: '#34D399' },
              { id: 7, name: 'Other Fire-Related Hazard', description: 'Any other safety issue that poses a fire risk not listed above', color: '#9CA3AF' },
        ])

      } finally {
        setCategoriesLoading(false)
      }
    })()

    // Sync offline reports on mount
    syncOfflineReports()
  }, [token, syncOfflineReports])

  // small helper for responsive widths
  const cardWidth = Math.min(760, WINDOW.width - 36)

  return (
    <YStack flex={1} backgroundColor="#fff">
      {/* Header: white with red title and back arrow per screenshot */}
      <View borderBottomWidth={1} borderColor={CARD_BORDER} backgroundColor="#fff" paddingVertical={12} paddingHorizontal={14} marginTop={30}>
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap={10}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text fontSize={20}>←</Text>
            </TouchableOpacity>
            <YStack>
              <Text fontSize={18} fontWeight="700" color={HEADER_RED}>
                Report Fire Hazard
              </Text>
              <Text fontSize={13} color="#777">Help keep our community safe</Text>
            </YStack>
          </XStack>

          {/* <XStack alignItems="center" gap={8}>
            <TouchableOpacity onPress={fillGPS}>
              <Text fontSize={13} color={HEADER_RED} fontWeight="700">Use GPS</Text>
            </TouchableOpacity>
          </XStack> */}
        </XStack>
      </View>

      {/* Scrollable content (including submit button at bottom) */}
      <ScrollView style={{ flex: 1 }}>
        <YStack alignItems="center">
          <YStack width={cardWidth} paddingHorizontal={0}>
            <YStack padding={14} gap={14}>
              {/* Category card */}
              <Card borderRadius={12} padding={12} borderWidth={1} borderColor={CARD_BORDER}>
                <XStack alignItems="center" gap={10}>
                  <Flame size={18} color={HEADER_RED} />
                  <Text fontWeight="700">Hazard Category *</Text>
                </XStack>

                <YStack marginTop={10} gap={8}>
                  {/* Category dropdown */}
                  <TouchableOpacity
                    onPress={() => !categoriesLoading && setShowCategoryDropdown(true)}
                    activeOpacity={0.8}
                    disabled={categoriesLoading}
                    style={{
                      borderRadius: 8,
                      height: 44,
                      backgroundColor: SOFT_GREY,
                      paddingHorizontal: 12,
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.04)',
                      opacity: categoriesLoading ? 0.6 : 1,
                    }}
                  >
                    <XStack justifyContent="space-between" alignItems="center">
                      <Text color={selectedCategory ? "#333" : "#999"} fontSize={14}>
                        {categoriesLoading ? "Loading categories..." : (selectedCategory ? selectedCategory.name : "Select hazard category")}
                      </Text>
                      <Text fontSize={14} color="#666">{categoriesLoading ? "⋯" : "▼"}</Text>
                    </XStack>
                  </TouchableOpacity>

                  {/* Custom category input - only show when "Other Fire-Related Hazard" is selected */}
                  {selectedCategory?.name === 'Other Fire-Related Hazard' && (
                    <Input
                      value={categoryInput}
                      onChangeText={setCategoryInput}
                      placeholder="Type your specific fire hazard (e.g., overloaded extension cord)"
                      borderRadius={8}
                      height={44}
                      backgroundColor={SOFT_GREY}
                      paddingHorizontal={12}
                      fontSize={14}
                      autoFocus={selectedCategory?.name === 'Other Fire-Related Hazard'}
                    />
                  )}
                </YStack>
              </Card>

              {/* Location Card */}
              <Card borderRadius={12} padding={12} borderWidth={1} borderColor={CARD_BORDER}>
                <XStack alignItems="center" gap={10}>
                  <MapPin size={18} color="#D35454" />
                  <Text fontWeight="700">Location *</Text>
                </XStack>

                <YStack marginTop={10} gap={12}>
                  {/* Street Address */}
                  <Input
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Street address (e.g., 123 Main St)"
                    borderRadius={8}
                    height={44}
                    backgroundColor={SOFT_GREY}
                    paddingHorizontal={12}
                    fontSize={14}
                  />

                  {/* Barangay */}
                  <Input
                    value={barangay}
                    onChangeText={setBarangay}
                    placeholder="Barangay (e.g., Poblacion)"
                    borderRadius={8}
                    height={44}
                    backgroundColor={SOFT_GREY}
                    paddingHorizontal={12}
                    fontSize={14}
                  />

                  {/* Municipality and Province (Fixed for Tagudin) */}
                  <View
                    backgroundColor={SOFT_GREY}
                    borderRadius={8}
                    height={44}
                    paddingHorizontal={12}
                    justifyContent="center"
                  >
                    <Text fontSize={14} color="#666">
                      Tagudin, Ilocos Sur
                    </Text>
                  </View>

                  <XStack justifyContent="space-between" alignItems="center" gap={8}>
                    <Text fontSize={12} color="#4A90E2" flex={1}>
                      GPS helps BFP locate the hazard quickly
                    </Text>
                    <Button
                      onPress={async () => {
                        await fillGPS()
                      }}
                      borderRadius={8}
                      backgroundColor="#fff"
                      borderWidth={1}
                      borderColor="#E0E0E0"
                      height={36}
                      paddingHorizontal={12}
                    >
                      <XStack alignItems="center" gap={6}>
                        <MapPin size={14} color={HEADER_RED} />
                        <Text color={HEADER_RED} fontWeight="700" fontSize={12}>Use GPS</Text>
                      </XStack>
                    </Button>
                  </XStack>

                  {(latitude || longitude) && (
                    <Text fontSize={11} color="#666" textAlign="center">
                      GPS: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                    </Text>
                  )}
                </YStack>
              </Card>

              {/* Photo Evidence */}
              <Card borderRadius={12} padding={12} borderWidth={1} borderColor={CARD_BORDER}>
                <XStack alignItems="center" gap={10}>
                  <Camera size={18} color="#D35454" />
                  <Text fontWeight="700">Photo Evidence</Text>
                </XStack>

                <Text fontSize={12} color="#777" marginTop={8}>
                  Photos help BFP verify and prioritize your report
                </Text>

                <XStack gap={8}>
                  <TouchableOpacity style={styles.photoDrop} onPress={pickImage} activeOpacity={0.8}>
                    <XStack alignItems="center" gap={10}>
                      <FileText size={18} color="#777" />
                      <Text color="#777">Choose from Gallery</Text>
                    </XStack>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoDrop} onPress={takePhoto} activeOpacity={0.8}>
                    <XStack alignItems="center" gap={10}>
                      <Camera size={18} color="#777" />
                      <Text color="#777">Take Photo</Text>
                    </XStack>
                  </TouchableOpacity>
                </XStack>

                <XStack gap={8} marginTop={8} flexWrap="wrap">
                  {images.map((i, idx) => (
                    <RNImage key={idx} source={{ uri: i }} style={styles.thumb} />
                  ))}
                </XStack>
              </Card>

              {/* Description */}
              <Card borderRadius={12} padding={12} borderWidth={1} borderColor={CARD_BORDER}>
                <XStack alignItems="center" gap={10}>
                  <FileText size={18} color="#D35454" />
                  <Text fontWeight="700">Description *</Text>
                </XStack>

                <Input
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe the hazard (what, when, who, how)"
                  borderRadius={8}
                  backgroundColor={SOFT_GREY}
                  height={120}
                  multiline
                  padding={12}
                  marginTop={10}
                />

                <Text fontSize={12} color="#4A90E2" marginTop={8}>
                  • Be specific to help BFP assess urgency
                </Text>
              </Card>

              {/* Contact Info */}
              <Card borderRadius={12} padding={12} borderWidth={1} borderColor="#E6F0FB">
                <Text fontWeight="700">Contact Information</Text>

                <View backgroundColor="#EAF4FF" borderRadius={8} padding={12} marginTop={10}>
                  <Text color="#1B6FB5" fontWeight="700">{user?.fullname || "Your name"}</Text>
                  <Text color="#1B6FB5" marginTop={6}>{user?.phone || "+63 912 345 6789"}</Text>
                  <Text color="#1B6FB5" marginTop={6}>{user?.email || "you@example.com"}</Text>
                </View>

                <Text fontSize={12} color="#777" marginTop={8}>• BFP may call to verify your report</Text>
              </Card>

              {/* Emergency block */}
              <Card borderRadius={12} padding={16} borderWidth={1} borderColor="#F5D6D6" backgroundColor="#FDEDED">
                <YStack alignItems="center" gap={8}>
                  <View width={56} height={56} borderRadius={28} backgroundColor="#FDEDED" alignItems="center" justifyContent="center" borderWidth={1} borderColor="#F5D6D6">
                    <Flame size={26} color={HEADER_RED} />
                  </View>

                  <Text fontWeight="700" fontSize={16} color={HEADER_RED}>Emergency Situation?</Text>
                  <Text textAlign="center" color="#777">If this is an active fire or immediate danger, call emergency services directly.</Text>

                  <Button
                    onPress={() => {
                      const phoneUrl = Platform.OS === "ios" ? "telprompt:0999-750-8975" : "tel:0999-750-8975"
                      Linking.openURL(phoneUrl).catch(() => {
                        Alert.alert("Call failed", "Unable to open phone app.")
                      })
                    }}
                    borderRadius={8}
                    backgroundColor={HEADER_RED}
                    paddingHorizontal={18}
                    paddingVertical={10}
                    marginTop={8}
                  >
                    <XStack alignItems="center" gap={8}>
                      <Phone size={14} color="#fff" />
                      <Text color="#fff" fontWeight="700">Call Emergency: 0999-750-8975</Text>
                    </XStack>
                  </Button>
                </YStack>
              </Card>

              {/* Submit button (part of the scroll; moves with page) */}
              <View marginTop={6} marginBottom={36}>
                <Button
                  onPress={handleSubmit}
                  borderRadius={10}
                  height={52}
                  backgroundColor={HEADER_RED}
                  disabled={submitting}
                >
                  <Text fontSize={16} color="#fff" fontWeight="700">Submit Report</Text>
                </Button>
              </View>
            </YStack>
          </YStack>
        </YStack>
        {showSuccess && (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 300 }}
              style={styles.overlay}
            >
              <View style={styles.successBox}>
                <Flame size={40} color="#28a745" />
                <Text fontSize={18} fontWeight="700" color="#28a745" marginTop={10}>
                  Report Submitted!
                </Text>
                <Text color="#555" marginTop={4}>
                  Thank you for helping keep your community safe.
                </Text>
              </View>
            </MotiView>
          )}

      </ScrollView>

      {/* Category Dropdown Sheet */}
      <Sheet
        modal
        open={showCategoryDropdown}
        onOpenChange={setShowCategoryDropdown}
        snapPoints={[80]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$5" gap="$5" backgroundColor="$background">
          <Sheet.Handle backgroundColor="$gray8" />
          <YStack gap="$4">
            <Text fontSize="$6" fontWeight="bold" textAlign="center">
              Select Hazard Category
            </Text>
            <ScrollView>
              <YStack gap="$2">
                {categoriesLoading ? (
                  <YStack alignItems="center" paddingVertical={40}>
                    <Text fontSize={16} color="#666">Loading categories...</Text>
                  </YStack>
                ) : categories.length === 0 ? (
                  <YStack alignItems="center" paddingVertical={40}>
                    <Text fontSize={16} color="#666">No categories available</Text>
                  </YStack>
                ) : (
                  categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => {
                        setSelectedCategory(category)
                        if (category.name === 'Other Fire-Related Hazard') {
                          setCategoryInput('')
                        } else {
                          setCategoryInput(category.name)
                        }
                        setShowCategoryDropdown(false)
                      }}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        backgroundColor: selectedCategory?.id === category.id ? 'rgba(214,40,40,0.1)' : SOFT_GREY,
                        borderWidth: selectedCategory?.id === category.id ? 1 : 0,
                        borderColor: selectedCategory?.id === category.id ? HEADER_RED : 'transparent',
                      }}
                    >
                      <Text
                        fontSize={16}
                        color={selectedCategory?.id === category.id ? HEADER_RED : "#333"}
                        fontWeight={selectedCategory?.id === category.id ? "700" : "500"}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </YStack>
            </ScrollView>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  )
}

const styles = StyleSheet.create({
  catChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    backgroundColor: "#fff",
  },
  photoDrop: {
    marginTop: 12,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: 8,
  },
  overlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.3)",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
},
successBox: {
  backgroundColor: "#fff",
  borderRadius: 16,
  paddingVertical: 24,
  paddingHorizontal: 28,
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 8,
  elevation: 5,
},

})
