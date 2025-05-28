import { motion } from 'framer-motion';
import { Calendar, Clock, DollarSign, MapPin, Briefcase, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Gig {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  duration: string;
  location: string;
  experience: string;
  postedBy: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  createdAt: string;
  category: string;
  deadline: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
}

const GigDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGigDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/gigs/${id}`);
        setGig(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch gig details');
        toast.error('Failed to fetch gig details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGigDetails();
    }
  }, [id]);

  const handleApply = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to apply for gigs');
      navigate('/login');
      return;
    }
    // TODO: Implement apply functionality
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error || 'Gig not found'}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4">{gig.title}</h1>
            <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
              <div className="flex items-center">
                <DollarSign size={18} className="mr-2" />
                ₹{gig.budget}
              </div>
              <div className="flex items-center">
                <Clock size={18} className="mr-2" />
                {gig.duration}
              </div>
              <div className="flex items-center">
                <MapPin size={18} className="mr-2" />
                {gig.location}
              </div>
              <div className="flex items-center">
                <Calendar size={18} className="mr-2" />
                {new Date(gig.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {gig.skills.map((skill, index) => (
                <span key={index} className="badge-primary">{skill}</span>
              ))}
            </div>
          </div>
          <button 
            onClick={handleApply}
            className="btn-primary"
            disabled={gig.status !== 'Open'}
          >
            {gig.status === 'Open' ? 'Apply Now' : 'Not Accepting Applications'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Project Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{gig.description}</p>
          </section>

          {/* Requirements */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Requirements</h2>
            <ul className="space-y-3">
              {[
                `Experience Level: ${gig.experience}`,
                `Category: ${gig.category}`,
                `Duration: ${gig.duration}`,
                `Location: ${gig.location}`,
                `Deadline: ${new Date(gig.deadline).toLocaleDateString()}`,
              ].map((req, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle size={20} className="text-primary-600 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-600">{req}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">About the Client</h3>
            <div className="space-y-3 text-gray-600">
              <p>
                <strong>Name:</strong> {gig.postedBy.name}
              </p>
              <p>
                <strong>Location:</strong> {gig.location}
              </p>
              <p>
                <strong>Experience Required:</strong> {gig.experience}
              </p>
              <p>
                <strong>Project Status:</strong> {gig.status}
              </p>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">Project Details</h3>
            <div className="space-y-3 text-gray-600">
              <p>
                <strong>Duration:</strong> {gig.duration}
              </p>
              <p>
                <strong>Budget:</strong> ₹{gig.budget}
              </p>
              <p>
                <strong>Category:</strong> {gig.category}
              </p>
              <p>
                <strong>Posted:</strong> {new Date(gig.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GigDetailPage;