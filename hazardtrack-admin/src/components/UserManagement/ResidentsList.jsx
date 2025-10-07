import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../config';

export default function ResidentsList() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const residentsPerPage = 10;

  const fetchResidents = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: currentPage,
        limit: residentsPerPage,
        status: statusFilter,
        search: searchTerm,
        role: 'resident'
      });

      const response = await fetch(`${API_URL}/get_users.php?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setResidents(result.users || []);
          setTotalPages(Math.ceil((result.total || 0) / residentsPerPage));
        }
      }
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchResidents();
  };

  const handleStatusToggle = async (userId, currentIsActive) => {
    try {
      const token = localStorage.getItem('authToken');
      const newIsActive = currentIsActive === 1 ? 0 : 1;

      const response = await fetch(`${API_URL}/update_user_status.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId,
          is_active: newIsActive
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          // Update local state
          setResidents(residents.map(resident =>
            resident.id === userId ? { ...resident, is_active: newIsActive } : resident
          ));
        }
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <div className="main-content">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 font-montserrat">Residents Management</h1>
            <div className="text-sm text-gray-600">
              Total Residents: {residents.length}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search residents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <button
                  onClick={handleSearch}
                  className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Residents Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading residents...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reports Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {residents.map((resident) => (
                      <tr key={resident.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{resident.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{resident.fullname || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{resident.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{resident.phone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resident.is_active === 1 ? 'active' : 'inactive')}`}>
                            {resident.is_active === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{resident.reports_count || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(resident.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleStatusToggle(resident.id, resident.is_active)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              resident.is_active === 1
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {resident.is_active === 1 ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {residents.length === 0 && !loading && (
                  <div className="p-8 text-center text-gray-500">
                    No residents found matching your criteria.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
