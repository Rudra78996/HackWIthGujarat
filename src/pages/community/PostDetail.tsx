import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, isValid } from 'date-fns';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
  } | null;
  createdAt: string;
}

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
  likedBy: string[];
  comments: Comment[];
  image?: string;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (!isValid(date)) {
      return 'Invalid date';
    }
    return format(date, 'MMMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/community/posts/${id}`);
      setPost(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching post:', err);
      setError(err.response?.data?.message || 'Failed to fetch post');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like posts');
      navigate('/login');
      return;
    }

    if (isLiking) return; // Prevent multiple clicks

    setIsLiking(true);
    try {
      const response = await api.post(`/community/posts/${id}/like`);
      setPost(response.data);
      toast.success(response.data.likedBy.includes(user._id) ? 'Post liked!' : 'Post unliked!');
    } catch (err: any) {
      console.error('Error liking post:', err);
      const errorMessage = err.response?.data?.message || 'Failed to like post';
      toast.error(errorMessage);
      setError(errorMessage);
      // Refresh the post data in case of error
      fetchPost();
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to comment');
      navigate('/login');
      return;
    }

    if (!commentContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(`/community/posts/${id}/comments`, {
        content: commentContent.trim()
      });
      setPost(response.data);
      setCommentContent('');
      toast.success('Comment added successfully');
    } catch (err: any) {
      console.error('Error adding comment:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add comment';
      toast.error(errorMessage);
      setError(errorMessage);
      // Refresh the post data in case of error
      fetchPost();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <button
            onClick={() => navigate('/community')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
            <button
              onClick={() => navigate('/community')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Back to Community
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLiked = user ? post.likedBy.includes(user._id) : false;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/community')}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
        >
          ← Back to Community
        </button>

        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          )}
          
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center text-gray-600 mb-6">
              <span className="mr-4">Posted by {post.author?.name || 'Unknown User'}</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>

            <div className="prose max-w-none mb-8">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center space-x-2 ${
                    isLiked ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
                  } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span>👍</span>
                  <span>{post.likes} likes</span>
                </button>
                <span className="text-gray-600">
                  💬 {post.comments.length} comments
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Comments</h2>
          
          {/* Comment Form */}
          <form onSubmit={handleComment} className="mb-8">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              rows={3}
            />
            <button
              type="submit"
              disabled={isSubmitting || !commentContent.trim()}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
                (isSubmitting || !commentContent.trim()) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">
                    {comment.author?.name || 'Unknown User'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail; 