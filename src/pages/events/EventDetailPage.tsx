import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, MapPin, Users, Clock, Link, CheckCircle } from 'lucide-react';
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

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data);
        // Check if current user is registered
        if (user) {
          const isUserRegistered = response.data.registrations.some(
            (reg: any) => reg.user._id === user._id && reg.status === 'Registered'
          );
          console.log('Registration check:', {
            userId: user._id,
            registrations: response.data.registrations,
            isRegistered: isUserRegistered
          });
          setIsRegistered(isUserRegistered);
        }
        setLoading(false);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch event details';
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register for events');
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`/events/${id}/register`);
      setEvent(response.data);
      setIsRegistered(true);
      toast.success('Successfully registered for the event!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to register for event';
      toast.error(errorMessage);
    }
  };

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

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-red-500 dark:text-red-400">{error || 'Event not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  const registeredCount = event.registrations.filter(r => r.status === 'Registered').length;
  const isFull = registeredCount >= event.capacity;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-red-500 dark:text-red-400">{error}</div>
          </div>
        ) : !event ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-gray-500 dark:text-gray-400">Event not found</div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Event Header */}
            <div className="mb-12">
              <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-xl">
                {event.coverImage ? (
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Calendar className="h-24 w-24 text-white opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.isFree 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {event.isFree ? 'Free' : `$${event.price}`}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.isOnline 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                    }`}>
                      {event.isOnline ? 'Online' : 'In-Person'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {event.type}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-4">{event.title}</h1>
                  <div className="flex flex-wrap gap-6 text-white/90">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{event.isOnline ? 'Online Event' : event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      <span>
                        {event.registrations.filter(r => r.status === 'Registered').length} / {event.capacity} registered
                      </span>
                    </div>
                    {event.isOnline && event.meetingLink && (
                      <div className="flex items-center">
                        <Link className="h-5 w-5 mr-2" />
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-200 transition-colors"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">About</h2>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                </div>

                {/* Details Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Type</h3>
                      <p className="text-gray-600 dark:text-gray-400">{event.type}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Category</h3>
                      <p className="text-gray-600 dark:text-gray-400">{event.category}</p>
                    </div>
                    {event.tags && event.tags.length > 0 && (
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {event.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Registration Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 sticky top-8">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Registration</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Price</h3>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {event.isFree ? 'Free' : `$${event.price}`}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Capacity</h3>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-500 h-2.5 rounded-full"
                          style={{
                            width: `${(event.registrations.filter(r => r.status === 'Registered').length / event.capacity) * 100}%`
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {event.registrations.filter(r => r.status === 'Registered').length} / {event.capacity} spots filled
                      </p>
                    </div>
                    {isRegistered ? (
                      <div className="text-center py-4 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-xl">
                        <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                        <p className="font-medium">You are registered for this event</p>
                      </div>
                    ) : (
                      <button
                        onClick={handleRegister}
                        disabled={isRegistered || event.registrations.filter(r => r.status === 'Registered').length >= event.capacity}
                        className={`w-full py-4 rounded-xl text-white font-medium transition-all duration-300 ${
                          isRegistered || event.registrations.filter(r => r.status === 'Registered').length >= event.capacity
                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        }`}
                      >
                        {isRegistered
                          ? 'Registered'
                          : event.registrations.filter(r => r.status === 'Registered').length >= event.capacity
                          ? 'Event Full'
                          : 'Register Now'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Organizer Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Organizer</h2>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-white">
                        {event.organizer.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{event.organizer.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Event Organizer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailPage; 