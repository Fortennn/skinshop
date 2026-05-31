import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCurrency, currencies } from '../../context/CurrencyContext';
import AuthModal from '../auth/AuthModal';
import CartDrawer from './CartDrawer';
import RefillModal from '../common/RefillModal';
import { ShoppingBag, Wallet, LogIn, Plus, Globe, ChevronDown } from 'lucide-react';

const Header = () => {
  const { user, logout, cart } = useAuth();
  const { currency, changeCurrency, formatPrice } = useCurrency();
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRefillOpen, setIsRefillOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Upgrader', path: '/upgrader' },
    ...(user ? [{ name: 'Inventory', path: '/profile' }] : [])
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 backdrop-blur-xl shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group relative">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-accent-cyan via-accent-blue to-accent-purple p-[1.5px] shadow-[0_0_15px_rgba(0,242,254,0.25)] group-hover:shadow-[0_0_25px_rgba(0,242,254,0.55)] transition-all duration-300"
          >
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center overflow-hidden">
              {logoError ? (
                <span className="text-accent-cyan font-black text-lg text-glow-cyan">V</span>
              ) : (
                <img 
                  src="/valkyrie-logo.png" 
                  alt="V" 
                  className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-300"
                  onError={() => setLogoError(true)}
                />
              )}
            </div>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-lg tracking-wider font-sans group-hover:text-accent-cyan transition-colors duration-300 text-shadow-sm">
              VALKYRIE
            </span>
            <span className="text-[10px] text-accent-cyan font-black tracking-widest -mt-1 opacity-80 uppercase">
              CS2 MARKET
            </span>
          </div>
        </Link>

        {/* Navigation - With Framer Motion layoutId Active Route Sliders */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className={`relative py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive(link.path) ? 'text-accent-cyan' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <motion.span 
                      layoutId="active-nav-marker"
                      className="absolute bottom-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple rounded-full shadow-[0_0_12px_rgba(0,242,254,0.8)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Auth / Account Controls */}
        <div className="flex items-center gap-4">
          
          {/* Currency Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{currency}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isCurrencyOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isCurrencyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 right-0 w-32 bg-dark-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden p-1 z-50"
                >
                  {Object.keys(currencies).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        changeCurrency(curr);
                        setIsCurrencyOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                        currency === curr 
                          ? 'bg-accent-cyan/10 text-accent-cyan' 
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{currencies[curr].label}</span>
                      <span className="opacity-50">{currencies[curr].symbol}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Account Balance Pill */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRefillOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-accent-cyan/35 transition-all duration-300 cursor-pointer shadow-lg active-border-sweep"
                title="Refill Balance"
              >
                <Wallet className="w-4 h-4 text-accent-cyan text-glow-cyan animate-pulse" />
                <span className="text-xs font-bold text-gray-200 font-sans tracking-wide">
                  {formatPrice(user.balance || 0)}
                </span>
                <span className="ml-0.5 w-4 h-4 rounded-md bg-accent-cyan/15 hover:bg-accent-cyan text-accent-cyan hover:text-black text-[9px] font-black flex items-center justify-center transition-colors">
                  <Plus className="w-2.5 h-2.5" />
                </span>
              </motion.div>

              {/* User Profile Info */}
              <Link 
                to="/profile" 
                className="flex items-center gap-2.5 group p-1 pr-3 rounded-full hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-accent-cyan/40 group-hover:border-accent-cyan transition-colors shadow-[0_0_10px_rgba(0,242,254,0.25)] relative">
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-accent-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="hidden sm:inline text-xs font-black text-gray-300 group-hover:text-white transition-colors max-w-[100px] truncate uppercase tracking-widest">
                  {user.name.split(' ')[0]}
                </span>
              </Link>

              {/* Shopping Cart Trigger */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 cursor-pointer transition-all duration-300 group shadow-md"
              >
                <ShoppingBag className="w-4.5 h-4.5 text-gray-300 group-hover:text-accent-cyan transition-colors" />
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-accent-cyan to-accent-blue text-dark-950 font-black text-[9px] flex items-center justify-center shadow-[0_0_8px_#00f2fe]">
                  {cart.length}
                </span>
              </motion.button>

            </div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsAuthModalOpen(true)}
              className="relative px-6 py-3 rounded-xl bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple hover:brightness-110 text-dark-950 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover-glow transition-all duration-300 cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(0,242,254,0.35)] shine-sweep"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </motion.button>
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      <RefillModal 
        isOpen={isRefillOpen}
        onClose={() => setIsRefillOpen(false)}
      />
    </header>
  );
};

export default Header;
