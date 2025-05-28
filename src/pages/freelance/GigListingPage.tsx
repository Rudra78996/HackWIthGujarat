import { motion } from 'framer-motion';
import { Search, Filter, Briefcase, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
}

interface ApplicationForm {
  coverLetter: string;
  proposedBudget: number;
}

const GigListingPage = () => {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState<ApplicationForm>({
    coverLetter: '',
    proposedBudget: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/gigs');
      setGigs(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch gigs');
      toast.error('Failed to fetch gigs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  const handleApply = (gig: Gig) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to apply for gigs');
      navigate('/login');
      return;
    }
    setSelectedGig(gig);
    setApplicationForm({
      coverLetter: '',
      proposedBudget: gig.budget
    });
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGig) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to apply for gigs');
        navigate('/login');
        return;
      }

      await axios.post(
        `http://localhost:5000/api/gigs/${selectedGig._id}/apply`,
        applicationForm,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      setSelectedGig(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted yesterday';
    return `Posted ${diffDays} days ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Available Gigs</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search gigs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <button className="btn-ghost">
            <Filter size={20} className="mr-2" />
            Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : gigs.length === 0 ? (
        <div className="text-center text-gray-600 py-8">No gigs found</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {gigs.map((gig) => (
            <div key={gig._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <Briefcase className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">{gig.title}</h3>
                    <p className="text-gray-600 mb-2 line-clamp-2">{gig.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {gig.skills.map((skill) => (
                        <span key={skill} className="badge-primary">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="mr-4">Location: {gig.location}</span>
                      <span>Experience: {gig.experience}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900">${gig.budget}/hr</p>
                  <p className="text-sm text-gray-500">{formatDate(gig.createdAt)}</p>
                  <p className="text-sm text-gray-500">Duration: {gig.duration}</p>
                  <button
                    onClick={() => handleApply(gig)}
                    className="mt-2 btn-primary text-sm"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedGig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Apply for {selectedGig.title}</h2>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Letter
                </label>
                <textarea
                  value={applicationForm.coverLetter}
                  onChange={(e) => setApplicationForm(prev => ({
                    ...prev,
                    coverLetter: e.target.value
                  }))}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Explain why you're the best fit for this gig..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proposed Budget (USD/hr)
                </label>
                <input
                  type="number"
                  value={applicationForm.proposedBudget}
                  onChange={(e) => setApplicationForm(prev => ({
                    ...prev,
                    proposedBudget: Number(e.target.value)
                  }))}
                  required
                  min={0}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GigListingPage;