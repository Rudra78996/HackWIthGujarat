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
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import PaymentButton from '../../components/payment/PaymentButton';
import { Link } from 'react-router-dom';
import { DollarSign, MapPin } from 'lucide-react';

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
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0
  });
  const [expandedGig, setExpandedGig] = useState<string | null>(null);
  const [showGigMenu, setShowGigMenu] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: ''
  });

  const categories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Data Science',
    'DevOps',
    'Blockchain',
    'Other'
  ];

  const filteredGigs = gigs.filter(gig => {
    if (filters.status !== 'all' && gig.status !== filters.status) return false;
    if (filters.category !== 'all' && gig.category !== filters.category) return false;
    if (filters.search && !gig.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

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
        // Calculate stats
        const stats = {
          total: response.data.length,
          active: response.data.filter(gig => gig.status === 'Open').length,
          completed: response.data.filter(gig => gig.status === 'Completed').length,
          cancelled: response.data.filter(gig => gig.status === 'Cancelled').length
        };
        setStats(stats);
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
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/50';
      case 'In Progress':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50';
      case 'Completed':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50';
      case 'Cancelled':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50';
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
      <div key={gig._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/50 rounded-lg">
              <Briefcase className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{gig.title || 'Untitled'}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGigStatusColor(gig.status)}`}>
                  {gig.status || 'Open'}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{gig.description || 'No description'}</p>
              <div className="flex flex-wrap gap-2">
                {gig.skills?.map((skill) => (
                  <span key={skill} className="badge-primary dark:bg-primary-900/50 dark:text-primary-400">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="mr-4">Location: {gig.location || 'Remote'}</span>
                <span>Experience: {gig.experience || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowGigMenu(showGigMenu === gig._id ? null : gig._id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <MoreVertical size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              {showGigMenu === gig._id && (
                <div className="absolute mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate(`/freelance/edit-gig/${gig._id}`);
                        setShowGigMenu(null);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Gig
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteGig(gig._id);
                        setShowGigMenu(null);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Gig
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">${gig.budget || 0}/hr</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Posted: {formatDate(gig.createdAt)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Duration: {gig.duration || 'Not specified'}</p>
            <button
              onClick={() => setExpandedGig(expandedGig === gig._id ? null : gig._id)}
              className="mt-2 btn-ghost text-sm flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <Users size={16} />
              <span>{gig.applications?.length || 0} Applications</span>
              {expandedGig === gig._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Applications Section */}
        {expandedGig === gig._id && (
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Applications</h4>
              {gig.status === 'Open' && (
                <select
                  value={gig.status}
                  onChange={(e) => handleUpdateGigStatus(gig._id, e.target.value as Gig['status'])}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              )}
            </div>
            {!gig.applications?.length ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No applications yet</p>
            ) : (
              <div className="space-y-4">
                {gig.applications.map((application) => (
                  <div key={application._id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">{application.user?.name || 'Anonymous'}</h5>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(application.status)}
                            <span className={`text-sm ${
                              application.status === 'Accepted' ? 'text-green-600 dark:text-green-400' :
                              application.status === 'Rejected' ? 'text-red-600 dark:text-red-400' :
                              'text-yellow-600 dark:text-yellow-400'
                            }`}>
                              {application.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">{application.coverLetter || 'No cover letter'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Proposed Budget: ${application.proposedBudget || 0}/hr
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Applied: {formatDate(application.submittedAt)}
                        </p>
                      </div>
                      {application.status === 'Pending' && gig.status === 'Open' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateApplicationStatus(gig._id, application._id, 'Accepted')}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(gig._id, application._id, 'Rejected')}
                            className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900"
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
                        <div className="text-green-600 dark:text-green-400 text-sm">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Gigs</h1>
        <Link to="/freelance/create" className="btn-primary">
          Create New Gig
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Gigs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.active}</p>
            </div>
            <div className="p-3 bg-primary-50 dark:bg-primary-900/50 rounded-full">
              <Briefcase className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-50 dark:bg-primary-900/50 rounded-full">
              <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Gigs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.completed}</p>
            </div>
            <div className="p-3 bg-primary-50 dark:bg-primary-900/50 rounded-full">
              <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-8">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="Open">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search gigs..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Gigs List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      ) : filteredGigs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No gigs found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGigs.map(gig => renderGigDetails(gig))}
        </div>
      )}
    </div>
  );
};

export default MyGigsPage; 