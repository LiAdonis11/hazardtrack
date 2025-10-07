import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { YStack, XStack, Text, Card, Input, Button } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Phone, MessageSquare, Send, User, Video } from '@tamagui/lucide-icons';

interface Message {
  id: number;
  sender: 'resident' | 'officer';
  message: string;
  timestamp: string;
}

const mockMessages: Message[] = [
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
];

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
];

export default function CommunicationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const report = params.report ? JSON.parse(params.report as string) : null;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'officer',
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleCall = () => {
    Alert.alert('Call Resident', 'Calling resident phone...', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => {
        // In real app, use Linking.openURL(`tel:${report.reporter_phone}`)
        Alert.alert('Calling...', 'Dialing resident phone number');
      }}
    ]);
  };

  const handleVideoCall = () => {
    Alert.alert('Video Call', 'Video call feature coming soon');
  };

  const handleQuickMessage = (msg: string) => {
    setMessage(msg);
  };

  return (
    <YStack flex={1} backgroundColor="#FAFAFA">
      {/* Header */}
      <YStack backgroundColor="white" paddingHorizontal="$4" paddingVertical="$4" paddingTop="$6" borderBottomWidth={1} borderBottomColor="#E5E7EB">
        <XStack alignItems="center" space="$3">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={20} color="#202124" />
          </TouchableOpacity>
          <XStack alignItems="center" space="$3" flex={1}>
            <YStack width={40} height={40} backgroundColor="#B71C1C20" borderRadius={20} alignItems="center" justifyContent="center">
              <User size={20} color="#B71C1C" />
            </YStack>
            <YStack>
              <Text fontSize={16} fontWeight="600" color="#202124">Juan Dela Cruz</Text>
              <Text fontSize={12} color="#9E9E9E">Report #{report?.id || 'R001'} - Resident</Text>
            </YStack>
          </XStack>
        </XStack>
      </YStack>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
        <YStack space="$4">
          {/* Quick Actions */}
          <XStack space="$3">
            <TouchableOpacity
              onPress={handleCall}
              style={{
                flex: 1,
                backgroundColor: '#388E3C',
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
                shadowColor: '#388E3C',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Phone size={20} color="white" />
              <Text fontSize={12} color="white" marginTop="$1">Call Resident</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleVideoCall}
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <Video size={20} color="#6B7280" />
              <Text fontSize={12} color="#6B7280" marginTop="$1">Video Call</Text>
            </TouchableOpacity>
          </XStack>

          {/* Chat Interface */}
          <Card padding="$4" backgroundColor="white" borderRadius={12}>
            <Text fontSize={16} fontWeight="600" color="#202124" marginBottom="$3">Messages</Text>

            <ScrollView
              style={{ height: 300, backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12 }}
              contentContainerStyle={{ paddingBottom: 12 }}
            >
              <YStack space="$3">
                {messages.map((msg) => (
                  <XStack
                    key={msg.id}
                    justifyContent={msg.sender === 'officer' ? 'flex-end' : 'flex-start'}
                  >
                    <YStack
                      maxWidth="70%"
                      paddingHorizontal="$3"
                      paddingVertical="$2"
                      borderRadius={12}
                      backgroundColor={msg.sender === 'officer' ? '#B71C1C' : 'white'}
                      borderWidth={msg.sender === 'resident' ? 1 : 0}
                      borderColor="#E5E7EB"
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
                        marginTop="$1"
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
            <XStack space="$2" marginTop="$3">
              <Input
                flex={1}
                placeholder="Type your message..."
                value={message}
                onChangeText={setMessage}
                backgroundColor="white"
                borderWidth={1}
                borderColor="#E5E7EB"
                borderRadius={8}
                paddingHorizontal="$3"
                paddingVertical="$2"
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#B71C1C',
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={16} color="white" />
              </TouchableOpacity>
            </XStack>
          </Card>

          {/* Quick Message Templates */}
          <Card padding="$4" backgroundColor="white" borderRadius={12}>
            <Text fontSize={16} fontWeight="600" color="#202124" marginBottom="$3">Quick Messages</Text>
            <YStack space="$2">
              {quickMessages.map((msg, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleQuickMessage(msg.title)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    backgroundColor: '#F9FAFB',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <Text fontSize={14} color="#202124" fontWeight="500">{msg.title}</Text>
                  <Text fontSize={12} color="#9E9E9E">{msg.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </YStack>
          </Card>

          {/* Contact Information */}
          <Card padding="$4" backgroundColor="white" borderRadius={12}>
            <Text fontSize={16} fontWeight="600" color="#202124" marginBottom="$3">Contact Information</Text>
            <YStack space="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color="#6B7280">Phone Number:</Text>
                <Text fontSize={14} color="#B71C1C" fontWeight="500">+63 912 345 6789</Text>
              </XStack>
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color="#6B7280">Address:</Text>
                <Text fontSize={14} color="#202124" flex={1} textAlign="right" marginLeft="$2">
                  Barangay Poblacion, Quezon City
                </Text>
              </XStack>
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color="#6B7280">Emergency Contact:</Text>
                <Text fontSize={14} color="#B71C1C" fontWeight="500">+63 917 888 7777</Text>
              </XStack>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
