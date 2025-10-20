import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_URL, API_ENDPOINTS, ERROR_MESSAGES } from "../config";
import { useAuth } from "../hooks/useAuth";
import ReportsMap from "./ReportsMap";

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { logout } = useAuth();

  const { data: reportsData, isLoading: queryLoading, error } = useQuery({
    queryKey: ['allReports'],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_URL}${API_ENDPOINTS.GET_ALL_REPORTS}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        logout();
        throw new Error('Authentication expired');
      }
      if (response.status === 403) {
        throw new Error('Access denied');
      }

      const result = await response.json();
      if (result.status === "success") {
        return result.reports;
      } else {
        throw new Error(result.message || 'Failed to fetch reports');
      }
    },
    enabled: !!localStorage.getItem("authToken"),
  });

  useEffect(() => {
    if (reportsData) {
      const found = reportsData.find((r) => r.id == id);
      if (found) {
        setReport(found);
        setSelectedStatus(found.status);
      }
    }
  }, [reportsData, id]);

  useEffect(() => {
    if (error) {
      console.error(ERROR_MESSAGES.NETWORK_ERROR, error);
    }
  }, [error]);

  const loading = queryLoading;

  const handleStatusUpdate = async (newStatus) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch(`${API_URL}${API_ENDPOINTS.UPDATE_REPORT_STATUS}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          report_id: report.id,
          status: newStatus,
          admin_notes: adminNotes.trim(),
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setReport((prev) => ({
          ...prev,
          status: newStatus,
          admin_notes: result.data.admin_notes,
        }));
        setAdminNotes("");
        setErrorMessage("");
        setSuccessMessage("✅ Status updated successfully!");
        setTimeout(() => setSuccessMessage(""), 2500);
      } else {
        setErrorMessage(result.message || "Failed to update status");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    const colorMap = {
      pending: "bg-yellow-500",
      in_progress: "bg-blue-500",
      verified: "bg-teal-500",
      resolved: "bg-purple-500",
      rejected: "bg-red-500",
      closed: "bg-gray-500",
    };
    return (
      <span
        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white shadow-md ${colorMap[status] || "bg-gray-400"}`}
      >
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );

  if (!report)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Report Not Found</h2>
          <button
            onClick={() => navigate("/reports")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              to="/hazard-reports"
              className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Report Details</h1>
              <p className="text-sm text-gray-500">Comprehensive report overview</p>
            </div>
          </div>
          {getStatusBadge(report.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden border border-gray-100">
              <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold">{report.title}</h2>
                </div>
                {/* <span
                  className={`px-4 py-1 rounded-full font-semibold text-sm ${
                    report.priority === "emergency"
                      ? "bg-red-600"
                      : report.priority === "high"
                      ? "bg-orange-500"
                      : report.priority === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  {report.priority.toUpperCase()}
                </span> */}
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
                  <p className="bg-gray-50 p-4 rounded-xl text-gray-700 leading-relaxed shadow-sm">
                    {report.description}
                  </p>
                </div>

                {report.image_path && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Attached Image</h3>
                    <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                      <img
                        src={report.image_path}
                        alt="Report Image"
                        className="w-full h-auto max-h-96 object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Location & Map</h3>
              <div className="text-sm text-gray-600 mb-3">
                <p><strong>Address:</strong> {report.location_address}</p>
                {report.latitude && (
                  <p><strong>Coordinates:</strong> {report.latitude}, {report.longitude}</p>
                )}
              </div>
              <div className="h-80 rounded-xl overflow-hidden">
                <ReportsMap reports={[report]} />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Report Info */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition border border-gray-100 p-6 space-y-3">
              <h3 className="font-semibold text-gray-800 mb-2">Report Info</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Category:</strong> {report.category_name}</p>
                <p><strong>Reporter:</strong> {report.user_fullname}</p>
                <p><strong>Email:</strong> {report.user_email}</p>
                <p><strong>Date Reported:</strong> {new Date(report.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Status Update */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Update Status</h3>
              <div className="space-y-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={updatingStatus}
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                  <option value="closed">Closed</option>
                </select>

                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add admin notes..."
                  rows={3}
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />

                <button
                  onClick={() => handleStatusUpdate(selectedStatus)}
                  disabled={
                    updatingStatus ||
                    (selectedStatus === report.status && adminNotes.trim() === "")
                  }
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {updatingStatus ? "Updating..." : "Update Status"}
                </button>

                {successMessage && (
                  <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-out z-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{successMessage}</span>
                  </div>
                )}


                {errorMessage && (
                  <p className="text-sm text-red-600 text-center">{errorMessage}</p>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            {report.admin_notes && (
              <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-2">Admin Notes</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg shadow-sm">
                  {report.admin_notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
