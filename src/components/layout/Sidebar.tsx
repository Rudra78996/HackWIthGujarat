import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Calendar, Users, Plus, ChevronDown, ChevronRight, ChevronLeft, Bot } from 'lucide-react';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  active?: boolean;
  submenu?: {
    title: string;
    path: string;
    active?: boolean;
  }[];
  open?: boolean;
}

const Sidebar = () => {
  const location = useLocation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const items: MenuItem[] = [
      {
        title: 'Freelance',
        path: '/freelance',
        icon: <Briefcase size={20} />,
        active: location.pathname.startsWith('/freelance'),
        open: location.pathname.startsWith('/freelance'),
        submenu: [
          {
            title: 'Browse Gigs',
            path: '/freelance/gigs',
            active: location.pathname === '/freelance/gigs',
          },
          {
            title: 'Post a Gig',
            path: '/freelance/create-gig',
            active: location.pathname === '/freelance/create-gig',
          },
          {
            title: 'My Applications',
            path: '/freelance/applications',
            active: location.pathname === '/freelance/applications',
          },
          {
            title: 'My Gigs',
            path: '/freelance/my-gigs',
            active: location.pathname === '/freelance/my-gigs',
          },
        ],
      },
      {
        title: 'Events',
        path: '/events',
        icon: <Calendar size={20} />,
        active: location.pathname.startsWith('/events'),
        open: location.pathname.startsWith('/events'),
        submenu: [
          {
            title: 'Upcoming Events',
            path: '/events',
            active: location.pathname === '/events',
          },
          {
            title: 'Create Event',
            path: '/events/create',
            active: location.pathname === '/events/create',
          },
          {
            title: 'My Events',
            path: '/events/my-events',
            active: location.pathname === '/events/my-events',
          },
        ],
      },
      {
        title: 'Community',
        path: '/community',
        icon: <Users size={20} />,
        active: location.pathname.startsWith('/community'),
        open: location.pathname.startsWith('/community'),
        submenu: [
          {
            title: 'Posts',
            path: '/community',
            active: location.pathname === '/community',
          },
          {
            title: 'All Groups',
            path: '/community/groups',
            active: location.pathname === '/community/groups',
          },
          // {
          //   title: 'Direct Messages',
          //   path: '/community/messages',
          //   active: location.pathname === '/community/messages',
          // },
          {
            title: 'Create Group',
            path: '/community/create-group',
            active: location.pathname === '/community/create-group',
          },
        ],
      },
    ];

    setMenuItems(items);
  }, [location.pathname]);

  const toggleSubmenu = (index: number) => {
    const updatedItems = [...menuItems];
    updatedItems[index].open = !updatedItems[index].open;
    setMenuItems(updatedItems);
  };

  return (
    <aside className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed left-0 h-full z-10 hidden md:block pt-4 pb-6 overflow-y-auto transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between px-4 mb-4">
        {!isCollapsed && (
          <Link
            to="/create"
            className="flex items-center justify-center w-full btn-primary space-x-2"
          >
            <Plus size={16} />
            <span>Create New</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 ${
            isCollapsed ? 'ml-2' : ''
          }`}
        >
          {isCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      <nav className="mt-2">
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li key={item.title}>
              <div className="px-3">
                <button
                  onClick={() => toggleSubmenu(index)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-md transition-colors ${
                    item.active
                      ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`${isCollapsed ? 'mr-0' : 'mr-3'}`}>{item.icon}</span>
                    {!isCollapsed && <span className="font-medium">{item.title}</span>}
                  </div>
                  {!isCollapsed && item.submenu && (
                    <span>
                      {item.open ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </span>
                  )}
                </button>
              </div>

              {!isCollapsed && item.submenu && item.open && (
                <ul className="mt-1 ml-12 space-y-1">
                  {item.submenu.map((subItem) => (
                    <li key={subItem.title}>
                      <Link
                        to={subItem.path}
                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                          subItem.active
                            ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {subItem.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="px-6 mt-8 space-y-4">
          <div className="p-4 bg-primary-50 dark:bg-primary-900/50 rounded-lg">
            <h4 className="font-medium text-primary-800 dark:text-primary-400 mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Have questions or need support with the platform?
            </p>
            <Link to="/support" className="btn-primary w-full text-center text-sm">
              Contact Support
            </Link>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-lg">
            <h4 className="font-medium text-purple-800 dark:text-purple-400 mb-2">AI Assistant</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Get instant help from our AI assistant
            </p>
            <Link to="/support/ai-assist" className="w-full text-center text-sm py-2 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium transition-colors">
              Chat with AI
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;