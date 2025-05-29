import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Calendar, MapPin, Link, Github, Linkedin, Twitter, Mail, Phone, Edit2, X } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  bio: string;
  title: string;
  location: string;
  website: string;
  skills: string[];
  socialLinks: SocialLinks;
  createdAt: string;
}

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/me');
        setUser(response.data);
        setEditedUser(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
        toast.error('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/users/me', editedUser);
      setUser(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditedUser(user || {});
    setIsEditing(false);
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;

    try {
      const updatedSkills = [...(editedUser.skills || []), newSkill.trim()];
      const response = await api.put('/users/me/skills', { skills: updatedSkills });
      setEditedUser(prev => ({ ...prev, skills: response.data.skills }));
      setNewSkill('');
      toast.success('Skill added successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    try {
      const updatedSkills = (editedUser.skills || []).filter(skill => skill !== skillToRemove);
      const response = await api.put('/users/me/skills', { skills: updatedSkills });
      setEditedUser(prev => ({ ...prev, skills: response.data.skills }));
      toast.success('Skill removed successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove skill');
    }
  };

  const handleUpdateSocialLinks = async () => {
    try {
      const response = await api.put('/users/me/social-links', editedUser.socialLinks);
      setEditedUser(prev => ({ ...prev, socialLinks: response.data.socialLinks }));
      toast.success('Social links updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update social links');
    }
  };

  const handleUpdateProfilePicture = async (url: string) => {
    try {
      const response = await api.put('/users/me/profile-picture', { profilePicture: url });
      setEditedUser(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
      toast.success('Profile picture updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile picture');
    }
  };

  const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
    setEditedUser(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error || 'Profile not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600"></div>

        {/* Profile Header */}
        <div className="px-6 py-4">
          <div className="flex items-center -mt-16">
            <div className="relative">
              <img
                src={user.profilePicture || 'https://via.placeholder.com/128'}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800"
              />
              {isEditing && (
                <button
                  onClick={() => {
                    const url = prompt('Enter profile picture URL:');
                    if (url) handleUpdateProfilePicture(url);
                  }}
                  className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{user.title}</p>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="ml-auto btn-primary"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 py-4">
          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  value={editedUser.bio || ''}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editedUser.title || ''}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editedUser.location || ''}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={editedUser.website || ''}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editedUser.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Social Links
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={editedUser.socialLinks?.linkedin || ''}
                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                    placeholder="LinkedIn URL"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="url"
                    value={editedUser.socialLinks?.github || ''}
                    onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                    placeholder="GitHub URL"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="url"
                    value={editedUser.socialLinks?.twitter || ''}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    placeholder="Twitter URL"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">About</h2>
                <p className="text-gray-600 dark:text-gray-400">{user.bio || 'No bio provided'}</p>
              </div>

              {/* Contact Info */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Contact Information</h2>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>{user.email}</span>
                  </div>
                  {user.location && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Link className="h-5 w-5 mr-2" />
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                        {user.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              {user.skills && user.skills.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(user.socialLinks?.linkedin || user.socialLinks?.github || user.socialLinks?.twitter) && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Social Links</h2>
                  <div className="flex gap-4">
                    {user.socialLinks?.linkedin && (
                      <a
                        href={user.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                      >
                        <Linkedin className="h-6 w-6" />
                      </a>
                    )}
                    {user.socialLinks?.github && (
                      <a
                        href={user.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                      >
                        <Github className="h-6 w-6" />
                      </a>
                    )}
                    {user.socialLinks?.twitter && (
                      <a
                        href={user.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                      >
                        <Twitter className="h-6 w-6" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Member Since */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Member Since</h2>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage; 