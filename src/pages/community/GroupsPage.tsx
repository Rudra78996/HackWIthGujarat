import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import api from '../../services/api';

interface Group {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  image?: string;
  category: string;
  createdAt: string;
}

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await api.get('/community/groups');
        if (!Array.isArray(response.data)) {
          throw new Error('Expected an array of groups from the API');
        }
        setGroups(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching groups:', err);
        setError(err.response?.data?.message || 'Failed to fetch groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Groups
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Join groups to connect with other freelancers
          </p>
        </div>
        <Link
          to="/community/create-group"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Group
        </Link>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <Link
            key={group._id}
            to={`/community/groups/${group._id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600"></div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {group.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {group.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{group.memberCount} members</span>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-full">
                  {group.category}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GroupsPage; 