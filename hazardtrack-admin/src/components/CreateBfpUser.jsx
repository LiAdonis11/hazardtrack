import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function CreateBfpUser() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    if (!fullname || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter.');
      return false;
    }
    if (!/\d/.test(password)) {
      setError('Password must contain at least one number.');
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('Password must contain at least one special character.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/create_bfp_account.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullname,
          email,
          password,
          phone,
          address,
          role: 'bfp_personnel'
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setSuccessMessage('BFP personnel account created successfully.');
        setError('');
        // Optionally redirect or clear form
        setTimeout(() => {
          navigate('/users');
        }, 2000);
      } else {
        setError(result.message || 'Failed to create account.');
        setSuccessMessage('');
      }
    } catch {
      setError('Network error. Please try again.');
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <div className="main-content max-w-md mx-auto p-4 bg-white rounded shadow">
          <h1 className="text-xl font-semibold mb-4">Create BFP Personnel Account</h1>
          {error && <div className="mb-4 text-red-600">{error}</div>}
          {successMessage && <div className="mb-4 text-green-600">{successMessage}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="block mb-1 font-medium" htmlFor="fullname">Full Name *</label>
              <input
                id="fullname"
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium" htmlFor="email">Email Address *</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium" htmlFor="password">Password *</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium" htmlFor="confirmPassword">Confirm Password *</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium" htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
