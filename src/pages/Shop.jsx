import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import SkinCard from '../components/skins/SkinCard';
import SkinInspectorModal from '../components/skins/SkinInspectorModal';
import skinsData from '../data/skins.json';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, SlidersHorizontal, RefreshCw, Sparkles, CheckCircle2, 
  AlertCircle, ShoppingCart, Grid, Flame, Shield, Crosshair, 
  Target, Zap, ChevronDown, Check, X 
} from 'lucide-react';

const Shop = () => {
  const { user, addToCart, cart } = useAuth();
  const { formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('price-high'); // Default sorted from expensive to cheap
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, success: true, message: '' });
  const [inspectedSkin, setInspectedSkin] = useState(null); // Skin detail modal trigger
  const [isSortOpen, setIsSortOpen] = useState(false);

  const categoryItems = [
    { value: 'All', label: 'All Skins' },
    { value: 'Knife', label: 'Knives' },
    { value: 'Gloves', label: 'Gloves' },
    { value: 'Rifle', label: 'Rifles' },
    { value: 'Sniper', label: 'Snipers' },
    { value: 'Pistol', label: 'Pistols' },
    { value: 'SMG', label: 'SMGs' }
  ];

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400); // simulation timing
    return () => clearTimeout(timer);
  }, [searchTerm, category, sortBy]);

  const handleAddToCart = (skin) => {
    const res = addToCart(skin);
    if (res.success) {
      showToast(true, res.message);
    } else {
      showToast(false, res.message);
    }
  };

  const showToast = (success, message) => {
    setToast({ show: true, success, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const filteredSkins = useMemo(() => {
    let result = [...skinsData];

    // Search filter
    if (searchTerm) {
      result = result.filter(skin => 
        skin.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (category !== 'All') {
      result = result.filter(skin => skin.type === category);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rarity':
        const rarityOrder = { 'Covert': 6, 'Classified': 5, 'Restricted': 4, 'Mil-Spec': 3, 'Industrial': 2, 'Consumer': 1 };
        result.sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0));
        break;
      default:
        // 'newest'
        break;
    }

    return result;
  }, [searchTerm, category, sortBy]);

  const skeletonCards = Array.from({ length: 8 });

  return (
    <div className="flex flex-col gap-8 pb-16 relative">
      
      {/* Toast Notification with Next-Gen Glow overlays */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[200] flex items-center gap-3.5 px-6 py-4 rounded-2xl border shadow-[0_0_35px_rgba(0,0,0,0.6)] backdrop-blur-xl max-w-sm ${
              toast.success 
                ? 'bg-emerald-950/85 border-emerald-500/25 text-emerald-300' 
                : 'bg-red-950/85 border-red-500/25 text-red-300'
            }`}
          >
            {toast.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div className="flex flex-col text-left">
              <span className="text-xs font-black uppercase tracking-widest">
                {toast.success ? 'Inventory Update' : 'Cart Alert'}
              </span>
              <span className="text-[11px] text-gray-300 mt-0.5 font-semibold">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skin Inspector Overlay Detail Modal */}
      <SkinInspectorModal 
        item={inspectedSkin}
        isOpen={!!inspectedSkin}
        onClose={() => setInspectedSkin(null)}
        onAddedToCart={(msg) => showToast(true, msg)}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2 text-glow-cyan">
            Marketplace <ShoppingCart className="w-6 h-6 text-accent-cyan" />
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-semibold">
            Explore premium skins sorted by valuation. Click a weapon to inspect full specifications in 3D-depth cards.
          </p>
        </div>
        {user && (
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 bg-white/5 border border-white/5 px-6 py-3 rounded-2xl md:self-center self-start shadow-md relative overflow-hidden"
          >
            <div className="flex flex-col text-right z-10">
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Available Balance</span>
              <span className="text-lg font-black text-accent-cyan text-glow-cyan">{formatPrice(user.balance)}</span>
            </div>
            {/* Soft backdrop glow */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-accent-cyan/5 blur-md pointer-events-none" />
          </motion.div>
        )}
      </div>

      {/* Sleek Filter Panel */}
      <div className="flex flex-col gap-6 p-6 rounded-2xl bg-dark-900/30 border border-white/[0.05] backdrop-blur-md shadow-2xl relative overflow-hidden active-border-sweep">
        
        {/* Search & Sort Input Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Search */}
          <div className="lg:col-span-2 flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">
              Search Skins
            </label>
            <div className="relative flex items-center group">
              <Search className="absolute left-4 w-4 h-4 text-gray-500 group-focus-within:text-accent-cyan transition-colors z-20" />
              <input 
                type="text" 
                placeholder="e.g. Karambit Doppler, AK-47 Fire Serpent, AWP..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-white/[0.02] border border-white/5 focus:border-accent-cyan/40 hover:border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-accent-cyan/20 transition-all font-sans relative z-10"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 text-gray-500 hover:text-white cursor-pointer z-20"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="absolute inset-0 rounded-xl bg-accent-cyan/2 opacity-0 group-focus-within:opacity-100 blur-sm pointer-events-none transition-all duration-300" />
            </div>
          </div>

          {/* Custom Sort Dropdown */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">
              Sort Sequence
            </label>
            <div className="relative z-20">
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="w-full flex items-center justify-between pl-11 pr-4 py-3 bg-white/[0.02] border border-white/5 focus:border-accent-cyan/40 hover:border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent-cyan/20 transition-all font-sans cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="absolute left-4 w-4 h-4 text-gray-500 pointer-events-none" />
                  <span>
                    {sortBy === 'price-high' && 'Price: High to Low'}
                    {sortBy === 'price-low' && 'Price: Low to High'}
                    {sortBy === 'rarity' && 'Rarity: Best First'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 mt-2 bg-dark-900/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 py-1 backdrop-blur-md"
                    >
                      {[
                        { val: 'price-high', lab: 'Price: High to Low' },
                        { val: 'price-low', lab: 'Price: Low to High' },
                        { val: 'rarity', lab: 'Rarity: Best First' }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => {
                            setSortBy(opt.val);
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left text-xs hover:bg-white/[0.04] transition-colors cursor-pointer ${
                            sortBy === opt.val ? 'text-accent-cyan bg-accent-cyan/5 font-extrabold' : 'text-gray-300'
                          }`}
                        >
                          <span>{opt.lab}</span>
                          {sortBy === opt.val && <Check className="w-3.5 h-3.5 text-accent-cyan" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Category selections & count stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/[0.04] pt-5">
          <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 w-fit">
            {categoryItems.map(cat => {
              const isSelected = category === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`relative px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isSelected ? 'text-accent-cyan font-extrabold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {/* Active sliding background */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-shop-category"
                      className="absolute inset-0 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl shadow-[0_0_15px_rgba(0,242,254,0.1)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 self-end sm:self-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hidden md:inline">
              Showing {filteredSkins.length} / {skinsData.length} skins
            </span>

            {(searchTerm || category !== 'All' || sortBy !== 'price-high') && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSearchTerm(''); setCategory('All'); setSortBy('price-high'); }}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-950/40 text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Weapons Catalog Grid */}
      <div className="relative min-h-[400px]">
        
        {/* Beautiful Skeleton Loading Placeholders */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {skeletonCards.map((_, i) => (
                <div key={i} className="flex flex-col justify-between rounded-2xl bg-dark-900 border border-white/[0.03] p-5 h-[340px] animate-pulse relative overflow-hidden">
                  <div className="flex justify-between items-center w-full">
                    <div className="w-14 h-4 bg-white/5 rounded-full" />
                    <div className="w-10 h-4 bg-white/5 rounded-full" />
                  </div>
                  <div className="w-32 h-20 bg-white/5 rounded-xl mx-auto my-6" />
                  <div className="flex flex-col gap-2">
                    <div className="w-3/4 h-4 bg-white/5 rounded" />
                    <div className="w-1/2 h-3.5 bg-white/5 rounded" />
                  </div>
                  <div className="h-[1px] bg-white/[0.03] my-2" />
                  <div className="flex justify-between items-center w-full">
                    <div className="w-16 h-5 bg-white/5 rounded" />
                    <div className="w-24 h-9 bg-white/5 rounded-xl" />
                  </div>
                  {/* Sweep light effect in skeleton */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>
              ))}
            </motion.div>
          ) : filteredSkins.length > 0 ? (
            /* Catalog Items loaded */
            <motion.div 
              key="catalog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredSkins.map(skin => {
                const inCart = cart.find(c => c.id === skin.id);
                return (
                  <div 
                    key={skin.id}
                    onClick={() => setInspectedSkin(skin)}
                    className="cursor-pointer"
                  >
                    <SkinCard 
                      item={skin}
                      actionLabel={user ? (inCart ? 'Add More' : 'Add to Cart') : 'Sign In'}
                      onAction={(item) => handleAddToCart(item)}
                      actionDisabled={false} // Click actions are handled contextually
                    />
                  </div>
                );
              })}
            </motion.div>
          ) : (
            /* Modern Empty State View */
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 px-4 rounded-2xl bg-dark-900/10 border border-white/[0.03] shadow-lg"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 mb-6 shadow-inner">
                <Sparkles className="w-8 h-8 text-accent-cyan text-glow-cyan animate-pulse" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider">No Weapons Found</h2>
              <p className="text-xs text-gray-400 mt-2 max-w-sm text-center leading-relaxed font-semibold">
                No weapons match your search tags or criteria. Reset your workspace options to explore the active catalog.
              </p>
              <motion.button 
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => { setSearchTerm(''); setCategory('All'); setSortBy('price-high'); }}
                className="mt-6 px-6 py-3 rounded-xl bg-accent-cyan text-dark-950 font-black text-xs uppercase tracking-widest hover-glow transition-all cursor-pointer shadow-[0_0_15px_rgba(0,242,254,0.2)]"
              >
                Show All Weapons
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default Shop;
