import React from 'react';
import { TrendingUp, Users, Star } from 'lucide-react';

interface TopFounder {
  id: string;
  name: string;
  avatar: string;
  startup: string;
  city: string;
  connections: number;
  isVerified?: boolean;
}

const mockTopFounders: TopFounder[] = [
  {
    id: '1',
    name: 'Alex Chen',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
    startup: 'DataFlow',
    city: 'San Francisco',
    connections: 1240,
    isVerified: true,
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
    startup: 'GreenTech',
    city: 'Austin',
    connections: 980,
  },
  {
    id: '3',
    name: 'David Kim',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150',
    startup: 'AI Solutions',
    city: 'New York',
    connections: 856,
    isVerified: true,
  },
];

export const SidebarCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
        <h3 className="font-bold text-gray-900">Top Founders</h3>
      </div>

      <div className="space-y-4">
        {mockTopFounders.map((founder, index) => (
          <div key={founder.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="relative">
              <img
                src={founder.avatar}
                alt={founder.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              {founder.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Star className="h-3 w-3 text-white fill-current" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">{founder.name}</h4>
              <p className="text-gray-600 text-xs">{founder.startup} • {founder.city}</p>
              <div className="flex items-center mt-1">
                <Users className="h-3 w-3 text-gray-500 mr-1" />
                <span className="text-xs text-gray-500">{founder.connections.toLocaleString()} connections</span>
              </div>
            </div>

            <div className="text-right">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                #{index + 1}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all">
        View All Founders
      </button>
    </div>
  );
};