import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, MapPin, Users, Plus, List, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  coverImage?: string;
  type: string;
  category: string;
  capacity: number;
  price: number;
  isFree: boolean;
  isOnline: boolean;
  meetingLink?: string;
  organizer: {
    _id: string;
    name: string;
  };
  registrations: Array<{
    user: {
      _id: string;
      name: string;
    };
    status: string;
    registeredAt: string;
  }>;
  status: string;
  tags: string[];
}

const MyEventsPage: React.FC = () => {
  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'organized' | 'registered'>('organized');
  const { user, isAuthenticated } = useAuthStore();

  const fetchMyEvents = async () => {
    try {
      const response = await api.get('/events/my-events');
      setOrganizedEvents(response.data.organized);
      setRegisteredEvents(response.data.registered);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch your events';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyEvents();
    } else {
      setLoading(false);
    }
  }, [user]);

  const TabButton = ({ tab, icon: Icon, label, count }: { tab: 'organized' | 'registered', icon: any, label: string, count: number }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
        activeTab === tab
          ? 'bg-blue-500 text-white shadow-lg'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-sm ${
        activeTab === tab
          ? 'bg-white/20 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      }`}>
        {count}
      </span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Please Login</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Login to view your events</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-red-500 dark:text-red-400">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            My Events
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage your organized events and track your registrations
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center gap-4 mb-8">
            <TabButton
              tab="organized"
              icon={List}
              label="Organized Events"
              count={organizedEvents.length}
            />
            <TabButton
              tab="registered"
              icon={UserCheck}
              label="Registered Events"
              count={registeredEvents.length}
            />
          </div>

          {/* Content Area */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
            {activeTab === 'organized' ? (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Organized Events</h2>
                  <Link
                    to="/events/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300"
                  >
                    <Plus className="h-5 w-5" />
                    Create Event
                  </Link>
                </div>
                {organizedEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <List className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Organized Events</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Start creating your first event!</p>
                    <Link
                      to="/events/create"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300"
                    >
                      <Plus className="h-5 w-5" />
                      Create Event
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {organizedEvents.map((event) => (
                      <Link
                        key={event._id}
                        to={`/events/${event._id}`}
                        className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                      >
                        <div className="relative h-48 overflow-hidden">
                          {event.coverImage ? (
                            <img
                              src={event.coverImage}
                              alt={event.title}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <Calendar className="h-16 w-16 text-white opacity-50" />
                            </div>
                          )}
                          <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              event.isFree 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            }`}>
                              {event.isFree ? 'Free' : `$${event.price}`}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.isOnline 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                            }`}>
                              {event.isOnline ? 'Online' : 'In-Person'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              {event.type}
                            </span>
                          </div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                            {event.title}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                          <div className="space-y-3">
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{new Date(event.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{event.isOnline ? 'Online Event' : event.location}</span>
                            </div>
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                              <Users className="h-4 w-4 mr-2" />
                              <span>
                                {event.registrations.filter(r => r.status === 'Registered').length} / {event.capacity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8">Registered Events</h2>
                {registeredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Registered Events</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Start exploring and registering for events!</p>
                    <Link
                      to="/events"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300"
                    >
                      Browse Events
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {registeredEvents.map((event) => (
                      <Link
                        key={event._id}
                        to={`/events/${event._id}`}
                        className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                      >
                        <div className="relative h-48 overflow-hidden">
                          {event.coverImage ? (
                            <img
                              src={event.coverImage}
                              alt={event.title}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <Calendar className="h-16 w-16 text-white opacity-50" />
                            </div>
                          )}
                          <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              event.isFree 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            }`}>
                              {event.isFree ? 'Free' : `$${event.price}`}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.isOnline 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                            }`}>
                              {event.isOnline ? 'Online' : 'In-Person'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              {event.type}
                            </span>
                          </div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                            {event.title}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                          <div className="space-y-3">
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{new Date(event.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{event.isOnline ? 'Online Event' : event.location}</span>
                            </div>
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                              <Users className="h-4 w-4 mr-2" />
                              <span>
                                {event.registrations.filter(r => r.status === 'Registered').length} / {event.capacity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyEventsPage; 