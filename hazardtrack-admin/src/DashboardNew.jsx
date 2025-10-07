import { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL, ERROR_MESSAGES, WEBSOCKET_CONFIG } from './config';
import StatsCard from './components/StatsCard';
import ReportsMap from './components/ReportsMap';
import { useAuth } from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './App.css'

export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    total_reports: 0,
    residents_count: 0,
    bfp_personnel_count: 0,
    avg_response_time_hours: 0,
    reports_by_priority: []
  });
  const [loading, setLoading] = useState(true);
  const [wsConnectionStatus, setWsConnectionStatus] = useState('disconnected');
  const [authError, setAuthError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  // WebSocket connection management functions
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
      return; // Already connecting
    }

    try {
      setWsConnectionStatus('connecting');
      const ws = new WebSocket(WEBSOCKET_CONFIG.URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setWsConnectionStatus('connected');
        setAuthError(null);
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection

        // Authenticate with token
        const token = localStorage.getItem('authToken');
        if (token) {
          ws.send(JSON.stringify({ type: 'authenticate', token }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'report_update' || data.type === 'new_report') {
            // Refetch stats on update
            const token = localStorage.getItem('authToken');
            if (token) {
              fetchDashboardStats(token);
            }

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
          } else if (data.type === 'auth_error') {
            setAuthError(data.message || 'Authentication failed');
            setWsConnectionStatus('auth_failed');
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnectionStatus('error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.reason);
        setWsConnectionStatus('disconnected');
        wsRef.current = null;

        // Attempt to reconnect if not intentionally closed and under max attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms... (Attempt ${reconnectAttemptsRef.current + 1}/${WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, delay);
        } else if (reconnectAttemptsRef.current >= WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS) {
          console.log('Max reconnection attempts reached');
          setWsConnectionStatus('max_reconnect_reached');
        }
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setWsConnectionStatus('error');
    }
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }

    setWsConnectionStatus('disconnected');
  }, []);

  // Enhanced fetchDashboardStats with better error handling
  const fetchDashboardStats = useCallback(async (token) => {
    try {
      setLoading(true);
      setAuthError(null);

      const response = await fetch(`${API_URL}/get_dashboard_stats.php`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setAuthError('Authentication expired. Please refresh the page.');
        setWsConnectionStatus('auth_failed');
        return;
      }

      if (response.status === 403) {
        console.error(ERROR_MESSAGES.ACCESS_DENIED);
        setAuthError('Access denied. Insufficient permissions.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        setDashboardStats(result.stats);
      } else {
        console.error(result.message || 'Failed to fetch dashboard stats');
        setAuthError(result.message || 'Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.NETWORK_ERROR, error);
      setAuthError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchDashboardStats(token);
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initialize WebSocket connection
    connectWebSocket();

    // Cleanup function
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket, fetchDashboardStats]);

  const handleCreateBfpAccount = () => {
    navigate('/user-management');
  };

  const handleGenerateReport = () => {
    navigate('/analytics-reports');
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDEBD0] to-[#F7CAC9]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC143C]"></div>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard Overview Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-montserrat">Dashboard Overview</h1>
          <p className="text-gray-600 font-montserrat mt-1">Welcome back, {user?.fullname || 'Admin'}.</p>
        </div>

        {/* Connection Status and Error Display */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* WebSocket Connection Status */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            wsConnectionStatus === 'connected'
              ? 'bg-green-100 text-green-800'
              : wsConnectionStatus === 'connecting'
              ? 'bg-yellow-100 text-yellow-800'
              : wsConnectionStatus === 'error' || wsConnectionStatus === 'auth_failed'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${wsConnectionStatus === 'connected' ? 'bg-green-500' : wsConnectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></span>
            {wsConnectionStatus === 'connected' ? 'Live' :
                wsConnectionStatus === 'connecting' ? 'Connecting...' :
                wsConnectionStatus === 'error' ? 'Connection Error' :
                wsConnectionStatus === 'auth_failed' ? 'Auth Failed' :
                wsConnectionStatus === 'max_reconnect_reached' ? 'Reconnect Failed' :
                'Disconnected'}
          </div>

          {/* Authentication Error */}
          {authError && (
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 flex items-center gap-2">
              ⚠️ {authError}
            </div>
          )}
        </div>
      </div>

      {/* Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Reports"
          value={dashboardStats.total_reports}
          icon="📊"
          change={12}
          changeType="positive"
          loading={loading}
          accentColor="bg-orange-500"
          compact={false}
          size="md"
        />
        <StatsCard
          title="Residents"
          value={dashboardStats.residents_count}
          icon="👥"
          change={8}
          changeType="positive"
          loading={loading}
          accentColor="bg-sky-500"
          compact={false}
          size="md"
        />
        <StatsCard
          title="BFP Personnel"
          value={dashboardStats.bfp_personnel_count}
          icon="👨‍🚒"
          change={3}
          changeType="positive"
          loading={loading}
          accentColor="bg-emerald-500"
          compact={false}
          size="md"
        />
        <StatsCard
          title="Avg Response Time"
          value={`${dashboardStats.avg_response_time_hours}h`}
          icon="⏱️"
          change={-2}
          changeType="positive"
          loading={loading}
          accentColor="bg-amber-500"
          compact={false}
          size="md"
        />
      </div>

      {/* Interactive Tagudin Map */}
      <div className="mb-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-orange-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3 font-montserrat">Tagudin, Ilocos Sur - Hazard Reports Map</h3>
        <ReportsMap
          reports={dashboardStats.reports_by_priority}
          loading={loading}
          showPriorityColors={true}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-orange-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 font-montserrat">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleCreateBfpAccount}
            className="bg-sky-600 text-white px-6 py-4 rounded-lg hover:bg-sky-700 transition-all duration-200 shadow-md hover:shadow-lg font-montserrat font-medium text-lg flex items-center justify-center gap-3"
          >
            <span className="text-2xl">👨‍🚒</span> Create BFP Account
          </button>
          <button
            onClick={handleGenerateReport}
            className="bg-emerald-600 text-white px-6 py-4 rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg font-montserrat font-medium text-lg flex items-center justify-center gap-3"
          >
            <span className="text-2xl">📈</span> Generate Report
          </button>
        </div>
      </div>
    </>
  );
}
