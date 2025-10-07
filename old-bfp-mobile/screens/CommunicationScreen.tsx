import { useState } from 'react'
import { YStack, XStack, Text, Card, Input, Button } from 'tamagui'
import { TouchableOpacity, ScrollView } from 'react-native'
import { ArrowLeft, Phone, MessageSquare, Send, User, Video } from '@tamagui/lucide-icons'

interface CommunicationScreenProps {
  onBack: () => void
}

const mockMessages = [
  {
    id: 1,
    sender: 'resident',
    message: 'Thank you for responding quickly to our report.',
    timestamp: '10:30 AM'
  },
  {
    id: 2,
    sender: 'officer',
    message: 'We\'re on our way to inspect the site. Please ensure the area remains evacuated.',
    timestamp: '10:32 AM'
  },
  {
    id: 3,
    sender: 'resident',
    message: 'Understood. All residents have been moved to the community center.',
    timestamp: '10:35 AM'
  }
]

const quickMessages = [
  {
    title: 'We\'re en route to your location',
    subtitle: 'ETA: 15 minutes',
  },
  {
    title: 'Please evacuate the area immediately',
    subtitle: 'Safety protocol',
  },
  {
    title: 'Inspection complete - area is safe',
    subtitle: 'All clear message',
  },
]

export function CommunicationScreen({ onBack }: CommunicationScreenProps) {
  const [message, setMessage] = useState('')

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack backgroundColor="white" paddingHorizontal={16} paddingVertical={16} paddingTop={24} borderBottomWidth={1} borderBottomColor="$border">
        <XStack alignItems="center" space={12}>
          <TouchableOpacity onPress={onBack}>
            <ArrowLeft size={20} color="#202124" />
          </TouchableOpacity>
          <XStack alignItems="center" space={12} flex={1}>
            <YStack width={40} height={40} backgroundColor="$primary/10" borderRadius={20} alignItems="center" justifyContent="center">
              <User size={20} color="$primary" />
            </YStack>
            <YStack>
              <Text fontSize={16} fontWeight="600" color="#202124">Juan Dela Cruz</Text>
              <Text fontSize={12} color="#9E9E9E">Report #R001 - Resident</Text>
            </YStack>
          </XStack>
        </XStack>
      </YStack>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <YStack space={16}>
          {/* Quick Actions */}
          <XStack space={12}>
            <Button backgroundColor="$green600" height={56} onPress={() => {}}>
              <XStack alignItems="center" justifyContent="center">
                <Phone size={20} />
                <Text fontSize={12} marginLeft={8}>Call Resident</Text>
              </XStack>
            </Button>
            <Button variant="outlined" height={56}>
              <XStack alignItems="center" justifyContent="center">
                <Video size={20} />
                <Text fontSize={12} marginLeft={8}>Video Call</Text>
              </XStack>
            </Button>
          </XStack>

          {/* Chat Interface */}
          <Card padding={16} backgroundColor="white" borderRadius={12}>
            <YStack marginBottom={12}>
              <Text fontSize={16} fontWeight="600" color="#202124">Messages</Text>
            </YStack>
            <YStack space={12}>
              <ScrollView style={{ height: 256, backgroundColor: '$muted', borderRadius: 8, padding: 12 }} contentContainerStyle={{ paddingBottom: 12 }}>
                <YStack space={12}>
                  {mockMessages.map((msg) => (
                    <XStack
                      key={msg.id}
                      justifyContent={msg.sender === 'officer' ? 'flex-end' : 'flex-start'}
                    >
                      <YStack
                        maxWidth="70%"
                        paddingHorizontal={12}
                        paddingVertical={8}
                        borderRadius={12}
                        backgroundColor={msg.sender === 'officer' ? '$primary' : 'white'}
                        borderWidth={msg.sender === 'resident' ? 1 : 0}
                        borderColor="$border"
                      >
                        <Text
                          fontSize={14}
                          color={msg.sender === 'officer' ? 'white' : '#202124'}
                          lineHeight={20}
                        >
                          {msg.message}
                        </Text>
                        <Text
                          fontSize={10}
                          color={msg.sender === 'officer' ? 'white' : '#9E9E9E'}
                          marginTop={4}
                          opacity={0.8}
                        >
                          {msg.timestamp}
                        </Text>
                      </YStack>
                    </XStack>
                  ))}
                </YStack>
              </ScrollView>

              {/* Message Input */}
              <XStack space={8} marginTop={16}>
                <Input
                  placeholder="Type your message..."
                  flex={1}
                  backgroundColor="white"
                  borderWidth={1}
                  borderColor="$border"
                  borderRadius={8}
                  paddingHorizontal={12}
                  paddingVertical={8}
                  value={message}
                  onChangeText={setMessage}
                />
                <TouchableOpacity onPress={() => {}} style={{ width: 40, height: 40, backgroundColor: '$primary', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={16} color="white" />
                </TouchableOpacity>
              </XStack>
            </YStack>
          </Card>

          {/* Quick Message Templates */}
          <Card padding={16} backgroundColor="white" borderRadius={12}>
            <YStack marginBottom={12}>
              <Text fontSize={16} fontWeight="600" color="#202124">Quick Messages</Text>
            </YStack>
            <YStack space={8}>
              {quickMessages.map((msg, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setMessage(msg.title)}
                  style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '$muted', borderRadius: 8, borderWidth: 1, borderColor: '$border' }}
                >
                  <YStack>
                    <Text fontSize={14} color="#202124" fontWeight="500">{msg.title}</Text>
                    <Text fontSize={12} color="$mutedForeground">{msg.subtitle}</Text>
                  </YStack>
                </TouchableOpacity>
              ))}
            </YStack>
          </Card>

          {/* Contact Information */}
          <Card padding={16} backgroundColor="white" borderRadius={12}>
            <YStack marginBottom={12}>
              <Text fontSize={16} fontWeight="600" color="#202124">Contact Information</Text>
            </YStack>
            <YStack space={12}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color="$mutedForeground">Phone Number:</Text>
                <Text fontSize={14} color="$primary" fontWeight="500">+63 912 345 6789</Text>
              </XStack>
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color="$mutedForeground">Address:</Text>
                <Text fontSize={14} color="#202124" flex={1} textAlign="right" marginLeft={8}>
                  Barangay Poblacion, Quezon City
                </Text>
              </XStack>
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color="$mutedForeground">Emergency Contact:</Text>
                <Text fontSize={14} color="$primary" fontWeight="500">+63 917 888 7777</Text>
              </XStack>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
