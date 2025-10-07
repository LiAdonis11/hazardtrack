import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';

const AssignedReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedReports();
  }, []);

  const fetchAssignedReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/get_assigned_reports.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setReports(data.data.reports);
        }
      }
    } catch (error) {
      console.error('Error fetching assigned reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Removed unused getStatusColor function to fix ESLint error

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="assigned-reports-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assigned Reports</h1>
        <p className="text-gray-600">Reports currently assigned to inspection teams</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assigned reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600">No reports currently assigned</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.report_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {report.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.assigned_inspector}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {report.team_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.assigned_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/reports/${report.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View Details
                      </Link>
                      <button className="text-orange-600 hover:text-orange-900">
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedReports;
