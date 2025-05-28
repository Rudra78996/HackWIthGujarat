import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    const fetchGroupData = async () => {
      try {
        const response = await axios.get(`/api/community/groups/${id}`);
        setGroup(response.data);
        setIsAdmin(response.data.members.some((member: any) => 
          member._id === localStorage.getItem('userId') && member.role === 'admin'
        ));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch group data');
        setLoading(false);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/community/groups/${id}/messages`);
        setMessages(response.data);
      } catch (err) {
        setError('Failed to fetch messages');
      }
    };

    fetchGroupData();
    fetchMessages();

    // Set up WebSocket connection for real-time messages
    const ws = new WebSocket(`ws://localhost:5000/ws/group/${id}`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    return () => {
      ws.close();
    };
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`/api/community/groups/${id}/messages`, {
        content: newMessage,
        type: 'text'
      });
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      await axios.post(`/api/community/groups/${id}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
                    alt={member.name}
                    className="h-8 w-8 rounded-full mr-2"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                    {member.name[0]}
                  </div>
                )}
                <span className="text-sm">
                  {member.name}
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
      <div className="flex-1 flex flex-col">
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

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
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
  );
};

export default GroupPage; 