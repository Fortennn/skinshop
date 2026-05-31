import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCurrency } from '../../context/CurrencyContext';

const SkinCard = ({ item, actionLabel, onAction, actionDisabled }) => {
  const { formatPrice } = useCurrency();
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

  // 3D Parallax Tilt State using Framer Motion Spring Values
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Springs for smooth movement
  const springConfig = { damping: 25, stiffness: 220 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), springConfig);

  // Glint reflection coordinate tracking
  const glintX = useSpring(useTransform(x, [-0.5, 0.5], ['0%', '100%']), springConfig);
  const glintY = useSpring(useTransform(y, [-0.5, 0.5], ['0%', '100%']), springConfig);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Normalize coordinates between -0.5 and 0.5
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-dark-900 border border-white/[0.04] hover:border-white/15 shadow-2xl transition-all duration-300 group select-none h-full"
    >
      {/* Top micro glowing rarity indicator strip */}
      <div 
        className="absolute top-0 left-0 w-full h-[2.5px] opacity-85 z-25"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {/* Dynamic Background Rarity Ambient Light Leak Aura */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full blur-[45px] pointer-events-none opacity-25 group-hover:opacity-45 transition-opacity duration-500 z-0"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      />

      {/* Dynamic Sheen Glint Overlay Reflection */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glintX.get()} ${glintY.get()}, rgba(255, 255, 255, 0.08) 0%, transparent 50%)`
        }}
      />

      {/* Sweeping shimmer scan line */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-0 pointer-events-none" />

      {/* Skin Preview Area with preserve-3d for Floating Depth */}
      <div 
        style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}
        className="relative p-6 pb-2 flex flex-col items-center justify-center min-h-[175px] z-20"
      >
        {/* StatTrak / Souvenir indicator */}
        {(item.stattrak || item.souvenir) && (
          <div className="absolute top-4 left-4 z-20" style={{ transform: 'translateZ(10px)' }}>
            <span className={`px-2.5 py-0.5 rounded text-[8px] font-black tracking-widest ${
              item.stattrak 
                ? 'bg-[#cf4800]/25 text-[#cf4800] border border-[#cf4800]/40' 
                : 'bg-accent-gold/25 text-accent-gold border border-accent-gold/40'
            }`}>
              {item.stattrak ? 'STATTRAK™' : 'SOUVENIR'}
            </span>
          </div>
        )}

        {/* Float Wear Badge */}
        <div className="absolute top-4 right-4 z-20" style={{ transform: 'translateZ(10px)' }}>
          <span 
            className="px-2.5 py-0.5 rounded-full text-[8px] font-extrabold tracking-wider bg-black/75 border border-white/10 uppercase"
            style={{ color, boxShadow: `0 0 10px ${color}15` }}
          >
            {item.wear || 'N/A'}
          </span>
        </div>

        {/* Gun Image Container - Floats in 3D space above the background */}
        <div 
          style={{ transform: 'translateZ(40px)' }}
          className="relative w-full h-28 flex items-center justify-center mt-3"
        >
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-auto h-24 object-contain group-hover:scale-108 group-hover:-rotate-3 transition-transform duration-500 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-16 rounded-full opacity-30 blur-sm" style={{ backgroundColor: color }} />
          )}
          
          {/* Subtle item shadow which scales down on hover as gun floats up */}
          <div className="absolute bottom-0 w-2/3 h-1 bg-black/60 blur-md rounded-full group-hover:scale-95 group-hover:opacity-75 transition-all duration-500" />
        </div>
      </div>

      {/* Content Info Section */}
      <div 
        style={{ transform: 'translateZ(15px)' }}
        className="p-5 pt-0 z-20 flex flex-col gap-3.5"
      >
        <div>
          <h3 className="text-sm font-black text-white group-hover:text-accent-cyan transition-colors truncate">
            {item.name}
          </h3>
          <p className="text-[10px] text-gray-500 font-extrabold tracking-widest uppercase mt-0.5">
            {item.type || 'Weapon'}
          </p>
        </div>

        {/* Dynamic Wear Float slider */}
        {item.float_value !== undefined && (
          <div className="flex flex-col gap-1.5 bg-black/40 px-3 py-2 rounded-xl border border-white/[0.03]">
            <div className="flex justify-between text-[8px] text-gray-500 font-black uppercase tracking-widest">
              <span>Wear Float</span>
              <span className="text-gray-300 font-mono tracking-wide">{item.float_value.toFixed(4)}</span>
            </div>
            
            {/* Visual Wear Float Slider */}
            <div className="relative w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="absolute inset-0 flex opacity-45">
                <div className="w-[7%] h-full border-r border-white/5 bg-accent-cyan" title="Factory New" />
                <div className="w-[8%] h-full border-r border-white/5 bg-accent-blue" title="Minimal Wear" />
                <div className="w-[23%] h-full border-r border-white/5 bg-green-500" title="Field Tested" />
                <div className="w-[7%] h-full border-r border-white/5 bg-yellow-500" title="Well Worn" />
                <div className="w-[55%] h-full bg-red-500" title="Battle Scarred" />
              </div>
              <motion.div 
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_#fff]"
                style={{ left: `${item.float_value * 100}%` }}
                animate={{ scaleY: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-[1px] bg-white/[0.03]" />

        {/* Pricing & Checkout Actions */}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <div className="flex flex-col text-left">
            <span className="text-[8px] text-gray-500 font-black tracking-widest uppercase">MARKET PRICE</span>
            <span className="text-sm font-black text-white">
              {formatPrice(item.price || 0)}
            </span>
          </div>

          <motion.button
            whileHover={actionDisabled ? {} : { 
              scale: 1.04,
              borderColor: color, 
              boxShadow: `0 0 15px ${color}45`,
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }}
            whileTap={{ scale: actionDisabled ? 1 : 0.96 }}
            disabled={actionDisabled}
            onClick={(e) => {
              e.stopPropagation();
              onAction(item);
            }}
            style={
              actionDisabled
                ? {}
                : (actionLabel === 'In Cart' || actionLabel === 'Add More')
                ? {
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.1)'
                  }
                : actionLabel === 'Sell Item'
                ? {
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.1)'
                  }
                : {
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${color}40`,
                    color: '#ffffff',
                    boxShadow: `0 0 10px ${color}10`
                  }
            }
            className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 ${
              actionDisabled 
                ? 'cursor-not-allowed border border-white/5 text-white/20 bg-white/[0.02]' 
                : 'cursor-pointer'
            }`}
          >
            {actionLabel}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SkinCard;
