import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Users, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import config from '../config/config';
interface AdminUser {
  id: string;
  name: string;
  email: string;
  startup: string;
  role: string;
  city: string;
  plan: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  paymentStatus?: 'Paid' | 'Unpaid' | 'Pending';
}

interface AdminStats {
  users: {
    total: number;
    pending: number;
    approved: number;
    newThisMonth: number;
  };
  content: {
    posts: number;
    events: number;
    requests: number;
  };
  monthlyGrowth?: number; // Assuming this might come from somewhere else or be calculated
};

export const AdminPage: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats>({ users: { total: 0, pending: 0, approved: 0, newThisMonth: 0 }, content: { posts: 0, events: 0, requests: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      navigate('/admin/login');
      return;
    }

    const fetchData = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('bxtra-token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [usersRes, statsRes] = await Promise.all([
          fetch(`${config.backendUrl}/api/admin/users`, { headers }),
          fetch(`${config.backendUrl}/api/admin/stats`, { headers }),
        ]);

        if (!usersRes.ok || !statsRes.ok) {
          throw new Error('Failed to fetch admin data');
        }

        const usersData = await usersRes.json();
        const statsData = await statsRes.json();

        setPendingUsers(usersData.users.filter((u: AdminUser) => u.status === 'pending'));
        setUsers(usersData.users.filter((u: AdminUser) => u.status === 'approved'));
        setStats(statsData.stats);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isLoading, navigate]);

  if (isLoading || !user || user.role !== 'admin') {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner /></div>;
  }

  const handleApprove = async (userId: string) => {
    try {
      const token = localStorage.getItem('bxtra-token');
      const res = await fetch(`${config.backendUrl}/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to approve user');
      
      const approvedUser = pendingUsers.find(u => u.id === userId);
      if (approvedUser) {
        setUsers(prev => [...prev, { ...approvedUser, status: 'approved' }]);
      }
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Failed to approve user.");
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const token = localStorage.getItem('bxtra-token');
      const res = await fetch(`${config.backendUrl}/api/admin/users/${userId}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to reject user');
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Failed to reject user.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-purple-600 hover:text-purple-800 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">BXtra Club Admin</h1>
            </div> 
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BX</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && <LoadingSpinner />}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">{error}</div>}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Applications</p>
                <p className="text-2xl font-bold text-orange-600">{stats.users.pending}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Events</p>
                <p className="text-2xl font-bold text-green-600">{stats.content.events}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Monthly Growth</p>
                <p className="text-2xl font-bold text-purple-600">+{stats.monthlyGrowth || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Pending Applications</h2>
            <p className="text-gray-600 mt-1">Review and approve new founder applications</p>
          </div>

          <div className="p-6">
            {!loading && pendingUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600">No pending applications to review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="h-12 w-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-gray-600 text-sm">{user.role} at {user.startup}</p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Email:</span>
                            <p className="text-gray-900">{user.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">City:</span>
                            <p className="text-gray-900">{user.city}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Plan:</span>
                            <p className="text-gray-900">{user.plan}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Applied:</span>
                            <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 ml-6">
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">All Users</h2>
            <p className="text-gray-600 mt-1">View and manage all registered users</p>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* Payment status is not available from the backend yet */}
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          N/A
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-purple-600 hover:text-purple-900">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};