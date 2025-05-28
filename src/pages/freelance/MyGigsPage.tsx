import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import PaymentButton from '../../components/payment/PaymentButton';

interface Application {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  coverLetter: string;
  proposedBudget: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  submittedAt: string;
  paymentDetails?: {
    paymentStatus: 'Completed' | 'Pending' | 'Failed';
  };
}

interface Gig {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  duration: string;
  location: string;
  experience: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  applications: Application[];
  createdAt: string;
}

const MyGigsPage = () => {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGig, setExpandedGig] = useState<string | null>(null);
  const [showGigMenu, setShowGigMenu] = useState<string | null>(null);

  const fetchMyGigs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to view your gigs');
        navigate('/login');
        return;
      }

      console.log('Fetching gigs with token:', token.substring(0, 10) + '...');
      
      const response = await axios.get('http://localhost:5000/api/gigs/my-gigs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        console.log('Received gigs:', response.data.length);
        setGigs(response.data);
        setError(null);
      }
    } catch (err: any) {
      console.error('Error fetching gigs:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      const errorMessage = err.response?.data?.message || 'Failed to fetch your gigs';
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (err.response?.status === 401) {
        console.log('Unauthorized access, redirecting to login');
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGigs();
  }, []);

  const handleUpdateApplicationStatus = async (gigId: string, applicationId: string, status: 'Accepted' | 'Rejected') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to update application status');
        navigate('/login');
        return;
      }

      await axios.put(
        `http://localhost:5000/api/gigs/${gigId}/applications/${applicationId}`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Application status updated successfully');
      fetchMyGigs(); // Refresh the gigs list
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update application status');
    }
  };

  const handleUpdateGigStatus = async (gigId: string, status: Gig['status']) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to update gig status');
        navigate('/login');
        return;
      }

      await axios.put(
        `http://localhost:5000/api/gigs/${gigId}/status`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Gig status updated successfully');
      fetchMyGigs(); // Refresh the gigs list
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update gig status');
    }
  };

  const handleDeleteGig = async (gigId: string) => {
    if (!window.confirm('Are you sure you want to delete this gig?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to delete gig');
        navigate('/login');
        return;
      }

      await axios.delete(
        `http://localhost:5000/api/gigs/${gigId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Gig deleted successfully');
      fetchMyGigs(); // Refresh the gigs list
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete gig');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getGigStatusColor = (status: Gig['status']) => {
    switch (status) {
      case 'Open':
        return 'text-green-600 bg-green-50';
      case 'In Progress':
        return 'text-blue-600 bg-blue-50';
      case 'Completed':
        return 'text-gray-600 bg-gray-50';
      case 'Cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderGigDetails = (gig: Gig) => {
    return (
      <div key={gig._id} className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary-50 rounded-lg">
              <Briefcase className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium">{gig.title || 'Untitled'}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGigStatusColor(gig.status)}`}>
                  {gig.status || 'Open'}
                </span>
              </div>
              <p className="text-gray-600 mb-2 line-clamp-2">{gig.description || 'No description'}</p>
              <div className="flex flex-wrap gap-2">
                {gig.skills?.map((skill) => (
                  <span key={skill} className="badge-primary">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <span className="mr-4">Location: {gig.location || 'Remote'}</span>
                <span>Experience: {gig.experience || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowGigMenu(showGigMenu === gig._id ? null : gig._id)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical size={20} />
              </button>
              {showGigMenu === gig._id && (
                <div className="absolute mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate(`/freelance/edit-gig/${gig._id}`);
                        setShowGigMenu(null);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Gig
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteGig(gig._id);
                        setShowGigMenu(null);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Gig
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-lg font-medium text-gray-900">${gig.budget || 0}/hr</p>
            <p className="text-sm text-gray-500">Posted: {formatDate(gig.createdAt)}</p>
            <p className="text-sm text-gray-500">Duration: {gig.duration || 'Not specified'}</p>
            <button
              onClick={() => setExpandedGig(expandedGig === gig._id ? null : gig._id)}
              className="mt-2 btn-ghost text-sm flex items-center space-x-1"
            >
              <Users size={16} />
              <span>{gig.applications?.length || 0} Applications</span>
              {expandedGig === gig._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Applications Section */}
        {expandedGig === gig._id && (
          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Applications</h4>
              {gig.status === 'Open' && (
                <select
                  value={gig.status}
                  onChange={(e) => handleUpdateGigStatus(gig._id, e.target.value as Gig['status'])}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              )}
            </div>
            {!gig.applications?.length ? (
              <p className="text-gray-500 text-center py-4">No applications yet</p>
            ) : (
              <div className="space-y-4">
                {gig.applications.map((application) => (
                  <div key={application._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium">{application.user?.name || 'Anonymous'}</h5>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(application.status)}
                            <span className={`text-sm ${
                              application.status === 'Accepted' ? 'text-green-600' :
                              application.status === 'Rejected' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {application.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-2">{application.coverLetter || 'No cover letter'}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Proposed Budget: ${application.proposedBudget || 0}/hr
                        </p>
                        <p className="text-sm text-gray-500">
                          Applied: {formatDate(application.submittedAt)}
                        </p>
                      </div>
                      {application.status === 'Pending' && gig.status === 'Open' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateApplicationStatus(gig._id, application._id, 'Accepted')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(gig._id, application._id, 'Rejected')}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {application.status === 'Accepted' && application.paymentDetails?.paymentStatus !== 'Completed' && (
                        <div className="flex space-x-2">
                          <PaymentButton
                            gigId={gig._id}
                            applicationId={application._id}
                            amount={application.proposedBudget}
                            onPaymentComplete={() => fetchMyGigs()}
                          />
                        </div>
                      )}
                      {application.paymentDetails?.paymentStatus === 'Completed' && (
                        <div className="text-green-600 text-sm">
                          Payment Completed
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Gigs</h1>
        <button
          onClick={() => navigate('/freelance/create-gig')}
          className="btn-primary"
        >
          Post New Gig
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : !gigs?.length ? (
        <div className="text-center text-gray-600 py-8">
          You haven't posted any gigs yet
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {gigs.map(renderGigDetails)}
        </div>
      )}
    </motion.div>
  );
};

export default MyGigsPage; 