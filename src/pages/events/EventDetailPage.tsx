import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image?: string;
  organizer: {
    _id: string;
    name: string;
  };
  attendees: Array<{
    _id: string;
    name: string;
  }>;
  maxAttendees: number;
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAttending, setIsAttending] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/api/events/${id}`);
        setEvent(response.data);
        setIsAttending(response.data.attendees.some(
          (attendee: any) => attendee._id === localStorage.getItem('userId')
        ));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch event details');
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleAttend = async () => {
    try {
      await axios.post(`/api/events/${id}/attend`);
      setEvent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          attendees: [...prev.attendees, { _id: localStorage.getItem('userId')!, name: 'You' }]
        };
      });
      setIsAttending(true);
    } catch (err) {
      setError('Failed to register for event');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error || 'Event not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {event.image && (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
          )}

          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
            <p className="text-gray-600 mb-6">{event.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <span>{new Date(event.date).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-500 mr-2" />
                <span>{event.attendees.length} / {event.maxAttendees} attendees</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Organized by {event.organizer.name}</p>
              </div>
              <button
                onClick={handleAttend}
                disabled={isAttending || event.attendees.length >= event.maxAttendees}
                className={`px-6 py-2 rounded-md ${
                  isAttending
                    ? 'bg-green-500 text-white'
                    : event.attendees.length >= event.maxAttendees
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isAttending
                  ? 'Attending'
                  : event.attendees.length >= event.maxAttendees
                  ? 'Event Full'
                  : 'Attend Event'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage; 