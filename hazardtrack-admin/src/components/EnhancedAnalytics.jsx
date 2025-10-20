import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';

// Export utility functions
const exportToCSV = (data, filename) => {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportMetricsToCSV = (metrics, filename) => {
  const csvContent = [
    'Metric,Value',
    `Total Reports,${metrics.total || 0}`,
    `Resolution Rate,${metrics.resolutionRate?.toFixed(1) || 0}%`,
    `Average Response Time,${metrics.avgResponseTime || 0} hours`,
    `Active Cases,${(metrics.pending || 0) + (metrics.inProgress || 0)}`,
    `Resolved Cases,${metrics.resolved || 0}`,
    `Weekly Growth,${metrics.weeklyGrowth?.toFixed(1) || 0}%`
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const EnhancedAnalytics = ({ reports, loading }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('reports');

  // Calculate performance metrics
  const metrics = useMemo(() => {
    if (!reports.length) return {};

    const total = reports.length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    const pending = reports.filter(r => r.status === 'pending').length;
    const inProgress = reports.filter(r => r.status === 'in_progress').length;

    // Calculate average response time (mock data for now)
    const avgResponseTime = 2.4; // hours
    const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

    // Calculate trends
    const lastWeek = reports.filter(r => {
      const reportDate = new Date(r.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reportDate >= weekAgo;
    });

    const previousWeek = reports.filter(r => {
      const reportDate = new Date(r.created_at);
      const twoWeeksAgo = new Date();
      const weekAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reportDate >= twoWeeksAgo && reportDate < weekAgo;
    });

    const weeklyGrowth = previousWeek.length > 0
      ? ((lastWeek.length - previousWeek.length) / previousWeek.length) * 100
      : 0;

    return {
      total,
      resolved,
      pending,
      inProgress,
      avgResponseTime,
      resolutionRate,
      weeklyGrowth,
      lastWeek: lastWeek.length,
      previousWeek: previousWeek.length
    };
  }, [reports]);

  // Generate time-series data
  const timeSeriesData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayReports = reports.filter(r => r.created_at?.startsWith(dateStr));
      const resolved = dayReports.filter(r => r.status === 'resolved').length;
      const pending = dayReports.filter(r => r.status === 'pending').length;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        reports: dayReports.length,
        resolved,
        pending,
        resolutionRate: dayReports.length > 0 ? (resolved / dayReports.length) * 100 : 0
      });
    }

    return data;
  }, [reports, timeRange]);

  // Category distribution
  const categoryData = useMemo(() => {
    const categories = {};
    reports.forEach(report => {
      const category = report.category_name || 'Unknown';
      categories[category] = (categories[category] || 0) + 1;
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [reports]);

  const statusColors = {
    pending: '#F59E0B',
    in_progress: '#3B82F6',
    verified: '#10B981',
    resolved: '#8B5CF6',
    rejected: '#EF4444',
    closed: '#6B7280'
  };

  const categoryColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899'
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <div className="flex space-x-2">
          {['7d', '30d', '90d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === range
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Reports</p>
              <p className="text-3xl font-bold">{metrics.total || 0}</p>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${metrics.weeklyGrowth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {metrics.weeklyGrowth >= 0 ? '+' : ''}{metrics.weeklyGrowth?.toFixed(1)}%
            </span>
            <span className="text-blue-200 text-sm ml-2">vs last week</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Resolution Rate</p>
              <p className="text-3xl font-bold">{metrics.resolutionRate?.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-200 text-sm">{metrics.resolved || 0} resolved</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Avg Response Time</p>
              <p className="text-3xl font-bold">{metrics.avgResponseTime}h</p>
            </div>
            <div className="p-3 bg-orange-400 bg-opacity-30 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-orange-200 text-sm">Target:  4h</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Active Cases</p>
              <p className="text-3xl font-bold">{(metrics.pending || 0) + (metrics.inProgress || 0)}</p>
            </div>
            <div className="p-3 bg-purple-400 bg-opacity-30 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-purple-200 text-sm">{metrics.pending || 0} pending</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Report Trends</h3>
            <div className="flex space-x-2">
              {['reports', 'resolution'].map(metric => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    selectedMetric === metric
                      ? 'bg-orange-100 text-orange-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {metric === 'reports' ? 'Volume' : 'Resolution Rate'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1"> // sky
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolution" x1="0" y1="0" x2="0" y2="1"> // emerald
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                  itemStyle={{ color: '#4b5563' }}
                />
                {selectedMetric === 'reports' ? (
                  <Area
                    type="monotone"
                    dataKey="reports"
                    stroke="#0ea5e9"
                    fillOpacity={1}
                    fill="url(#colorReports)"
                    strokeWidth={2}
                  />
                ) : (
                  <Area
                    type="monotone"
                    dataKey="resolutionRate"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorResolution)"
                    strokeWidth={2}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Reports by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                  itemStyle={{ color: '#4b5563' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Current Status</h4>
            {Object.entries({
              pending: metrics.pending || 0,
              in_progress: metrics.inProgress || 0,
              resolved: metrics.resolved || 0
            }).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: statusColors[status] }}
                  ></div>
                  <span className="text-sm text-gray-600 capitalize">
                    {status.replace('_', ' ')}
                  </span>
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Performance</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Resolution Rate</span>
                <span className="font-semibold text-green-600">
                  {metrics.resolutionRate?.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Response</span>
                <span className="font-semibold">{metrics.avgResponseTime}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Weekly Growth</span>
                <span className={`font-semibold ${metrics.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.weeklyGrowth >= 0 ? '+' : ''}{metrics.weeklyGrowth?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Quick Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => exportMetricsToCSV(metrics, `analytics_metrics_${new Date().toISOString().split('T')[0]}.csv`)}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Metrics
              </button>
              <button
                onClick={() => exportToCSV(timeSeriesData, `analytics_trends_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`)}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Export Trends
              </button>
              <button
                onClick={() => exportToCSV(categoryData, `analytics_categories_${new Date().toISOString().split('T')[0]}.csv`)}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Export Categories
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683l-9-9 3.5-3.5 9 9z" />
                </svg>
                Set Alerts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalytics;
