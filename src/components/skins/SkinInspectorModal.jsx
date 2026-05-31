import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { X, ShoppingCart, Info, TrendingUp, ShieldAlert, Award, Minus, Plus, Loader2 } from 'lucide-react';

const SkinInspectorModal = ({ item, isOpen, onClose, onAddedToCart }) => {
  const { user, addToCart, cart } = useAuth();
  const { formatPrice } = useCurrency();
  const toast = useToast();
  const [quantity, setQuantity] = React.useState(1);
  const [busy, setBusy] = React.useState(false);

  if (!item || !isOpen) return null;

  const rarityColors = {
    'Covert': '#eb4b4b',
    'Classified': '#d32ce6',
    'Restricted': '#8847ff',
    'Mil-Spec': '#4b69ff',
    'Industrial': '#5e98d9',
    'Consumer': '#b0c3d9',
    'Extraordinary': '#eb4b4b'
  };

  const color = rarityColors[item.rarity] || '#b0c3d9';
  const isInCart = cart.find(c => c.id === item.id);

  // Generate mock stats based on weapon type
  const getStats = (type) => {
    switch (type) {
      case 'Knife':
        return { damage: 95, speed: 70, recoil: 98, range: 10 };
      case 'Sniper':
        return { damage: 98, speed: 12, recoil: 45, range: 99 };
      case 'Rifle':
        return { damage: 65, speed: 72, recoil: 60, range: 65 };
      case 'Pistol':
        return { damage: 32, speed: 45, recoil: 80, range: 35 };
      case 'SMG':
        return { damage: 38, speed: 92, recoil: 72, range: 25 };
      case 'Gloves':
        return { damage: 5, speed: 90, recoil: 95, range: 5 }; // Armor / Dexterity
      default:
        return { damage: 50, speed: 50, recoil: 50, range: 50 };
    }
  };

  const weaponStats = getStats(item.type);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }
    if (busy) return;
    setBusy(true);
    const res = await addToCart(item, quantity);
    setBusy(false);
    if (res.success) {
      toast.success(`Added ${quantity}x ${item.name} to cart`);
      onAddedToCart?.(res.message);
      onClose();
    } else {
      toast.error(res.message || 'Failed to add to cart');
    }
  };

  const incrementQty = () => setQuantity(prev => Math.min(prev + 1, 20));
  const decrementQty = () => setQuantity(prev => Math.max(prev - 1, 1));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#030507]/90 backdrop-blur-md cursor-pointer"
        />

        {/* Inspector Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-[720px] bg-dark-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row text-left font-sans"
        >
          {/* Top accent glow line */}
          <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: color }} />

          {/* Left panel: Gun visual & description */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden bg-black/20">
            {/* Ambient Backlight Glow */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[70px] pointer-events-none opacity-20"
              style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
            />

            <div className="relative z-10">
              <span 
                className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase border"
                style={{ borderColor: color, color }}
              >
                {item.rarity || 'Consumer'}
              </span>

              {/* Stattrak/Souvenir Indicator */}
              {(item.stattrak || item.souvenir) && (
                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                  item.stattrak 
                    ? 'bg-[#cf4800]/10 text-[#cf4800] border-[#cf4800]/30' 
                    : 'bg-accent-gold/10 text-accent-gold border-accent-gold/30'
                }`}>
                  {item.stattrak ? 'STATTRAK™' : 'SOUVENIR'}
                </span>
              )}

              <h2 className="text-xl sm:text-2xl font-black text-white mt-4 tracking-tight leading-tight">
                {item.name}
              </h2>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5 block">
                {item.type || 'Weapon'}
              </span>
            </div>

            {/* Weapon Image Preview */}
            <div className="relative w-full h-44 flex items-center justify-center my-6 z-10">
              <img 
                src={item.image} 
                alt={item.name} 
                className="max-w-[85%] max-h-36 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute bottom-2 w-1/2 h-1.5 bg-black/40 blur-md rounded-full" />
            </div>

            {/* Wear details */}
            <div className="relative z-10 flex flex-col gap-2 bg-white/5 border border-white/5 p-4 rounded-2xl">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400 font-bold uppercase tracking-widest">Wear Division</span>
                <span className="text-white font-mono uppercase font-black">{item.wear}</span>
              </div>
              {item.float_value !== undefined && (
                <div className="flex flex-col gap-1.5 mt-1.5">
                  <div className="flex justify-between text-[8px] text-gray-500 font-extrabold uppercase">
                    <span>Seed Range (0.00 - 1.00)</span>
                    <span className="text-gray-300 font-mono">{item.float_value.toFixed(6)}</span>
                  </div>
                  <div className="relative w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="absolute inset-0 flex">
                      <div className="w-[7%] h-full border-r border-white/5 bg-accent-cyan/15" />
                      <div className="w-[8%] h-full border-r border-white/5 bg-accent-blue/15" />
                      <div className="w-[23%] h-full border-r border-white/5 bg-green-500/15" />
                      <div className="w-[7%] h-full border-r border-white/5 bg-yellow-500/15" />
                      <div className="w-[55%] h-full bg-red-500/15" />
                    </div>
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_5px_#fff]"
                      style={{ left: `${item.float_value * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right panel: Weapon specs & checkout CTA */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between gap-6">
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-accent-cyan text-gray-400 transition-all z-20 active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Weapon Stats */}
            <div className="flex flex-col gap-3.5 mt-3">
              <h3 className="text-[10px] font-black tracking-widest text-white uppercase border-l-2 border-accent-cyan pl-2 mb-1">
                Weapon Specification
              </h3>
              
              {/* Stat meters */}
              {[
                { label: "Firepower / Damage", val: weaponStats.damage },
                { label: "Cyclic Fire Rate", val: weaponStats.speed },
                { label: "Recoil Displacement", val: weaponStats.recoil },
                { label: "Effective Range", val: weaponStats.range }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    <span>{stat.label}</span>
                    <span className="text-white font-mono">{stat.val}%</span>
                  </div>
                  <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-accent-cyan to-accent-blue rounded-full shadow-[0_0_8px_#00f2fe]" 
                      style={{ width: `${stat.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Mock price index chart */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black tracking-widest text-white uppercase border-l-2 border-accent-cyan pl-2">
                  Market Trend (7D)
                </h3>
                <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-extrabold uppercase">
                  <TrendingUp className="w-3 h-3" /> +14.2%
                </span>
              </div>
              <div className="bg-black/45 border border-white/5 rounded-2xl p-3 h-28 flex items-end relative overflow-hidden">
                {/* SVG mock graph */}
                <svg className="w-full h-20 overflow-visible z-10" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M0,24 Q12,18 25,20 T50,8 T75,14 T100,2 L100,30 L0,30 Z" 
                    fill="url(#chartGradient)"
                  />
                  <path 
                    d="M0,24 Q12,18 25,20 T50,8 T75,14 T100,2" 
                    fill="none" 
                    stroke="#00f2fe" 
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="2" r="1.2" fill="#ffffff" />
                </svg>
                <div className="absolute bottom-2 left-3 text-[8px] text-gray-500 font-bold font-mono">MAY 22</div>
                <div className="absolute bottom-2 right-3 text-[8px] text-gray-300 font-bold font-mono">LATEST</div>
              </div>
            </div>

            {/* Price tag & CTA button */}
            <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-4">
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 font-black tracking-widest uppercase">INSURED MARKET PRICE</span>
                <span className="text-xl font-black text-white">{formatPrice(item.price * quantity)}</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden h-12">
                  <button 
                    onClick={decrementQty}
                    className="w-10 h-full flex items-center justify-center hover:bg-white/5 transition-colors text-gray-400 active:scale-90"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-black text-white">{quantity}</span>
                  <button 
                    onClick={incrementQty}
                    className="w-10 h-full flex items-center justify-center hover:bg-white/5 transition-colors text-gray-400 active:scale-90"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isInCart ? (
                  <button 
                    onClick={handleAddToCart}
                    className="px-6 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-accent-cyan/20 transition-all"
                  >
                    <Award className="w-4 h-4" />
                    <span>Add More</span>
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={!user}
                    className={`px-6 h-12 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${
                      user 
                        ? 'bg-gradient-to-r from-accent-cyan to-accent-blue text-dark-950 hover-glow cursor-pointer active:scale-95 shadow-xl' 
                        : 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add To Cart</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SkinInspectorModal;
