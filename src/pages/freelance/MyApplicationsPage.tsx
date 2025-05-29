import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Briefcase, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

interface Application {
  _id: string;
  gig: {
    _id: string;
    title: string;
    description: string;
    budget: number;
    duration: string;
    location: string;
    status: string;
    client: {
      avatar: string;
      name: string;
      title: string;
    };
  };
  coverLetter: string;
  proposedBudget: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  submittedAt: string;
}

const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to view your applications');
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/gigs/my-applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setApplications(response.data);
        setError(null);
        setStats({
          pending: response.data.filter(app => app.status === 'Pending').length,
          accepted: response.data.filter(app => app.status === 'Accepted').length,
          rejected: response.data.filter(app => app.status === 'Rejected').length
        });
      }
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      if (err.response?.status === 401) {
        toast.error('Please login to view your applications');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch applications');
        toast.error('Failed to fetch applications');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewGig = (gigId: string) => {
    navigate(`/freelance/gigs/${gigId}`);
  };

  const filteredApplications = applications.filter(app => {
    if (filters.status === 'all') return true;
    if (filters.status === app.status) return true;
    return false;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Applications</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Accepted</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.accepted}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/50 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/50 rounded-full">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
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
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
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

      {/* Applications List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No applications found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredApplications.map(application => (
            <div 
              key={application._id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {application.gig.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Applied on {new Date(application.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    application.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400' :
                    application.status === 'Accepted' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400' :
                    'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400'
                  }`}>
                    {application.status === 'Accepted' ? 'Accepted' : 
                     application.status === 'Pending' ? 'Pending' : 
                     'Rejected'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Client</h4>
                    <div className="flex items-center">
                      <img
                        src={application.gig.client?.avatar || '/default-avatar.png'}
                        alt={application.gig.client?.name || 'Client'}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {application.gig.client?.name || 'Unknown Client'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {application.gig.client?.title || 'No title'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Gig Details</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Budget: ${application.gig.budget}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Duration: {application.gig.duration}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Cover Letter</h4>
                  <p className="text-gray-600 dark:text-gray-400">{application.coverLetter}</p>
                </div>

                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/freelance/gigs/${application.gig._id}`}
                    className="btn-ghost"
                  >
                    View Gig
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage; 