import React from 'react';
import { Calendar, MapPin, Users, ExternalLink } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  city: string;
  date: string;
  time: string;
  attendees: number;
  maxAttendees: number;
  image: string;
  organizer: string;
  isJoined?: boolean;
}

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="relative h-48">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white bg-opacity-90 text-purple-600 font-semibold px-3 py-1 rounded-full text-sm">
            {event.city}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-3 text-purple-500" />
            <span className="text-sm">{event.date} at {event.time}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-3 text-purple-500" />
            <span className="text-sm">{event.city}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-3 text-purple-500" />
            <span className="text-sm">{event.attendees}/{event.maxAttendees} attending</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Organized by {event.organizer}
          </div>
          {event.isJoined ? (
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
              Joined ✓
            </button>
          ) : (
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center">
              Join Event
              <ExternalLink className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};