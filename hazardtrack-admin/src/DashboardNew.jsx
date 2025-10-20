import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_URL, ERROR_MESSAGES, WEBSOCKET_CONFIG } from './config';
import StatsCard from './components/StatsCard';
import ReportsMap from './components/ReportsMap';
import { useAuth } from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './App.css'

const Dashboard = memo(function Dashboard() {
  const [wsConnectionStatus, setWsConnectionStatus] = useState('disconnected');
  const [authError, setAuthError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const queryClient = useQueryClient();

  const { data: dashboardStats = {
    total_reports: 0,
    residents_count: 0,
    bfp_personnel_count: 0,
    avg_response_time_hours: 0,
    reports_by_priority: []
  }, isLoading: loading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_URL}/get_dashboard_stats.php`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setAuthError('Authentication expired. Please refresh the page.');
        setWsConnectionStatus('auth_failed');
        throw new Error('Authentication expired');
      }

      if (response.status === 403) {
        setAuthError('Access denied. Insufficient permissions.');
        throw new Error('Access denied');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        return result.stats;
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard stats');
      }
    },
    enabled: !!localStorage.getItem('authToken'),
    retry: (failureCount, error) => {
      if (error.message.includes('Authentication') || error.message.includes('Access denied')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (error) {
      setAuthError(error.message || 'Network error. Please check your connection.');
    }
  }, [error]);

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
          ws.send(JSON.stringify({ token }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'report_update' || data.type === 'new_report') {
            // Invalidate and refetch stats on update
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });

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

  useEffect(() => {
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
  }, [connectWebSocket, disconnectWebSocket]);

  const handleCreateBfpAccount = useCallback(() => {
    navigate('/user-management');
  }, [navigate]);

  const handleGenerateReport = useCallback(() => {
    navigate('/analytics-reports');
  }, [navigate]);

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-10">
        {/* Dashboard Overview Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.fullname || 'Admin'}.</p>
          </div>

          {/* Connection Status and Error Display */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* WebSocket Connection Status */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              wsConnectionStatus === 'connected'
                ? 'bg-success text-white'
                : wsConnectionStatus === 'connecting'
                ? 'bg-accent text-white'
                : wsConnectionStatus === 'error' || wsConnectionStatus === 'auth_failed'
                ? 'bg-destructive text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${wsConnectionStatus === 'connected' ? 'bg-success' : wsConnectionStatus === 'connecting' ? 'bg-accent animate-pulse' : 'bg-destructive'}`}></span>
              {wsConnectionStatus === 'connected' ? 'Live' :
                  wsConnectionStatus === 'connecting' ? 'Connecting...' :
                  wsConnectionStatus === 'error' ? 'Connection Error' :
                  wsConnectionStatus === 'auth_failed' ? 'Auth Failed' :
                  wsConnectionStatus === 'max_reconnect_reached' ? 'Reconnect Failed' :
                  'Disconnected'}
            </div>

            {/* Authentication Error */}
            {authError && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-destructive text-white gap-2">
                ⚠️ {authError}
              </div>
            )}
          </div>
        </div>

        {/* Overview Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Reports"
            value={dashboardStats.total_reports}
            icon="📊"
            change={12}
            changeType="positive"
            loading={loading}
            accentColor="bg-accent"
            compact={false}
            size="md"
            valueStyle={{ color: 'var(--medium-grey)' }}
          />
          <StatsCard
            title="Residents"
            value={dashboardStats.residents_count}
            icon="👥"
            change={8}
            changeType="positive"
            loading={loading}
            accentColor="bg-primary"
            compact={false}
            size="md"
            valueStyle={{ color: 'var(--medium-grey)' }}
          />
          <StatsCard
            title="BFP Personnel"
            value={dashboardStats.bfp_personnel_count}
            icon="🚒"
            change={3}
            changeType="positive"
            loading={loading}
            accentColor="bg-success"
            compact={false}
            size="md"
            valueStyle={{ color: 'var(--medium-grey)' }}
          />
          <StatsCard
            title="Avg Response Time"
            value={`${dashboardStats.avg_response_time_hours}h`}
            icon="⏱️"
            change={-2}
            changeType="positive"
            loading={loading}
            accentColor="bg-accent"
            compact={false}
            size="md"
            valueStyle={{ color: 'var(--medium-grey)' }}
          />
        </div>

        {/* Interactive Tagudin Map */}
        <div className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Tagudin, Ilocos Sur - Hazard Reports Map</h3>
          <ReportsMap
            reports={dashboardStats.reports_by_priority}
            loading={loading}
            showPriorityColors={true}
          />
        </div>

        {/* Quick Actions */}
      
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
            ⚡ Quick Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleCreateBfpAccount}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 opacity-0 group-hover:opacity-100 blur-md transition duration-500"></div>
              <span className="relative flex items-center gap-2">
                <span className="text-2xl">🚒</span>
                Create BFP Account
              </span>
            </button>

            <button
              onClick={handleGenerateReport}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 blur-md transition duration-500"></div>
              <span className="relative flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Generate Report
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
});

export default Dashboard;
