import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Send } from 'lucide-react';
import api from '../../services/api';
import socketService from '../../services/socket';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
    size: number;
  }>;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  members: Array<{
    _id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'member';
  }>;
  image?: string;
  category: string;
  createdAt: string;
}

const GroupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true);
        const groupResponse = await api.get(`/community/groups/${id}`);
        setGroup(groupResponse.data);
        setIsAdmin(groupResponse.data.members.some(
          (member: any) => member._id === localStorage.getItem('userId') && member.role === 'admin'
        ));
        setError(null);
      } catch (err: any) {
        console.error('Error fetching group data:', err);
        setError(err.response?.data?.message || 'Failed to fetch group data');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [id]);

  useEffect(() => {
    // Connect to socket and join group
    socketService.connect(localStorage.getItem('token') || '');
    socketService.joinGroup(id!);

    // Fetch initial messages
    socketService.emit('get_group_messages', { groupId: id }, (response: any) => {
      if (response.messages) {
        setMessages(response.messages);
      }
    });

    // Listen for new messages
    socketService.onGroupMessage((message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      socketService.leaveGroup(id!);
      socketService.off('group_message');
    };
  }, [id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      socketService.sendGroupMessage(id!, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error || 'Group not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Group Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{group.name}</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{group.description}</p>
              </div>
              {isAdmin ? (
                <button
                  onClick={() => navigate(`/community/groups/${id}/settings`)}
                  className="btn-outline-danger"
                >
                  Leave Group
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/community/groups/${id}/join`)}
                  className="btn-primary"
                >
                  Join Group
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {/* Messages List */}
            <div className="h-[600px] overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message._id}
                  className={`flex ${message.sender._id === localStorage.getItem('userId') ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender._id === localStorage.getItem('userId')
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">{message.sender.name}</span>
                      <span className="text-xs opacity-75">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p>{message.content}</p>
                    {message.attachments?.map((attachment, index) => (
                      <div key={index} className="mt-2">
                        {attachment.type === 'image' && (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="rounded-lg max-w-full h-48 object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Group Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Group Info</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</h3>
                <p className="mt-1 text-gray-900 dark:text-gray-100">{group.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</h3>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {new Date(group.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Members</h2>
            <div className="space-y-4">
              {group.members.map(member => (
                <div key={member._id} className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {member.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPage; 