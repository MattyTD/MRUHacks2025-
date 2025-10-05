import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Owner from './pages/Owner';
import ProtectedRoute from './components/ProtectedRoute';
import hud from './assets/jhudderson.png';
import gaybrothers from './assets/gaybrothers.png';
import './App.css';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/owner';

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jhuddy<3" element={
                <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh', // or '100vh' for full viewport
                width: '100%',
                }}>
              <img src={hud} alt=''/>
              </div>
              }
            />
            <Route path="/gaybrothers" element={
                <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh', // or '100vh' for full viewport
                width: '100%',
                }}>
              <img src={gaybrothers} alt=''/>
              </div>
              }
            />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/owner" 
                element={
                  <ProtectedRoute>
                    <Owner />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
