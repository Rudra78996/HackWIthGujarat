import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsProps {
  onClose: () => void;
}

interface Notification {
  id: string;
  type: 'message' | 'event' | 'gig' | 'system';
  title: string;
  description: string;
  read: boolean;
  createdAt: Date;
  link: string;
}

const Notifications = ({ onClose }: NotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - would fetch from API in real app
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'message',
        title: 'New message',
        description: 'Sarah sent you a message',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 mins ago
        link: '/community/messages/1',
      },
      {
        id: '2',
        type: 'event',
        title: 'Event reminder',
        description: 'React Meetup starts in 2 hours',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        link: '/events/2',
      },
      {
        id: '3',
        type: 'gig',
        title: 'Gig application',
        description: 'Your application was accepted',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        link: '/freelance/gigs/3',
      },
    ];
    
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({
        ...notification,
        read: true,
      }))
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message':
        return (
          <div className="p-2 rounded-full bg-primary-100 text-primary-600">
            <Bell size={16} />
          </div>
        );
      case 'event':
        return (
          <div className="p-2 rounded-full bg-secondary-100 text-secondary-600">
            <Bell size={16} />
          </div>
        );
      case 'gig':
        return (
          <div className="p-2 rounded-full bg-accent-100 text-accent-600">
            <Bell size={16} />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-full bg-gray-100 text-gray-600">
            <Bell size={16} />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div>
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-medium">Notifications</h3>
          <p className="text-sm text-gray-500">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
            >
              <Check size={14} className="mr-1" />
              Mark all as read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <ul>
            {notifications.map(notification => (
              <li 
                key={notification.id}
                className={`border-b border-gray-100 last:border-0 ${!notification.read ? 'bg-gray-50' : ''}`}
              >
                <Link 
                  to={notification.link}
                  className="px-4 py-3 flex items-start hover:bg-gray-50"
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex-shrink-0 mr-3">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {notification.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary-600"></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 text-center">
        <Link
          to="/notifications"
          className="text-sm text-primary-600 hover:text-primary-800 font-medium"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default Notifications;