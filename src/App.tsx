import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Loading from './components/ui/Loading';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Freelance pages
const FreelanceHome = lazy(() => import('./pages/freelance/FreelanceHome'));
const GigListingPage = lazy(() => import('./pages/freelance/GigListingPage'));
const GigDetailPage = lazy(() => import('./pages/freelance/GigDetailPage'));
const CreateGigPage = lazy(() => import('./pages/freelance/CreateGigPage'));
const FreelanceProfilePage = lazy(() => import('./pages/freelance/FreelanceProfilePage'));

// Event pages
const EventsHome = lazy(() => import('./pages/events/EventsHome'));
const EventDetailPage = lazy(() => import('./pages/events/EventDetailPage'));
const CreateEventPage = lazy(() => import('./pages/events/CreateEventPage'));
const ManageEventPage = lazy(() => import('./pages/events/ManageEventPage'));

// Community pages
const CommunityHome = lazy(() => import('./pages/community/CommunityHome'));
const GroupPage = lazy(() => import('./pages/community/GroupPage'));
const DirectMessagePage = lazy(() => import('./pages/community/DirectMessagePage'));
const CreateGroupPage = lazy(() => import('./pages/community/CreateGroupPage'));
const CreatePost = lazy(() => import('./pages/community/CreatePost'));
const PostDetail = lazy(() => import('./pages/community/PostDetail'));

// Error and not found
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  const location = useLocation();
  const { checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Loading />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            
            {/* Auth Routes */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<ProfilePage />} />
              
              {/* Freelance Routes */}
              <Route path="freelance">
                <Route index element={<FreelanceHome />} />
                <Route path="gigs" element={<GigListingPage />} />
                <Route path="gigs/:id" element={<GigDetailPage />} />
                <Route path="create-gig" element={<CreateGigPage />} />
                <Route path="profile/:id" element={<FreelanceProfilePage />} />
              </Route>
              
              {/* Event Routes */}
              <Route path="events">
                <Route index element={<EventsHome />} />
                <Route path=":id" element={<EventDetailPage />} />
                <Route path="create" element={<CreateEventPage />} />
                <Route path="manage/:id" element={<ManageEventPage />} />
              </Route>
              
              {/* Community Routes */}
              <Route path="community">
                <Route index element={<CommunityHome />} />
                <Route path="groups/:id" element={<GroupPage />} />
                <Route path="messages/:id" element={<DirectMessagePage />} />
                <Route path="create-group" element={<CreateGroupPage />} />
                <Route path="create-post" element={<CreatePost />} />
                <Route path="posts/:id" element={<PostDetail />} />
              </Route>
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default App;