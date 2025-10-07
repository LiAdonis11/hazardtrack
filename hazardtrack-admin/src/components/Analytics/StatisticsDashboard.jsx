import React, { useState, useEffect, useMemo } from 'react';
import { API_URL, ERROR_MESSAGES } from '../../config';

const StatisticsDashboard = () => {
  const [stats, setStats] = useState({
    reportsByBarangay: [],
    reportsByHazardType: [],
    responseTimeAnalytics: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [error, setError] = useState(null);

  const StatCard = ({ title, value, subtitle, color, icon }) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`text-3xl p-3 rounded-full ${color.replace('border', 'bg').replace('-500', '-100')} ${color.replace('border', 'text')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/analytics_stats.php?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setStats(data.data);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || ERROR_MESSAGES.DEFAULT);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const BarChart = ({ data, title, color }) => {
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.length > 0 ? data.map((item, index) => (
            <div key={index} className="flex items-center group">
              <div className="w-32 text-sm text-gray-600 truncate" title={item.label}>{item.label}</div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-4 rounded-full ${color} transition-all duration-500`}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-12 text-sm font-medium text-gray-800">{item.value}</div>
            </div>
          )) : <p className="text-sm text-gray-500 text-center py-4">No data available.</p>}
        </div>
      </div>
    );
  };

  const TrendChart = ({ data, title }) => {
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="h-64 flex items-end justify-around space-x-2 border-b border-gray-200 pb-2">
          {data.length > 0 ? data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1 group">
              <div
                className="w-full bg-sky-500 rounded-t-md hover:bg-sky-600 transition-all duration-300"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 text-white text-xs text-center p-1 rounded-md -mt-8">
                  {item.value}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                {item.label}
              </div>
            </div>
          )) : <p className="text-sm text-gray-500 text-center w-full py-4">No trend data available.</p>}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Statistics Overview</h2>
            <p className="text-gray-500 mt-1">Comprehensive analytics and insights for the selected period.</p>
          </div>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reports"
          value={stats.totalReports || 0}
          subtitle="All time"
          color="border-sky-500"
          icon="📊"
        />
        <StatCard
          title="Resolved Cases"
          value={stats.resolvedReports || 0}
          subtitle={`${stats.resolutionRate || 0}% resolution rate`}
          color="border-emerald-500"
          icon="✅"
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats.avgResponseTime || 0}h`}
          subtitle="Time to first response"
          color="border-amber-500"
          icon="⏱️"
        />
        <StatCard
          title="Active Cases"
          value={stats.activeCases || 0}
          subtitle="Currently in progress"
          color="border-red-500"
          icon="🔥"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={stats.reportsByBarangay || []}
          title="Reports by Barangay"
          color="bg-sky-500"
        />
        <BarChart
          data={stats.reportsByHazardType || []}
          title="Reports by Hazard Type"
          color="bg-emerald-500"
        />
      </div>

      {/* Response Time Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={stats.responseTimeAnalytics || []}
          title="Response Time Distribution"
          color="bg-amber-500"
        />
        <TrendChart
          data={stats.monthlyTrends || []}
          title="Monthly Trends"
        />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Emergency</span>
              <span className="text-sm font-medium">{stats.emergencyCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">High Priority</span>
              <span className="text-sm font-medium">{stats.highPriorityCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Medium Priority</span>
              <span className="text-sm font-medium">{stats.mediumPriorityCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low Priority</span>
              <span className="text-sm font-medium">{stats.lowPriorityCount || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-medium">{stats.pendingCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="text-sm font-medium">{stats.inProgressCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Resolved</span>
              <span className="text-sm font-medium">{stats.resolvedCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Rejected</span>
              <span className="text-sm font-medium">{stats.rejectedCount || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Resolution Time</span>
              <span className="text-sm font-medium">{stats.avgResolutionTime || 0}h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-medium">{stats.successRate || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">User Satisfaction</span>
              <span className="text-sm font-medium">{stats.userSatisfaction || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
