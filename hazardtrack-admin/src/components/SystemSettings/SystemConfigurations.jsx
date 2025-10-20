import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../config';

const SystemConfigurations = () => {
  const [settings, setSettings] = useState({
    hazardCategories: [],
    priorityLevels: [],
    notificationRules: [],
    systemLimits: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/get_system_settings.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setSettings(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/update_system_settings.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addHazardCategory = () => {
    setSettings({
      ...settings,
      hazardCategories: [...settings.hazardCategories, { id: Date.now(), name: '', description: '', active: true }]
    });
  };

  const removeHazardCategory = (id) => {
    setSettings({
      ...settings,
      hazardCategories: settings.hazardCategories.filter(cat => cat.id !== id)
    });
  };

  const updateHazardCategory = (id, field, value) => {
    setSettings({
      ...settings,
      hazardCategories: settings.hazardCategories.map(cat =>
        cat.id === id ? { ...cat, [field]: value } : cat
      )
    });
  };

  const addNotificationRule = () => {
    setSettings({
      ...settings,
      notificationRules: [...settings.notificationRules, {
        id: Date.now(),
        trigger: '',
        recipients: [],
        message: '',
        active: true
      }]
    });
  };

  const removeNotificationRule = (id) => {
    setSettings({
      ...settings,
      notificationRules: settings.notificationRules.filter(rule => rule.id !== id)
    });
  };

  const updateNotificationRule = (id, field, value) => {
    setSettings({
      ...settings,
      notificationRules: settings.notificationRules.map(rule =>
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="system-configurations">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Configurations</h1>
            <p className="text-gray-600">Configure hazard categories, priorities, and system rules</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <span className="mr-2">💾</span>
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Hazard Categories */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Hazard Categories</h2>
              <p className="text-gray-600">Define types of hazards that can be reported</p>
            </div>
            <button
              onClick={addHazardCategory}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <span className="mr-2">+</span>
              Add Category
            </button>
          </div>

          <div className="space-y-4">
            {settings.hazardCategories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateHazardCategory(category.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Fire, Flood"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={category.description}
                      onChange={(e) => updateHazardCategory(category.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of the hazard type"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={category.active}
                        onChange={(e) => updateHazardCategory(category.id, 'active', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                    <button
                      onClick={() => removeHazardCategory(category.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remove category"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Levels */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Priority Levels</h2>
            <p className="text-gray-600">Configure priority levels for hazard reports</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings.priorityLevels.map((priority, index) => (
              <div key={`priority-${priority.name}-${index}`} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 capitalize">{priority.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    priority.name === 'emergency' ? 'bg-red-100 text-red-800' :
                    priority.name === 'high' ? 'bg-orange-100 text-orange-800' :
                    priority.name === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Level {priority.level}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600">Response Time (hours)</label>
                    <input
                      type="number"
                      value={priority.responseTime}
                      onChange={(e) => {
                        const newPriorities = [...settings.priorityLevels];
                        newPriorities[index].responseTime = parseInt(e.target.value);
                        setSettings({...settings, priorityLevels: newPriorities});
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Description</label>
                    <textarea
                      value={priority.description}
                      onChange={(e) => {
                        const newPriorities = [...settings.priorityLevels];
                        newPriorities[index].description = e.target.value;
                        setSettings({...settings, priorityLevels: newPriorities});
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Rules */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notification Rules</h2>
              <p className="text-gray-600">Configure automated notifications for different events</p>
            </div>
            <button
              onClick={addNotificationRule}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <span className="mr-2">+</span>
              Add Rule
            </button>
          </div>

          <div className="space-y-4">
            {settings.notificationRules.map((rule) => (
              <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Event</label>
                    <select
                      value={rule.trigger}
                      onChange={(e) => updateNotificationRule(rule.id, 'trigger', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select trigger</option>
                      <option value="new_report">New Report</option>
                      <option value="emergency_report">Emergency Report</option>
                      <option value="unassigned_report">Unassigned Report</option>
                      <option value="overdue_report">Overdue Report</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                    <input
                      type="text"
                      value={rule.recipients.join(', ')}
                      onChange={(e) => updateNotificationRule(rule.id, 'recipients', e.target.value.split(',').map(r => r.trim()))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email1@example.com, email2@example.com"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <input
                      type="text"
                      value={rule.message}
                      onChange={(e) => updateNotificationRule(rule.id, 'message', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Notification message"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rule.active}
                        onChange={(e) => updateNotificationRule(rule.id, 'active', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                    <button
                      onClick={() => removeNotificationRule(rule.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remove rule"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Limits */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">System Limits</h2>
            <p className="text-gray-600">Configure system-wide limits and thresholds</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max File Upload Size (MB)</label>
              <input
                type="number"
                value={settings.systemLimits.maxFileSize || 10}
                onChange={(e) => setSettings({
                  ...settings,
                  systemLimits: {...settings.systemLimits, maxFileSize: parseInt(e.target.value)}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Photos per Report</label>
              <input
                type="number"
                value={settings.systemLimits.maxPhotosPerReport || 5}
                onChange={(e) => setSettings({
                  ...settings,
                  systemLimits: {...settings.systemLimits, maxPhotosPerReport: parseInt(e.target.value)}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.systemLimits.sessionTimeout || 60}
                onChange={(e) => setSettings({
                  ...settings,
                  systemLimits: {...settings.systemLimits, sessionTimeout: parseInt(e.target.value)}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigurations;
