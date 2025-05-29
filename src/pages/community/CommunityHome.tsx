import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, ThumbsUp, Share2, Plus } from 'lucide-react';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 5000,
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

const CommunityHome: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/community/posts');
        if (!Array.isArray(response.data)) {
          throw new Error('Expected an array of posts from the API');
        }
        setPosts(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePostClick = (postId: string) => {
    navigate(`/community/posts/${postId}`);
  };

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
            Community Posts
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Share your thoughts and connect with other freelancers
          </p>
        </div>
        <Link
          to="/community/create-post"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Post
        </Link>
      </div>

      {/* Posts Section */}
      <div className="space-y-6">
        {posts.map(post => (
          <div
            key={post._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handlePostClick(post._id)}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {post.author.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {post.content}
                </p>
                {post.image && (
                  <div className="mb-4">
                    <img
                      src={post.image}
                      alt="Post attachment"
                      className="rounded-lg max-w-full h-48 object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <button 
                    className="flex items-center hover:text-primary-600 dark:hover:text-primary-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle like
                    }}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>{post.likes}</span>
                  </button>
                  <button 
                    className="flex items-center hover:text-primary-600 dark:hover:text-primary-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle comment
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{post.comments.length}</span>
                  </button>
                  <button 
                    className="flex items-center hover:text-primary-600 dark:hover:text-primary-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle share
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityHome; 