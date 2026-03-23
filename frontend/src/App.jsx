import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home'; // This is our Chat page
import Admin from './pages/Admin';
import Login from './pages/Login';
import { verifySession } from './services/api.service';

function AppContent({ authenticated, setAuthenticated }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-blue-400/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-violet-400/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-indigo-400/5 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Subtle Paper Texture Overlay */}
      <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      {!isLoginPage && <Navbar authenticated={authenticated} setAuthenticated={setAuthenticated} />}

      {/* Global Page Container */}
      <main className="flex-1 flex flex-col w-full relative z-10">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<Home />} />
          <Route path="/login" element={<Login setAuthenticated={setAuthenticated} />} />
          <Route 
            path="/admin" 
            element={authenticated ? <Admin /> : <Navigate to="/login" />} 
          />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await verifySession();
        if (data && data.user_id) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (err) {
        setAuthenticated(false);
      } finally {
        setAppLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (appLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent authenticated={authenticated} setAuthenticated={setAuthenticated} />
    </Router>
  );
}

export default App;
