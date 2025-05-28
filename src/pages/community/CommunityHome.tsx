import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 5000, // 5 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - Is the backend server running?');
      return Promise.reject(new Error('Unable to connect to the server. Please check if the backend is running.'));
    }
    if (error.response?.status === 401) {
      console.error('Authentication error - Please log in');
      return Promise.reject(new Error('Please log in to access this resource'));
    }
    return Promise.reject(error);
  }
);

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  createdAt: string;
  likes: number;
  comments: Array<{
    _id: string;
    content: string;
    author: {
      _id: string;
      name: string;
    };
    createdAt: string;
  }>;
  image?: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  image?: string;
  createdAt?: string;
  members?: Array<{
    _id: string;
    name: string;
    role: string;
  }>;
}

const CommunityHome: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'groups'>('posts');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'posts') {
          const response = await api.get('/community/posts');
          if (!Array.isArray(response.data)) {
            throw new Error('Expected an array of posts from the API');
          }
          setPosts(response.data);
        } else {
          const response = await api.get('/community/groups');
          if (!Array.isArray(response.data)) {
            throw new Error('Expected an array of groups from the API');
          }
          setGroups(response.data);
        }
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Community</h1>
        <div className="space-x-4">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'posts'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'groups'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {activeTab === 'posts' ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Link
              to="/community/create-post"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create Post
            </Link>
          </div>

          {!posts?.length ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No posts found</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  to={`/community/posts/${post._id}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  {post.image && (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Posted by {post.author?.name || 'Unknown'}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>{post.likes} likes</span>
                        <span>{post.comments?.length || 0} comments</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Link
              to="/community/create-group"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create Group
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : !groups?.length ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No groups found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Link
                  key={group._id}
                  to={`/community/groups/${group._id}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  {group.image && (
                    <img
                      src={group.image}
                      alt={group.name || 'Group image'}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2">{group.name || 'Unnamed Group'}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">{group.description || 'No description available'}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{group.memberCount || 0} members</span>
                      <span className="text-blue-500">Join Group</span>
                    </div>
                    {group.createdAt && (
                      <div className="mt-2 text-xs text-gray-400">
                        Created {new Date(group.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityHome; 