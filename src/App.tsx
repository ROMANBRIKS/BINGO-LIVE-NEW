import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { BottomNav } from './components/BottomNav';
import { Shield, MessageSquare, X } from 'lucide-react';
import { cn } from './lib/utils';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ChatBox } from './components/ChatBox';

// Lazy load pages for better performance
import HomePage from './pages/HomePage';
const MoviesPage = lazy(() => import('./pages/MoviesPage'));
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
const RelationshipsPage = lazy(() => import('./pages/RelationshipsPage').then(m => ({ default: m.RelationshipsPage })));
const GoLivePage = lazy(() => import('./pages/GoLivePage'));
const TaskCenterPage = lazy(() => import('./pages/TaskCenterPage'));
const FansGroupPage = lazy(() => import('./pages/FansGroupPage'));
const PostsPage = lazy(() => import('./pages/PostsPage'));
const PropsStorePage = lazy(() => import('./pages/PropsStorePage'));
import PointsRedemptionPage from './pages/PointsRedemptionPage';
const WalletPage = lazy(() => import('./pages/WalletPage'));
const WithdrawalHistoryPage = lazy(() => import('./pages/WithdrawalHistoryPage'));
const FamilyDashboardPage = lazy(() => import('./pages/FamilyDashboardPage'));
const FanClubCenterPage = lazy(() => import('./pages/FanClubCenterPage'));
const NobleCenterPage = lazy(() => import('./pages/NobleCenterPage'));
const HonorHallPage = lazy(() => import('./pages/HonorHallPage'));
const VisitorsPage = lazy(() => import('./pages/VisitorsPage'));
const FamilyLeaderboardPage = lazy(() => import('./pages/FamilyLeaderboardPage'));
const FamilyListPage = lazy(() => import('./pages/FamilyListPage'));
const VIPCenterPage = lazy(() => import('./pages/VIPCenterPage'));
const EarningsDashboardPage = lazy(() => import('./pages/EarningsDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AgencyDashboardPage = lazy(() => import('./pages/AgencyDashboardPage'));
const TrendsPage = lazy(() => import('./pages/TrendsPage'));
const MigrationPage = lazy(() => import('./pages/MigrationPage'));
const TalentProfilePage = lazy(() => import('./pages/TalentProfilePage'));
const PublicPortfolio = lazy(() => import('./components/PublicPortfolio').then(m => ({ default: m.PublicPortfolio })));

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#050505] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppContent = () => {
  const { user, profile, loading, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [showStreamChat, setShowStreamChat] = React.useState(false);
  const isStreamPage = location.pathname.startsWith('/room/') || location.pathname === '/go-live' || location.pathname.startsWith('/talent/') || location.pathname.startsWith('/u/');

  if (loading) return <LoadingFallback />;

  // Absolute lock condition:
  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';
  const hasTargetedBans = profile?.bannedStreaming || profile?.bannedMessaging || profile?.bannedWithdrawals || profile?.bannedMovies;
  const isSuspendedLock = !isStaff && profile?.suspendedUntil && new Date(profile.suspendedUntil) > new Date() && !hasTargetedBans;
  const isAppLocked = !isStaff && profile && (profile.isBanned || profile.bannedApp || isSuspendedLock);

  if (isAppLocked) {
    return (
      <div className="min-h-screen w-full bg-[#07070a] flex items-center justify-center p-6 text-zinc-100 font-sans z-[999999] relative">
        <div className="max-w-md w-full bg-[#101015] border border-red-500/20 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden text-center mx-auto">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />
          
          <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 mx-auto animate-pulse">
            <Shield className="text-red-500" size={26} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black uppercase tracking-tight text-white italic">
              🚨 ACCOUNT TERMINATION LOCK
            </h1>
            <p className="text-xs text-zinc-400">
              Access to this application and services has been restricted by the Compliance Team.
            </p>
          </div>

          <div className="bg-black/50 border border-white/5 p-4 rounded-2xl space-y-3.5 text-left text-xs font-mono">
            <div>
              <span className="text-zinc-600 uppercase font-bold tracking-wider block text-[8px]">ACCOUNT ID:</span>
              <span className="text-zinc-300 select-all overflow-hidden text-ellipsis block">{profile.uid}</span>
            </div>
            <div>
              <span className="text-zinc-600 uppercase font-bold tracking-wider block text-[8px]">VIOLATION CONDUCT STATEMENT:</span>
              <span className="text-red-400 font-bold">{profile.suspensionReason || 'Violation of BINGO Live community guidelines & platform standards'}</span>
            </div>
            {profile.suspendedUntil && (
              <div>
                <span className="text-zinc-600 uppercase font-bold tracking-wider block text-[8px]">RESTRICTION EXPIRATION:</span>
                <span className="text-amber-400 font-bold">{new Date(profile.suspendedUntil).toLocaleString()}</span>
              </div>
            )}
            {(profile.isBanned || profile.bannedApp) && !profile.suspendedUntil && (
              <div>
                <span className="text-zinc-600 uppercase font-bold tracking-wider block text-[8px]">LOCK PERIOD:</span>
                <span className="text-red-500 font-extrabold uppercase">PERMANENT DEBARMENT</span>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5 text-left font-sans">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300">Submit Compliance Appeal</h3>
            <p className="text-[10px] text-zinc-500 leading-normal">
              Provide an official explanation statement to request early reinstatement or contest this policy enforcement action.
            </p>

            {profile.appealStatus === 'pending' ? (
              <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[9px] text-amber-500 font-black tracking-widest uppercase animate-pulse block">🕒 STATEMENT UNDER DISPATCH</span>
                <p className="text-[10px] text-zinc-400">Your statement is being audited on the Compliance Review Board.</p>
              </div>
            ) : profile.appealStatus === 'rejected' ? (
              <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[9px] text-red-500 font-black tracking-widest uppercase block">❌ REINSTATEMENT APPEAL DENIED</span>
                <p className="text-[10px] text-zinc-500">The moderation deck reviewed evidence logs and rejected the appeal. The lock remains active.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  placeholder="Describe your reasoning and action context..."
                  id="app-lockout-appeal-textarea"
                  className="w-full h-20 bg-black/40 border border-white/5 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-red-500/30 font-medium placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const el = document.getElementById('app-lockout-appeal-textarea') as HTMLTextAreaElement;
                    if (!el || !el.value.trim()) return;
                    try {
                      const text = el.value.trim();
                      await updateDoc(doc(db, 'users', profile.uid), {
                        appealText: text,
                        appealStatus: 'pending'
                      });
                      try {
                        const q = query(
                          collection(db, 'suspensions'),
                          where('userId', '==', profile.uid),
                          where('appealStatus', '==', 'none')
                        );
                        const snapshot = await getDocs(q);
                        if (!snapshot.empty) {
                          const latestDoc = snapshot.docs[0];
                          await updateDoc(doc(db, 'suspensions', latestDoc.id), {
                            appealText: text,
                            appealStatus: 'pending'
                          });
                        }
                      } catch (innerErr) {
                        console.warn("Could not synchronize suspensions:", innerErr);
                      }
                      window.location.reload();
                    } catch (e: any) {
                      console.error(`Appeal failed: ${e.message}`);
                    }
                  }}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] tracking-widest uppercase rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  Submit Official Appeal
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={async () => {
              await logout();
              window.location.reload();
            }}
            className="text-[10px] font-black tracking-widest uppercase text-zinc-500 hover:text-white transition-all cursor-pointer block mx-auto pt-2 bg-transparent border-0 outline-none"
          >
            Log Out Account
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/talent/:username" element={<TalentProfilePage />} />
          <Route path="/u/:uid" element={<PublicPortfolio />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex justify-center overflow-x-hidden transition-colors duration-300",
      theme === 'dark' ? "bg-[#050505] text-white" : "bg-[#f8f8f8] text-black"
    )}>
      <div className="w-full flex max-w-[1600px] relative">
        {!isStreamPage && <Sidebar />}
        <main className={cn(
          "flex-1 min-h-screen relative overflow-x-hidden transition-colors duration-300",
          theme === 'dark' ? "bg-[#121212]" : "bg-white",
          !isStreamPage && (theme === 'dark' ? "sm:border-x border-white/5" : "sm:border-x border-black/5")
        )}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/room/:roomId" element={<RoomPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/creator-center" element={<CreatorCenterPage />} />
              <Route path="/party" element={<PartyPage />} />
              <Route path="/chats" element={<RealmatchPage />} />
              <Route path="/messages" element={<ChatsPage />} />
              <Route path="/chats/:chatId" element={<ChatDetailPage />} />
              <Route path="/go-live" element={<GoLivePage />} />
              <Route path="/tasks" element={<TaskCenterPage />} />
              <Route path="/fans" element={<RelationshipsPage initialTab="fans" />} />
              <Route path="/fan-group" element={<FansGroupPage />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/store" element={<PropsStorePage />} />
              <Route path="/svip" element={<PointsRedemptionPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/withdrawal-history" element={<WithdrawalHistoryPage />} />
              <Route path="/points-redemption" element={<PointsRedemptionPage />} />
              <Route path="/family-dashboard" element={<FamilyDashboardPage />} />
              <Route path="/fan-club-center" element={<FanClubCenterPage />} />
              <Route path="/noble-center" element={<NobleCenterPage />} />
              <Route path="/honor-hall" element={<HonorHallPage />} />
              <Route path="/visitors" element={<VisitorsPage />} />
              <Route path="/family-leaderboard" element={<FamilyLeaderboardPage />} />
              <Route path="/family-list" element={<FamilyListPage />} />
              <Route path="/earnings-dashboard" element={<EarningsDashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/agency-dashboard" element={<AgencyDashboardPage />} />
              <Route path="/news" element={<TrendsPage />} />
              <Route path="/trends" element={<TrendsPage />} />
              <Route path="/following" element={<RelationshipsPage initialTab="following" />} />
              <Route path="/friends" element={<RelationshipsPage initialTab="friends" />} />
              <Route path="/vip" element={<VIPCenterPage />} />
              <Route path="/pk" element={<ComingSoonPage title="PK Battles" />} />
              <Route path="/hot" element={<ComingSoonPage title="Hot Content" />} />
              <Route path="/migration" element={<MigrationPage />} />
              <Route path="/talent/:username" element={<TalentProfilePage />} />
              <Route path="/u/:uid" element={<PublicPortfolio />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
        {!isStreamPage && <RightSidebar />}
      </div>
      {!isStreamPage && <BottomNav />}

      {/* Floating Real-Time Stream Chat Widget */}
      <div className={cn(
        "fixed z-50 transition-all duration-300 ease-out flex flex-col items-end gap-3",
        isStreamPage ? "bottom-24 right-4" : "bottom-20 right-6 sm:bottom-24 sm:right-8"
      )}>
        {showStreamChat && (
          <div className="w-[340px] sm:w-[380px] max-w-[calc(100vw-2rem)] h-[450px] bg-[#0c0c14] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)] flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="font-black text-xs uppercase tracking-widest text-white italic">REAL-TIME GLOBAL CHAT</span>
              </div>
              <button 
                onClick={() => setShowStreamChat(false)}
                className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/35 cursor-pointer transition-colors active:scale-90"
              >
                <X size={14} />
              </button>
            </div>
            
            {/* Chat Content */}
            <div className="flex-1 overflow-hidden bg-slate-950/20">
              <ChatBox channelId="global-stream-channel" />
            </div>
          </div>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={() => setShowStreamChat(!showStreamChat)}
          className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer transition-all duration-300 active:scale-105 active:scale-95",
            showStreamChat 
              ? "bg-zinc-800 hover:bg-zinc-700 shadow-black/40 rotate-90" 
              : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:scale-105 shadow-indigo-500/30"
          )}
          title="Open Stream Chat"
        >
          {showStreamChat ? <X size={20} /> : <MessageSquare size={22} />}
        </button>
      </div>
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
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <Router>
                <AppContent />
              </Router>
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
