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

interface Application {
  _id: string;
  freelancer: {
    _id: string;
    name: string;
    title: string;
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const GigDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gig, setGig] = useState<Gig | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchGigDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/gigs/${id}`);
        setGig(response.data);
        
        // Fetch applications if user is authenticated
        const token = localStorage.getItem('token');
        if (token) {
          const applicationsResponse = await axios.get(`http://localhost:5000/api/gigs/${id}/applications`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setApplications(applicationsResponse.data);
          setIsAuthenticated(true);
          setIsClient(response.data.postedBy._id === localStorage.getItem('userId'));
        }
        
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

  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to perform this action');
        navigate('/login');
        return;
      }

      await axios.put(
        `http://localhost:5000/api/gigs/${id}/applications/${applicationId}`,
        { status: action === 'accept' ? 'accepted' : 'rejected' },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Refresh applications after action
      const response = await axios.get(`http://localhost:5000/api/gigs/${id}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setApplications(response.data);
      
      toast.success(`Application ${action}ed successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} application`);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to apply');
        navigate('/login');
        return;
      }

      await axios.post(
        `http://localhost:5000/api/gigs/${id}/apply`,
        { message: applicationMessage },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Application submitted successfully');
      setShowApplyModal(false);
      setApplicationMessage('');
      
      // Refresh applications
      const response = await axios.get(`http://localhost:5000/api/gigs/${id}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setApplications(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to save gigs');
        navigate('/login');
        return;
      }

      if (isSaved) {
        await axios.delete(`http://localhost:5000/api/gigs/${id}/save`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setIsSaved(false);
        toast.success('Gig removed from saved items');
      } else {
        await axios.post(
          `http://localhost:5000/api/gigs/${id}/save`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setIsSaved(true);
        toast.success('Gig saved successfully');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save gig');
    }
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      ) : !gig ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Gig not found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{gig.title}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  gig.status === 'active' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400' :
                  gig.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                }`}>
                  {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                </span>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400">{gig.description}</p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">${gig.budget}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{gig.duration}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{gig.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience Level</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{gig.experience}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {gig.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm font-medium bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Applications Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Applications</h2>
              {applications.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
              ) : (
                <div className="space-y-4">
                  {applications.map(application => (
                    <div
                      key={application.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {application.freelancer.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {application.freelancer.title}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          application.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400' :
                          application.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400' :
                          'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{application.message}</p>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApplicationAction(application.id, 'reject')}
                          className="btn-ghost text-red-600 dark:text-red-400"
                          disabled={application.status !== 'pending'}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApplicationAction(application.id, 'accept')}
                          className="btn-primary"
                          disabled={application.status !== 'pending'}
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">About the Client</h2>
              <div className="flex items-center mb-4">
                <img
                  src={gig.client.avatar}
                  alt={gig.client.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{gig.client.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{gig.client.title}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{gig.client.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Member since {new Date(gig.client.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                <button
                  onClick={handleApply}
                  className="w-full btn-primary"
                  disabled={!isAuthenticated || isClient}
                >
                  {isAuthenticated ? 'Apply Now' : 'Sign in to Apply'}
                </button>
                <button
                  onClick={handleSave}
                  className="w-full btn-ghost"
                  disabled={!isAuthenticated}
                >
                  {isSaved ? 'Saved' : 'Save Gig'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Apply for this Gig</h2>
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cover Letter
                </label>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GigDetailPage;