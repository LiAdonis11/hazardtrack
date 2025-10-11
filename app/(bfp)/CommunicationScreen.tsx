import React, { useEffect, useState } from 'react';
import { ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { TextInput } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Phone, MessageSquare, Send, User } from '@tamagui/lucide-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiGetAllReports } from '../../lib/api';
import { getUserToken } from '../../lib/storage';
import { openURL } from 'expo-linking';

const COLORS = {
  primary: '#E53935',
  greenCall: '#10B981',
  background: '#F8F9FA',
  card: '#FFFFFF',
  mutedText: '#6B7280',
  heading: '#111827',
  border: '#E5E7EB',
};

const sampleMessages = [
  { id: '1', sender: 'resident', text: 'Thank you for responding quickly to our report.', time: '10:30 AM' },
  { id: '2', sender: 'officer', text: "We’re on our way to inspect the site. Please keep the area clear.", time: '10:32 AM' },
  { id: '3', sender: 'resident', text: 'Understood. Everyone is safe now.', time: '10:35 AM' },
];

const quickMessages = [
  { id: 'q1', title: 'We’re en route to your location', subtitle: 'ETA: 15 minutes' },
  { id: 'q2', title: 'Please evacuate the area immediately', subtitle: 'Safety protocol' },
  { id: 'q3', title: 'Inspection complete - area is safe', subtitle: 'All clear message' },
];

export default function CommunicationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id;
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>(sampleMessages);

  useEffect(() => {
    let mounted = true;
    const fetchReport = async () => {
      try {
        const token = await getUserToken();
        if (token) {
          const res = await apiGetAllReports(token);
          if (res?.status === 'success') {
            const found = res.reports.find((r: any) => String(r.id) === String(id));
            if (found && mounted) {
              setReport(found);
              if (Array.isArray(found.messages) && found.messages.length > 0) {
                setMessages(
                  found.messages.map((m: any, idx: number) => ({
                    id: String(m.id ?? idx),
                    sender: m.sender ?? 'resident',
                    text: m.text ?? m.message ?? '',
                    time: m.time ?? m.timestamp ?? '',
                  }))
                );
              }
            }
          }
        }
      } catch (err) {
        console.warn('Communication fetch error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetchReport();
    return () => {
      mounted = false;
    };
  }, [id]);

  const openTel = (phone?: string) => {
    if (!phone) return;
    openURL(`tel:${phone}`);
  };

  const openSms = (phone?: string, body?: string) => {
    if (!phone) return;
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const url = body
      ? `sms:${phone}${separator}body=${encodeURIComponent(body)}`
      : `sms:${phone}`;
    openURL(url);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    openSms(report?.phone, message.trim());
    const newMsg = {
      id: String(Date.now()),
      sender: 'officer',
      text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage('');
  };

  const handleQuick = (text: string) => {
    setMessage(text);
  };

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor={COLORS.background}>
        <Text color={COLORS.mutedText}>Loading...</Text>
      </YStack>
    );
  }

  if (!report) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor={COLORS.background}>
        <Text color={COLORS.mutedText}>Report not found.</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor={COLORS.background}>
      {/* Header */}
      <YStack
        backgroundColor={COLORS.card}
        borderBottomWidth={1}
        borderBottomColor={COLORS.border}
        paddingHorizontal={16}
        paddingVertical={12}
        marginTop={30}
      >
        <XStack alignItems="center" gap="$3">
          <Button
            variant="outlined"
            size="icon"
            onPress={() => router.back()}
            backgroundColor="transparent"
            borderColor={COLORS.border}
          >
            <ArrowLeft size={18} color={COLORS.heading} />
          </Button>

          <XStack alignItems="center" gap="$3" flex={1}>
            <View width={44} height={44} borderRadius={22} backgroundColor="#FFF0F0" alignItems="center" justifyContent="center">
              <User size={20} color={COLORS.primary} />
            </View>
            <YStack flex={1}>
              <Text fontSize={16} fontWeight="700" color={COLORS.heading}>
                {report.user_fullname ?? 'Resident'}
              </Text>
              <Text fontSize={13} color={COLORS.mutedText}>
                Report {report.title}
              </Text>
            </YStack>
          </XStack>
        </XStack>
      </YStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$4" paddingBottom={160}>
          {/* Action Buttons */}
          <XStack gap="$3">
            <Button
              flex={1}
              height={54}
              borderRadius={12}
              backgroundColor={COLORS.greenCall}
              onPress={() => openTel(report.phone)}
            >
              <Phone size={18} color="white" />
              <Text marginLeft="$2" color="white" fontWeight="600">
                Call
              </Text>
            </Button>
            <Button
              flex={1}
              height={54}
              borderRadius={12}
              variant="outlined"
              onPress={() => openSms(report.phone)}
            >
              <MessageSquare size={18} color={COLORS.heading} />
              <Text marginLeft="$2" fontWeight="600">
                Message
              </Text>
            </Button>
          </XStack>

          {/* Messages */}
          <Card
            backgroundColor={COLORS.card}
            borderRadius={16}
            padding={16}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <YStack gap="$3">
                {messages.map((item) => {
                  const isOfficer = item.sender === 'officer';
                  return (
                    <XStack
                      key={item.id}
                      justifyContent={isOfficer ? 'flex-end' : 'flex-start'}
                      paddingVertical={4}
                    >
                      <YStack
                        maxWidth="80%"
                        paddingHorizontal={14}
                        paddingVertical={10}
                        borderRadius={14}
                        backgroundColor={isOfficer ? COLORS.primary : '#F1F5F9'}
                      >
                        <Text fontSize={14} color={isOfficer ? 'white' : COLORS.heading}>
                          {item.text}
                        </Text>
                        <Text
                          fontSize={11}
                          color={isOfficer ? 'rgba(255,255,255,0.8)' : COLORS.mutedText}
                          marginTop={6}
                          alignSelf={isOfficer ? 'flex-end' : 'flex-start'}
                        >
                          {item.time}
                        </Text>
                      </YStack>
                    </XStack>
                  );
                })}

                {/* Message Input */}
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                  <XStack
                    alignItems="center"
                    gap="$2"
                    backgroundColor="#F9FAFB"
                    borderWidth={1}
                    borderColor={COLORS.border}
                    borderRadius={14}
                    paddingHorizontal={10}
                    paddingVertical={6}
                  >
                    <TextInput
                      placeholder="Type a message..."
                      value={message}
                      onChangeText={setMessage}
                      multiline
                      style={{
                        flex: 1,
                        fontSize: 15,
                        paddingVertical: 8,
                        color: COLORS.heading,
                      }}
                    />
                    <Button
                      size="icon"
                      backgroundColor={COLORS.primary}
                      borderRadius={12}
                      onPress={handleSend}
                      disabled={!message.trim()}
                    >
                      <Send size={18} color="white" />
                    </Button>
                  </XStack>
                </KeyboardAvoidingView>
              </YStack>
            </CardContent>
          </Card>

          {/* Quick Messages */}
          <Card backgroundColor={COLORS.card} borderRadius={16} padding={16}>
            <CardHeader>
              <CardTitle>Quick Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <YStack gap="$3">
                {quickMessages.map((q) => (
                  <Button
                    key={q.id}
                    variant="outlined"
                    width="100%"
                    justifyContent="flex-start"
                    borderRadius={12}
                    onPress={() => handleQuick(q.title)}
                  >
                    <YStack alignItems="flex-start">
                      <Text fontSize={14} fontWeight="600" color={COLORS.heading}>
                        {q.title}
                      </Text>
                      <Text fontSize={12} color={COLORS.mutedText}>
                        {q.subtitle}
                      </Text>
                    </YStack>
                  </Button>
                ))}
              </YStack>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card backgroundColor={COLORS.card} borderRadius={16} padding={16}>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <YStack gap="$3">
                <YStack gap="$1">
                  <Text fontSize={13} color={COLORS.mutedText}>
                    Phone Number:
                  </Text>
                  <Text
                    fontSize={15}
                    color={COLORS.primary}
                    fontWeight="600"
                    onPress={() => openTel(report.phone)}
                  >
                    {report.phone ?? '+63 912 345 6789'}
                  </Text>
                </YStack>

                <YStack gap="$1">
                  <Text fontSize={13} color={COLORS.mutedText}>
                    Address:
                  </Text>
                  <Text fontSize={15} color={COLORS.heading}>
                    {report.location_address ?? 'Barangay Poblacion, Quezon City'}
                  </Text>
                </YStack>
              </YStack>
            </CardContent>
          </Card>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
