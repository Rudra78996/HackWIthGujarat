import { motion } from 'framer-motion';
import { Calendar, Clock, DollarSign, MapPin, Briefcase, CheckCircle } from 'lucide-react';

const GigDetailPage = () => {
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
            <h1 className="text-3xl font-bold mb-4">Senior React Developer Needed</h1>
            <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
              <div className="flex items-center">
                <DollarSign size={18} className="mr-2" />
                $80-100/hr
              </div>
              <div className="flex items-center">
                <Clock size={18} className="mr-2" />
                Full-time
              </div>
              <div className="flex items-center">
                <MapPin size={18} className="mr-2" />
                Remote
              </div>
              <div className="flex items-center">
                <Calendar size={18} className="mr-2" />
                Posted 2 days ago
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="badge-primary">React</span>
              <span className="badge-primary">TypeScript</span>
              <span className="badge-primary">Node.js</span>
              <span className="badge-primary">AWS</span>
            </div>
          </div>
          <button className="btn-primary">Apply Now</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Project Description</h2>
            <p className="text-gray-600 mb-4">
              We are looking for a senior React developer to join our team and help build a new SaaS platform. 
              The ideal candidate will have strong experience with React, TypeScript, and modern frontend development practices.
            </p>
            <p className="text-gray-600">
              This is a long-term project with potential for extension based on performance.
            </p>
          </section>

          {/* Requirements */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Requirements</h2>
            <ul className="space-y-3">
              {[
                '5+ years of experience with React and modern JavaScript',
                'Strong TypeScript skills',
                'Experience with state management (Redux, MobX, etc.)',
                'Understanding of CI/CD practices',
                'Excellent communication skills',
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
                <strong>Company:</strong> TechCorp Inc.
              </p>
              <p>
                <strong>Location:</strong> San Francisco, CA
              </p>
              <p>
                <strong>Company Size:</strong> 50-100 employees
              </p>
              <p>
                <strong>Industry:</strong> SaaS/Technology
              </p>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">Project Details</h3>
            <div className="space-y-3 text-gray-600">
              <p>
                <strong>Duration:</strong> 6+ months
              </p>
              <p>
                <strong>Hours:</strong> 40 hrs/week
              </p>
              <p>
                <strong>Experience:</strong> Senior
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GigDetailPage;