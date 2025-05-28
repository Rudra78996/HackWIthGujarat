import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import socketService from '../../services/socket';
import { toast } from 'react-hot-toast';
import { Send, Image as ImageIcon, Users, Settings } from 'lucide-react';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  type: 'text' | 'image';
  imageUrl?: string;
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
  createdAt: string;
}

const GroupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isComponentMounted = true;
    let connectionCheckInterval: number;

    const fetchGroupData = async () => {
      if (!isComponentMounted) return;
      
      setLoading(true);
      try {
        console.log('Fetching group data for ID:', id);
        socketService.emit('get_group', { groupId: id }, (response: any) => {
          if (!isComponentMounted) return;
          
          console.log('Group data response:', response);
          if (response.error) {
            console.error('Error fetching group:', response.error);
            setError('Failed to fetch group data');
            setLoading(false);
            return;
          }
          if (!response.data) {
            console.error('No group data received');
            setError('Group data not found');
            setLoading(false);
            return;
          }
          setGroup(response.data);
          setIsAdmin(response.data.members.some((member: any) => 
            member._id === localStorage.getItem('userId') && member.role === 'admin'
          ));
          setLoading(false);
        });
      } catch (err) {
        if (!isComponentMounted) return;
        console.error('Error in fetchGroupData:', err);
        setError('Failed to fetch group data');
        setLoading(false);
      }
    };

    const fetchMessages = async () => {
      if (!isComponentMounted) return;
      
      try {
        console.log('Fetching messages for group:', id);
        socketService.emit('get_group_messages', { groupId: id }, (response: any) => {
          if (!isComponentMounted) return;
          
          console.log('Messages response:', response);
          if (response.error) {
            console.error('Error fetching messages:', response.error);
            setError('Failed to fetch messages');
            return;
          }
          if (response.messages) {
            setMessages(response.messages);
          }
        });
      } catch (err) {
        if (!isComponentMounted) return;
        console.error('Error in fetchMessages:', err);
        setError('Failed to fetch messages');
      }
    };

    const setupSocket = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        toast.error('Please log in to use chat features');
        setLoading(false);
        return;
      }

      console.log('Connecting to socket...');
      socketService.connect(token);
      
      connectionCheckInterval = setInterval(() => {
        if (!isComponentMounted) {
          clearInterval(connectionCheckInterval);
          return;
        }

        if (socketService.isConnected()) {
          console.log('Socket connected, joining group...');
          clearInterval(connectionCheckInterval);
          socketService.joinGroup(id!);
          fetchGroupData();
          fetchMessages();
        }
      }, 1000);
    };

    setupSocket();

    // Listen for new messages
    socketService.onGroupMessage((message: Message) => {
      if (!isComponentMounted) return;
      console.log('New message received:', message);
      setMessages(prev => [...prev, message]);
    });

    // Listen for errors
    socketService.onGroupError((error: { message: string }) => {
      if (!isComponentMounted) return;
      console.error('Group error:', error);
      toast.error(error.message);
    });

    return () => {
      isComponentMounted = false;
      clearInterval(connectionCheckInterval);
      socketService.leaveGroup(id!);
      socketService.off('group_message');
      socketService.off('group_error');
    };
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      socketService.sendGroupMessage(id!, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`/api/community/groups/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.imageUrl) {
        socketService.sendGroupMessage(id!, '', 'image', response.data.imageUrl);
      }
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group data...</p>
        </div>
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
    <div className="h-[calc(100vh-64px)] flex">
      {/* Group Info Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{group.name}</h2>
          {isAdmin && (
            <button
              onClick={() => navigate(`/community/groups/${id}/settings`)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Settings className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gray-600">{group.description}</p>
        </div>

        <div>
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="font-medium">Members ({group.members.length})</h3>
          </div>
          <div className="space-y-2">
            {group.members.map((member) => (
              <div key={member._id} className="flex items-center">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name || 'User'}
                    className="h-8 w-8 rounded-full mr-2"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                    {(member.name || 'U')[0]}
                  </div>
                )}
                <span className="text-sm">
                  {member.name || 'Unknown User'}
                  {member.role === 'admin' && (
                    <span className="ml-2 text-xs text-blue-500">(Admin)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.sender._id === localStorage.getItem('userId')
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender._id === localStorage.getItem('userId')
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {message.type === 'image' && message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Shared"
                    className="max-w-full rounded-lg mb-2"
                  />
                )}
                <p>{message.content}</p>
                <div
                  className={`text-xs mt-1 ${
                    message.sender._id === localStorage.getItem('userId')
                      ? 'text-blue-100'
                      : 'text-gray-500'
                  }`}
                >
                  {message.sender.name} •{' '}
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <ImageIcon className="h-5 w-5 text-gray-500" />
              </label>
              <button
                type="submit"
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupPage; 