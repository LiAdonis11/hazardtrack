import React, { useState } from 'react';
import { Alert, TouchableOpacity, Linking } from 'react-native';
import { YStack, XStack, Text, Button, ScrollView, TextArea } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getUserToken } from '../lib/storage';
import { apiUpdateReportStatus, apiUpdateReportPriority } from '../lib/api';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, MessageSquare, Camera, Phone, Send } from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';
import { addPhotoNote } from '../lib/photoNotes';
import { showEmergencyOptions } from '../lib/communications';

export default function ReportAction() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const report = params.report ? JSON.parse(params.report as string) : null;

  const [verification, setVerification] = useState<'validate' | 'false' | null>(null);
  const [priority, setPriority] = useState(report?.priority || 'low');
  const [status, setStatus] = useState(report?.status || 'pending');
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  if (!report) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text>Report not found</Text>
      </YStack>
    );
  }

  const handleConfirm = async () => {
    if (!verification) {
      Alert.alert('Error', 'Please select Validate or False Alarm');
      return;
    }

    setLoading(true);
    try {
      const token = await getUserToken();
      if (!token) return;

      // Update status based on verification
      const newStatus = verification === 'validate' ? 'verified' : 'rejected';
      await apiUpdateReportStatus({
        token,
        report_id: report.id,
        status: newStatus,
        admin_notes: `Report ${verification === 'validate' ? 'validated' : 'marked as false alarm'} by BFP personnel.`
      });

      // Update priority if changed
      if (priority !== report.priority) {
        await apiUpdateReportPriority({ token, report_id: report.id, priority });
      }

      // Update status if changed
      if (status !== report.status && status !== newStatus) {
        await apiUpdateReportStatus({
          token,
          report_id: report.id,
          status,
          admin_notes: `Status updated to ${status} by BFP personnel.`
        });
      }

      Alert.alert('Success', 'Report updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update report');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = () => {
    Alert.prompt('Add Note', 'Enter your note:', (note) => {
      if (note) {
        addPhotoNote(report.id, 'note', note).then(() => {
          Alert.alert('Success', 'Note added');
        });
      }
    });
  };

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      await addPhotoNote(report.id, 'photo', result.assets[0].base64);
      Alert.alert('Success', 'Photo added');
    }
  };

  const handleContact = () => {
    showEmergencyOptions(report.location_address || '', report.description);
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack
        backgroundColor="white"
        padding="$4"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        shadowColor="#000"
        shadowOpacity={0.05}
        shadowRadius={4}
        shadowOffset={{ width: 0, height: 2 }}
        elevation={2}
      >
        <XStack alignItems="center" space="$3">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="$text" />
          </TouchableOpacity>
          <YStack flex={1}>
            <Text fontSize={20} fontWeight="700" color="$text">
              Act on Report
            </Text>
            <Text fontSize={14} color="$textSecondary">
              {report.title}
            </Text>
          </YStack>
        </XStack>
      </YStack>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <YStack space="$6">

          {/* Step 1: Verification */}
          <YStack
            backgroundColor="white"
            borderRadius={16}
            padding="$4"
            shadowColor="#000"
            shadowOpacity={0.08}
            shadowRadius={8}
            shadowOffset={{ width: 0, height: 2 }}
            elevation={2}
          >
            <XStack alignItems="center" space={3} marginBottom="$4">
              <CheckCircle size={20} color="#6B7280" />
              <Text fontSize={18} fontWeight="600" color="$text" textTransform="uppercase">
                Step 1: Verification
              </Text>
            </XStack>

            <Text fontSize={16} color="$textSecondary" marginBottom="$4">
              Confirm if this hazard report is legitimate or a false alarm.
            </Text>

            <XStack space={12}>
              <TouchableOpacity
                onPress={() => setVerification('validate')}
                style={{
                  flex: 1,
                  backgroundColor: verification === 'validate' ? '#388E3C' : '#F5F5F5',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: verification === 'validate' ? 2 : 1,
                  borderColor: verification === 'validate' ? '#388E3C' : '#E5E7EB',
                }}
              >
                <CheckCircle size={24} color={verification === 'validate' ? 'white' : '#388E3C'} />
                <Text
                  fontSize={16}
                  fontWeight="600"
                  color={verification === 'validate' ? 'white' : '$text'}
                  marginTop={8}
                >
                  VALIDATE
                </Text>
                <Text
                  fontSize={12}
                  color={verification === 'validate' ? 'white' : '$textSecondary'}
                  textAlign="center"
                  marginTop={4}
                >
                  Confirm hazard exists
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setVerification('false')}
                style={{
                  flex: 1,
                  backgroundColor: verification === 'false' ? '#B71C1C' : '#F5F5F5',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: verification === 'false' ? 2 : 1,
                  borderColor: verification === 'false' ? '#B71C1C' : '#E5E7EB',
                }}
              >
                <XCircle size={24} color={verification === 'false' ? 'white' : '#B71C1C'} />
                <Text
                  fontSize={16}
                  fontWeight="600"
                  color={verification === 'false' ? 'white' : '$text'}
                  marginTop={8}
                >
                  FALSE ALARM
                </Text>
                <Text
                  fontSize={12}
                  color={verification === 'false' ? 'white' : '$textSecondary'}
                  textAlign="center"
                  marginTop={4}
                >
                  No hazard found
                </Text>
              </TouchableOpacity>
            </XStack>
          </YStack>

          {/* Step 2: Priority Assignment */}
          <YStack
            backgroundColor="white"
            borderRadius={16}
            padding="$4"
            shadowColor="#000"
            shadowOpacity={0.08}
            shadowRadius={8}
            shadowOffset={{ width: 0, height: 2 }}
            elevation={2}
          >
            <XStack alignItems="center" space={3} marginBottom="$4">
              <AlertTriangle size={20} color="#6B7280" />
              <Text fontSize={18} fontWeight="600" color="$text" textTransform="uppercase">
                Step 2: Priority Level
              </Text>
            </XStack>

            <Text fontSize={16} color="$textSecondary" marginBottom="$4">
              Set the appropriate priority level for response.
            </Text>

            <YStack space={12}>
              {[
                { key: 'high', label: 'HIGH PRIORITY', desc: 'Immediate response required', color: '#D32F2F', emoji: '🔴' },
                { key: 'medium', label: 'MEDIUM PRIORITY', desc: 'Response within hours', color: '#FFA000', emoji: '🟠' },
                { key: 'low', label: 'LOW PRIORITY', desc: 'Monitor and respond', color: '#6B7D99', emoji: '🔵' },
              ].map((p) => (
                <TouchableOpacity
                  key={p.key}
                  onPress={() => setPriority(p.key)}
                  style={{
                    backgroundColor: priority === p.key ? p.color : '#F5F5F5',
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: priority === p.key ? 2 : 1,
                    borderColor: priority === p.key ? p.color : '#E5E7EB',
                  }}
                >
                  <XStack alignItems="center" space={12}>
                    <Text fontSize={24}>{p.emoji}</Text>
                    <YStack flex={1}>
                      <Text
                        fontSize={16}
                        fontWeight="600"
                        color={priority === p.key ? 'white' : '$text'}
                      >
                        {p.label}
                      </Text>
                      <Text
                        fontSize={14}
                        color={priority === p.key ? 'rgba(255,255,255,0.8)' : '$textSecondary'}
                      >
                        {p.desc}
                      </Text>
                    </YStack>
                    {priority === p.key && <CheckCircle size={20} color="white" />}
                  </XStack>
                </TouchableOpacity>
              ))}
            </YStack>
          </YStack>

          {/* Step 3: Status Update */}
          <YStack
            backgroundColor="white"
            borderRadius={16}
            padding="$4"
            shadowColor="#000"
            shadowOpacity={0.08}
            shadowRadius={8}
            shadowOffset={{ width: 0, height: 2 }}
            elevation={2}
          >
            <XStack alignItems="center" space={3} marginBottom="$4">
              <MessageSquare size={20} color="#6B7280" />
              <Text fontSize={18} fontWeight="600" color="$text" textTransform="uppercase">
                Step 3: Response Status
              </Text>
            </XStack>

            <Text fontSize={16} color="$textSecondary" marginBottom="$4">
              Update the current response status.
            </Text>

            <XStack space={12}>
              <TouchableOpacity
                onPress={() => setStatus('in_progress')}
                style={{
                  flex: 1,
                  backgroundColor: status === 'in_progress' ? '#0D47A1' : '#F5F5F5',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: status === 'in_progress' ? 2 : 1,
                  borderColor: status === 'in_progress' ? '#0D47A1' : '#E5E7EB',
                }}
              >
                <Text
                  fontSize={16}
                  fontWeight="600"
                  color={status === 'in_progress' ? 'white' : '$text'}
                  textAlign="center"
                >
                  START{'\n'}PROGRESS
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStatus('resolved')}
                style={{
                  flex: 1,
                  backgroundColor: status === 'resolved' ? '#388E3C' : '#F5F5F5',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: status === 'resolved' ? 2 : 1,
                  borderColor: status === 'resolved' ? '#388E3C' : '#E5E7EB',
                }}
              >
                <Text
                  fontSize={16}
                  fontWeight="600"
                  color={status === 'resolved' ? 'white' : '$text'}
                  textAlign="center"
                >
                  MARK{'\n'}RESOLVED
                </Text>
              </TouchableOpacity>
            </XStack>
          </YStack>

          {/* Step 4: Action Logging */}
          <YStack
            backgroundColor="white"
            borderRadius={16}
            padding="$4"
            shadowColor="#000"
            shadowOpacity={0.08}
            shadowRadius={8}
            shadowOffset={{ width: 0, height: 2 }}
            elevation={2}
          >
            <XStack alignItems="center" space={3} marginBottom="$4">
              <Send size={20} color="#6B7280" />
              <Text fontSize={18} fontWeight="600" color="$text" textTransform="uppercase">
                Step 4: Action Logging
              </Text>
            </XStack>

            <Text fontSize={16} color="$textSecondary" marginBottom="$4">
              Add notes, photos, or contact the reporter.
            </Text>

            <YStack space={12}>
              {/* Add Note */}
              {!showNoteInput ? (
                <TouchableOpacity
                  onPress={() => setShowNoteInput(true)}
                  style={{
                    backgroundColor: '#F5F5F5',
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <XStack alignItems="center" space={12}>
                    <MessageSquare size={20} color="#6B7280" />
                    <YStack flex={1}>
                      <Text fontSize={16} fontWeight="500" color="$text">
                        Add Note
                      </Text>
                      <Text fontSize={14} color="$textSecondary">
                        Log actions or observations
                      </Text>
                    </YStack>
                  </XStack>
                </TouchableOpacity>
              ) : (
                <YStack space={12}>
                  <TextArea
                    placeholder="Enter your note here... Use @team to mention teams"
                    value={noteText}
                    onChangeText={setNoteText}
                    multiline
                    numberOfLines={3}
                    backgroundColor="#F5F5F5"
                    borderRadius={8}
                    padding={12}
                  />
                  <XStack space={8}>
                    <Button
                      flex={1}
                      onPress={() => {
                        setShowNoteInput(false);
                        setNoteText('');
                      }}
                      variant="outlined"
                    >
                      Cancel
                    </Button>
                    <Button
                      flex={1}
                      onPress={() => {
                        if (noteText.trim()) {
                          addPhotoNote(report.id, 'note', noteText).then(() => {
                            Alert.alert('Success', 'Note added');
                            setNoteText('');
                            setShowNoteInput(false);
                          });
                        }
                      }}
                      backgroundColor="#0D47A1"
                      color="white"
                    >
                      Save Note
                    </Button>
                  </XStack>
                </YStack>
              )}

              {/* Add Photo */}
              <TouchableOpacity
                onPress={handleAddPhoto}
                style={{
                  backgroundColor: '#F5F5F5',
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}
              >
                <XStack alignItems="center" space={12}>
                  <Camera size={20} color="#6B7280" />
                  <YStack flex={1}>
                    <Text fontSize={16} fontWeight="500" color="$text">
                      Add Photo Evidence
                    </Text>
                    <Text fontSize={14} color="$textSecondary">
                      Capture scene or progress photos
                    </Text>
                  </YStack>
                </XStack>
              </TouchableOpacity>

              {/* Contact Reporter */}
              <TouchableOpacity
                onPress={handleContact}
                style={{
                  backgroundColor: '#F5F5F5',
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}
              >
                <XStack alignItems="center" space={12}>
                  <Phone size={20} color="#6B7280" />
                  <YStack flex={1}>
                    <Text fontSize={16} fontWeight="500" color="$text">
                      Contact Reporter
                    </Text>
                    <Text fontSize={14} color="$textSecondary">
                      Call or SMS for more information
                    </Text>
                  </YStack>
                </XStack>
              </TouchableOpacity>
            </YStack>
          </YStack>

        </YStack>
      </ScrollView>

      {/* Action Summary & Confirm */}
      <YStack
        backgroundColor="white"
        padding="$4"
        borderTopWidth={1}
        borderTopColor="$borderColor"
        shadowColor="#000"
        shadowOpacity={0.05}
        shadowRadius={4}
        shadowOffset={{ width: 0, height: -2 }}
        elevation={2}
      >
        <YStack space={12}>
          <Text fontSize={18} fontWeight="600" color="$text">
            Action Summary
          </Text>

          <YStack space={6}>
            <Text fontSize={14} color="$textSecondary">
              • Verification: {verification ? (verification === 'validate' ? 'Validated' : 'False Alarm') : 'Not selected'}
            </Text>
            <Text fontSize={14} color="$textSecondary">
              • Priority: {priority?.toUpperCase()}
            </Text>
            <Text fontSize={14} color="$textSecondary">
              • Status: {status?.replace('_', ' ').toUpperCase()}
            </Text>
          </YStack>

          <Button
            onPress={handleConfirm}
            backgroundColor={verification ? '#B71C1C' : '#9CA3AF'}
            disabled={loading || !verification}
            paddingVertical={16}
            borderRadius={12}
          >
            <Text fontSize={18} fontWeight="600" color="white">
              {loading ? 'Processing...' : 'CONFIRM ACTIONS'}
            </Text>
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
}
