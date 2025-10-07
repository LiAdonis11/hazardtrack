import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const ReportsChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <div className="skeleton skeleton-text" style={{ width: '200px', height: '24px' }}></div>
        </div>
        <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)' }}></div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Reports Overview</h3>
      </div>
      <div style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
            <XAxis 
              dataKey="name" 
              stroke="var(--gray-600)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--gray-600)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)'
              }}
            />
              <Bar 
                dataKey="reports" 
                fill="var(--primary-600)"
                radius={[4, 4, 0, 0]}
              />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const StatusPieChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <div className="skeleton skeleton-text" style={{ width: '150px', height: '24px' }}></div>
        </div>
        <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)' }}></div>
      </div>
    );
  }

  const COLORS = {
    pending: '#F75270', // Strong Pink for pending/warning
    verified: '#DC143C', // Crimson for verified/primary
    resolved: '#10b981'  // Green for resolved/success
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Status Distribution</h3>
      </div>
      <div style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export { ReportsChart, StatusPieChart };
