import React from 'react';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Your profile content will go here.</p>
      </div>
    </motion.div>
  );
};

export default ProfilePage;