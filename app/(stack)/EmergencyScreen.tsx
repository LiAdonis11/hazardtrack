import React, { useState, useEffect } from "react"
import { Linking, ScrollView, TouchableOpacity, Alert, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { YStack, XStack, Text, Card, Button, View, Input } from "tamagui"
import { ArrowLeft, MapPin, AlertTriangle, Phone, MessageSquare, Flame, Clock } from "@tamagui/lucide-icons"
import { useRouter } from "expo-router"
import { StatusBar } from 'expo-status-bar'
import * as Location from 'expo-location'

const HEADER_RED = "#D62828"

const emergencyContacts = [
  {
    title: "Office of the Mayor",
    number: "0949-996-9094",
    description: "Municipal executive office",
    type: "mayor",
  },
  {
    title: "MDRRMO Tagudin",
    number: "0939-400-8004",
    description: "Municipal Disaster Risk Reduction and Management Office",
    type: "disaster",
  },
  {
    title: "PNP Tagudin",
    number: "0998-967-9261",
    description: "Philippine National Police - Tagudin Station",
    type: "police",
  },
  {
    title: "BFP Tagudin",
    number: "0999-750-8975",
    description: "Bureau of Fire Protection - Tagudin Station",
    type: "bfp",
  },
  {
    title: "ISECO Sta. Cruz",
    number: "0999-995-5943",
    description: "Ilocos Sur Electric Cooperative",
    type: "electric",
  },
]

const quickMessages = [
  {
    title: "Active Fire Emergency",
    message:
      "EMERGENCY: Active fire at [YOUR LOCATION]. Need immediate fire truck dispatch. People may be in danger.",
    recipient: "0999-750-8975",
  },
  {
    title: "Gas Leak Emergency",
    message:
      "EMERGENCY: Gas leak detected at [YOUR LOCATION]. Area being evacuated. Need immediate response.",
    recipient: "0999-750-8975",
  },
  {
    title: "Electrical Fire",
    message:
      "EMERGENCY: Electrical fire at [YOUR LOCATION]. Power disconnected. Need fire department response.",
    recipient: "0999-750-8975",
  },
]

export default function EmergencyScreen() {
  const router = useRouter()
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 17.3500,
    longitude: 120.4500,
    address: "Barangay Sawat, Tagudin, Ilocos Sur"
  })
  const [locationLoading, setLocationLoading] = useState(true)
  const [customMessage, setCustomMessage] = useState('')

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('Location Permission', 'Location permission is required to show your current location for emergency services.')
          setLocationLoading(false)
          return
        }

        // Add timeout for location request
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Location timeout')), 10000)
        )

        const positionPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        })

        const position = await Promise.race([positionPromise, timeoutPromise]) as any

        const { latitude, longitude } = position.coords

        // Try to reverse geocode for address with timeout
        try {
          const geocodeTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Geocode timeout')), 5000)
          )

          const geocodePromise = Location.reverseGeocodeAsync({
            latitude,
            longitude
          })

          const address = await Promise.race([geocodePromise, geocodeTimeout]) as any

          let locationString = "Current Location"
          if (address && address.length > 0) {
            const addr = address[0]
            const parts = []
            if (addr.street) parts.push(addr.street)
            if (addr.city) parts.push(addr.city)
            if (addr.region) parts.push(addr.region)
            locationString = parts.join(', ') || "Current Location"
          }

          setCurrentLocation({
            latitude,
            longitude,
            address: locationString
          })
        } catch (geocodeError) {
          // If reverse geocoding fails, just use coordinates
          setCurrentLocation({
            latitude,
            longitude,
            address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
          })
        }
      } catch (error: any) {
        console.warn('Location error:', error)
        if (error.message === 'Location timeout') {
          Alert.alert('Location Timeout', 'Unable to get your location within 10 seconds. Using default location.')
        } else {
          Alert.alert('Location Error', 'Unable to get your current location. Using default location.')
        }
      } finally {
        setLocationLoading(false)
      }
    }

    getCurrentLocation()
  }, [])

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`)
  }

  const handleSendMessage = (message: string, recipient?: string) => {
    const encoded = encodeURIComponent(message)
    const url = recipient ? `sms:${recipient}?body=${encoded}` : `sms:?body=${encoded}`
    Linking.openURL(url)
  }

  return (
    <>
      <StatusBar backgroundColor={HEADER_RED} style="light" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF4EE" }}>
      {/* Header */}
       <View backgroundColor={HEADER_RED} paddingTop={18} paddingBottom={16} paddingHorizontal={18} borderBottomLeftRadius={14} borderBottomRightRadius={14}>
        <XStack alignItems="center">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <YStack marginLeft={12}>
            <Text color="#fff" fontSize={20} fontWeight="800">
              Emergency Actions
            </Text>
            <Text color="rgba(255,255,255,0.9)" fontSize={13}>
              Get immediate help when you need it
            </Text>
          </YStack>
        </XStack>
      </View>

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <YStack gap={18}>
          {/* Location */}
          <Card
            backgroundColor="#FFEDEE"
            borderRadius={12}
            borderWidth={1}
            borderColor="#F5B9B8"
            padding={16}
          >
            <XStack alignItems="center" gap={10}>
              <View
                width={40}
                height={40}
                borderRadius={10}
                backgroundColor="#FBD5D5"
                alignItems="center"
                justifyContent="center"
              >
                <MapPin size={20} color="#C62828" />
              </View>
              <YStack>
                <Text color="#C62828" fontWeight="700">
                  Your Current Location
                </Text>
                <Text color="#222" fontSize={13}>
                  {locationLoading ? "Getting location..." : currentLocation.address}
                </Text>
                <Text color="#666" fontSize={12}>
                  • GPS: {currentLocation.latitude.toFixed(4)}° N, {currentLocation.longitude.toFixed(4)}° E
                </Text>
              </YStack>
            </XStack>
          </Card>

          {/* Emergency Guidelines */}
          <Card
            backgroundColor="#FFF5E6"
            borderRadius={12}
            borderWidth={1}
            borderColor="#FFD59E"
            padding={16}
          >
            <XStack gap={12} alignItems="flex-start">
              <View
                width={42}
                height={42}
                borderRadius={10}
                backgroundColor="#FFE3B0"
                alignItems="center"
                justifyContent="center"
              >
                <AlertTriangle size={22} color="#FF9E1C" />
              </View>
              <YStack gap={8}>
                <Text color="#FF9E1C" fontWeight="700" fontSize={15}>
                  Emergency Guidelines
                </Text>
                {[
                  "For active fires, call 0999-750-8975 immediately",
                  "Evacuate the area if safe to do so",
                  "Do not attempt to fight large fires yourself",
                  "Stay low to avoid smoke inhalation",
                  "Have a clear escape route",
                ].map((tip, i) => (
                  <XStack key={i} gap={6} alignItems="flex-start">
                    <View width={6} height={6} borderRadius={3} backgroundColor="#FF9E1C" marginTop={6} />
                    <Text color="#333" fontSize={13} flex={1}>
                      {tip}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </XStack>
          </Card>

          {/* Emergency Contacts */}
          <Card backgroundColor="#fff" borderRadius={12} padding={16} borderWidth={1} borderColor="#E4E4E4">
            <XStack alignItems="center" gap={8} marginBottom={10}>
              <Phone size={18} color="#C62828" />
              <Text fontWeight="700" fontSize={16}>
                Emergency Contacts
              </Text>
            </XStack>
            <YStack gap={12}>
              {emergencyContacts.map((c, i) => (
                <Card
                  key={i}
                  borderRadius={10}
                  borderWidth={1}
                  borderColor="#F0F0F0"
                  padding={12}
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack flex={1}>
                      <Text fontWeight="700" color="#222">
                        {c.title}
                      </Text>
                      <Text fontSize={12} color="#777">
                        {c.description}
                      </Text>
                    </YStack>
                    <Button
                      onPress={() => handleCall(c.number)}
                      backgroundColor={c.type === "emergency" ? "#D62828" : "#E53935"}
                      borderRadius={10}
                      paddingHorizontal={14}
                      paddingVertical={6}
                    >
                      <Text color="#fff" fontWeight="700">
                        {c.number}
                      </Text>
                    </Button>
                  </XStack>
                </Card>
              ))}
            </YStack>
          </Card>

          {/* Quick Emergency Messages */}
          <Card backgroundColor="#fff" borderRadius={12} padding={16} borderWidth={1} borderColor="#E4E4E4">
            <XStack alignItems="center" gap={8} marginBottom={10}>
              <MessageSquare size={18} color="#FF9E1C" />
              <Text fontWeight="700" fontSize={16}>
                Quick Emergency Messages
              </Text>
            </XStack>
            <Text fontSize={12} color="#777" marginBottom={10}>
              Pre-written messages for rapid emergency communication
            </Text>
            <YStack gap={10}>
              {quickMessages.map((m, i) => (
                <Card
                  key={i}
                  borderRadius={10}
                  borderWidth={1}
                  borderColor="#FFE0B2"
                  backgroundColor="#FFF9F0"
                  padding={12}
                >
                  <Text fontWeight="700" color="#C62828" fontSize={14}>
                    {m.title}
                  </Text>
                  <Text fontSize={12} color="#444" marginVertical={6}>
                    {m.message}
                  </Text>
                  <Button
                    borderRadius={8}
                    backgroundColor="#FF9E1C"
                    onPress={() => handleSendMessage(m.message, m.recipient)}
                  >
                    <Text color="#fff" fontWeight="700">
                      Send Message
                    </Text>
                  </Button>
                </Card>
              ))}

              <Card
                borderRadius={10}
                borderWidth={1}
                borderColor="#FFE0B2"
                backgroundColor="#FFF9F0"
                padding={16}
              >
                <XStack alignItems="center" gap={8} marginBottom={10}>
                  <MessageSquare size={18} color="#FF9E1C" />
                  <Text fontWeight="700" fontSize={16} color="#C62828">
                    Send Custom Emergency Message
                  </Text>
                </XStack>
                <Text fontSize={12} color="#777" marginBottom={12}>
                  Compose your own emergency message to send directly to BFP Tagudin
                </Text>
                <Input
                  value={customMessage}
                  onChangeText={setCustomMessage}
                  placeholder="Type your emergency message here..."
                  borderRadius={8}
                  backgroundColor="#F8F9FA"
                  borderWidth={1}
                  borderColor="#E0E0E0"
                  height={80}
                  multiline
                  padding={12}
                  marginBottom={12}
                  fontSize={14}
                />
                <Button
                  borderRadius={8}
                  backgroundColor="#FF9E1C"
                  onPress={() => {
                    if (!customMessage.trim()) {
                      Alert.alert('Error', 'Please enter a message')
                      return
                    }
                    handleSendMessage(customMessage, "0999-750-8975")
                    setCustomMessage('')
                  }}
                  disabled={!customMessage.trim()}
                >
                  <XStack alignItems="center" gap={8}>
                    <MessageSquare size={16} color="#fff" />
                    <Text color="#fff" fontWeight="700">
                      Send to BFP Tagudin
                    </Text>
                  </XStack>
                </Button>
              </Card>

              <Card
                borderRadius={10}
                borderWidth={1}
                borderColor="#FFE0B2"
                backgroundColor="#FFF9F0"
                padding={12}
              >
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
              </Card>

            </YStack>
          </Card>



          {/* Fire Safety Reminders */}
          <Card
            backgroundColor="#FFF8E1"
            borderRadius={12}
            padding={16}
            borderWidth={1}
            borderColor="#FFE082"
          >
            <XStack alignItems="center" gap={8} marginBottom={6}>
              <Flame size={18} color="#FB8C00" />
              <Text fontWeight="700" fontSize={16}>
                Fire Safety Reminders
              </Text>
            </XStack>
            <Text fontSize={13} color="#444" marginBottom={6}>
              Before Emergency Services Arrive:
            </Text>
            <YStack gap={4}>
              {[
                "Alert others in the area",
                "Turn off gas/electricity if safely possible",
                "Gather important documents if time permits",
                "Move to a safe distance from the hazard",
              ].map((tip, i) => (
                <XStack key={i} alignItems="flex-start" gap={6}>
                  <View width={6} height={6} borderRadius={3} backgroundColor="#FB8C00" marginTop={6} />
                  <Text color="#6b4f00" fontSize={13} flex={1}>
                    {tip}
                  </Text>
                </XStack>
              ))}
            </YStack>
          </Card>

          {/* Last Updated */}
          {/* <Card
            borderRadius={12}
            borderWidth={1}
            borderColor="#E4E4E4"
            backgroundColor="#fff"
            padding={10}
          >
            <XStack alignItems="center" gap={6}>
              <Clock size={14} color="#777" />
              <Text fontSize={12} color="#777">
                Emergency contacts last updated: October 2024
              </Text>
            </XStack>
          </Card> */}
        </YStack>
      </ScrollView>
    </SafeAreaView>
    </>
  )
}
