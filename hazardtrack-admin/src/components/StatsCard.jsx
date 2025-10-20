const StatsCard = ({ title, value, icon, change, changeType, loading = false, valueStyle }) => {
  if (loading) {
    return (
      <div className="stat-card">
        <div className="stat-header">
          <div className="skeleton skeleton-text" style={{ width: '100px', height: '20px' }}></div>
          <div className="skeleton skeleton-circle"></div>
        </div>
        <div className="skeleton skeleton-text" style={{ width: '60px', height: '32px' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '80px', height: '16px' }}></div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="stat-header">
        <h3 className="stat-label" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>{title}</h3>
        <div className="stat-icon">
          {icon}
        </div>
      </div>
      
      <div className="stat-value" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, ...valueStyle }}>{value}</div>
      
      {change && (
        <div className={`stat-change ${changeType}`} style={{ color: changeType === 'positive' ? 'var(--success)' : 'var(--error)' }}>
          <svg 
            width="16" 
            height="16" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            style={{ 
              transform: changeType === 'positive' ? 'rotate(0deg)' : 'rotate(180deg)',
              marginRight: 'var(--spacing-1)'
            }}
          >
            {changeType === 'positive' ? (
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            )}
          </svg>
          {change}% from last week
        </div>
      )}
    </div>
  );
};

export default StatsCard;