import { useState, useMemo } from 'react';
import AssignInspectorModal from './AssignInspectorModal';

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

const ReportsTable = ({
  reports,
  loading = false,
  onReportClick,
  onStatusUpdate,
  assignedToMeFilter = false,
  onAssignedToMeFilterChange,
  isFiltered = false // New prop to indicate if reports are already filtered by parent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const filteredAndSortedReports = useMemo(() => {
    let filtered = reports.filter(report => {
      const matchesSearch = searchTerm === '' ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.user_fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category_name.toLowerCase().includes(searchTerm.toLowerCase());

      // Only apply status filter if parent hasn't already filtered the data
      const matchesStatus = isFiltered || statusFilter === 'all' || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [reports, searchTerm, statusFilter, sortConfig, isFiltered]);

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStatusChange = async (reportId, newStatus) => {
    setUpdatingStatus(reportId);
    try {
      await onStatusUpdate(reportId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      verified: 'bg-sky-100 text-sky-800 border border-sky-200',
      in_progress: 'bg-blue-100 text-blue-800 border border-blue-200',
      resolved: 'bg-green-100 text-green-800 border border-green-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200',
      closed: 'bg-gray-100 text-gray-800 border border-gray-200',
    };

    const style = statusStyles[status] || 'bg-gray-100 text-gray-800 border border-gray-200';

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}
      >
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getStatusDropdown = (report) => {
    const statuses = ['pending', 'verified', 'in_progress', 'resolved'];

    return (
      <>
        <select
          value={report.status}
          onChange={(e) => handleStatusChange(report.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          disabled={updatingStatus === report.id}
          className="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="px-2 py-1 text-xs bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          title="Assign Inspector"
        >
          Assign
        </button>
      </>
    );
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;

    return (
      <svg
        width="12"
        height="12"
        fill="currentColor"
        viewBox="0 0 20 20"
        style={{
          marginLeft: 'var(--spacing-1)',
          transform: sortConfig.direction === 'asc' ? 'rotate(0deg)' : 'rotate(180deg)'
        }}
      >
        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="table-container">
        <div className="table-header">
          <div className="skeleton skeleton-text" style={{ width: '150px', height: '24px' }}></div>
          <div className="skeleton" style={{ width: '250px', height: '32px' }}></div>
        </div>
        <table className="table">
          <thead>
            <tr>
              {['Title', 'Category', 'Reporter', 'Status', 'Priority', 'Actions', 'Date'].map((header) => (
                <th key={header}>
                  <div className="skeleton skeleton-text" style={{ width: '80px', height: '16px' }}></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row}>
                {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
                  <td key={cell}>
                    <div className="skeleton skeleton-text" style={{ width: '60px', height: '16px' }}></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const handleExport = () => {
    const exportData = filteredAndSortedReports.map(report => ({
      ID: report.id,
      Title: report.title,
      Description: report.description || '',
      Category: report.category_name,
      Reporter: report.user_fullname,
      Email: report.user_email,
      Status: report.status,
      Priority: report.priority,
      Created_Date: report.created_at,
      Updated_Date: report.updated_at || '',
      Is_Unsure: report.is_unsure ? 'Yes' : 'No'
    }));

    const filename = `reports_export_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(exportData, filename);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Reports Management</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {filteredAndSortedReports.length} of {reports.length} reports
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <label className="hidden items-center text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assignedToMeFilter}
                  onChange={(e) => onAssignedToMeFilterChange(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-2"
                />
                Assigned to me
              </label>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-64"
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('title')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors min-w-[200px]"
              >
                <div className="flex items-center">
                  Title
                  {getSortIcon('title')}
                </div>
              </th>
              <th
                onClick={() => handleSort('category_name')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors min-w-[120px]"
              >
                <div className="flex items-center">
                  Category
                  {getSortIcon('category_name')}
                </div>
              </th>
              <th
                onClick={() => handleSort('user_fullname')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors min-w-[150px] hidden md:table-cell"
              >
                <div className="flex items-center">
                  Reporter
                  {getSortIcon('user_fullname')}
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors min-w-[100px]"
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th
                onClick={() => handleSort('priority')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors min-w-[100px]"
              >
                <div className="flex items-center">
                  Priority
                  {getSortIcon('priority')}
                </div>
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Actions
              </th>
              <th
                onClick={() => handleSort('created_at')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors min-w-[120px] hidden lg:table-cell"
              >
                <div className="flex items-center">
                  Date
                  {getSortIcon('created_at')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedReports.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No reports found</h3>
                    <p className="text-sm text-gray-500">
                      {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Get started by creating your first report'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedReports.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => onReportClick && onReportClick(report)}
                  className={`${
                    onReportClick ? 'cursor-pointer hover:bg-gray-50' : ''
                  } transition-colors duration-150`}
                >
                  <td className="px-4 py-4 whitespace-nowrap min-w-[200px]">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {report.title || 'Untitled Report'}
                        </div>
                        {report.description && (
                          <div className="text-sm text-gray-500 max-w-xs truncate mt-1">
                            {report.description.length > 60 ? `${report.description.substring(0, 60)}...` : report.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap min-w-[120px]">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border">
                      {report.category_name}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap min-w-[150px] hidden md:table-cell">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {report.user_fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {report.user_fullname}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.user_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap min-w-[100px]">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(report.status)}
                      {report.is_unsure && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Unsure
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap min-w-[100px]">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      report.priority === 'emergency' ? 'bg-red-500 text-white shadow-sm' :
                      report.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                      report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      report.priority === 'low' ? 'bg-green-100 text-green-800 border border-green-200' :
                      'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {report.priority ? report.priority.charAt(0).toUpperCase() + report.priority.slice(1) : 'N/A'}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium min-w-[180px]">
                    <div className="flex items-center space-x-2">
                      {getStatusDropdown(report)}
                      {updatingStatus === report.id && (
                        <div className="flex items-center text-gray-500">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[120px] hidden lg:table-cell">
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(report.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-gray-500">
                        {new Date(report.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredAndSortedReports.length > 0 && (
        <div style={{
          padding: 'var(--spacing-4)',
          borderTop: '1px solid var(--gray-200)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--gray-500)'
        }}>
          Showing {filteredAndSortedReports.length} of {reports.length} reports
        </div>
      )}

      <AssignInspectorModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedReport(null);
        }}
        onAssign={() => {
          if (onStatusUpdate) {
            onStatusUpdate(selectedReport.id, selectedReport.status);
          }
        }}
        report={selectedReport}
      />
    </div>
  );
};

export default ReportsTable;
