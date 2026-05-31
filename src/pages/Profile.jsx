import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Navigate } from 'react-router-dom';
import SkinCard from '../components/skins/SkinCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Wallet, Shield, History, Settings, LogOut, CheckCircle2, 
  Copy, Check, ArrowUpRight, ArrowDownRight, Sparkles, Plus
} from 'lucide-react';

const Profile = () => {
  const { user, logout, sellItem, topUpBalance } = useAuth();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [confirmItem, setConfirmItem] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', success: true });

  if (!user) return <Navigate to="/" />;

  const userInventory = user.inventory || [];
  const userHistory = user.history || [];

  const showToast = (message, success = true) => {
    setToast({ show: true, message, success });
    setTimeout(() => setToast({ show: false, message: '', success: true }), 3000);
  };

  const handleSellConfirm = (item) => setConfirmItem(item);

  const executeSell = () => {
    if (confirmItem) {
      sellItem(confirmItem.purchaseId);
      setConfirmItem(null);
      showToast(`Sold ${confirmItem.name} for ${formatPrice(confirmItem.price)}`);
    }
  };

  const copyTradeLink = () => {
    navigator.clipboard.writeText('https://steamcommunity.com/tradeoffer/new/?partner=89210292&token=Valkyrie');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTopUp = (amount) => {
    const res = topUpBalance(amount);
    if (res && res.success) {
      showToast(`+${formatPrice(amount)} credited to your wallet!`);
    } else {
      showToast(res?.message || 'Top-up failed', false);
    }
  };

  const TABS = [
    { id: 'overview',   label: 'Overview',     icon: User },
    { id: 'inventory',  label: 'Inventory',    icon: Shield },
    { id: 'history',    label: 'Trade Log',    icon: History },
    { id: 'settings',   label: 'Settings',     icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return (
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.28 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left"
        >
          {/* Balance Card */}
          <div className="relative rounded-2xl p-6 overflow-hidden flex flex-col gap-4 border border-white/[0.06] bg-[#0a0e16]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent-cyan/8 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Account Balance</span>
              <Wallet className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <span className="text-4xl font-black text-white">{formatPrice(user.balance || 0)}</span>
              <p className="text-[10px] text-gray-500 font-medium mt-1">Simulated wallet · instant refill</p>
            </div>
            {/* Top-up presets */}
            <div className="grid grid-cols-3 gap-2 mt-auto">
              {[50, 100, 150].map(amt => (
                <button
                  key={amt}
                  onClick={() => handleTopUp(amt)}
                  className="py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/[0.08] bg-white/[0.04] hover:border-accent-cyan/50 hover:bg-accent-cyan/10 hover:text-accent-cyan text-gray-300 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />{formatPrice(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Card */}
          <div className="relative rounded-2xl p-6 border border-white/[0.06] bg-[#0a0e16] flex flex-col gap-4">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent-purple/8 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Market Metrics</span>
              <Shield className="w-5 h-5 text-accent-purple" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Inventory', value: `${userInventory.length} Items` },
                { label: 'Purchases', value: `${userHistory.filter(h => h.type === 'Purchase').length} Trades` },
                { label: 'Sales Made', value: `${userHistory.filter(h => h.type === 'Sale').length} Trades` },
                { label: 'Join Date', value: user.memberSince || 'Just now' },
              ].map(stat => (
                <div key={stat.label} className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</span>
                  <span className="text-sm font-black text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Card */}
          <div className="relative rounded-2xl p-6 border border-white/[0.06] bg-[#0a0e16] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Clearance Status</span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                Verified
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your Steam API connection is secure. Cleared for peer-to-peer instant trading with 0.1s average dispatch times.
            </p>
            <div className="mt-auto flex items-center gap-2 text-[9px] text-gray-300 font-black bg-white/[0.04] border border-white/[0.06] p-2.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>VALVE SECURE CHECKOUT ACTIVE</span>
            </div>
          </div>
        </motion.div>
      );

      case 'inventory': return (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} className="flex flex-col gap-6"
        >
          {userInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/[0.04] bg-[#0a0e16]/60">
              <Sparkles className="w-8 h-8 text-accent-cyan mb-4 opacity-60" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Inventory is Empty</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-xs text-center leading-relaxed">
                Browse the marketplace to acquire skins.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {userInventory.map(item => (
                <SkinCard
                  key={item.purchaseId}
                  item={item}
                  actionLabel="Sell Item"
                  onAction={() => handleSellConfirm(item)}
                />
              ))}
            </div>
          )}
        </motion.div>
      );

      case 'history': return (
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          className="rounded-2xl overflow-hidden border border-white/[0.05] bg-[#0a0e16]"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-gray-300">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                  {['Trade Action', 'Item Detail', 'Date Stamp', 'Value'].map(h => (
                    <th key={h} className={`px-6 py-4 font-black uppercase tracking-widest text-[9px] text-gray-400 ${h === 'Value' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {userHistory.map(row => {
                  const isProfit = row.amount.startsWith('+');
                  return (
                    <tr key={row.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          isProfit ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20' : 'bg-red-950/30 text-red-400 border border-red-500/20'
                        }`}>
                          {isProfit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {row.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-white">{row.item}</td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{row.date}</td>
                      <td className={`px-6 py-4 text-right font-black text-sm ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>{row.amount}</td>
                    </tr>
                  );
                })}
                {userHistory.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-black uppercase tracking-widest text-xs">
                      No transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      );

      case 'settings': return (
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
        >
          <div className="rounded-2xl p-6 flex flex-col gap-6 border border-white/[0.05] bg-[#0a0e16]">
            <h3 className="text-sm font-black tracking-widest text-white uppercase border-l-2 border-accent-cyan pl-3">
              Steam Configuration
            </h3>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Steam Trade Link</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  className="w-full pl-4 pr-11 py-3 bg-black/40 border border-white/[0.08] focus:border-accent-cyan/40 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
                  defaultValue="https://steamcommunity.com/tradeoffer/new/?partner=89210292&token=Valkyrie"
                />
                <button
                  onClick={copyTradeLink}
                  className="absolute right-2.5 p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] hover:text-accent-cyan text-gray-400 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[9px] text-gray-500 uppercase tracking-wider pl-1">Required for automated trade dispatches.</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Steam API Key</label>
              <input
                type="password"
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full px-4 py-3 bg-black/40 border border-white/[0.08] focus:border-accent-cyan/40 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
              />
              <span className="text-[9px] text-gray-500 uppercase tracking-wider pl-1">Stored in encrypted browser storage.</span>
            </div>
            <button
              onClick={() => showToast('Steam settings saved!')}
              className="py-3 px-8 rounded-xl font-black text-xs uppercase tracking-widest self-start transition-all cursor-pointer shadow-lg hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #00f2fe, #4facfe)', color: '#000' }}
            >
              Save Settings
            </button>
          </div>

          <div className="rounded-2xl p-6 flex flex-col gap-4 border border-white/[0.05] bg-[#0a0e16]">
            <h3 className="text-sm font-black tracking-widest text-white uppercase border-l-2 border-accent-cyan pl-3">
              Security Audit
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Valkyrie operates a fully-integrated Steam escrow protection program. Your account is audited and verified.
            </p>
            <div className="flex flex-col gap-3 mt-2">
              {[
                { label: 'Escrow Verification', status: 'ACTIVE', ok: true },
                { label: '2-Factor Authentication', status: 'SYNCED', ok: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">{item.label}</span>
                  <span className={`text-[10px] font-black ${item.ok ? 'text-emerald-400' : 'text-red-400'}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      );

      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16 relative">

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[500] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl max-w-sm ${
              toast.success
                ? 'bg-emerald-950/90 border-emerald-500/25 text-emerald-300'
                : 'bg-red-950/90 border-red-500/25 text-red-300'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sell Confirm Dialog */}
      <AnimatePresence>
        {confirmItem && (
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmItem(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-[10px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-white/[0.07] shadow-[0_30px_80px_rgba(0,0,0,0.9)] p-6 text-left"
              style={{ zIndex: 1, background: '#0a0e16' }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 to-pink-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3 mt-1.5">Confirm Sale</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Sell <span className="text-white font-black">{confirmItem.name}</span> back to the market?
              </p>
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/[0.06] mb-6">
                <div>
                  <span className="text-[8px] text-gray-500 font-black tracking-widest uppercase">Liquidation Value</span>
                  <div className="text-lg font-black text-white mt-0.5">{formatPrice(confirmItem.price)}</div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-white/[0.05] flex items-center justify-center overflow-hidden">
                  <img src={confirmItem.image} alt="" className="w-10 h-10 object-contain" />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmItem(null)}
                  className="flex-1 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-xs font-black uppercase tracking-widest text-gray-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeSell}
                  className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  style={{ background: '#ef4444', color: '#fff' }}
                >
                  Confirm Sale
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left border-b border-white/[0.05] pb-8">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-accent-cyan/40 shadow-[0_0_24px_rgba(0,242,254,0.15)]">
            <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wide">{user.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
            <button
              onClick={logout}
              className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 text-[10px] font-black uppercase tracking-widest text-red-400 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.05] self-start max-w-full overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest cursor-pointer whitespace-nowrap transition-colors duration-200 overflow-hidden"
              style={{ color: isActive ? '#ffffff' : 'rgba(107,114,128,1)' }}
            >
              {/* Gradient background — rendered first, below text */}
              {isActive && (
                <motion.div
                  layoutId="profile-tab-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #00f2fe, #4facfe, #8a2be2)',
                    zIndex: 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              {/* Content sits above motion div */}
              <Icon className="w-3.5 h-3.5 relative" style={{ zIndex: 1 }} />
              <span className="hidden sm:inline relative" style={{ zIndex: 1 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
