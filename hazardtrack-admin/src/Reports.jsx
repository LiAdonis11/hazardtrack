import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, API_ENDPOINTS, ERROR_MESSAGES, WEBSOCKET_CONFIG } from './config';
import { useAuth } from './hooks/useAuth';
import ReportsTableResponsive from './components/ReportsTableResponsive';
import ExportModal from './components/ExportModal';
import ReportsMap from './components/ReportsMap';

export default function Reports({ filter }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [view, setView] = useState('table'); // 'table' or 'map'
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchReports = useCallback(async (token) => {
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
        setReports(result.reports || []);
      } else {
        console.error(result.message || 'Failed to fetch reports');
      }
    } catch {
      console.error(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchReports(token);
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Setup WebSocket or polling to listen for report updates
    const ws = new WebSocket(WEBSOCKET_CONFIG.URL);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'report_update' || data.type === 'new_report') {
        // Refetch reports on update
        fetchReports(token);

        // Show browser notification for new reports
        if (data.type === 'new_report' && 'Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification('New Hazard Report', {
            body: `A new ${data.report?.category || 'hazard'} report has been submitted in ${data.report?.location || 'Tagudin'}`,
            icon: '/favicon.ico', // Add appropriate icon
            tag: 'new-report'
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          // Auto-close after 5 seconds
          setTimeout(() => {
            notification.close();
          }, 5000);
        }
      }
    };

    return () => {
      ws.close();
    };
  }, [fetchReports]);



  const handleReportClick = (report) => {
    navigate(`/reports/${report.id}`);
  };

  const handleStatusUpdate = useCallback(async (reportId, newStatus) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.UPDATE_REPORT_STATUS}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          report_id: reportId,
          status: newStatus
        })
      });

      if (response.ok) {
        // Update local state
        setReports(prevReports =>
          prevReports.map(report =>
            report.id === reportId ? { ...report, status: newStatus } : report
          )
        );
      } else {
        console.error('Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  }, []);

  const handleExportClick = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleExportClose = useCallback(() => {
    setShowExportModal(false);
  }, []);

  // Filter reports based on the filter prop
  const filteredReports = filter ? reports.filter(report => report.status === filter) : reports;

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 font-montserrat">
          {filter ? `${filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')} Reports` : 'All Reports'}
        </h1>
        <div className="flex space-x-2">
            <button
              onClick={() => setView('table')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center gap-2 ${
                view === 'table' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Table View
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center gap-2 ${
                view === 'map' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Map View
            </button>
          </div>
      </div>

      <div className="mb-6">
        {view === 'table' ? (
          <ReportsTableResponsive
            reports={filteredReports}
            loading={loading}
            onReportClick={handleReportClick}
            onStatusUpdate={handleStatusUpdate}
            isFiltered={!!filter} // Pass true if parent has filtered by status
          />
        ) : (
          <ReportsMap
            reports={filteredReports}
            loading={loading}
            onReportClick={handleReportClick}
            filter={filter}
          />
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={handleExportClose}
        />
      )}
    </>
  );
}
