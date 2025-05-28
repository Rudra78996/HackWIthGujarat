import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, Search, TrendingUp, Users } from 'lucide-react';

const FreelanceHome = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 -mx-4 px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-4">Find Your Next Opportunity</h1>
          <p className="text-primary-100 text-lg mb-6">
            Connect with top companies and startups looking for tech talent
          </p>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search for gigs, skills, or keywords..."
              className="w-full pl-12 pr-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: <Briefcase className="h-6 w-6 text-primary-600" />,
            label: 'Active Gigs',
            value: '250+',
          },
          {
            icon: <Users className="h-6 w-6 text-primary-600" />,
            label: 'Freelancers',
            value: '1,000+',
          },
          {
            icon: <TrendingUp className="h-6 w-6 text-primary-600" />,
            label: 'Success Rate',
            value: '95%',
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-50 rounded-lg">{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Categories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            'Web Development',
            'Mobile Development',
            'UI/UX Design',
            'DevOps',
            'Data Science',
            'Blockchain',
          ].map((category, index) => (
            <Link
              key={index}
              to={`/freelance/gigs?category=${category}`}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-lg mb-2">{category}</h3>
              <p className="text-gray-600 text-sm">
                Find opportunities in {category.toLowerCase()}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Freelancing?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Create your profile, showcase your skills, and start applying to gigs that match your expertise.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/freelance/create-profile" className="btn-primary">
            Create Your Profile
          </Link>
          <Link to="/freelance/gigs" className="btn-ghost">
            Browse All Gigs
          </Link>
        </div>
      </section>
    </motion.div>
  );
};

export default FreelanceHome;