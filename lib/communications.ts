import Communications from 'react-native-communications';
import { Alert, Platform } from 'react-native';

// Emergency contact numbers for Philippines
export const EMERGENCY_CONTACTS = {
  BFP: '160', // Bureau of Fire Protection
  POLICE: '911',
  MEDICAL: '911',
  FIRE_DEPARTMENT: '160'
};

// Emergency message templates
export const EMERGENCY_MESSAGES = {
  FIRE_HAZARD: "🚨 FIRE HAZARD REPORT 🚨\n\nI have reported a fire hazard in my area. Please respond immediately!\n\nLocation: [LOCATION]\nDescription: [DESCRIPTION]\n\nThis is an automated message from HazardTrack app.",
  GENERAL_EMERGENCY: "🚨 EMERGENCY ALERT 🚨\n\nI need immediate assistance in my area.\n\nLocation: [LOCATION]\n\nThis is an automated message from HazardTrack app."
};

/**
 * Make a phone call to emergency services
 * @param service - The emergency service to call ('BFP', 'POLICE', 'MEDICAL', 'FIRE_DEPARTMENT')
 */
export const callEmergencyService = (service: keyof typeof EMERGENCY_CONTACTS) => {
  const phoneNumber = EMERGENCY_CONTACTS[service];

  Alert.alert(
    `Call ${service}`,
    `Are you sure you want to call ${service} (${phoneNumber})?`,
    [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Call',
        onPress: () => {
          try {
            Communications.phonecall(phoneNumber, true);
          } catch (error) {
            Alert.alert('Error', 'Unable to make phone call. Please dial manually.');
          }
        }
      }
    ]
  );
};

/**
 * Send SMS to emergency services
 * @param service - The emergency service to message
 * @param location - Location string
 * @param description - Optional description of the hazard
 */
export const sendEmergencySMS = (
  service: keyof typeof EMERGENCY_CONTACTS,
  location: string,
  description?: string
) => {
  const phoneNumber = EMERGENCY_CONTACTS[service];
  const message = description
    ? EMERGENCY_MESSAGES.FIRE_HAZARD
        .replace('[LOCATION]', location)
        .replace('[DESCRIPTION]', description)
    : EMERGENCY_MESSAGES.GENERAL_EMERGENCY
        .replace('[LOCATION]', location);

  Alert.alert(
    `Send SMS to ${service}`,
    `Send emergency SMS to ${service} (${phoneNumber})?`,
    [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Send SMS',
        onPress: () => {
          try {
            Communications.text(phoneNumber, message);
          } catch (error) {
            Alert.alert('Error', 'Unable to send SMS. Please send manually.');
          }
        }
      }
    ]
  );
};

/**
 * Send WhatsApp message to emergency services
 * @param service - The emergency service to message
 * @param location - Location string
 * @param description - Optional description of the hazard
 */
export const sendEmergencyWhatsApp = (
  service: keyof typeof EMERGENCY_CONTACTS,
  location: string,
  description?: string
) => {
  const phoneNumber = EMERGENCY_CONTACTS[service];
  const message = description
    ? EMERGENCY_MESSAGES.FIRE_HAZARD
        .replace('[LOCATION]', location)
        .replace('[DESCRIPTION]', description)
    : EMERGENCY_MESSAGES.GENERAL_EMERGENCY
        .replace('[LOCATION]', location);

  Alert.alert(
    `Send WhatsApp to ${service}`,
    `Send emergency WhatsApp message to ${service}?`,
    [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Send WhatsApp',
        onPress: () => {
          try {
            // WhatsApp URL scheme for mobile
            const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
            Communications.web(whatsappUrl);
          } catch (error) {
            Alert.alert('Error', 'WhatsApp not available. Please send SMS instead.');
          }
        }
      }
    ]
  );
};

/**
 * Quick emergency call - calls BFP directly
 */
export const quickEmergencyCall = () => {
  callEmergencyService('BFP');
};

/**
 * Quick emergency SMS - sends SMS to BFP
 */
export const quickEmergencySMS = (location: string, description?: string) => {
  sendEmergencySMS('BFP', location, description);
};

/**
 * Quick emergency WhatsApp - sends WhatsApp to BFP
 */
export const quickEmergencyWhatsApp = (location: string, description?: string) => {
  sendEmergencyWhatsApp('BFP', location, description);
};

/**
 * Show emergency contact options
 * @param location - Current location
 * @param description - Optional hazard description
 */
export const showEmergencyOptions = (location: string, description?: string) => {
  Alert.alert(
    '🚨 Emergency Contact',
    'Choose how to contact emergency services:',
    [
      {
        text: '📞 Call BFP',
        onPress: () => callEmergencyService('BFP')
      },
      {
        text: '💬 SMS BFP',
        onPress: () => sendEmergencySMS('BFP', location, description)
      },
      {
        text: '📱 WhatsApp BFP',
        onPress: () => sendEmergencyWhatsApp('BFP', location, description)
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ]
  );
};

/**
 * Show contact options for a specific phone number
 * @param phoneNumber - The phone number to contact
 */
export const showContactOptions = (phoneNumber: string) => {
  if (!phoneNumber) {
    Alert.alert('Contact Error', 'Reporter phone number not available.');
    return;
  }

  Alert.alert(
    'Contact Reporter',
    `Choose an action for ${phoneNumber}`,
    [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Call',
        onPress: () => {
          try {
            Communications.phonecall(phoneNumber, true);
          } catch (error) {
            Alert.alert('Error', 'Unable to make phone call. Please dial manually.');
          }
        }
      },
      {
        text: 'Send SMS',
        onPress: () => {
          try {
            Communications.text(phoneNumber);
          } catch (error) {
            Alert.alert('Error', 'Unable to send SMS. Please send manually.');
          }
        }
      }
    ]
  );
};
