import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Briefcase, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Applications</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : applications.length === 0 ? (
        <div className="text-center text-gray-600 py-8">
          You haven't applied to any gigs yet
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications.map((application) => (
            <div 
              key={application._id} 
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewGig(application.gig._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <Briefcase className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium">{application.gig.title}</h3>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(application.status)}
                        <span className={`text-sm ${
                          application.status === 'Accepted' ? 'text-green-600' :
                          application.status === 'Rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2 line-clamp-2">{application.gig.description}</p>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Cover Letter:</span> {application.coverLetter}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Proposed Budget:</span> ${application.proposedBudget}/hr
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Submitted:</span> {formatDate(application.submittedAt)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Location: {application.gig.location}</p>
                  <p className="text-sm text-gray-500">Duration: {application.gig.duration}</p>
                  <p className="text-sm text-gray-500">Budget: ${application.gig.budget}/hr</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MyApplicationsPage; 