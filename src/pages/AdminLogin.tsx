import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { success, message } = await login(
        { email: formData.email, password: formData.password },
        true // isAdmin flag
      );
      
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError(message || 'Invalid admin credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <div className="h-12 w-12 bg-gradient-to-r from-gray-800 to-gray-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">AD</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
            <p className="text-gray-600 mt-2">Sign in to manage BXtra Club</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent"
                  placeholder="admin@bxtraclub.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gray-800 to-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-gray-900 hover:to-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In as Admin'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Regular user?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-800 font-semibold">
                User Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
