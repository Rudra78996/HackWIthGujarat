import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Globe, Github, Linkedin, Star, Briefcase, Clock } from 'lucide-react';
import axios from 'axios';

interface Profile {
  name: string;
  title: string;
  avatar: string;
  location: string;
  joinDate: string;
  rating: number;
  reviews: number;
  about: string;
  skills: string[];
  email: string;
  website?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
  };
}

const FreelanceProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/freelance/profile');
        setProfile(response.data);
        setIsOwnProfile(true); // You might want to check this based on the current user
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
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
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact</h2>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Mail className="h-5 w-5 mr-2" />
                  <a href={`mailto:${profile.email}`} className="hover:text-primary-600">
                    {profile.email}
                  </a>
                </div>
                {profile.website && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Globe className="h-5 w-5 mr-2" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Social</h2>
              <div className="flex space-x-4">
                {profile.socialLinks?.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    <Github className="h-6 w-6" />
                  </a>
                )}
                {profile.socialLinks?.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    <Linkedin className="h-6 w-6" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FreelanceProfilePage;