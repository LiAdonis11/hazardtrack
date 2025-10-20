import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';

const BackupRestore = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoring, setRestoring] = useState(false);
  // Removed unused selectedBackup state

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/get_backups.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setBackups(data.data.backups);
        }
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreatingBackup(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/create_backup.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'full',
          includeFiles: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          alert('Backup created successfully!');
          fetchBackups(); // Refresh the list
        } else {
          alert('Failed to create backup: ' + data.message);
        }
      } else {
        alert('Failed to create backup. Please try again.');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Failed to create backup. Please try again.');
    } finally {
      setCreatingBackup(false);
    }
  };

  const restoreBackup = async (backupId) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      return;
    }

    setRestoring(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/restore_backup.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          backupId: backupId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          alert('Backup restored successfully! The system will reload.');
          window.location.reload();
        } else {
          alert('Failed to restore backup: ' + data.message);
        }
      } else {
        alert('Failed to restore backup. Please try again.');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Failed to restore backup. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const downloadBackup = async (backupId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/download_backup.php?backupId=${backupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hazardtrack_backup_${backupId}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download backup. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading backup:', error);
      alert('Failed to download backup. Please try again.');
    }
  };

  const deleteBackup = async (backupId) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/delete_backup.php`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          backupId: backupId
        })
      });

      if (response.ok) {
        alert('Backup deleted successfully!');
        fetchBackups(); // Refresh the list
      } else {
        alert('Failed to delete backup. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      alert('Failed to delete backup. Please try again.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="backup-restore">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Backup & Restore</h1>
        <p className="text-gray-600">Manage system backups and data restoration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Backup */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Backup</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Full System Backup</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Creates a complete backup of all data including database, files, and configurations.
                </p>
                <button
                  onClick={createBackup}
                  disabled={creatingBackup}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {creatingBackup ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">💾</span>
                      Create Backup
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Backup Information</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Database tables and data</li>
                  <li>• Uploaded files and images</li>
                  <li>• System configurations</li>
                  <li>• User accounts and permissions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Backup List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Backups</h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading backups...</p>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-600">No backups found</p>
                <p className="text-sm text-gray-500 mt-2">Create your first backup to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">📦</div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Backup {new Date(backup.created_at).toLocaleDateString()}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Created at {new Date(backup.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>Size: {formatFileSize(backup.size)}</span>
                          <span>Type: {backup.type}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            backup.status === 'completed' ? 'bg-green-100 text-green-800' :
                            backup.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {backup.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => downloadBackup(backup.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                          title="Download backup"
                        >
                          📥
                        </button>
                        <button
                          onClick={() => restoreBackup(backup.id)}
                          disabled={restoring}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                          title="Restore backup"
                        >
                          {restoring ? '...' : '🔄'}
                        </button>
                        <button
                          onClick={() => deleteBackup(backup.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                          title="Delete backup"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Health & Maintenance */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Storage Usage</span>
              <span className="text-gray-900">2.3 GB / 10 GB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Backup</span>
              <span className="text-gray-900">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Uptime</span>
              <span className="text-gray-900">99.9%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Maintenance Tasks</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Clean Old Logs</h3>
                  <p className="text-sm text-gray-600">Remove log files older than 30 days</p>
                </div>
                <span className="text-blue-600">→</span>
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Optimize Database</h3>
                  <p className="text-sm text-gray-600">Defragment and optimize database tables</p>
                </div>
                <span className="text-blue-600">→</span>
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Clear Cache</h3>
                  <p className="text-sm text-gray-600">Clear system cache and temporary files</p>
                </div>
                <span className="text-blue-600">→</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;
