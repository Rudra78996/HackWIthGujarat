import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Send, Image as ImageIcon, Info, X } from 'lucide-react';
import { MessageSquare } from 'lucide-react';

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

interface User {
  _id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

const DirectMessagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/users/${id}`);
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user data');
        setLoading(false);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/messages/${id}`);
        setMessages(response.data);
      } catch (err) {
        setError('Failed to fetch messages');
      }
    };

    fetchUserData();
    fetchMessages();

    // Set up WebSocket connection for real-time messages
    const ws = new WebSocket(`ws://localhost:5000/ws/dm/${id}`);
    
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
      await axios.post(`/api/messages/${id}`, {
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
      await axios.post(`/api/messages/${id}`, formData, {
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

  if (error || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error || 'User not found'}</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Messages</h2>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-180px)]">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedConversation?.id === conversation.id
                  ? 'bg-gray-50 dark:bg-gray-700'
                  : ''
              }`}
            >
              <div className="relative">
                <img
                  src={conversation.participant.avatar}
                  alt={conversation.participant.name}
                  className="h-12 w-12 rounded-full"
                />
                {conversation.participant.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {conversation.participant.name}
                  </p>
                  {conversation.lastMessage && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(conversation.lastMessage.createdAt)}
                    </p>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {conversation.lastMessage.content}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-800">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={selectedConversation.participant.avatar}
                    alt={selectedConversation.participant.name}
                    className="h-10 w-10 rounded-full"
                  />
                  {selectedConversation.participant.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {selectedConversation.participant.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedConversation.participant.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUserProfile(true)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender.id === currentUser?.id
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender.id === currentUser?.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
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
                        message.sender.id === currentUser?.id
                          ? 'text-primary-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <label className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <ImageIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </label>
                <button
                  type="submit"
                  className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No conversation selected
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {showUserProfile && selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                User Profile
              </h3>
              <button
                onClick={() => setShowUserProfile(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <img
                src={selectedConversation.participant.avatar}
                alt={selectedConversation.participant.name}
                className="h-16 w-16 rounded-full"
              />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedConversation.participant.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedConversation.participant.title}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedConversation.participant.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedConversation.participant.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectMessagePage; 