import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return;
      }

      // This should be a new endpoint, e.g., /get_audit_logs.php
      const response = await fetch(`${API_URL}/get_audit_logs.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          // Assuming the API returns logs sorted by date
          setAuditLogs(data.logs || []);
        }
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const actionLower = log.action.toLowerCase();
    const matchesFilter = filter === 'all' || actionLower.includes(filter.toLowerCase().replace(' ', ''));
    const matchesSearch = searchTerm === '' ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'Report Created': return 'bg-blue-100 text-blue-800';
      case 'Status Updated': return 'bg-yellow-100 text-yellow-800';
      case 'Report Verified': return 'bg-green-100 text-green-800';
      case 'Report Resolved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="text-center mt-2 text-gray-600">Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Audit Logs</h3>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Actions</option>
          <option value="Status Updated">Status Updated</option>
          <option value="Report Created">Report Created</option>
          <option value="Report Verified">Report Verified</option>
          <option value="Report Resolved">Report Resolved</option>
        </select>
      </div>

      {/* Logs List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {filteredLogs.length > 0 ? (
          filteredLogs.map(log => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-sm text-gray-600">{log.user}</span>
                  </div>
                  <h4 className="font-medium text-gray-800">{log.target}</h4>
                  <p className="text-sm text-gray-600">{log.details}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {formatDate(log.timestamp)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No audit logs found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {auditLogs.filter(log => log.action === 'Report Created').length}
            </div>
            <div className="text-sm text-gray-600">Reports Created</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {auditLogs.filter(log => log.action === 'Status Updated').length}
            </div>
            <div className="text-sm text-gray-600">Status Updates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {auditLogs.filter(log => log.action === 'Report Verified').length}
            </div>
            <div className="text-sm text-gray-600">Verifications</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {auditLogs.filter(log => log.action === 'Report Resolved').length}
            </div>
            <div className="text-sm text-gray-600">Resolutions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
