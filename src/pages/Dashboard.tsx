import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { MobileTabBar } from '../components/MobileTabBar';
import { PostCard } from '../components/PostCard';
import { EventCard } from '../components/EventCard';
import { RequestCard } from '../components/RequestCard';
import { SidebarCard } from '../components/SidebarCard';
import { Plus } from 'lucide-react';
import { CreatePostModal } from '../components/CreatePostModal';
import { CreateEventModal } from '../components/CreateEventModal';
import { CreateRequestModal } from '../components/CreateRequestModal';
import { SearchBar } from '../components/SearchBar';
import config from '../config/config';
interface User {
  id: string;
  name: string;
  email: string;
  startup: string;
  role: string;
  city: string;
  status: 'pending' | 'approved';
  plan: string;
  avatar?: string;
}

interface PostAuthor {
  name: string;
  avatar: string;
  startup: string;
  role: string;
}

interface Post {
  _id: string;
  author: PostAuthor;
  content: string;
  image?: string;
  tags: string[];
  likes: string[]; // Assuming likes are user ids
  comments: any[]; // Define a proper comment type if available
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  city: string;
  date: string;
  time: string;
  maxAttendees: number;
  attendees: number;
  image: string;
  organizer: string;
  isJoined: boolean;
}

export const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') || 'home';
    setActiveTab(tab);

    const fetchPosts = async () => {
      try {
        const response = await fetch(`${config.backendUrl}/api/posts`);
        const data = await response.json();
        if (data.success) {
          setPosts(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [user, navigate, location, isLoading]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/dashboard?tab=${tab}`, { replace: true });
  };

  const handleCreatePost = async (postData: { content: string; tags: string[]; image?: string }) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bxtra-token')}`
        },
        body: JSON.stringify({
          content: postData.content,
          tags: postData.tags,
          image: postData.image
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw {
          message: data.message || 'Failed to create post',
          errors: data.errors
        };
      }

      const newPost = data.post;
      setPosts([newPost, ...posts]);
    } catch (error) {
      console.error('Create post error:', error);
      alert('Failed to create post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`${config.backendUrl}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('bxtra-token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setPosts(posts.filter(p => p._id !== postId));
    } catch (error) {
      console.error('Delete post error:', error);
      alert('Failed to delete post');
    }
  };

  const handleCreateEvent = async (eventData: {
    title: string;
    description: string;
    city: string;
    date: string;
    time: string;
    maxAttendees: number;
    image: File | null;
  }) => {
    try {
      console.log('Submitting event data:', eventData);
      const formData = new FormData();
      formData.append('title', eventData.title);
      formData.append('description', eventData.description);
      formData.append('city', eventData.city);
      formData.append('date', eventData.date);
      formData.append('time', eventData.time);
      formData.append('maxAttendees', eventData.maxAttendees.toString());
      
      if (eventData.image) {
        formData.append('image', eventData.image);
      }

      const response = await fetch(`${config.backendUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('bxtra-token')}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw {
          message: data.message || 'Failed to create event',
          errors: data.errors
        };
      }

      const newEvent = data.event;
      setEvents([newEvent, ...events]);
    } catch (error) {
      console.error('Create event error:', error);
      alert('Failed to create event');
    }
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

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    const results = {
      posts: posts.filter(post => 
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
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

  const handlePlanChange = (plan: string) => {
    alert(`Plan changed to ${plan}`);
    // In a real app, this would call an API to update the user's plan
  };
  
  const handleUpgrade = async () => {
    try {
      // This would call an API to upgrade the user's plan
      alert('Plan upgrade successful! You can now create events.');
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to upgrade plan');
    }
  };

  if (isLoading) return null;

  if (!user || user.status === 'pending') {
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
              
              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Plan</label>
                <div className="flex flex-wrap gap-4">
                  {['Free', 'Premium', 'Business'].map((plan) => (
                    <div 
                      key={plan}
                      className={`px-4 py-2 border rounded-lg cursor-pointer ${user.plan === plan ? 'bg-purple-100 border-purple-500' : 'border-gray-300'}`}
                      onClick={() => handlePlanChange(plan)}
                    >
                      {plan}
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                onClick={handleUpgrade}
              >
                {user.plan === 'Free' ? 'Upgrade Plan' : 'Change Plan'}
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
                        <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
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
                {postsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard 
                      key={post._id} 
                      post={{
                        id: post._id,
                        author: {
                          name: post.author?.name || 'Unknown',
                          avatar: post.author?.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
                          startup: post.author?.startup || 'Unknown',
                          role: post.author?.role || 'Unknown'
                        },
                        content: post.content,
                        image: post.image,
                        tags: post.tags,
                        likes: post.likes.length,
                        comments: post.comments.length,
                        timestamp: new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        isLiked: user ? post.likes.includes(user.id) : false,
                      }} 
                      onDelete={handleDeletePost} 
                    />
                  ))
                )}
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