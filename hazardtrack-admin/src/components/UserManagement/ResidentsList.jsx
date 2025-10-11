import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../config';
import useDebounce from '../../hooks/useDebounce'; // Import the custom hook

// --- Helper & Skeleton Components ---

const SearchIcon = () => (
  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const ChevronLeftIcon = () => ( <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>);
const ChevronRightIcon = () => ( <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>);


// A skeleton loader to provide a better loading UX
const TableSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead>
        <tr>
          {[...Array(7)].map((_, i) => (
            <th key={i} className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {[...Array(10)].map((_, i) => (
          <tr key={i}>
            {[...Array(7)].map((_, j) => (
              <td key={j} className="px-6 py-4"><div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- Main Component ---

export default function ResidentsList() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounce search term

  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0); // For total residents count
  const residentsPerPage = 10;

  const fetchResidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: currentPage,
        limit: residentsPerPage,
        status: statusFilter,
        search: debouncedSearchTerm,
        role: 'resident'
      });

      const response = await fetch(`${API_URL}/get_users.php?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch data.');
      
      const result = await response.json();
      if (result.status === 'success') {
        setResidents(result.users || []);
        const total = result.total || 0;
        setTotalCount(total);
        setTotalPages(Math.ceil(total / residentsPerPage));
      } else {
        throw new Error(result.message || 'An unknown error occurred.');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching residents:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearchTerm]);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  const handleStatusToggle = async (userId, currentIsActive) => {
    const newIsActive = currentIsActive === 1 ? 0 : 1;
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/update_user_status.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ user_id: userId, is_active: newIsActive })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setResidents(residents.map(res =>
          res.id === userId ? { ...res, is_active: newIsActive } : res
        ));
      }
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  const getStatusBadgeClasses = (isActive) => {
    if (isActive) {
      return 'bg-green-100 text-green-700'; // Active
    }
    return 'bg-gray-100 text-gray-700'; // Inactive
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 className="text-xl font-bold text-gray-800">Residents Management</h2>
            <p className="text-sm text-gray-500">Total Residents: <span className="font-medium text-gray-700">{totalCount}</span></p>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <SearchIcon />
            <input
              type="text"
              placeholder="Find a resident..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="p-8 text-center text-red-600 bg-red-50">
            <p><strong>Oops!</strong> Could not load residents. {error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Full Name', 'Email', 'Phone', 'Status', 'Reports', 'Joined', 'Actions'].map(header => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {residents.length > 0 ? residents.map((resident) => (
                  <tr key={resident.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resident.fullname || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{resident.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{resident.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeClasses(resident.is_active === 1)}`}>
                        {resident.is_active === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{resident.reports_count || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(resident.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleStatusToggle(resident.id, resident.is_active)}
                        className={`font-medium transition-colors ${
                          resident.is_active === 1
                            ? 'text-red-600 hover:text-red-800'
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {resident.is_active === 1 ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">No residents found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon /> Previous
          </button>
          <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  );
}