
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Briefcase, Mail, MapPin, Calendar, Shield, DollarSign, TrendingUp, BarChart2, MessageSquare } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import config from '../config/config';
import { useAuth } from '../contexts/AuthContext';

interface UserDetails {
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
  bio?: string;
  interests?: string[];
  socials?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  activity?: {
    posts: number;
    comments: number;
    eventsAttended: number;
  };
}

export const UserDetailsPage: React.FC = () => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const { user: adminUser, isLoading: adminLoading } = useAuth();

  useEffect(() => {
    if (adminLoading) return;
    if (!adminUser || adminUser.role !== 'admin') {
      // or redirect to login
      setError("You are not authorized to view this page.");
      setLoading(false);
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('bxtra-token');
        const res = await fetch(`${config.backendUrl}/api/admin/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch user details');
        }
        const data = await res.json();
        const userWithActivity = {
          ...data.user,
          activity: {
            posts: data.stats.posts || 0,
            comments: 0, // Placeholder for comments
            eventsAttended: data.stats.events || 0,
          }
        };
        setUser(userWithActivity);
       
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id, adminUser, adminLoading]);

  if (loading || adminLoading) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!user) {
    return <div className="text-center mt-10">User not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="text-purple-600 hover:text-purple-800 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
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
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - User Profile */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="h-24 w-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-4xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.role} at {user.startup}</p>
              <div className="mt-4 flex justify-center space-x-4">
                {user.socials?.linkedin && <a href={user.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">LinkedIn</a>}
                {user.socials?.twitter && <a href={user.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">Twitter</a>}
                {user.socials?.website && <a href={user.socials.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-600">Website</a>}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Bio</h3>
              <p className="text-gray-600 text-sm">{user.bio || "No bio provided."}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests?.map(interest => (
                  <span key={interest} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{interest}</span>
                )) || <p className="text-gray-500 text-sm">No interests listed.</p>}
              </div>
            </div>
          </div>

          {/* Right Column - Details & Activity */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Account Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">City</p>
                    <p className="text-gray-900 font-medium">{user.city}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Joined</p>
                    <p className="text-gray-900 font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'approved' ? 'bg-green-100 text-green-800' :
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Membership</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Plan</p>
                    <p className="text-gray-900 font-medium">{user.plan}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Payment Status</p>
                    <p className="text-gray-900 font-medium">{user.paymentStatus || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Community Activity</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <BarChart2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{user.activity?.posts || 0}</p>
                  <p className="text-gray-500 text-sm">Posts</p>
                </div>
                <div>
                  <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{user.activity?.comments || 0}</p>
                  <p className="text-gray-500 text-sm">Comments</p>
                </div>
                <div>
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{user.activity?.eventsAttended || 0}</p>
                  <p className="text-gray-500 text-sm">Events Attended</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
