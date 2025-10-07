import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL, API_ENDPOINTS, ERROR_MESSAGES } from '../config';
import { useAuth } from '../hooks/useAuth';
import ReportsMap from './ReportsMap';
import { Link } from 'react-router-dom';

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchReport = async (token) => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}${API_ENDPOINTS.GET_ALL_REPORTS}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          logout();
          return;
        }

        if (response.status === 403) {
          console.error(ERROR_MESSAGES.ACCESS_DENIED);
          setLoading(false);
          return;
        }

        const result = await response.json();

        if (result.status === 'success') {
          const foundReport = result.reports.find(r => r.id == id);
          if (foundReport) {
            setReport(foundReport);
            setSelectedStatus(foundReport.status); // Initialize selected status
          } else {
            console.error('Report not found');
          }
        } else {
          console.error(result.message || 'Failed to fetch report');
        }
      } catch {
        console.error(ERROR_MESSAGES.NETWORK_ERROR);
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('authToken');
    if (token) {
      fetchReport(token);
    }
  }, [id, logout]);

  const handleStatusUpdate = async (newStatus) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    setUpdatingStatus(true);
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.UPDATE_REPORT_STATUS}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          report_id: report.id,
          status: newStatus,
          admin_notes: adminNotes.trim()
        })
      });

      if (response.ok) {
        setReport(prev => ({
          ...prev,
          status: newStatus,
          admin_notes: adminNotes.trim()
        }));
        setAdminNotes(''); // Clear the notes after successful update
      } else {
        console.error('Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { backgroundColor: '#F59E0B', color: 'white' },
      in_progress: { backgroundColor: '#3B82F6', color: 'white' },
      verified: { backgroundColor: '#10B981', color: 'white' },
      resolved: { backgroundColor: '#8B5CF6', color: 'white' },
      rejected: { backgroundColor: '#EF4444', color: 'white' },
      closed: { backgroundColor: '#6B7280', color: 'white' }
    };

    const style = statusStyles[status] || { backgroundColor: '#6B7280', color: 'white' };

    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
        style={style}
      >
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Report Not Found</h2>
          <button
            onClick={() => navigate('/reports')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-details-layout">
      <div className="report-details-content">
        <div className="main-content max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Link
                to="/hazard-reports"
                className="mr-4 p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-800 font-montserrat">Report Details</h1>
            </div>
          </div>

          <div className="space-y-6">
            {/* Report Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 font-serif max-w-xl truncate">{report.title}</h2>
                {getStatusBadge(report.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-md font-semibold text-gray-700 mb-2 border-b pb-2">Report Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Category:</span> {report.category_name}</p>
                    <p><span className="font-medium">Reporter:</span> {report.user_fullname}</p>
                    <p><span className="font-medium">Email:</span> {report.user_email}</p>
                    <p><span className="font-medium">Date:</span> {new Date(report.created_at).toLocaleString()}</p>
                    {report.is_unsure && (
                      <p className="text-orange-600 font-medium">⚠️ Reporter is unsure about this hazard</p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border">
                  <h3 className="text-md font-semibold text-gray-700 mb-2">Update Status</h3>
                  <div className="space-y-3">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      disabled={updatingStatus}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="verified">Verified</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                      <option value="closed">Closed</option>
                    </select>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Notes (Optional)
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this status update..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        rows={3}
                        disabled={updatingStatus}
                      />
                    </div>

                    <button
                      onClick={() => handleStatusUpdate(selectedStatus)}
                      disabled={updatingStatus || selectedStatus === report.status}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {updatingStatus ? 'Updating...' : 'Update Status'}
                    </button>

                    {updatingStatus && (
                      <p className="text-sm text-gray-600">Updating status...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{report.description}</p>
            </div>

            {/* Location Map */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Location</h3>
              <div className="h-96 rounded-lg overflow-hidden">
                <ReportsMap reports={[report]} />
              </div>
              {report.latitude && report.longitude && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Coordinates:</span> {report.latitude}, {report.longitude}
                  </p>
                </div>
              )}
            </div>

            {/* Images */}
            {report.image_path && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Attached Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <img
                    src={`${API_URL}/uploads/${report.image_path}`}
                    alt="Report"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
