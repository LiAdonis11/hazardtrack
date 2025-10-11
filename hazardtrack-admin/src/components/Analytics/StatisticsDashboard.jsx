import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
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
  const [monthsRange, setMonthsRange] = useState(6);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, monthsRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/analytics_stats.php?range=${timeRange}&months=${monthsRange}`, {
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

  const exportReport = () => {
    alert('Generating analytics report...');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Statistics Overview</h2>
          <p className="text-gray-500 mt-1">Fire hazard reporting insights</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          {/* <button
            onClick={exportReport}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Export Report
          </button> */}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalReports || 247}</p>
              <p className="text-xs text-green-600">+15% this month</p>
            </div>
            <div className="text-3xl p-3 rounded-full bg-blue-100 text-blue-600">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Resolution Rate</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.resolutionRate || 94}%</p>
              <p className="text-xs text-green-600">+2% improvement</p>
            </div>
            <div className="text-3xl p-3 rounded-full bg-green-100 text-green-600">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.avgResponseTime ? `${stats.avgResponseTime}h` : '2.4h'}</p>
              <p className="text-xs text-red-600">+12% slower</p>
            </div>
            <div className="text-3xl p-3 rounded-full bg-orange-100 text-orange-600">⏱️</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.activeUsers || 156}</p>
              <p className="text-xs text-green-600">+{stats.newUsers || 8} new users</p>
            </div>
            <div className="text-3xl p-3 rounded-full bg-purple-100 text-purple-600">👥</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
      📊 Monthly Report Trends
    </h3>
    <span className="text-sm text-gray-500">Updated: {new Date().toLocaleDateString()}</span>
  </div>
  <div className="flex gap-2 mb-4">
    {[3, 6, 12].map((months) => (
      <button
        key={months}
        onClick={() => setMonthsRange(months)}
        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
          monthsRange === months
            ? 'bg-red-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {months}M
      </button>
    ))}
  </div>

  <div className="relative h-64">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={stats.monthlyTrends && stats.monthlyTrends.length > 0 ? stats.monthlyTrends : [
          { label: 'Jan', value: 10 },
          { label: 'Feb', value: 15 },
          { label: 'Mar', value: 8 },
          { label: 'Apr', value: 22 },
          { label: 'May', value: 18 },
          { label: 'Jun', value: 25 }
        ]}
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.9} />
            <stop offset="50%" stopColor="#D32F2F" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#D32F2F" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 12 }} />
        <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#D32F2F"
          strokeWidth={2}
          fill="url(#colorValue)"
          dot={{ fill: '#D32F2F', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#D32F2F', strokeWidth: 2, fill: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>

    <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-gray-100"></div>
  </div>
</div>


        {/* Hazard Types Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Hazard Types Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.reportsByHazardType || [
                    { label: 'Electrical Hazard', value: 89 },
                    { label: 'Fire Hazard', value: 67 },
                    { label: 'Building Safety', value: 45 },
                    { label: 'LPG/Gas Issue', value: 32 },
                    { label: 'Other', value: 14 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.reportsByHazardType?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#D32F2F', '#FBC02D', '#2E7D32', '#1976D2', '#F57C00'][index % 5]} />
                  )) || [
                    <Cell key="cell-0" fill="#D32F2F" />,
                    <Cell key="cell-1" fill="#FBC02D" />,
                    <Cell key="cell-2" fill="#2E7D32" />,
                    <Cell key="cell-3" fill="#1976D2" />,
                    <Cell key="cell-4" fill="#F57C00" />
                  ]}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Response Time Analysis */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Response Time Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Average Response Time</p>
            <p className="text-2xl mb-1">{stats.avgResponseTime ? `${stats.avgResponseTime}h` : '2.4 hours'}</p>
            <p className="text-xs text-red-600">+12% from last month</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Resolution Time</p>
            <p className="text-2xl mb-1">18.5 hours</p>
            <p className="text-xs text-green-600">-8% from last month</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Verification Time</p>
            <p className="text-2xl mb-1">45 minutes</p>
            <p className="text-xs text-red-600">+5% from last month</p>
          </div>
        </div>
      </div>

 <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-8">
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
      Status Overview
    </h3>
    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
      Live Data
    </span>
  </div>

  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={[
          { name: 'Pending', value: stats.pendingCount || 0 },
          { name: 'In Progress', value: stats.inProgressCount || 0 },
          { name: 'Resolved', value: stats.resolvedCount || 0 },
          { name: 'Rejected', value: stats.rejectedCount || 0 },
        ]}
        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        barCategoryGap="25%"
      >
        <defs>
          <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FACC15" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#2563EB" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#16A34A" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="rejectedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#DC2626" stopOpacity={0.6} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="2 3" stroke="#F3F4F6" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #F3F4F6',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            padding: '10px 14px',
            fontSize: '13px',
          }}
          labelStyle={{ color: '#374151', fontWeight: 600 }}
        />
        <Bar
          dataKey="value"
          radius={[5, 5, 0, 0]}
          maxBarSize={190}
        >
          <Cell fill="url(#pendingGradient)" />
          <Cell fill="url(#progressGradient)" />
          <Cell fill="url(#resolvedGradient)" />
          <Cell fill="url(#rejectedGradient)" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>

  <div className="flex justify-center gap-6 mt-5">
    {[
      { color: 'bg-yellow-400', label: 'Pending' },
      { color: 'bg-blue-500', label: 'In Progress' },
      { color: 'bg-green-500', label: 'Resolved' },
      { color: 'bg-red-500', label: 'Rejected' },
    ].map((item) => (
      <div key={item.label} className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
        <span className="text-sm text-gray-600">{item.label}</span>
      </div>
    ))}
  </div>
</div>



      {/* Dynamic Summary */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-blue-800 mb-2">
          {(() => {
            const now = new Date();
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                               'July', 'August', 'September', 'October', 'November', 'December'];
            return `${monthNames[now.getMonth()]} ${now.getFullYear()} Highlights`;
          })()}
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• {stats.totalReports || 0} hazard reports submitted in the selected period</li>
          <li>• {stats.resolvedReports || 0} reports successfully resolved ({stats.resolutionRate || 0}% resolution rate)</li>
          <li>• Average response time: {stats.avgResponseTime ? `${stats.avgResponseTime.toFixed(1)} hours` : 'N/A'}</li>
          <li>• {stats.pendingCount || 0} reports currently pending, {stats.inProgressCount || 0} in progress</li>
          {stats.reportsByHazardType && stats.reportsByHazardType.length > 0 && (
            <li>• Most common hazard: {stats.reportsByHazardType[0].label} ({stats.reportsByHazardType[0].value} reports)</li>
          )}
          {stats.reportsByBarangay && stats.reportsByBarangay.length > 0 && (
            <li>• Top performing barangay: {stats.reportsByBarangay[0].label} ({stats.reportsByBarangay[0].value} reports)</li>
          )}
          <li>• Emergency priority reports: {stats.emergencyCount || 0}</li>
        </ul>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
