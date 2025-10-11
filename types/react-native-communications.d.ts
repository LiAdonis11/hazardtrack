declare module 'react-native-communications' {
  interface CommunicationsStatic {
    phonecall(phoneNumber: string, prompt?: boolean): void;
    email(to: string[], cc?: string[], bcc?: string[], subject?: string, body?: string): void;
    text(phoneNumber?: string, body?: string): void;
    textWithoutEncoding(phoneNumber?: string, body?: string): void;
    web(address: string): void;
  }

  const Communications: CommunicationsStatic;
  export default Communications;
}
