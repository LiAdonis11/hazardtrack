import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  Image,
  TouchableOpacity,
  TextInput,
  View,
  ScrollView,
  Platform,
  StyleSheet,
  TextInput as RNTextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'tamagui';
import { API_URL } from '../lib/config';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const PasswordInput = React.forwardRef<RNTextInput, any>(
  ({ value, onChangeText, placeholder, accessibilityLabel, onSubmitEditing }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
      <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color="#666"
          style={{ marginRight: 10 }}
        />
        <TextInput
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          style={styles.inputField}
          placeholderTextColor="#999"
          accessibilityLabel={accessibilityLabel}
          returnKeyType="next"
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.showHideButton}
        >
          <Text style={{ color: '#007BFF', fontWeight: '600', fontSize: 13 }}>
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
);

const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <Text style={styles.errorText} accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
};

export default function RegisterScreen() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);
  const confirmPasswordRef = useRef<RNTextInput>(null);
  const phoneRef = useRef<RNTextInput>(null);
  const addressRef = useRef<RNTextInput>(null);

  const router = useRouter();

  useEffect(() => {
    setPasswordRules({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    })
  }, [password])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullname) newErrors.fullname = 'Full Name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

    if (!password) newErrors.password = 'Password is required';
    else if (!passwordRules.length || !passwordRules.uppercase || !passwordRules.lowercase || !passwordRules.number) {
      newErrors.password = 'Password does not meet requirements';
    }

    if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!phone) newErrors.phone = 'Phone number is required';
    else if (phone.length < 10 || phone.length > 11) newErrors.phone = 'Phone number must be 10-11 digits';
    else if (!/^09\d{8,9}$/.test(phone)) newErrors.phone = 'Phone number must start with 09 and be 10-11 digits';
    if (!address) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please correct the errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      // Add timeout for registration API call
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout for registration

      const apiUrl = API_URL;
      const response = await fetch(`${apiUrl}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname,
          email,
          password,
          phone,
          address,
          role: 'resident',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId)
      const result = await response.json();

      if (result.status === 'success') {
        setSuccessMessage(
          `Welcome ${fullname}! Your account has been created successfully.`
        );
        setRegistrationSuccess(true);
        setTimeout(() => router.replace('/login' as any), 3000);
      } else {
        Alert.alert('Registration Failed', result.message || 'Please try again.');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('Registration timed out')
        Alert.alert('Timeout', 'Registration is taking longer than expected. Please try again.');
      } else {
        Alert.alert('Error', 'Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={registrationSuccess}
        onRequestClose={() => router.replace('/login' as any)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successContainer}>
            <Text style={styles.successCheck}>✓</Text>
            <Text style={styles.successTitle}>Registration Successful!</Text>
            <Text style={styles.successMessage}>{successMessage}</Text>
            <ActivityIndicator size="large" color="#E53935" />
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={24} color="#E53935" />
          </TouchableOpacity>
          <View style={{ marginLeft: 5 }}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Register as a resident</Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Join HazardTrack</Text>
          <Text style={styles.cardSubtitle}>
            Help keep our community safe by reporting fire hazards
          </Text>

          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={18} color="#666" style={styles.icon} />
            <TextInput
              style={styles.inputField}
              placeholder="Enter your full name"
              value={fullname}
              onChangeText={setFullname}
              onSubmitEditing={() => emailRef.current?.focus()}
              placeholderTextColor="#999"
            />
          </View>
          <FormError message={errors.fullname} />

          {/* Email */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={18} color="#666" style={styles.icon} />
            <TextInput
              ref={emailRef}
              style={styles.inputField}
              placeholder="Enter your email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#999"
            />
          </View>
          <FormError message={errors.email} />

          {/* Contact Number */}
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={18} color="#666" style={styles.icon} />
            <TextInput
              ref={phoneRef}
              style={styles.inputField}
              placeholder="+63 912 345 6789"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>
          <Text style={styles.helperText}>Required for BFP callback verification</Text>
          <FormError message={errors.phone} />

          {/* Address */}
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={18} color="#666" style={styles.icon} />
            <TextInput
              ref={addressRef}
              style={styles.inputField}
              placeholder="Complete address (Barangay, Municipality, Province)"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#999"
            />
          </View>
          <FormError message={errors.address} />

          {/* Password */}
          <PasswordInput
            ref={passwordRef}
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
          <FormError message={errors.password} />

          {/* Password Rules */}
          <View style={styles.passwordRulesContainer}>
            <Text style={styles.passwordRulesTitle}>Password Requirements:</Text>
            <View style={styles.passwordRule}>
              <FontAwesome
                name={passwordRules.length ? 'check-circle' : 'times-circle'}
                size={14}
                color={passwordRules.length ? '#28A745' : '#DC3545'}
              />
              <Text style={[styles.passwordRuleText, { color: passwordRules.length ? '#28A745' : '#DC3545' }]}>
                At least 6 characters
              </Text>
            </View>
            <View style={styles.passwordRule}>
              <FontAwesome
                name={passwordRules.uppercase ? 'check-circle' : 'times-circle'}
                size={14}
                color={passwordRules.uppercase ? '#28A745' : '#DC3545'}
              />
              <Text style={[styles.passwordRuleText, { color: passwordRules.uppercase ? '#28A745' : '#DC3545' }]}>
                At least one uppercase letter
              </Text>
            </View>
            <View style={styles.passwordRule}>
              <FontAwesome
                name={passwordRules.lowercase ? 'check-circle' : 'times-circle'}
                size={14}
                color={passwordRules.lowercase ? '#28A745' : '#DC3545'}
              />
              <Text style={[styles.passwordRuleText, { color: passwordRules.lowercase ? '#28A745' : '#DC3545' }]}>
                At least one lowercase letter
              </Text>
            </View>
            <View style={styles.passwordRule}>
              <FontAwesome
                name={passwordRules.number ? 'check-circle' : 'times-circle'}
                size={14}
                color={passwordRules.number ? '#28A745' : '#DC3545'}
              />
              <Text style={[styles.passwordRuleText, { color: passwordRules.number ? '#28A745' : '#DC3545' }]}>
                At least one number
              </Text>
            </View>
          </View>

          {/* Confirm Password */}
          <PasswordInput
            ref={confirmPasswordRef}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onSubmitEditing={handleRegister}
          />
          <FormError message={errors.confirmPassword} />

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>Important: </Text>
              Your contact information will only be used by BFP personnel for report verification and emergency communication.
            </Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={[styles.registerButton, { opacity: loading ? 0.6 : 1 }]}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <Text
            style={styles.loginText}
            onPress={() => router.push('/login')}
          >
            Already have an account? <Text style={{ color: '#E53935' }}>Login here</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#E53935',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#777',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputFocused: {
    borderColor: '#E53935',
  },
  inputField: {
    flex: 1,
    color: '#333',
    fontSize: 15,
  },
  icon: {
    marginRight: 8,
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  helperText: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#333',
  },
  registerButton: {
    backgroundColor: '#E53935',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 15,
    color: '#444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
  },
  successCheck: {
    fontSize: 48,
    color: '#E53935',
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  successMessage: {
    color: '#444',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
  showHideButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  passwordRulesContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  passwordRulesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  passwordRule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  passwordRuleText: {
    fontSize: 13,
    marginLeft: 8,
  },
});
