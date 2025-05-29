import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, Calendar, Users, ChevronRight, ExternalLink, CheckCircle } from 'lucide-react';

const HomePage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <div className="space-y-20 pb-20 bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative -mt-6 px-4 pt-20 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-accent-700 h-3/4 z-[-1]"></div>
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
            className="space-y-6"
          >
            <motion.h1
              variants={fadeIn}
              custom={0}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
            >
              Connect, Collaborate, and Grow Together
            </motion.h1>
            <motion.p
              variants={fadeIn}
              custom={1}
              className="text-xl text-gray-700 dark:text-white/90 max-w-3xl mx-auto"
            >
              The all-in-one platform for tech professionals to find gigs, attend events, and build community
            </motion.p>
            <motion.div
              variants={fadeIn}
              custom={2}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
            >
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Get Started
              </Link>
              <Link to="/about" className="btn bg-white text-primary-700 hover:bg-gray-100 text-lg px-8 py-3">
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Feature cards */}
        <div className="max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="card p-8"
            >
              <div className="p-3 bg-primary-50 rounded-lg w-fit mb-4">
                <Briefcase className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Freelance Marketplace</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Post gigs, find projects, and connect with clients looking for your skills.
              </p>
              <Link
                to="/freelance"
                className="text-primary-600 font-medium flex items-center hover:text-primary-700"
              >
                Explore Marketplace
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="card p-8"
            >
              <div className="p-3 bg-secondary-50 rounded-lg w-fit mb-4">
                <Calendar className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Event Management</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Create, discover, and join hackathons, webinars, and tech meetups.
              </p>
              <Link
                to="/events"
                className="text-secondary-600 font-medium flex items-center hover:text-secondary-700"
              >
                Browse Events
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="card p-8"
            >
              <div className="p-3 bg-accent-50 rounded-lg w-fit mb-4">
                <Users className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Community Platform</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Join tech groups, chat in real-time, and build your professional network.
              </p>
              <Link
                to="/community"
                className="text-accent-600 font-medium flex items-center hover:text-accent-700"
              >
                Join Community
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">How It Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Our platform brings together everything you need for tech collaboration in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-bold mb-6">
              1
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Create Your Profile</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sign up and build your professional profile showcasing your skills, experience, and portfolio.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-bold mb-6">
              2
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Connect & Collaborate</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Find gigs, join events, and engage with the community through groups and direct messages.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-bold mb-6">
              3
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Grow Your Network</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Build relationships, gain visibility, and unlock new opportunities in the tech industry.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">Featured Opportunities</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Discover top gigs, upcoming events, and active communities in your area of expertise.
              </p>

              <ul className="space-y-4">
                {[
                  'Access exclusive tech gigs and projects',
                  'Network with industry professionals',
                  'Participate in live events and webinars',
                  'Showcase your portfolio to potential clients',
                  'Learn from peers in specialized communities',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link to="/explore" className="btn-primary">
                  Explore All Opportunities
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img
                  src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Collaboration"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-200">Upcoming Event</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">React Developer Summit</p>
                  </div>
                </div>
                <Link to="/events/1" className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center">
                  View Details
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">What Our Users Say</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Join thousands of tech professionals who've found success on our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Alex Rivera',
              role: 'Frontend Developer',
              image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              quote:
                'I found my dream remote job through the freelance marketplace. The platform made it easy to showcase my portfolio and connect with clients.',
            },
            {
              name: 'Sarah Johnson',
              role: 'UX Designer',
              image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              quote:
                'The events feature helped me find local tech meetups where I made valuable connections. I even landed a speaking opportunity at a UX conference!',
            },
            {
              name: 'Marcus Chen',
              role: 'Startup Founder',
              image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              quote:
                'As a founder, I use the platform to find talent, connect with other entrepreneurs, and stay updated on industry trends through the community forums.',
            },
          ].map((testimonial, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-700 py-16 rounded-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join the Tech Collaboration Hub?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Connect with peers, find opportunities, and grow your career all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn bg-white text-primary-700 hover:bg-gray-100 text-lg px-8 py-3">
              Create Your Account
            </Link>
            <Link to="/freelance" className="btn border border-white text-white hover:bg-white/10 text-lg px-8 py-3">
              Browse Opportunities
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;