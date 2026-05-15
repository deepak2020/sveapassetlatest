import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Home from './pages/Home';
import LanguageLessons from './pages/LanguageLessons';
import LessonDetail from './pages/LessonDetail';
import CivicTopics from './pages/CivicTopics';
import TopicDetail from './pages/TopicDetail';
import LanguageTest from './pages/LanguageTest';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Gym from './pages/Gym';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors (only for truly required pages)
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Dashboard />} />
        <Route path="/language" element={<LanguageLessons />} />
        <Route path="/language/:id" element={<LessonDetail />} />
        <Route path="/civic" element={<CivicTopics />} />
        <Route path="/civic/:id" element={<TopicDetail />} />
        <Route path="/language-test" element={<LanguageTest />} />
        <Route path="/gym" element={<Gym />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App