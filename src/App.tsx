import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { BottomNav } from './components/BottomNav';
import { Shield } from 'lucide-react';
import { cn } from './lib/utils';

// Lazy load pages for better performance
import HomePage from './pages/HomePage';
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const RoomPage = lazy(() => import('./pages/RoomPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CreatorCenterPage = lazy(() => import('./pages/CreatorCenterPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PartyPage = lazy(() => import('./pages/PartyPage'));
const ChatsPage = lazy(() => import('./pages/ChatsPage'));
const RealmatchPage = lazy(() => import('./pages/RealmatchPage'));
const ChatDetailPage = lazy(() => import('./pages/ChatDetailPage'));
const ComingSoonPage = lazy(() => import('./pages/ComingSoonPage'));
const GoLivePage = lazy(() => import('./pages/GoLivePage'));
const PointsRedemptionPage = lazy(() => import('./pages/PointsRedemptionPage'));
const FamilyDashboardPage = lazy(() => import('./pages/FamilyDashboardPage'));
const FanClubCenterPage = lazy(() => import('./pages/FanClubCenterPage'));
const NobleCenterPage = lazy(() => import('./pages/NobleCenterPage'));
const EarningsDashboardPage = lazy(() => import('./pages/EarningsDashboardPage'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#050505] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppContent = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingFallback />;

  if (!user) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LandingPage />
      </Suspense>
    );
  }

  const isStreamPage = location.pathname.startsWith('/room/') || location.pathname === '/go-live';

  return (
    <div className="min-h-screen bg-[#050505] text-white flex justify-center overflow-x-hidden">
      <div className="w-full flex max-w-[1600px] relative">
        {!isStreamPage && <Sidebar />}
        <main className={cn(
          "flex-1 min-h-screen bg-[#121212] relative overflow-x-hidden",
          !isStreamPage && "sm:border-x border-white/5"
        )}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/room/:roomId" element={<RoomPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/creator-center" element={<CreatorCenterPage />} />
              <Route path="/party" element={<PartyPage />} />
              <Route path="/chats" element={<RealmatchPage />} />
              <Route path="/messages" element={<ChatsPage />} />
              <Route path="/chats/:chatId" element={<ChatDetailPage />} />
              <Route path="/go-live" element={<GoLivePage />} />
              <Route path="/points-redemption" element={<PointsRedemptionPage />} />
              <Route path="/family-dashboard" element={<FamilyDashboardPage />} />
              <Route path="/fan-club-center" element={<FanClubCenterPage />} />
              <Route path="/noble-center" element={<NobleCenterPage />} />
              <Route path="/earnings-dashboard" element={<EarningsDashboardPage />} />
              <Route path="/following" element={<ComingSoonPage title="Following" />} />
              <Route path="/vip" element={<ComingSoonPage title="VIP Center" />} />
              <Route path="/pk" element={<ComingSoonPage title="PK Battles" />} />
              <Route path="/hot" element={<ComingSoonPage title="Hot Content" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
        {!isStreamPage && <RightSidebar />}
      </div>
      {!isStreamPage && <BottomNav />}
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <Shield size={64} className="mx-auto mb-6 text-red-500" />
            <h2 className="text-2xl font-black uppercase italic mb-4">Something went wrong</h2>
            <p className="text-white/40 text-sm mb-8">
              {this.state.error?.message || "An unexpected error occurred. Please try refreshing the page."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-white text-black font-bold rounded-xl"
            >
              REFRESH PAGE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
