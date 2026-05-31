import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import { User, Mail, Lock, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, loginWithEmail, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const result = loginWithEmail(formData.email, formData.password);
      if (result.success) { onClose(); } else { setError(result.message); }
    } else {
      if (!formData.name) return setError('Name is required');
      const result = register(formData.name, formData.email, formData.password);
      if (result.success) { onClose(); } else { setError(result.message); }
    }
  };

  const handleGoogleSuccess = (response) => {
    login(response);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isLogin ? 'Welcome Back' : 'Create Account'}>

      {/* Tab switcher — motion div rendered FIRST (behind text) */}
      <div className="relative flex gap-2 p-1 rounded-xl bg-white/[0.05] border border-white/[0.06] mb-6">
        {['Login', 'Register'].map((tab) => {
          const isActive = (tab === 'Login' && isLogin) || (tab === 'Register' && !isLogin);
          return (
            <button
              key={tab}
              type="button"
              onClick={() => { setIsLogin(tab === 'Login'); setError(''); }}
              className="relative flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-colors duration-200 cursor-pointer overflow-hidden"
              style={{ color: isActive ? '#ffffff' : 'rgba(156,163,175,1)' }}
            >
              {/* Background pill — rendered before text in DOM = lower z than text */}
              {isActive && (
                <motion.div
                  layoutId="auth-tab-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #00f2fe, #4facfe, #8a2be2)',
                    zIndex: 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              {/* Text — sits above the motion background */}
              <span className="relative" style={{ zIndex: 1 }}>{tab}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, x: isLogin ? -8 : 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isLogin ? 8 : -8 }}
          transition={{ duration: 0.18 }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Username (Register only) */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Username</label>
                <div className="relative flex items-center group">
                  <User className="absolute left-3.5 w-4 h-4 text-gray-500 group-focus-within:text-accent-cyan transition-colors pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. skin_lord_99"
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/[0.08] focus:border-accent-cyan/50 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Email Address</label>
              <div className="relative flex items-center group">
                <Mail className="absolute left-3.5 w-4 h-4 text-gray-500 group-focus-within:text-accent-cyan transition-colors pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/[0.08] focus:border-accent-cyan/50 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label>
                {isLogin && (
                  <span className="text-[9px] font-bold text-accent-cyan/60 hover:text-accent-cyan cursor-pointer transition-colors uppercase tracking-widest">
                    Forgot?
                  </span>
                )}
              </div>
              <div className="relative flex items-center group">
                <Lock className="absolute left-3.5 w-4 h-4 text-gray-500 group-focus-within:text-accent-cyan transition-colors pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/[0.08] focus:border-accent-cyan/50 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-950/25 border border-red-500/25 text-red-400 text-xs font-semibold"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3.5 mt-1 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(0,242,254,0.25)]"
              style={{
                background: 'linear-gradient(135deg, #00f2fe, #4facfe, #8a2be2)',
                color: '#000000',
              }}
            >
              {isLogin ? 'Authenticate Session' : 'Register Account'}
            </motion.button>
          </form>
        </motion.div>
      </AnimatePresence>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-[1px] bg-white/[0.06]" />
        <span className="text-[9px] font-black text-gray-500 tracking-widest">OR SIGN IN WITH</span>
        <div className="flex-1 h-[1px] bg-white/[0.06]" />
      </div>

      {/* Auth Providers */}
      <div className="flex flex-col gap-3">
        {/* Google OAuth */}
        <div className="w-full border border-white/[0.07] rounded-xl overflow-hidden bg-black hover:border-white/20 transition-colors">
          <div className="flex justify-center w-full scale-[1.02]">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Authentication Failed')}
              theme="filled_black"
              shape="pill"
              text="signin_with"
              width="400"
            />
          </div>
        </div>

        {/* Steam Auth */}
        <button
          onClick={() => window.location.href = 'http://localhost:5000/auth/steam'}
          className="w-full h-[40px] flex items-center justify-center gap-3 rounded-xl border border-white/[0.07] bg-[#1b2838] hover:bg-[#2a475e] hover:border-white/20 transition-all duration-300 group shadow-lg shadow-black/20"
        >
          <div className="flex items-center gap-2.5 px-4">
            <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.54-.374 1.203-.6 1.922-.606l2.36-3.37V9.61c0-2.029 1.644-3.673 3.673-3.673 2.03 0 3.674 1.644 3.674 3.673s-1.644 3.674-3.674 3.674c-.09 0-.172-.018-.259-.027l-3.356 2.373a3.63 3.63 0 01-3.645 3.398c-.145 0-.29-.01-.43-.028l-5.187 2.143C3.582 23.216 7.558 24 12 24c6.627 0 12-5.373 12-12S18.627 0 11.979 0zM7.483 14.79c.067 0 .135.003.203.003 1.341 0 2.43-1.09 2.43-2.43s-1.09-2.43-2.43-2.43c-.394 0-.756.1-.11.272l-4.223 1.745c-.173.53-.267 1.096-.267 1.685 0 1.25.94 2.276 2.152 2.417l.248.01c.621 0 1.18-.25 1.587-.655l.413-.617zm5.286-8.527c1.3 0 2.355 1.055 2.355 2.355s-1.055 2.355-2.355 2.355-2.355-1.055-2.355-2.355 1.056-2.355 2.355-2.355zm0 3.673c.727 0 1.318-.591 1.318-1.318s-.591-1.318-1.318-1.318-1.318.591-1.318 1.318.591 1.318 1.318 1.318z"/>
            </svg>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Sign in with Steam</span>
          </div>
        </button>
      </div>
    </Modal>
  );
};

export default AuthModal;
