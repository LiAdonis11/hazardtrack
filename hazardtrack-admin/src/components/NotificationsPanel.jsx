import { useState, useEffect } from 'react';

export default function NotificationsPanel({ reports, loading }) {
  const [urgentReports, setUrgentReports] = useState([]);
  const [unresolvedReports, setUnresolvedReports] = useState([]);

  useEffect(() => {
    if (reports && reports.length > 0) {
      // Filter urgent reports (emergency priority or pending for more than 24 hours)
      const urgent = reports.filter(report =>
        report.priority === 'emergency' ||
        (report.status === 'pending' && new Date() - new Date(report.created_at) > 24 * 60 * 60 * 1000)
      );
      setUrgentReports(urgent);

      // Filter unresolved reports (pending or in_progress)
      const unresolved = reports.filter(report =>
        report.status === 'pending' || report.status === 'in_progress'
      );
      setUnresolvedReports(unresolved);
    } else {
      setUrgentReports([]);
      setUnresolvedReports([]);
    }
  }, [reports]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="text-center mt-2 text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Notifications Panel</h3>
        <span className="text-sm text-gray-500">Real-time Hazard Alerts</span>
      </div>

      {/* Urgent Hazards */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-red-700 mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Urgent Hazards ({urgentReports.length})
        </h4>
        {urgentReports.length > 0 ? (
          <div className="space-y-3">
            {urgentReports.slice(0, 5).map(report => (
              <div key={report.id} className="border-l-4 border-red-500 rounded-r-lg p-3 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-semibold text-gray-900">{report.title}</h5>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {report.category_name} &middot; <span className="text-xs">{formatDate(report.created_at)}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-200 text-red-800 tracking-wider">
                    {report.priority === 'emergency' ? 'EMERGENCY' : 'OVERDUE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border border-dashed rounded-lg">
            <p className="text-sm text-gray-500">No urgent hazards at this time. Great job!</p>
          </div>
        )}
      </div>

      {/* Unresolved Hazards */}
      <div>
        <h4 className="text-md font-semibold text-orange-700 mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Unresolved Hazards ({unresolvedReports.length})
        </h4>
        {unresolvedReports.length > 0 ? (
          <div className="space-y-3">
            {unresolvedReports.slice(0, 10).map(report => (
              <div key={report.id} className="border-l-4 border-orange-500 rounded-r-lg p-3 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-semibold text-gray-900">{report.title}</h5>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {report.category_name} &middot; <span className="text-xs">{formatDate(report.created_at)}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-200 text-orange-800">
                    {report.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border border-dashed rounded-lg">
            <p className="text-sm text-gray-500">All hazards have been resolved. Keep up the good work!</p>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Notification Settings</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-2" defaultChecked />
            <span className="text-sm">Email notifications for urgent hazards</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-2" defaultChecked />
            <span className="text-sm">Real-time alerts for emergency reports</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-2" />
            <span className="text-sm">Daily summary reports</span>
          </label>
        </div>
      </div>
    </div>
  );
}
