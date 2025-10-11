import { io, Socket } from 'socket.io-client';
import { getUserToken } from './storage';
import { API_URL } from './config';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  // Event listeners
  private listeners: { [event: string]: ((...args: any[]) => void)[] } = {};

  constructor() {
    this.setupEventListeners();
  }

  // Initialize WebSocket connection
  async connect(userType: 'resident' | 'bfp_personnel' | 'admin' = 'resident'): Promise<boolean> {
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      return true;
    }

    this.isConnecting = true;

    try {
      const token = await getUserToken();
      if (!token) {
        console.error('No auth token available for WebSocket connection');
        this.isConnecting = false;
        return false;
      }

      // Connect to WebSocket server
      // For development, use localhost. For production, use the API_URL
      const isDevelopment = __DEV__; // React Native __DEV__ flag
      const websocketUrl = isDevelopment
        ? 'http://localhost:3001'
        : `${API_URL.replace('/api', '').replace('http', 'ws')}:3001`;

      this.socket = io(websocketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      return new Promise((resolve) => {
        if (!this.socket) {
          this.isConnecting = false;
          resolve(false);
          return;
        }

        // Connection successful
        this.socket.on('connect', () => {
          console.log('🔌 WebSocket connected:', this.socket?.id);
          this.reconnectAttempts = 0;

          // Authenticate with server
          this.socket?.emit('authenticate', { token, userType });

          this.isConnecting = false;
          resolve(true);
        });

        // Authentication successful
        this.socket.on('authenticated', (data: any) => {
          console.log('✅ WebSocket authenticated:', data);
          this.emit('authenticated', data);
        });

        // Authentication failed
        this.socket.on('auth_error', (error: any) => {
          console.error('❌ WebSocket auth error:', error);
          this.emit('auth_error', error);
          this.isConnecting = false;
          resolve(false);
        });

        // Connection error
        this.socket.on('connect_error', (error: any) => {
          console.error('🔌 WebSocket connection error:', error);
          this.handleReconnect();
          this.isConnecting = false;
          resolve(false);
        });

        // Disconnected
        this.socket.on('disconnect', (reason: any) => {
          console.log('🔌 WebSocket disconnected:', reason);
          this.emit('disconnected', { reason });

          if (reason === 'io server disconnect') {
            // Server disconnected us, try to reconnect
            this.handleReconnect();
          }
        });
      });

    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
      this.isConnecting = false;
      return false;
    }
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...');
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }

  // Handle reconnection logic
  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Send report creation event
  sendReport(reportData: any) {
    if (this.socket?.connected) {
      console.log('📤 Sending report via WebSocket:', reportData.id);
      this.socket.emit('report_created', reportData);
    } else {
      console.warn('WebSocket not connected, cannot send report');
    }
  }

  // Send status update event
  sendStatusUpdate(reportId: number, newStatus: string, updatedBy: number) {
    if (this.socket?.connected) {
      console.log(`📊 Sending status update: Report ${reportId} -> ${newStatus}`);
      this.socket.emit('status_updated', { reportId, newStatus, updatedBy });
    } else {
      console.warn('WebSocket not connected, cannot send status update');
    }
  }

  // Send emergency alert
  sendEmergencyAlert(alertData: any) {
    if (this.socket?.connected) {
      console.log('🚨 Sending emergency alert via WebSocket');
      this.socket.emit('emergency_alert', alertData);
    } else {
      console.warn('WebSocket not connected, cannot send emergency alert');
    }
  }

  // Send location update
  sendLocationUpdate(location: { latitude: number; longitude: number }) {
    if (this.socket?.connected) {
      this.socket.emit('location_update', location);
    }
  }

  // Typing indicators
  startTyping(username: string, room?: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { username, room });
    }
  }

  stopTyping(room?: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { room });
    }
  }

  // Setup default event listeners
  private setupEventListeners() {
    // These will be set up when socket connects
  }

  // Add event listener
  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // If socket is already connected, attach the listener
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.listeners[event] = this.listeners[event]?.filter(cb => cb !== callback) || [];
    } else {
      delete this.listeners[event];
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Emit event to listeners
  private emit(event: string, data?: any) {
    const callbacks = this.listeners[event] || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} callback:`, error);
      }
    });
  }

  // Get connection status
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get connection info
  get connectionInfo() {
    return {
      connected: this.isConnected,
      id: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
export { WebSocketService };
