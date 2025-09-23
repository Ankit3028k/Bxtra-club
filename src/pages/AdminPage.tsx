import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Users, Calendar, MessageSquare, TrendingUp } from 'lucide-react';

const mockPendingUsers = [
  {
    id: '3',
    name: 'Jennifer Liu',
    email: 'jennifer@techstartup.com',
    startup: 'TechStartup',
    role: 'CEO',
    city: 'Seattle',
    appliedAt: '2024-03-10',
    plan: 'Premium'
  },
  {
    id: '4',
    name: 'Marcus Johnson',
    email: 'marcus@innovateai.com',
    startup: 'InnovateAI',
    role: 'CTO',
    city: 'Boston',
    appliedAt: '2024-03-09',
    plan: 'Basic'
  }
];

const mockUsers = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@startup.com',
    plan: 'Premium',
    paymentStatus: 'Paid'
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah@tech.io',
    plan: 'Basic',
    paymentStatus: 'Unpaid'
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael@ai.com',
    plan: 'Premium',
    paymentStatus: 'Paid'
  },
  {
    id: '4',
    name: 'Emma Rodriguez',
    email: 'emma@health.com',
    plan: 'Enterprise',
    paymentStatus: 'Pending'
  }
];

const mockStats = {
  totalUsers: 1247,
  pendingApplications: 23,
  activeEvents: 8,
  monthlyGrowth: 12.5
};

export const AdminPage: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState(mockPendingUsers);
  const [users] = useState(mockUsers);

  const handleApprove = (userId: string) => {
    setPendingUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleReject = (userId: string) => {
    setPendingUsers(prev => prev.filter(user => user.id !== userId));
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
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Applications</p>
                <p className="text-2xl font-bold text-orange-600">{mockStats.pendingApplications}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Events</p>
                <p className="text-2xl font-bold text-green-600">{mockStats.activeEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Monthly Growth</p>
                <p className="text-2xl font-bold text-purple-600">+{mockStats.monthlyGrowth}%</p>
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
            {pendingUsers.length === 0 ? (
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
                            <p className="text-gray-900">{user.appliedAt}</p>
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                          user.paymentStatus === 'Unpaid' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.paymentStatus}
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