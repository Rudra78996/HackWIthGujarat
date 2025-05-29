import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, isValid } from 'date-fns';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Edit, Heart, MessageSquare, Share2 } from 'lucide-react';

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
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

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

  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please log in to add a comment');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(`/community/posts/${id}/comments`, {
        content: newComment.trim()
      });
      setPost(response.data);
      setNewComment('');
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

  const handleDeleteComment = async (commentId: string) => {
    if (!user) {
      toast.error('Please log in to delete a comment');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.delete(`/community/posts/${id}/comments/${commentId}`);
      setPost(response.data);
      toast.success('Comment deleted successfully');
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete comment';
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      ) : !post ? (
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>Post not found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Post Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="h-12 w-12 rounded-full"
                />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {post.author.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {post.author.id === user?._id && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/community/posts/${post._id}/edit`)}
                    className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      // Implement delete functionality
                    }}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {post.title}
            </h1>
            <div className="mt-2 flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center text-sm ${
                  isLiked
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <Heart className={`h-5 w-5 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes} likes</span>
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <MessageSquare className="h-5 w-5 mr-1" />
                <span>{post.comments.length} comments</span>
              </button>
              <button
                onClick={() => {
                  // Implement share functionality
                }}
                className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <Share2 className="h-5 w-5 mr-1" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Post Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="prose dark:prose-invert max-w-none">
              {post.content}
            </div>
            {post.image && (
              <div className="mt-4">
                <img
                  src={post.image}
                  alt="Post attachment"
                  className="rounded-lg max-w-full"
                />
              </div>
            )}
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Comments
              </h2>
              <div className="space-y-4">
                {post.comments.map(comment => (
                  <div key={comment._id} className="flex space-x-3">
                    <img
                      src={comment.author?.avatar}
                      alt={comment.author?.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {comment.author?.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {comment.content}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDate(comment.createdAt)}</span>
                        {comment.author?._id === user?._id && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="ml-2 text-red-500 hover:text-red-600 dark:hover:text-red-400"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex space-x-3">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={handleAddComment}
                        className="btn-primary"
                        disabled={!newComment}
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostDetail; 