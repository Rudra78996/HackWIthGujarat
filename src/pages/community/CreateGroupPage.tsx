import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Other',
    isPrivate: false,
    image: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    description?: string;
    category?: string;
  }>({});

  const validateForm = () => {
    const errors: {
      name?: string;
      description?: string;
      category?: string;
    } = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Group name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Group name must be at least 3 characters long';
    } else if (formData.name.trim().length > 50) {
      errors.name = 'Group name cannot exceed 50 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    } else if (formData.description.trim().length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters';
    }

    // Category validation
    if (!formData.category) {
      errors.category = 'Category is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/community/groups', {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        isPrivate: formData.isPrivate
      });

      toast.success('Group created successfully!');
      navigate(`/community/groups/${response.data._id}`);
    } catch (err: any) {
      console.error('Error creating group:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create group';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create New Group</h1>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Group preview"
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                  <span className="text-white text-sm">Change Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload a group image (optional)
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Recommended size: 400x400 pixels
                </p>
              </div>
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Group Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                validationErrors.name 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter group name"
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                validationErrors.category 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Data Science">Data Science</option>
              <option value="DevOps">DevOps</option>
              <option value="Blockchain">Blockchain</option>
              <option value="AI/ML">AI/ML</option>
              <option value="Game Development">Game Development</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Content Writing">Content Writing</option>
              <option value="Video Production">Video Production</option>
              <option value="Career">Career</option>
              <option value="Open Source">Open Source</option>
              <option value="Other">Other</option>
            </select>
            {validationErrors.category && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.category}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                validationErrors.description 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Describe your group's purpose and topics"
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.description}</p>
            )}
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            />
            <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Make this group private
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupPage; 