import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Globe, Github, Linkedin, Star, Briefcase, Clock } from 'lucide-react';

const FreelanceProfilePage = () => {
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
      ) : !profile ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Profile not found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-6">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.name}</h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400">{profile.title}</p>
                    </div>
                    {isOwnProfile && (
                      <Link to="/freelance/profile/edit" className="btn-primary">
                        Edit Profile
                      </Link>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>Member since {new Date(profile.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Star className="h-5 w-5 mr-2" />
                      <span>{profile.rating} ({profile.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">About</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{profile.about}</p>
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-700"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
              <img
                src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold">Alex Rivera</h1>
              <p className="text-xl text-gray-600">Senior Full Stack Developer</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-primary">
                Contact
              </button>
              <button className="btn-ghost">
                Follow
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">About</h2>
            <p className="text-gray-600">
              Full stack developer with 8+ years of experience specializing in React, Node.js, and cloud technologies. 
              Passionate about building scalable web applications and mentoring junior developers.
            </p>
          </section>

          {/* Skills */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {[
                'React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS', 'Docker',
                'GraphQL', 'PostgreSQL', 'Redis', 'Next.js', 'TailwindCSS'
              ].map((skill, index) => (
                <span key={index} className="badge-primary">{skill}</span>
              ))}
            </div>
          </section>

          {/* Work History */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Work History</h2>
            <div className="space-y-6">
              {[1, 2, 3].map((job) => (
                <div key={job} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-lg">Senior Frontend Developer</h3>
                      <p className="text-gray-600">TechCorp Inc.</p>
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <Clock size={16} className="mr-1" />
                        Jan 2020 - Present
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="text-yellow-400 h-5 w-5" />
                      <span className="ml-1 font-medium">4.9</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-3">
                    Led the frontend development team in building a modern SaaS platform using React and TypeScript.
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <MapPin size={18} className="mr-2" />
                San Francisco, CA
              </div>
              <div className="flex items-center text-gray-600">
                <Mail size={18} className="mr-2" />
                <a href="mailto:alex@example.com" className="text-primary-600 hover:text-primary-700">
                  alex@example.com
                </a>
              </div>
              <div className="flex items-center text-gray-600">
                <Globe size={18} className="mr-2" />
                <a href="https://alexrivera.dev" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                  alexrivera.dev
                </a>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex space-x-3">
                <a href="#" className="text-gray-600 hover:text-primary-600">
                  <Github size={20} />
                </a>
                <a href="#" className="text-gray-600 hover:text-primary-600">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-medium mb-4">Stats & Achievements</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Jobs Completed</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium">98%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">On Time</span>
                <span className="font-medium">100%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Response Rate</span>
                <span className="font-medium">95%</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-medium mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((activity) => (
                <div key={activity} className="flex items-start space-x-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Briefcase size={16} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Completed a new project for
                      <Link to="#" className="text-primary-600 hover:text-primary-700 mx-1">
                        TechCorp Inc
                      </Link>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FreelanceProfilePage;