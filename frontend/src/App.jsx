import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RoadmapDetail from './pages/RoadmapDetail';
import Stats from './pages/Stats';
import SharedRoadmap from './pages/SharedRoadmap';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AllPlans from './pages/AllPlans';
import InterviewPrep from './pages/InterviewPrep';
import CVAnalyzer from './pages/CVAnalyzer';
import AIChatbot from './components/AIChatbot';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#0a0a0f' }}>
      <div style={{ width:40, height:40, border:'4px solid rgba(168,85,247,0.2)', borderTopColor:'#a855f7', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function GlobalChatbot() {
  const { user } = useAuth();
  return user ? <AIChatbot /> : null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <GlobalChatbot />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/roadmap/:id" element={<PrivateRoute><RoadmapDetail /></PrivateRoute>} />
            <Route path="/stats" element={<PrivateRoute><Stats /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/plans" element={<PrivateRoute><AllPlans /></PrivateRoute>} />
            <Route path="/interview-prep" element={<PrivateRoute><InterviewPrep /></PrivateRoute>} />
            <Route path="/cv-analyzer" element={<PrivateRoute><CVAnalyzer /></PrivateRoute>} />
            <Route path="/share/:token" element={<SharedRoadmap />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
