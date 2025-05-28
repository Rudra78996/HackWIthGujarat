import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Network, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4"
    >
      <Network className="h-20 w-20 text-primary-300 mb-6" />
      
      <motion.h1
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-5xl md:text-6xl font-bold text-gray-900 mb-4"
      >
        404
      </motion.h1>
      
      <motion.h2
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2"
      >
        Page not found
      </motion.h2>
      
      <motion.p
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-lg text-gray-600 max-w-md mb-8"
      >
        The page you're looking for doesn't exist or has been moved.
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
      >
        <Link to="/" className="btn-primary flex items-center justify-center">
          <Home className="mr-2 h-5 w-5" />
          Go Home
        </Link>
        
        <button 
          onClick={() => window.history.back()}
          className="btn-ghost flex items-center justify-center"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Go Back
        </button>
      </motion.div>
    </motion.div>
  );
};

export default NotFoundPage;