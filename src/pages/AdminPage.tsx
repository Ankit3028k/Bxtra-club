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

const mockStats = {
  totalUsers: 1247,
  pendingApplications: 23,
  activeEvents: 8,
  monthlyGrowth: 12.5
};

export const AdminPage: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState(mockPendingUsers);

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
      </div>
    </div>
  );
};