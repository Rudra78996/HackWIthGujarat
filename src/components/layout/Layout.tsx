import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../store/authStore';

const Layout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  
  // Check if we're on an auth page
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  
  // Only show sidebar on authenticated pages that are not auth pages
  const showSidebar = isAuthenticated && !isAuthPage;
  
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <div className="flex flex-1">
        {showSidebar && <Sidebar />}
        
        <main className={`flex-1 ${showSidebar ? 'ml-0 md:ml-64' : ''}`}>
          <div className="container-custom py-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;