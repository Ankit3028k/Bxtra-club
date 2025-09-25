import React, { useState } from 'react';
import { Menu, X, Bell, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationBell } from './NotificationBell';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
  showMobileToggle?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle, showMobileToggle }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {showMobileToggle && (
              <button
                onClick={onMobileMenuToggle}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            
            <Link to="/dashboard" className="flex items-center ml-2">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BX</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">BXtra Club</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
              Home
            </Link>
            <Link to="/dashboard?tab=events" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
              Events
            </Link>
            <Link to="/dashboard?tab=requests" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
              Requests
            </Link>
            <Link to="/dashboard?tab=messages" className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
              Messages
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationBell />
            <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
              <MessageCircle className="h-5 w-5" />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <img
                  src={user?.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150`}
                  alt={user?.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-gray-500 text-xs">{user?.startup}</p>
                    </div>
                    <Link
                      to="/dashboard?tab=profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/choose-plan"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Plan
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};