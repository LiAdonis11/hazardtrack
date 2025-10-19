import React, { useState, useEffect } from "react"
import { ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Keyboard, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { YStack, XStack, Text, View, Card, Input, Button, Avatar, Sheet, Spinner, AlertDialog} from "tamagui"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useRouter } from "expo-router"
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '../../context/AuthContext'
import { apiGetUserProfile, apiChangePassword, apiDeleteAccount, apiUpdateUserProfile } from '../../lib/api'
import { removeUserToken, removeUserData } from '../../lib/storage'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  profileImage?: string
  joinedDate: string
  totalReports: number
  resolvedReports: number
  emergencyContact?: string
}

export default function ProfileScreen() {
  const router = useRouter()
  const { token, loading: authLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    joinedDate: "",
    totalReports: 0,
    resolvedReports: 0,
    emergencyContact: "",
  })
  const [editedProfile, setEditedProfile] = useState(profile)
  const [showPasswordChangeSheet, setShowPasswordChangeSheet] = useState(false)
  const [showDeleteSheet, setShowDeleteSheet] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [showDeletePass, setShowDeletePass] = useState(false)
  const [keyboardShown, setKeyboardShown] = useState(false)
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardShown(true)
    })
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardShown(false)
    })

    return () => {
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [])

  const fetchProfile = async () => {
    if (authLoading) return;

    if (!token) {
      Alert.alert('Error', 'No authentication token found')
      setLoading(false)
      return
    }

    try {
      // First try to get user data from storage for immediate display
      const { getUserData } = await import('../../lib/storage')
      const storedUserData = await getUserData()
      if (storedUserData) {
        const tempProfile: UserProfile = {
          id: storedUserData.id.toString(),
          name: storedUserData.fullname,
          email: storedUserData.email,
          phone: storedUserData.phone || "",
          address: storedUserData.address || "",
          joinedDate: storedUserData.created_at || new Date().toISOString(),
          totalReports: 0, // Will be updated from API
          resolvedReports: 0, // Will be updated from API
          emergencyContact: storedUserData.phone || "",
          profileImage: undefined,
        }
        setProfile(tempProfile)
        setEditedProfile(tempProfile)
        setLoading(false) // Show profile immediately
      }

      // Then fetch full profile data from API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await apiGetUserProfile(token)
      clearTimeout(timeoutId)

      if (response.status === 'success') {
        const profileData = response.profile
        const userProfile: UserProfile = {
          id: profileData.id.toString(),
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone || "",
          address: profileData.address || "",
          joinedDate: profileData.joinedDate,
          totalReports: profileData.totalReports,
          resolvedReports: profileData.resolvedReports,
          emergencyContact: profileData.emergencyContact || "",
          profileImage: profileData.profileImage || undefined,
        }
        setProfile(userProfile)
        setEditedProfile(userProfile)
      } else {
        Alert.alert('Error', response.message || 'Failed to load profile')
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      if (error.name === 'AbortError') {
        Alert.alert('Timeout', 'Request timed out. Please check your connection.')
      } else {
        Alert.alert('Error', 'Failed to load profile data')
      }
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [token, authLoading])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchProfile()
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    setPasswordRules({
      length: newPassword.length >= 6,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
    })
  }, [newPassword])

  const handleSave = async () => {
    // Validate phone number
    if (editedProfile.phone && (!/^09\d{8,9}$/.test(editedProfile.phone) || editedProfile.phone.length < 10 || editedProfile.phone.length > 11)) {
      Alert.alert('Invalid Phone Number', 'Phone number must start with 09 and be 10-11 digits')
      return
    }

    try {
      if (authLoading) return;

      if (!token) {
        Alert.alert('Error', 'No authentication token found')
        return
      }

      const res = await apiUpdateUserProfile(token, {
        fullname: editedProfile.name,
        email: editedProfile.email,
        phone: editedProfile.phone,
        address: editedProfile.address
      })

      if (res.status === 'success') {
        setProfile(editedProfile)
        setIsEditing(false)
        Alert.alert('Success', 'Profile updated successfully')
      } else {
        Alert.alert('Error', res.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      Alert.alert('Error', 'Failed to update profile')
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await removeUserToken()
            await removeUserData()
            // Trigger global auth check to update authentication state
            if (global.triggerAuthCheck) {
              global.triggerAuthCheck()
            }
            router.replace('/login')
          },
        },
      ]
    )
  }

  const handleImageChange = () => {
    console.log("Open camera/gallery here")
  }

  const profileCompleteness = () => {
    const total = 6
    const filled = [
      profile.name,
      profile.email,
      profile.phone,
      profile.address,
      profile.profileImage,
      profile.emergencyContact,
    ].filter(Boolean).length
    return Math.round((filled / total) * 100)
  }

  if (authLoading || loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF8F6", justifyContent: 'center', alignItems: 'center' }}>
        <YStack alignItems="center" gap={12}>
          <Spinner size="large" color="#D62828" />
          <Text style={{ fontSize: 16, color: "#666" }}>Loading profile...</Text>
        </YStack>
      </SafeAreaView>
    )
  }

  return (
    <>
      <StatusBar backgroundColor="#D62828" style="light" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FAF8F6"}} >
        {/* Header (gradient red) */}
        <LinearGradient
          colors={["#C62828", "#B71C1C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingVertical: 20,
            paddingHorizontal: 16,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        >
          <XStack alignItems="center" justifyContent="space-between">
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
              <FontAwesome name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Profile header block - centered */}
            <XStack alignItems="center" gap={12} flex={1} justifyContent="center">
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </Text>
              </View>

              <YStack>
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>{profile.name}</Text>
                {/* <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 2, fontSize: 12 }}>
                  Resident ID: {profile.id}
                </Text> */}
              </YStack>
            </XStack>

            {/* <XStack alignItems="center" gap={8}>
              {!isEditing ? (
                <TouchableOpacity onPress={() => setIsEditing(true)} style={{ padding: 6 }}>
                  <FontAwesome name="pencil" size={18} color="#fff" />
                </TouchableOpacity>
              ) : (
                <XStack gap={14}>
                  <TouchableOpacity onPress={handleCancel} style={{ padding: 6 }}>
                    <FontAwesome name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSave} style={{ padding: 6 }}>
                    <FontAwesome name="save" size={18} color="#fff" />
                  </TouchableOpacity>
                </XStack>
              )}
              <TouchableOpacity onPress={handleLogout} style={{ padding: 6 }}>
                <FontAwesome name="sign-out" size={18} color="#fff" />
              </TouchableOpacity>
            </XStack> */}
          </XStack>

          {/* Profile completeness badge - below the main header */}
          {/* <YStack alignItems="center" marginTop={10}>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.16)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                Profile {profileCompleteness()}% Complete
              </Text>
            </View>
          </YStack> */}
        </LinearGradient>

        {/* Main content */}
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <YStack gap={16}>
            {/* Stats */}
            <XStack gap={10}>
              <Card
                flex={1}
                alignItems="center"
                padding={16}
                borderRadius={12}
                backgroundColor="#fff"
              >
                <Text fontSize={26} fontWeight="800" color="#D62828">
                  {profile.totalReports}
                </Text>
                <Text fontSize={13} color="#777">
                  Total Reports
                </Text>
              </Card>
              <Card
                flex={1}
                alignItems="center"
                padding={16}
                borderRadius={12}
                backgroundColor="#fff"
              >
                <Text fontSize={26} fontWeight="800" color="#28A745">
                  {profile.resolvedReports}
                </Text>
                <Text fontSize={13} color="#777">
                  Resolved
                </Text>
              </Card>
            </XStack>

            {/* Personal Information */}
            <Card backgroundColor="#fff" borderRadius={12} padding={16}>
              <XStack alignItems="center" justifyContent="space-between" marginBottom={10}>
                <Text fontWeight="700" fontSize={16}>
                  Personal Information
                </Text>
                {!isEditing ? (
                  <TouchableOpacity onPress={() => setIsEditing(true)} style={{ padding: 6 }}>
                    <FontAwesome name="pencil" size={16} color="#D62828" />
                  </TouchableOpacity>
                ) : (
                  <XStack gap={8}>
                    <TouchableOpacity onPress={handleCancel} style={{ padding: 6 }}>
                      <FontAwesome name="close" size={14} color="#777" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSave} style={{ padding: 6 }}>
                      <FontAwesome name="save" size={14} color="#28A745" />
                    </TouchableOpacity>
                  </XStack>
                )}
              </XStack>
              <YStack gap={12}>
                <View>
                  <Text color="#777" fontSize={13}>
                    Full Name
                  </Text>
                  {isEditing ? (
                    <Input
                      value={editedProfile.name}
                      onChangeText={(text) => setEditedProfile({ ...editedProfile, name: text })}
                      placeholder="Enter full name"
                    />
                  ) : (
                    <Text>{profile.name}</Text>
                  )}
                </View>

                <View>
                  <Text color="#777" fontSize={13}>
                    Email
                  </Text>
                  {isEditing ? (
                    <Input
                      value={editedProfile.email}
                      onChangeText={(text) => setEditedProfile({ ...editedProfile, email: text })}
                      placeholder="Enter email"
                    />
                  ) : (
                    <Text>{profile.email}</Text>
                  )}
                </View>

                <View>
                  <Text color="#777" fontSize={13}>
                    Phone
                  </Text>
                  {isEditing ? (
                    <Input
                      value={editedProfile.phone}
                      onChangeText={(text) => setEditedProfile({ ...editedProfile, phone: text })}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <Text>{profile.phone}</Text>
                  )}
                  {isEditing && (
                    <Text style={{ color: "#888", fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                      Phone number must start with 09 and be 10-11 digits
                    </Text>
                  )}
                </View>

                <View>
                  <Text color="#777" fontSize={13}>
                    Address
                  </Text>
                  {isEditing ? (
                    <Input
                      value={editedProfile.address}
                      onChangeText={(text) => setEditedProfile({ ...editedProfile, address: text })}
                      placeholder="Enter address"
                    />
                  ) : (
                    <Text>{profile.address}</Text>
                  )}
                </View>
              </YStack>
            </Card>

            {/* Emergency Contact */}
            {/* <Card backgroundColor="#fff" borderRadius={12} padding={16}>
              <Text fontWeight="700" fontSize={16} marginBottom={10}>
                Emergency Contact
              </Text>
              {isEditing ? (
                <Input
                  value={editedProfile.emergencyContact || ""}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, emergencyContact: text })
                  }
                  placeholder="Enter emergency contact number"
                />
              ) : (
                <Text>{profile.emergencyContact || "Not set"}</Text>
              )}
            </Card> */}

            {/* Account Info */}
            <Card backgroundColor="#fff" borderRadius={12} padding={16}>
              <Text fontWeight="700" fontSize={16} marginBottom={10}>
                Account Information
              </Text>
              <YStack gap={6}>
                <XStack justifyContent="space-between">
                  <Text color="#777">Member Since</Text>
                  <Text>{new Date(profile.joinedDate).toLocaleDateString()}</Text>
                </XStack>
                <XStack justifyContent="space-between">
                  <Text color="#777">Account Status</Text>
                  <Text color="#28A745" fontWeight="700">
                    Active
                  </Text>
                </XStack>
              </YStack>
            </Card>

            {/* Actions */}
            {!isEditing && (
              <YStack gap={8}>
                <Button backgroundColor="#eee" onPress={() => setShowPasswordChangeSheet(true)}>
                  <Text color="#333">Change Password</Text>
                </Button>
                <Button
                  backgroundColor="#666"
                  onPress={handleLogout}
                >
                  <Text color="white" fontWeight="700">
                    Logout
                  </Text>
                </Button>
                <Button backgroundColor="#F8D7DA" onPress={() => setShowDeleteSheet(true)}>
                  <Text color="#D62828" fontWeight="700">
                    Delete Account
                  </Text>
                </Button>
              </YStack>
            )}
          </YStack>
        </ScrollView>

        {/* Change Password Sheet */}
        <Sheet
          modal
          open={showPasswordChangeSheet}
          onOpenChange={(open: boolean) => {
            setShowPasswordChangeSheet(open)
            if (!open) setShowSuccess(false)
          }}
          snapPoints={keyboardShown ? [90] : [80]}
          dismissOnSnapToBottom
        >
          <Sheet.Overlay />
          <Sheet.Frame padding="$5" gap="$5" backgroundColor="$background">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : 'height'} style={{ flex: 1 }}>
              <Sheet.Handle backgroundColor="$gray8" />
              {showSuccess ? (
                <YStack alignItems="center" gap="$4" marginTop="$5">
                  <FontAwesome name="check-circle" size={64} color="#28A745" />
                  <Text fontSize="$7" fontWeight="bold" color="$color" textAlign="center">Password Changed Successfully</Text>
                  <Text fontSize="$4" color="$gray11" textAlign="center">
                    Great! Your password has been updated successfully. Stay safe and secure.
                  </Text>
                  <Button
                    backgroundColor="#D62828"
                    borderRadius="$4"
                    paddingVertical="$3"
                    paddingHorizontal="$4"
                    onPress={() => {
                      setShowSuccess(false)
                      setShowPasswordChangeSheet(false)
                    }}
                  >
                    <Text color="white" fontWeight="600">Continue</Text>
                  </Button>
                </YStack>
              ) : (
                <YStack alignItems="center" gap="$2">
                  <FontAwesome name="lock" size={32} color="#D62828" />
                  <Text fontSize="$7" fontWeight="bold" color="$color">Change Password</Text>
                  <Text fontSize="$4" color="$gray11" textAlign="center">
                    Enter your current password and choose a new one
                  </Text>
                </YStack>
              )}

              {!showSuccess && (
                <>
                  {/* Password Inputs with Eye Icons */}
                  <YStack gap="$4" marginTop="$3">
                {/* Current Password */}
                <Input
                  placeholder="Current Password"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  backgroundColor="$gray2"
                  borderColor="$gray6"
                  borderWidth={1}
                  borderRadius="$4"
                  padding="$3"
                  fontSize="$4"
                />

                {/* New Password */}
                <XStack
                  alignItems="center"
                  backgroundColor="$gray2"
                  borderColor="$gray6"
                  borderWidth={1}
                  borderRadius="$4"
                  paddingHorizontal="$3"
                >
                  <Input
                    flex={1}
                    placeholder="New Password"
                    secureTextEntry={!showNewPass}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    borderWidth={0}
                    fontSize="$4"
                  />
                  <FontAwesome
                    name={showNewPass ? 'eye-slash' : 'eye'}
                    size={16}
                    color="#888"
                    onPress={() => setShowNewPass(!showNewPass)}
                  />
                </XStack>

                {/* Password Rules */}
                <YStack gap="$1" marginTop="$2">
                  <XStack alignItems="center" gap="$2">
                    <FontAwesome
                      name={passwordRules.length ? 'check-circle' : 'times-circle'}
                      size={14}
                      color={passwordRules.length ? '#28A745' : '#DC3545'}
                    />
                    <Text fontSize="$3" color={passwordRules.length ? '#28A745' : '#DC3545'}>
                      At least 6 characters
                    </Text>
                  </XStack>
                  <XStack alignItems="center" gap="$2">
                    <FontAwesome
                      name={passwordRules.uppercase ? 'check-circle' : 'times-circle'}
                      size={14}
                      color={passwordRules.uppercase ? '#28A745' : '#DC3545'}
                    />
                    <Text fontSize="$3" color={passwordRules.uppercase ? '#28A745' : '#DC3545'}>
                      At least one uppercase letter
                    </Text>
                  </XStack>
                  <XStack alignItems="center" gap="$2">
                    <FontAwesome
                      name={passwordRules.lowercase ? 'check-circle' : 'times-circle'}
                      size={14}
                      color={passwordRules.lowercase ? '#28A745' : '#DC3545'}
                    />
                    <Text fontSize="$3" color={passwordRules.lowercase ? '#28A745' : '#DC3545'}>
                      At least one lowercase letter
                    </Text>
                  </XStack>
                  <XStack alignItems="center" gap="$2">
                    <FontAwesome
                      name={passwordRules.number ? 'check-circle' : 'times-circle'}
                      size={14}
                      color={passwordRules.number ? '#28A745' : '#DC3545'}
                    />
                    <Text fontSize="$3" color={passwordRules.number ? '#28A745' : '#DC3545'}>
                      At least one number
                    </Text>
                  </XStack>
                </YStack>

                {/* Confirm Password */}
                <XStack
                  alignItems="center"
                  backgroundColor="$gray2"
                  borderColor="$gray6"
                  borderWidth={1}
                  borderRadius="$4"
                  paddingHorizontal="$3"
                >
                  <Input
                    flex={1}
                    placeholder="Confirm New Password"
                    secureTextEntry={!showConfirmPass}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    borderWidth={0}
                    fontSize="$4"
                  />
                  <FontAwesome
                    name={showConfirmPass ? 'eye-slash' : 'eye'}
                    size={16}
                    color="#888"
                    onPress={() => setShowConfirmPass(!showConfirmPass)}
                  />
                </XStack>
              </YStack>

              {/* Buttons */}
              <XStack gap="$3" marginTop={18} marginBottom={40}>
                <Button
                  flex={1}
                  variant="outlined"
                  onPress={() => setShowPasswordChangeSheet(false)}
                  backgroundColor="transparent"
                  borderColor="$gray6"
                  borderWidth={1}
                  borderRadius="$4"
                  paddingVertical="$3"
                >
                  <Text color="$gray11" fontWeight="600">Cancel</Text>
                </Button>

                <Button
                  flex={1}
                  backgroundColor="#D62828"
                  borderRadius="$4"
                  paddingVertical="$3"
                    onPress={async () => {
                    if (authLoading) return;

                    if (!currentPassword || !newPassword || !confirmNewPassword) {
                      Alert.alert('Error', 'Please fill all fields')
                      return
                    }
                    if (newPassword !== confirmNewPassword) {
                      Alert.alert('Error', 'New passwords do not match')
                      return
                    }
                    if (!token) return Alert.alert('Error', 'No auth token found')

                    const res = await apiChangePassword(token, currentPassword, newPassword)
                    if (res.status === 'success') {
                      setCurrentPassword('')
                      setNewPassword('')
                      setConfirmNewPassword('')
                      setShowSuccess(true)
                    } else {
                      Alert.alert('Error', res.message || 'Failed to change password')
                    }
                  }}
                >
                  <Text color="white" fontWeight="600">Update Password</Text>
                </Button>
              </XStack>
                </>
              )}
            </KeyboardAvoidingView>
          </Sheet.Frame>
        </Sheet>

        {/* Delete Account Sheet */}
        <Sheet
          modal
          open={showDeleteSheet}
          onOpenChange={setShowDeleteSheet}
          snapPoints={[80]}
          dismissOnSnapToBottom
        >
          <Sheet.Overlay />
          <Sheet.Frame padding="$5" gap="$5" backgroundColor="$background">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
              style={{ flex: 1 }}
            >
              <ScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: 'center',
                  paddingBottom: 20,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Sheet.Handle backgroundColor="$gray8" />

                <YStack alignItems="center" gap="$2" marginBottom="$4">
                  <FontAwesome name="exclamation-triangle" size={32} color="#D62828" />
                  <Text fontSize="$7" fontWeight="bold" color="$color">
                    Delete Account
                  </Text>
                  <Text fontSize="$4" color="$gray11" textAlign="center">
                    This action cannot be undone. Enter your password to confirm.
                  </Text>
                </YStack>

                <XStack
                  alignItems="center"
                  backgroundColor="$gray2"
                  borderColor="$gray6"
                  borderWidth={1}
                  borderRadius="$4"
                  paddingHorizontal="$3"
                  marginBottom="$4"
                >
                  <Input
                    flex={1}
                    placeholder="Enter your password"
                    secureTextEntry={!showDeletePass}
                    value={deletePassword}
                    onChangeText={setDeletePassword}
                    borderWidth={0}
                    fontSize="$4"
                  />
                  <FontAwesome
                    name={showDeletePass ? 'eye-slash' : 'eye'}
                    size={20}
                    color="#555"
                    onPress={() => setShowDeletePass(!showDeletePass)}
                  />
                </XStack>

                <XStack gap="$3" marginTop="$3">
                  <Button
                    flex={1}
                    variant="outlined"
                    onPress={() => setShowDeleteSheet(false)}
                    backgroundColor="transparent"
                    borderColor="$gray6"
                    borderWidth={1}
                    borderRadius="$4"
                    paddingVertical="$3"
                  >
                    <Text color="$gray11" fontWeight="600">Cancel</Text>
                  </Button>

                  <Button
                    flex={1}
                    backgroundColor="#D62828"
                    borderRadius="$4"
                    paddingVertical="$3"
                  onPress={async () => {
                      if (authLoading) return;

                      if (!deletePassword) {
                        Alert.alert('Error', 'Please enter your password');
                        return;
                      }
                      if (!token) return Alert.alert('Error', 'No auth token found');
                      const res = await apiDeleteAccount(token, deletePassword);
                      if (res.status === 'success') {
                        Alert.alert('Account Deleted', res.message);
                        await removeUserToken();
                        await removeUserData();
                        setDeletePassword('');
                        setShowDeleteSheet(false);
                        // Trigger global auth check to update authentication state
                        if (global.triggerAuthCheck) {
                          global.triggerAuthCheck()
                        }
                        router.replace('/login');
                      } else {
                        Alert.alert('Error', res.message || 'Failed to delete account');
                      }
                    }}
                  >
                    <Text color="white" fontWeight="600">Delete Account</Text>
                  </Button>
                </XStack>
              </ScrollView>
            </KeyboardAvoidingView>
          </Sheet.Frame>
        </Sheet>
      </SafeAreaView>
    </>
  )
}
