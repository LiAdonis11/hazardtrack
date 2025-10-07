const StatsCard = ({ title, value, icon, change, changeType, loading = false }) => {
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

  const getIconClass = () => {
    switch (icon) {
      case 'total':
        return 'stat-icon primary';
      case 'pending':
        return 'stat-icon warning';
      case 'resolved':
        return 'stat-icon success';
      case 'verified':
        return 'stat-icon info';
      default:
        return 'stat-icon primary';
    }
  };

  const getIconSvg = () => {
    switch (icon) {
      case 'total':
        return (
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'pending':
        return (
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'resolved':
        return (
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'verified':
        return (
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  return (
    <div className="stat-card">
      <div className="stat-header">
        <h3 className="stat-label" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>{title}</h3>
        <div className={getIconClass()}>
          {getIconSvg()}
        </div>
      </div>
      
      <div className="stat-value" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>{value}</div>
      
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
