import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import Upgrader from './pages/Upgrader';

const CLIENT_ID = "391022026207-mpbuh1cff64bkvarv7dldcet7fqfdn1a.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <ToastProvider>
        <CurrencyProvider>
          <AuthProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/upgrader" element={<Upgrader />} />
                </Routes>
              </Layout>
            </Router>
          </AuthProvider>
        </CurrencyProvider>
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
