import { motion } from 'framer-motion';
import { Search, Filter, Briefcase } from 'lucide-react';

const GigListingPage = () => {
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

      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3, 4, 5].map((gig) => (
          <div key={gig} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Briefcase className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Senior React Developer Needed</h3>
                  <p className="text-gray-600 mb-2">
                    Looking for an experienced React developer to help build a new SaaS platform.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge-primary">React</span>
                    <span className="badge-primary">TypeScript</span>
                    <span className="badge-primary">Node.js</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-gray-900">$80-100/hr</p>
                <p className="text-sm text-gray-500">Posted 2 days ago</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <nav className="flex items-center space-x-2">
          <button className="px-3 py-2 rounded-md bg-gray-100 text-gray-700">Previous</button>
          <button className="px-3 py-2 rounded-md bg-primary-600 text-white">1</button>
          <button className="px-3 py-2 rounded-md hover:bg-gray-100">2</button>
          <button className="px-3 py-2 rounded-md hover:bg-gray-100">3</button>
          <button className="px-3 py-2 rounded-md hover:bg-gray-100">Next</button>
        </nav>
      </div>
    </motion.div>
  );
};

export default GigListingPage;