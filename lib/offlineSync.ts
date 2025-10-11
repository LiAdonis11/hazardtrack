import {
  getOfflineReports,
  removeOfflineReport,
  updateOfflineReportStatus,
  getOfflineStatusUpdates,
  removeOfflineStatusUpdate,
  setNetworkStatus,
  getNetworkStatus,
  setLastSyncTime,
  getPendingUploads,
  removePendingUpload,
  getUserToken
} from './storage';
import { apiSubmitReport } from './api';
import { apiUpdateReportStatus } from './api_update_status';
import websocketService from './websocket';

class OfflineSyncService {
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private listeners: ((status: boolean) => void)[] = [];
  private networkCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initializeNetworkListener();
  }

  // Initialize network state listener (simplified version)
  private initializeNetworkListener() {
    // Simple network check using fetch to local API
    const checkNetworkStatus = async () => {
      try {
        // Use local API endpoint for network check to avoid CORS issues
        const response = await fetch('http://localhost:80/hazardTrackV2/api/db.php', {
          method: 'HEAD',
          timeout: 5000
        } as any);
        const wasOffline = !this.isOnline;
        this.isOnline = response.ok;

        // Update stored network status
        await setNetworkStatus(this.isOnline);

        // Notify listeners of network status change
        this.listeners.forEach(listener => listener(this.isOnline));

        // If we just came back online, start sync
        if (wasOffline && this.isOnline) {
          console.log('📱 Device came back online, starting sync...');
          this.syncOfflineData();
        }
      } catch (error) {
        const wasOffline = !this.isOnline;
        this.isOnline = false;
        await setNetworkStatus(false);

        if (wasOffline) {
          this.listeners.forEach(listener => listener(false));
        }
      }
    };

    // Check network status every 30 seconds
    this.networkCheckInterval = setInterval(checkNetworkStatus, 30000);

    // Initial check
    checkNetworkStatus();
  }

  // Add network status listener
  onNetworkStatusChange(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Get current network status
  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  // Sync offline data when coming back online
  async syncOfflineData(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Starting offline data synchronization...');

    try {
      // Sync offline reports
      await this.syncOfflineReports();

      // Sync offline status updates
      await this.syncOfflineStatusUpdates();

      // Sync pending uploads
      await this.syncPendingUploads();

      // Update last sync time
      await setLastSyncTime(new Date().toISOString());

      console.log('✅ Offline data synchronization completed');

    } catch (error) {
      console.error('❌ Error during offline sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync offline reports
  private async syncOfflineReports(): Promise<void> {
    const offlineReports = await getOfflineReports();

    if (offlineReports.length === 0) {
      return;
    }

    console.log(`📤 Syncing ${offlineReports.length} offline reports...`);

    for (const report of offlineReports) {
      try {
        // Get user token for API call
        const token = await this.getUserToken();
        if (!token) {
          console.error('No auth token available for report sync');
          continue;
        }

        // Prepare report data for API submission
        const reportData = {
          token: token,
          title: report.title,
          description: report.description,
          category_id: report.category_id,
          location_address: report.location_address,
          latitude: report.latitude,
          longitude: report.longitude,
          image: report.image // This should be handled properly for offline images
        };

        // Submit report via API
        const result = await apiSubmitReport(reportData);

        if (result.status === 'success') {
          // Mark as synced and store server ID
          await updateOfflineReportStatus(report.offlineId, true, result.report_id);

          // Send real-time notification if WebSocket is connected
          if (websocketService.isConnected) {
            websocketService.sendReport({
              id: result.report_id,
              title: report.title,
              category: report.category_id,
              location: report.location_address,
              latitude: report.latitude,
              longitude: report.longitude,
              timestamp: report.createdAt
            });
          }

          // Remove from offline storage
          await removeOfflineReport(report.offlineId);

          console.log(`✅ Synced offline report: ${report.title}`);
        } else {
          console.error(`❌ Failed to sync report: ${report.title}`, result.message);
        }

      } catch (error) {
        console.error(`❌ Error syncing report ${report.offlineId}:`, error);
      }
    }
  }

  // Sync offline status updates
  private async syncOfflineStatusUpdates(): Promise<void> {
    const offlineUpdates = await getOfflineStatusUpdates();

    if (offlineUpdates.length === 0) {
      return;
    }

    console.log(`📊 Syncing ${offlineUpdates.length} offline status updates...`);

    for (const update of offlineUpdates) {
      try {
        // Get user token for API call
        const token = await this.getUserToken();
        if (!token) {
          console.error('No auth token available for status update sync');
          continue;
        }

        // Submit status update via API
        const result = await apiUpdateReportStatus(
          token,
          update.reportId,
          update.status,
          update.adminNotes
        );

        if (result.status === 'success') {
          // Send real-time notification if WebSocket is connected
          if (websocketService.isConnected) {
            websocketService.sendStatusUpdate(update.reportId, update.status, update.updatedBy);
          }

          // Remove from offline storage
          await removeOfflineStatusUpdate(update.offlineId);

          console.log(`✅ Synced status update for report ${update.reportId}`);
        } else {
          console.error(`❌ Failed to sync status update for report ${update.reportId}`, result.message);
        }

      } catch (error) {
        console.error(`❌ Error syncing status update ${update.offlineId}:`, error);
      }
    }
  }

  // Sync pending uploads (images, attachments)
  private async syncPendingUploads(): Promise<void> {
    const pendingUploads = await getPendingUploads();

    if (pendingUploads.length === 0) {
      return;
    }

    console.log(`📎 Syncing ${pendingUploads.length} pending uploads...`);

    // This would handle image uploads and other file attachments
    // Implementation depends on specific upload requirements
    for (const upload of pendingUploads) {
      try {
        // TODO: Implement file upload logic
        console.log(`📎 Processing upload: ${upload.fileName}`);

        // After successful upload, remove from pending
        await removePendingUpload(upload.id);

      } catch (error) {
        console.error(`❌ Error syncing upload ${upload.id}:`, error);
      }
    }
  }

  // Queue report for offline submission
  async queueOfflineReport(reportData: any): Promise<void> {
    const { addOfflineReport } = await import('./storage');
    await addOfflineReport(reportData);

    console.log('📱 Report queued for offline submission');
  }

  // Queue status update for offline submission
  async queueOfflineStatusUpdate(updateData: any): Promise<void> {
    const { addOfflineStatusUpdate } = await import('./storage');
    await addOfflineStatusUpdate(updateData);

    console.log('📊 Status update queued for offline submission');
  }

  // Get sync status
  async getSyncStatus() {
    const [
      offlineReports,
      offlineUpdates,
      pendingUploads,
      lastSync,
      networkStatus
    ] = await Promise.all([
      getOfflineReports(),
      getOfflineStatusUpdates(),
      getPendingUploads(),
      (await import('./storage')).getLastSyncTime(),
      getNetworkStatus()
    ]);

    return {
      isOnline: networkStatus,
      syncInProgress: this.syncInProgress,
      offlineReportsCount: offlineReports.length,
      offlineStatusUpdatesCount: offlineUpdates.length,
      pendingUploadsCount: pendingUploads.length,
      lastSyncTime: lastSync
    };
  }

  // Force sync (manual trigger)
  async forceSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    await this.syncOfflineData();
  }

  // Helper method to get user token
  private async getUserToken(): Promise<string | null> {
    const { getUserToken } = await import('./storage');
    return await getUserToken();
  }

  // Cleanup
  destroy() {
    this.listeners = [];
  }
}

// Create singleton instance
const offlineSyncService = new OfflineSyncService();

export default offlineSyncService;
export { OfflineSyncService };
