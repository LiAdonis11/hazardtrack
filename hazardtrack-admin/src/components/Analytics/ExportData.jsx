import React, { useState } from 'react';
import { API_URL } from '../../config';

const ExportData = () => {
  const [exportType, setExportType] = useState('reports');
  const [dateRange, setDateRange] = useState('30d');
  const [format, setFormat] = useState('excel');
  const [filters, setFilters] = useState({
    status: '',
    hazardType: '',
    barangay: '',
    priority: ''
  });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const params = new URLSearchParams({
        type: exportType,
        range: dateRange,
        format: format,
        ...filters
      });

      const response = await fetch(`${API_URL}/export_data_enhanced.php?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hazardtrack_export_enhanced${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const exportOptions = [
    {
      id: 'reports',
      title: 'All Reports',
      description: 'Complete list of all hazard reports with details',
      icon: '📋'
    },
    {
      id: 'analytics',
      title: 'Analytics Data',
      description: 'Statistical data and trends analysis',
      icon: '📊'
    },
    {
      id: 'users',
      title: 'User Data',
      description: 'Resident and BFP personnel information',
      icon: '👥'
    },
    {
      id: 'audit',
      title: 'Audit Logs',
      description: 'System activity and user action logs',
      icon: '📜'
    }
  ];

  return (
    <div className="export-data">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Data</h1>
        <p className="text-gray-600">Export hazard tracking data in various formats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Configuration */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Configuration</h2>

            {/* Export Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Data Type</label>
              <div className="grid grid-cols-1 gap-3">
                {exportOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      exportType === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExportType(option.id)}
                  >
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{option.icon}</div>
                      <div>
                        <h3 className="font-medium text-gray-900">{option.title}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Format */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'excel', label: 'Excel', icon: '📊' },
                  { id: 'csv', label: 'CSV', icon: '📄' },
                  { id: 'pdf', label: 'PDF', icon: '📕' }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      format === fmt.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{fmt.icon}</div>
                    <div className="text-sm font-medium">{fmt.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filters (for reports export) */}
          {exportType === 'reports' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hazard Type</label>
                  <select
                    value={filters.hazardType}
                    onChange={(e) => setFilters({...filters, hazardType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="fire">Fire</option>
                    <option value="flood">Flood</option>
                    <option value="earthquake">Earthquake</option>
                    <option value="accident">Accident</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                  <select
                    value={filters.barangay}
                    onChange={(e) => setFilters({...filters, barangay: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Barangays</option>
                    <option value="tagudin_center">Tagudin Center</option>
                    <option value="biag">Biag</option>
                    <option value="balingaoan">Balingaoan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Priorities</option>
                    <option value="emergency">Emergency</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Summary & Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Data Type:</span>
                <span className="font-medium">{exportOptions.find(opt => opt.id === exportType)?.title}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Date Range:</span>
                <span className="font-medium">
                  {dateRange === '7d' ? 'Last 7 days' :
                   dateRange === '30d' ? 'Last 30 days' :
                   dateRange === '90d' ? 'Last 90 days' :
                   dateRange === '1y' ? 'Last year' : 'All time'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Format:</span>
                <span className="font-medium uppercase">{format}</span>
              </div>
              {exportType === 'reports' && (
                <div className="py-2 border-b border-gray-200">
                  <span className="text-gray-600">Filters Applied:</span>
                  <div className="mt-1 text-sm">
                    {Object.entries(filters).map(([key, value]) => (
                      value && <div key={key} className="text-gray-800">• {key}: {value}</div>
                    ))}
                    {Object.values(filters).every(v => !v) && <div className="text-gray-500">None</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Export</h3>
            <p className="text-blue-700 mb-4">
              Your data will be processed and downloaded automatically. Large exports may take a few moments.
            </p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <span className="mr-2">📥</span>
                  Start Export
                </>
              )}
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export History</h3>
            <p className="text-gray-600 text-sm mb-4">
              Your recent exports will appear here for quick access.
            </p>
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📂</div>
              <p className="text-sm">No recent exports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
