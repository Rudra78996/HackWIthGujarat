import { motion } from 'framer-motion';
import { Search, Filter, Briefcase, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Gig {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  duration: string;
  location: string;
  experience: string;
  category: string;
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

interface FilterState {
  location: string[];
  experience: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  category?: string;
}

const GigListingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState<ApplicationForm>({
    coverLetter: '',
    proposedBudget: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    location: [],
    experience: [],
    budgetRange: {
      min: 0,
      max: 1000
    }
  });

  const locations = ['Remote', 'Onsite', 'Hybrid'];
  const experienceLevels = ['Entry', 'Intermediate', 'Expert'];

  // Initialize filters from URL parameters
  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    if (search) {
      setSearchQuery(search);
    }

    if (category) {
      // If category is present in URL, add it to the filters
      setFilters(prev => ({
        ...prev,
        category: category
      }));
    }
  }, [searchParams]);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/gigs');
      setGigs(response.data);
      setFilteredGigs(response.data);
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

  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery, gigs]);

  const applyFilters = () => {
    let filtered = [...gigs];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(gig =>
        gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply location filter
    if (filters.location.length > 0) {
      filtered = filtered.filter(gig => filters.location.includes(gig.location));
    }

    // Apply experience filter
    if (filters.experience.length > 0) {
      filtered = filtered.filter(gig => filters.experience.includes(gig.experience));
    }

    // Apply budget range filter
    filtered = filtered.filter(gig =>
      gig.budget >= filters.budgetRange.min && gig.budget <= filters.budgetRange.max
    );

    // Apply category filter if present
    if (filters.category) {
      filtered = filtered.filter(gig => 
        gig.category?.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    setFilteredGigs(filtered);
  };

  const handleFilterChange = (type: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleLocationToggle = (location: string) => {
    setFilters(prev => ({
      ...prev,
      location: prev.location.includes(location)
        ? prev.location.filter(loc => loc !== location)
        : [...prev.location, location]
    }));
  };

  const handleExperienceToggle = (experience: string) => {
    setFilters(prev => ({
      ...prev,
      experience: prev.experience.includes(experience)
        ? prev.experience.filter(exp => exp !== experience)
        : [...prev.experience, experience]
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: [],
      experience: [],
      budgetRange: {
        min: 0,
        max: 1000
      }
    });
    setSearchQuery('');
  };

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
      setApplicationForm({
        coverLetter: '',
        proposedBudget: 0
      });
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
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gigs..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={() => setShowFilterModal(true)}
          className="btn-ghost flex items-center justify-center gap-2"
        >
          <Filter className="h-5 w-5" />
          Filters
        </button>
      </div>

      {/* Active Filters */}
      {(filters.location.length > 0 || filters.experience.length > 0 || filters.category) && (
        <div className="flex flex-wrap gap-2">
          {filters.location.map(location => (
            <span
              key={location}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400"
            >
              {location}
              <button
                onClick={() => handleLocationToggle(location)}
                className="ml-2 hover:text-primary-900 dark:hover:text-primary-300"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
          {filters.experience.map(experience => (
            <span
              key={experience}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400"
            >
              {experience}
              <button
                onClick={() => handleExperienceToggle(experience)}
                className="ml-2 hover:text-primary-900 dark:hover:text-primary-300"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
          {filters.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400">
              {filters.category}
              <button
                onClick={() => handleFilterChange('category', undefined)}
                className="ml-2 hover:text-primary-900 dark:hover:text-primary-300"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Gig List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading gigs...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : filteredGigs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No gigs found</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredGigs.map(gig => (
            <div
              key={gig._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
              onClick={() => navigate(`/freelance/gigs/${gig._id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {gig.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {gig.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {gig.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Budget: ${gig.budget}</span>
                    <span>Duration: {gig.duration}</span>
                    <span>Location: {gig.location}</span>
                    <span>Experience: {gig.experience}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply(gig);
                  }}
                  className="btn-primary whitespace-nowrap"
                >
                  Apply Now
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                    {gig.postedBy.profilePicture ? (
                      <img
                        src={gig.postedBy.profilePicture}
                        alt={gig.postedBy.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      gig.postedBy.name.charAt(0)
                    )}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Posted by {gig.postedBy.name}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-500">
                  {formatDate(gig.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Filters</h2>
            
            {/* Location Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2 dark:text-gray-200">Location</h3>
              <div className="space-y-2">
                {locations.map(location => (
                  <label key={location} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.location.includes(location)}
                      onChange={() => handleLocationToggle(location)}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2 dark:text-gray-200">Experience Level</h3>
              <div className="space-y-2">
                {experienceLevels.map(level => (
                  <label key={level} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.experience.includes(level)}
                      onChange={() => handleExperienceToggle(level)}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget Range Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-2 dark:text-gray-200">Budget Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Min</label>
                  <input
                    type="number"
                    value={filters.budgetRange.min}
                    onChange={(e) => handleFilterChange('budgetRange', {
                      ...filters.budgetRange,
                      min: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Max</label>
                  <input
                    type="number"
                    value={filters.budgetRange.max}
                    onChange={(e) => handleFilterChange('budgetRange', {
                      ...filters.budgetRange,
                      max: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowFilterModal(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  applyFilters();
                  setShowFilterModal(false);
                }}
                className="btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedGig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Apply for {selectedGig.title}</h2>
            
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cover Letter
                </label>
                <textarea
                  value={applicationForm.coverLetter}
                  onChange={(e) => setApplicationForm(prev => ({
                    ...prev,
                    coverLetter: e.target.value
                  }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Explain why you're the best fit for this gig..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Proposed Budget
                </label>
                <input
                  type="number"
                  value={applicationForm.proposedBudget}
                  onChange={(e) => setApplicationForm(prev => ({
                    ...prev,
                    proposedBudget: Number(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min={0}
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowApplyModal(false);
                    setSelectedGig(null);
                    setApplicationForm({
                      coverLetter: '',
                      proposedBudget: 0
                    });
                  }}
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
    </motion.div>
  );
};

export default GigListingPage;