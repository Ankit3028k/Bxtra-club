import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { MobileTabBar } from '../components/MobileTabBar';
import { PostCard } from '../components/PostCard';
import { EventCard } from '../components/EventCard';
import { RequestCard } from '../components/RequestCard';
import { SidebarCard } from '../components/SidebarCard';
import { Plus, Search, Filter } from 'lucide-react';
import { CreatePostModal } from '../components/CreatePostModal';
import { CreateEventModal } from '../components/CreateEventModal';
import { CreateRequestModal } from '../components/CreateRequestModal';
import { SearchBar } from '../components/SearchBar';

// Mock data
const mockPosts = [
  {
    id: '1',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150',
      startup: 'TechFlow',
      role: 'CEO'
    },
    content: 'Just closed our Series A! 🎉 Grateful for the amazing journey and excited for what\'s ahead. The BXtra Club community has been instrumental in connecting us with the right investors.',
    tags: ['funding', 'seriesA', 'milestone'],
    likes: 45,
    comments: 12,
    timestamp: '2 hours ago',
    isLiked: false
  },
  {
    id: '2',
    author: {
      name: 'Alex Rodriguez',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      startup: 'DataViz',
      role: 'CTO'
    },
    content: 'Looking for feedback on our new AI-powered analytics dashboard. Would love to connect with fellow founders who have experience in the B2B SaaS space.',
    image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['AI', 'SaaS', 'feedback'],
    likes: 23,
    comments: 8,
    timestamp: '5 hours ago',
    isLiked: true
  }
];

const mockEvents = [
  {
    id: '1',
    title: 'Startup Founders Networking Night',
    description: 'Join us for an exclusive evening of networking with successful entrepreneurs and investors.',
    city: 'San Francisco',
    date: 'March 15, 2024',
    time: '6:00 PM',
    attendees: 45,
    maxAttendees: 50,
    image: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800',
    organizer: 'BXtra Club',
    isJoined: false
  },
  {
    id: '2',
    title: 'AI in Startup Operations Workshop',
    description: 'Learn how to leverage AI tools to streamline your startup operations and scale efficiently.',
    city: 'New York',
    date: 'March 20, 2024',
    time: '2:00 PM',
    attendees: 28,
    maxAttendees: 40,
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    organizer: 'Tech Leaders NYC',
    isJoined: true
  }
];

const mockRequests = [
  {
    id: '1',
    author: {
      name: 'Maria Garcia',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
      startup: 'GreenTech Solutions'
    },
    title: 'Looking for a Technical Co-Founder',
    content: 'We\'re building a sustainable energy platform and need a technical co-founder with experience in IoT and renewable energy systems. Seed funding secured.',
    tags: ['co-founder', 'technical', 'greentech'],
    replies: 15,
    upvotes: 32,
    timestamp: '1 day ago',
    isUpvoted: false
  },
  {
    id: '2',
    author: {
      name: 'David Kim',
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150',
      startup: 'FinanceAI'
    },
    title: 'Seeking Introductions to VCs in Fintech',
    content: 'We\'re raising our Series A and would love warm introductions to VCs who specialize in fintech, particularly in the B2B lending space.',
    tags: ['vc', 'fintech', 'introductions'],
    replies: 8,
    upvotes: 19,
    timestamp: '3 days ago',
    isUpvoted: true
  }
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [posts, setPosts] = useState(mockPosts);
  const [events, setEvents] = useState(mockEvents);
  const [requests, setRequests] = useState(mockRequests);
  const [searchResults, setSearchResults] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Get tab from URL params
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') || 'home';
    setActiveTab(tab);
  }, [user, navigate, location]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/dashboard?tab=${tab}`, { replace: true });
  };

  const handleCreatePost = (postData: { content: string; tags: string[]; image?: string }) => {
    const newPost = {
      id: Date.now().toString(),
      author: {
        name: user!.name,
        avatar: user!.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
        startup: user!.startup,
        role: user!.role
      },
      content: postData.content,
      image: postData.image,
      tags: postData.tags,
      likes: 0,
      comments: 0,
      timestamp: 'Just now',
      isLiked: false
    };
    setPosts([newPost, ...posts]);
  };

  const handleCreateEvent = (eventData: {
    title: string;
    description: string;
    city: string;
    date: string;
    time: string;
    maxAttendees: number;
  }) => {
    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
      attendees: 1,
      image: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800',
      organizer: user!.name,
      isJoined: true
    };
    setEvents([newEvent, ...events]);
  };

  const handleCreateRequest = (requestData: {
    title: string;
    content: string;
    tags: string[];
  }) => {
    const newRequest = {
      id: Date.now().toString(),
      author: {
        name: user!.name,
        avatar: user!.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
        startup: user!.startup
      },
      title: requestData.title,
      content: requestData.content,
      tags: requestData.tags,
      replies: 0,
      upvotes: 0,
      timestamp: 'Just now',
      isUpvoted: false
    };
    setRequests([newRequest, ...requests]);
  };

  const handleSearch = (query: string, filters: any) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    // Mock search implementation
    const results = {
      posts: posts.filter(post => 
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ),
      events: events.filter(event =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase())
      ),
      requests: requests.filter(request =>
        request.title.toLowerCase().includes(query.toLowerCase()) ||
        request.content.toLowerCase().includes(query.toLowerCase())
      )
    };

    setSearchResults(results);
  };

  if (!user) return null;

  if (user.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⏳</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Under Review</h2>
            <p className="text-gray-600 mb-6">
              Thank you for joining BXtra Club! Your application is currently under review by our admin team. 
              You'll receive an email notification once your account is approved.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>What happens next?</strong><br />
                Our team reviews all applications to maintain the quality of our founder community. 
                This process typically takes 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Events</h2>
              <button 
                onClick={() => setShowCreateEvent(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        );
      
      case 'requests':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Requests</h2>
              <button 
                onClick={() => setShowCreateRequest(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Request
              </button>
            </div>
            <div className="space-y-4">
              {requests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>
        );
      
      case 'messages':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Messages</h3>
            <p className="text-gray-600 mb-6">
              Direct messaging feature coming soon! Connect with fellow founders through the platform.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Enable Notifications
            </button>
          </div>
        );
      
      case 'perks':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Exclusive Perks</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'AWS Credits', description: '$5,000 in AWS credits for startups', logo: 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=300' },
                { title: 'Stripe Atlas', description: 'Free company incorporation', logo: 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg?auto=compress&cs=tinysrgb&w=300' },
                { title: 'HubSpot Starter', description: '90% off HubSpot CRM', logo: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=300' }
              ].map((perk, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <img src={perk.logo} alt={perk.title} className="w-full h-32 object-cover rounded-lg mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">{perk.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{perk.description}</p>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                    Claim Perk
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-6 mb-8">
              <img
                src={user.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150`}
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.role} at {user.startup}</p>
                <p className="text-gray-500 text-sm">{user.city} • {user.plan} Plan</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Startup</label>
                <input
                  type="text"
                  value={user.startup}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={user.city}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Update Profile
              </button>
            </div>
          </div>
        );
      
      default: // home
        return (
          <div className="space-y-6">
            <SearchBar onSearch={handleSearch} />
            
            {searchResults && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Search Results</h3>
                <div className="space-y-4">
                  {searchResults.posts.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Posts ({searchResults.posts.length})</h4>
                      {searchResults.posts.slice(0, 3).map((post: any) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                  {searchResults.events.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Events ({searchResults.events.length})</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {searchResults.events.slice(0, 2).map((event: any) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    </div>
                  )}
                  {searchResults.requests.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Requests ({searchResults.requests.length})</h4>
                      {searchResults.requests.slice(0, 2).map((request: any) => (
                        <RequestCard key={request.id} request={request} />
                      ))}
                    </div>
                  )}
                  {searchResults.posts.length === 0 && searchResults.events.length === 0 && searchResults.requests.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No results found. Try different keywords.</p>
                  )}
                </div>
                <button
                  onClick={() => setSearchResults(null)}
                  className="mt-4 text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  Clear search results
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h2>
                <p className="text-gray-600">See what's happening in the founder community</p>
              </div>
              <button 
                onClick={() => setShowCreatePost(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </button>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={user.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150`}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <input
                  type="text"
                  placeholder="Share an update with the community..."
                  onClick={() => setShowCreatePost(true)}
                  readOnly
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button 
                  onClick={() => setShowCreatePost(true)}
                  className="text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {!searchResults && (
              <div>
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80">
            <SidebarCard />
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="pb-20 md:pb-0">
        <MobileTabBar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={handleCreatePost}
      />
      <CreateEventModal
        isOpen={showCreateEvent}
        onClose={() => setShowCreateEvent(false)}
        onSubmit={handleCreateEvent}
      />
      <CreateRequestModal
        isOpen={showCreateRequest}
        onClose={() => setShowCreateRequest(false)}
        onSubmit={handleCreateRequest}
      />
    </div>
  );
};