import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorageShim from './asyncStorageShim';

// Use web-compatible shim for web platform
const StorageAPI = Platform.OS === 'web' ? AsyncStorageShim : AsyncStorage;

// Storage keys
const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  OFFLINE_REPORTS: 'offline_reports',
  OFFLINE_STATUS_UPDATES: 'offline_status_updates',
  NETWORK_STATUS: 'network_status',
  LAST_SYNC: 'last_sync',
  PENDING_UPLOADS: 'pending_uploads'
};

// User token management
export const getUserToken = async (): Promise<string | null> => {
  try {
    return await StorageAPI.getItem(STORAGE_KEYS.USER_TOKEN);
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
};

export const setUserToken = async (token: string): Promise<void> => {
  try {
    await StorageAPI.setItem(STORAGE_KEYS.USER_TOKEN, token);
  } catch (error) {
    console.error('Error setting user token:', error);
  }
};

export const removeUserToken = async (): Promise<void> => {
  try {
    await StorageAPI.removeItem(STORAGE_KEYS.USER_TOKEN);
  } catch (error) {
    console.error('Error removing user token:', error);
  }
};

// User data management
export const getUserData = async (): Promise<any | null> => {
  try {
    const data = await StorageAPI.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const setUserData = async (userData: any): Promise<void> => {
  try {
    await StorageAPI.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};

export const removeUserData = async (): Promise<void> => {
  try {
    await StorageAPI.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    await removeUserToken();
    await removeUserData();
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

// Offline reports queue
export const getOfflineReports = async (): Promise<any[]> => {
  try {
    const reports = await StorageAPI.getItem(STORAGE_KEYS.OFFLINE_REPORTS);
    return reports ? JSON.parse(reports) : [];
  } catch (error) {
    console.error('Error getting offline reports:', error);
    return [];
  }
};

export const addOfflineReport = async (report: any): Promise<void> => {
  try {
    const reports = await getOfflineReports();
    const reportWithId = {
      ...report,
      offlineId: Date.now().toString(),
      createdAt: new Date().toISOString(),
      synced: false
    };
    reports.push(reportWithId);
    await StorageAPI.setItem(STORAGE_KEYS.OFFLINE_REPORTS, JSON.stringify(reports));
  } catch (error) {
    console.error('Error adding offline report:', error);
  }
};

export const removeOfflineReport = async (offlineId: string): Promise<void> => {
  try {
    const reports = await getOfflineReports();
    const filteredReports = reports.filter(r => r.offlineId !== offlineId);
    await StorageAPI.setItem(STORAGE_KEYS.OFFLINE_REPORTS, JSON.stringify(filteredReports));
  } catch (error) {
    console.error('Error removing offline report:', error);
  }
};

export const updateOfflineReportStatus = async (offlineId: string, synced: boolean, serverId?: number): Promise<void> => {
  try {
    const reports = await getOfflineReports();
    const reportIndex = reports.findIndex(r => r.offlineId === offlineId);
    if (reportIndex !== -1) {
      reports[reportIndex].synced = synced;
      if (serverId) {
        reports[reportIndex].serverId = serverId;
      }
      await StorageAPI.setItem(STORAGE_KEYS.OFFLINE_REPORTS, JSON.stringify(reports));
    }
  } catch (error) {
    console.error('Error updating offline report status:', error);
  }
};

// Offline status updates queue
export const getOfflineStatusUpdates = async (): Promise<any[]> => {
  try {
    const updates = await StorageAPI.getItem(STORAGE_KEYS.OFFLINE_STATUS_UPDATES);
    return updates ? JSON.parse(updates) : [];
  } catch (error) {
    console.error('Error getting offline status updates:', error);
    return [];
  }
};

export const addOfflineStatusUpdate = async (update: any): Promise<void> => {
  try {
    const updates = await getOfflineStatusUpdates();
    const updateWithId = {
      ...update,
      offlineId: Date.now().toString(),
      createdAt: new Date().toISOString(),
      synced: false
    };
    updates.push(updateWithId);
    await StorageAPI.setItem(STORAGE_KEYS.OFFLINE_STATUS_UPDATES, JSON.stringify(updates));
  } catch (error) {
    console.error('Error adding offline status update:', error);
  }
};

export const removeOfflineStatusUpdate = async (offlineId: string): Promise<void> => {
  try {
    const updates = await getOfflineStatusUpdates();
    const filteredUpdates = updates.filter(u => u.offlineId !== offlineId);
    await StorageAPI.setItem(STORAGE_KEYS.OFFLINE_STATUS_UPDATES, JSON.stringify(filteredUpdates));
  } catch (error) {
    console.error('Error removing offline status update:', error);
  }
};

// Network status management
export const getNetworkStatus = async (): Promise<boolean> => {
  try {
    const status = await StorageAPI.getItem(STORAGE_KEYS.NETWORK_STATUS);
    return status ? JSON.parse(status) : true; // Default to online
  } catch (error) {
    console.error('Error getting network status:', error);
    return true;
  }
};

export const setNetworkStatus = async (isOnline: boolean): Promise<void> => {
  try {
    await StorageAPI.setItem(STORAGE_KEYS.NETWORK_STATUS, JSON.stringify(isOnline));
  } catch (error) {
    console.error('Error setting network status:', error);
  }
};

// Sync timestamp management
export const getLastSyncTime = async (): Promise<string | null> => {
  try {
    return await StorageAPI.getItem(STORAGE_KEYS.LAST_SYNC);
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
};

export const setLastSyncTime = async (timestamp: string): Promise<void> => {
  try {
    await StorageAPI.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  } catch (error) {
    console.error('Error setting last sync time:', error);
  }
};

// Pending uploads management
export const getPendingUploads = async (): Promise<any[]> => {
  try {
    const uploads = await StorageAPI.getItem(STORAGE_KEYS.PENDING_UPLOADS);
    return uploads ? JSON.parse(uploads) : [];
  } catch (error) {
    console.error('Error getting pending uploads:', error);
    return [];
  }
};

export const addPendingUpload = async (upload: any): Promise<void> => {
  try {
    const uploads = await getPendingUploads();
    uploads.push({
      ...upload,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    });
    await StorageAPI.setItem(STORAGE_KEYS.PENDING_UPLOADS, JSON.stringify(uploads));
  } catch (error) {
    console.error('Error adding pending upload:', error);
  }
};

export const removePendingUpload = async (uploadId: string): Promise<void> => {
  try {
    const uploads = await getPendingUploads();
    const filteredUploads = uploads.filter(u => u.id !== uploadId);
    await StorageAPI.setItem(STORAGE_KEYS.PENDING_UPLOADS, JSON.stringify(filteredUploads));
  } catch (error) {
    console.error('Error removing pending upload:', error);
  }
};

// Clear all data (for logout)
export const clearAllData = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await StorageAPI.multiRemove(keys);
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};

// Get storage info
export const getStorageInfo = async () => {
  try {
    const [
      offlineReports,
      offlineStatusUpdates,
      pendingUploads,
      lastSync,
      networkStatus
    ] = await Promise.all([
      getOfflineReports(),
      getOfflineStatusUpdates(),
      getPendingUploads(),
      getLastSyncTime(),
      getNetworkStatus()
    ]);

    return {
      offlineReportsCount: offlineReports.length,
      offlineStatusUpdatesCount: offlineStatusUpdates.length,
      pendingUploadsCount: pendingUploads.length,
      lastSync,
      isOnline: networkStatus
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
};
