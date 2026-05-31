import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCurrency } from '../context/CurrencyContext';
import SkinCard from '../components/skins/SkinCard';
import skinsData from '../data/skins.json';
import { Shield, Zap, Gem, ArrowRight, Activity, TrendingUp, Users, Clock } from 'lucide-react';

// A specialized local 3D Tilt Wrapper for Features
const TiltCard = ({ children, className }) => {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 200 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), springConfig);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
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
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  // Get top 4 expensive skins as "Featured"
  const featuredSkins = [...skinsData]
    .sort((a, b) => b.price - a.price)
    .slice(0, 4);

  // Floating Hero Cards reference items
  const heroFloatingSkins = [
    skinsData.find(s => s.name.includes("Doppler")) || skinsData[0],
    skinsData.find(s => s.name.includes("Printstream")) || skinsData[1]
  ];

  const liveActivity = [
    { id: 1, user: "Nightmare", action: "purchased", item: "AWP | Dragon Lore", time: "2m ago", price: 12000, type: "Sniper", rarity: "Covert" },
    { id: 2, user: "S1mple_Fan", action: "sold", item: "AK-47 | Asiimov", time: "5m ago", price: 250.50, type: "Rifle", rarity: "Covert" },
    { id: 3, user: "TraderJoe", action: "purchased", item: "M4A1-S | Printstream", time: "8m ago", price: 450.00, type: "Rifle", rarity: "Classified" },
    { id: 4, user: "GabeN", action: "sold", item: "★ Butterfly Knife | Fade", time: "11m ago", price: 2800.00, type: "Knife", rarity: "Extraordinary" },
    { id: 5, user: "SkinValk", action: "purchased", item: "Sport Gloves | Vice", time: "14m ago", price: 3400.00, type: "Gloves", rarity: "Extraordinary" }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  return (
    <div className="flex flex-col gap-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col lg:flex-row items-center justify-between gap-12 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 -mt-[112px] pt-[112px] pb-12">
        
        {/* Cinematic Backdrop Overlay - Seamless Integrated Video */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <video 
            src="/assets/videos/hero.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-40 filter brightness-[0.8] contrast-[1.1] scale-105 pointer-events-none"
          />
          {/* Aggressive gradient masking to dissolve all rectangular edges */}
          {/* Top gradient adjusted to blend with the header */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030508] via-transparent to-[#030508]/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030508]/80 via-transparent to-transparent h-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030508] via-transparent to-[#030508]/40" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#030508] via-transparent to-[#030508]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#030508_100%)]" />
          
          {/* Cybernetic grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:30px_30px]" />
        </div>

        {/* Hero Content Left */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative flex-1 flex flex-col gap-6 text-left p-6 sm:p-12 z-10 max-w-2xl"
        >
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-[9px] font-black uppercase tracking-widest self-start"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
            Next-Gen CS2 Trading Protocol
          </motion.div>

          <motion.h1 
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05]"
          >
            Forge Your Legend With <span className="gradient-text-neon text-glow-cyan">Valkyrie</span>
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-lg font-medium"
          >
            Counter-Strike skin exchange, amplified. Ultra-secure peer-to-peer escrow protection, zero artificial trade lock delays, and the lowest market fees in the universe.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap items-center gap-4 mt-2"
          >
            <button 
              onClick={() => navigate('/shop')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple hover:brightness-110 text-dark-950 font-black text-xs uppercase tracking-widest hover-glow transition-all duration-300 active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.35)] shine-sweep cursor-pointer"
            >
              <span>Launch Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link 
              to="/profile" 
              className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest border border-white/10 hover:border-white/20 transition-all duration-300 active:scale-95 shadow-md"
            >
              My Inventory
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Visual Right: Glowing Valkyrie Orb & Floating Cards */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex-1 flex items-center justify-center p-6 min-h-[400px] z-10 w-full lg:w-auto"
        >
          {/* Main Rotating Branding Orb */}
          <motion.div 
            animate={{ 
              y: [0, -12, 0],
              rotate: [0, 1, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 6,
              ease: "easeInOut"
            }}
            className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full flex items-center justify-center bg-gradient-to-tr from-accent-purple/15 to-accent-cyan/15 border border-white/5 shadow-[0_0_90px_rgba(0,242,254,0.15)]"
          >
            <div className="absolute inset-4 rounded-full bg-dark-950/95 backdrop-blur-md border border-white/[0.03] flex items-center justify-center overflow-hidden">
              {/* Particle Lighting Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,242,254,0.2)_0%,transparent_50%)] pointer-events-none" />
              
              <img 
                src="/valkyrie-logo.png" 
                alt="Valkyrie Logo" 
                className="w-40 h-40 sm:w-52 sm:h-52 object-contain filter drop-shadow-[0_0_30px_rgba(0,242,254,0.35)]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://ui-avatars.com/api/?name=Valkyrie&size=200&background=0b0f15&color=00f2fe';
                }}
              />
            </div>
            
            {/* Rotating Cyber Orbit Line */}
            <div className="absolute inset-0 border border-dashed border-accent-cyan/20 rounded-full animate-[spin_40s_linear_infinite] pointer-events-none" />
            <div className="absolute -top-1 left-1/3 w-3 h-3 rounded-full bg-accent-cyan shadow-[0_0_12px_#00f2fe] animate-pulse" />
            <div className="absolute -bottom-1 right-1/3 w-3 h-3 rounded-full bg-accent-purple shadow-[0_0_12px_#8a2be2] animate-pulse" />
          </motion.div>

          {/* Floating Weapon Mini-Cards (Left & Right) */}
          {heroFloatingSkins[0] && (
            <motion.div
              animate={{ y: [10, -10, 10], x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="absolute left-4 top-12 w-28 bg-dark-900/90 border border-white/5 p-3 rounded-xl shadow-2xl backdrop-blur-md flex flex-col items-center gap-1.5 z-20 pointer-events-none"
            >
              <span className="text-[7px] font-black text-[#eb4b4b] uppercase bg-[#eb4b4b]/15 px-1.5 py-0.5 rounded self-start">COVERT</span>
              <img src={heroFloatingSkins[0].image} alt="" className="w-16 h-12 object-contain filter drop-shadow-md" />
              <div className="text-center w-full">
                <p className="text-[7px] font-black text-white truncate">{heroFloatingSkins[0].name.split(' | ')[0]}</p>
                <p className="text-[8px] font-black text-accent-cyan mt-0.5">{formatPrice(heroFloatingSkins[0].price)}</p>
              </div>
            </motion.div>
          )}

          {heroFloatingSkins[1] && (
            <motion.div
              animate={{ y: [-10, 10, -10], x: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute right-4 bottom-12 w-28 bg-dark-900/90 border border-white/5 p-3 rounded-xl shadow-2xl backdrop-blur-md flex flex-col items-center gap-1.5 z-20 pointer-events-none"
            >
              <span className="text-[7px] font-black text-[#d32ce6] uppercase bg-[#d32ce6]/15 px-1.5 py-0.5 rounded self-start">CLASSIFIED</span>
              <img src={heroFloatingSkins[1].image} alt="" className="w-16 h-12 object-contain filter drop-shadow-md" />
              <div className="text-center w-full">
                <p className="text-[7px] font-black text-white truncate">{heroFloatingSkins[1].name.split(' | ')[0]}</p>
                <p className="text-[8px] font-black text-accent-cyan mt-0.5">{formatPrice(heroFloatingSkins[1].price)}</p>
              </div>
            </motion.div>
          )}

        </motion.div>
      </section>

      {/* Live Trading Feed Ticker */}
      <section className="w-full flex flex-col gap-4 z-10 relative">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-accent-cyan animate-pulse" />
            <h3 className="text-xs font-black tracking-widest uppercase text-white">
              Live Trade Dispatch Ticker
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            escrow active
          </span>
        </div>

        {/* Ticker scrolling loop container */}
        <div className="relative w-full overflow-hidden py-1">
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-dark-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-dark-950 to-transparent z-10 pointer-events-none" />
          
          <motion.div 
            className="flex gap-4 w-max"
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
          >
            {[...liveActivity, ...liveActivity, ...liveActivity].map((activity, index) => {
              const colors = { Covert: '#eb4b4b', Classified: '#d32ce6', Restricted: '#8847ff', Extraordinary: '#eb4b4b' };
              const activeColor = colors[activity.rarity] || '#00f2fe';
              return (
                <div 
                  key={index}
                  className="flex items-center gap-4 min-w-[280px] bg-dark-900/40 border border-white/[0.03] px-4 py-3 rounded-xl select-none relative overflow-hidden group"
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs shrink-0 text-black shadow-inner"
                    style={{ background: `linear-gradient(135deg, ${activeColor}, #ffffff)` }}
                  >
                    {activity.user[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-0.5 text-left w-full overflow-hidden z-10">
                    <div className="text-xs truncate">
                      <span className="font-extrabold text-white">{activity.user}</span> 
                      <span className="text-gray-400 font-medium"> {activity.action}</span>
                    </div>
                    <div className="text-[10px] text-gray-300 font-extrabold truncate">
                      {activity.item}
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-gray-500 font-bold mt-0.5">
                      <span>{activity.time}</span>
                      <span style={{ color: activeColor }} className="font-extrabold">{formatPrice(activity.price)}</span>
                    </div>
                  </div>
                  {/* Subtle color highlight in background */}
                  <div className="absolute top-0 bottom-0 right-0 w-[4px]" style={{ backgroundColor: activeColor }} />
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Stats Counter Section with Border Sweeps */}
      <section className="relative grid grid-cols-2 lg:grid-cols-4 gap-5 z-10">
        {[
          { label: "Legends Joined", value: "250,000+", icon: Users, glow: "text-glow-cyan", accent: "group-hover:border-accent-cyan/30" },
          { label: "Market Volume", value: "5.8M+", icon: TrendingUp, glow: "text-glow-purple", accent: "group-hover:border-accent-purple/30" },
          { label: "Avg Trade Speed", value: "0.1 Seconds", icon: Clock, glow: "text-glow-pink", accent: "group-hover:border-accent-pink/30" },
          { label: "Escrow Auditing", value: "24/7 Shield", icon: Shield, glow: "text-glow-cyan", accent: "group-hover:border-accent-cyan/30" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className={`group flex flex-col gap-3 bg-dark-900/40 hover:bg-dark-900/80 border border-white/[0.03] p-6 rounded-2xl transition-all duration-300 text-left relative overflow-hidden shadow-lg ${stat.accent}`}
          >
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 w-fit group-hover:text-accent-cyan transition-colors">
              <stat.icon className="w-5 h-5 text-gray-300 group-hover:text-accent-cyan" />
            </div>
            <div className="flex flex-col gap-0.5 mt-2">
              <span className={`text-xl sm:text-2xl font-black text-white ${stat.glow}`}>{stat.value}</span>
              <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest">{stat.label}</span>
            </div>
            
            {/* Visual glow backdrop for premium feel */}
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white/1 rounded-full blur-xl group-hover:bg-accent-cyan/5 transition-all" />
          </motion.div>
        ))}
      </section>

      {/* Featured Skins Section ("Elite Drops") */}
      <section className="flex flex-col gap-8 z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left border-b border-white/5 pb-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase text-glow-cyan">
              Elite Drops
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-semibold">
              Top featured items on the live market. Act fast, inventory shifts dynamically.
            </p>
          </div>
          <motion.button 
            whileHover={{ x: 3 }}
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 text-xs font-black text-accent-cyan hover:text-white transition-colors uppercase tracking-widest self-start cursor-pointer"
          >
            <span>Browse All Marketplace</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </motion.button>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredSkins.map((skin) => (
            <motion.div key={skin.id} variants={fadeInUp}>
              <SkinCard 
                item={skin} 
                actionLabel="Inspect & Buy" 
                onAction={() => navigate('/shop')} 
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid Section with Dynamic 3D Tilting Cards */}
      <section className="flex flex-col gap-8 z-10">
        <div className="text-left border-b border-white/5 pb-4">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">
            Platform Protocol
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-semibold">
            Built by players, for players. Underpinned by ultra-fast web tech and industry-grade cryptography.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: "Escrow Protection",
              text: "Cryptographic escrow algorithms and Valve-API secure checkouts shield every transaction. Zero trade locks.",
              color: "hover:border-accent-cyan/30",
              decorColor: "from-accent-cyan/10"
            },
            {
              icon: Zap,
              title: "Sub-Second Payouts",
              text: "Immediate Steam inventory synchronization. Liquidate skin assets or buy rare collection items in seconds.",
              color: "hover:border-accent-blue/30",
              decorColor: "from-accent-blue/10"
            },
            {
              icon: Gem,
              title: "Exclusive Pricing",
              text: "No hidden listing fees. 0% seller commission for premium creators, maximizing margins on trade transactions.",
              color: "hover:border-accent-purple/30",
              decorColor: "from-accent-purple/10"
            }
          ].map((feat, i) => (
            <TiltCard
              key={i}
              className={`p-8 rounded-2xl bg-dark-900/30 border border-white/[0.03] hover:bg-dark-900/60 flex flex-col gap-5 text-left transition-all duration-300 relative overflow-hidden group shadow-lg ${feat.color}`}
            >
              {/* Corner decor glows */}
              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${feat.decorColor} to-transparent blur-md rounded-tr-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 w-fit group-hover:text-accent-cyan transition-colors" style={{ transform: 'translateZ(15px)' }}>
                <feat.icon className="w-6 h-6 text-gray-300 group-hover:text-accent-cyan" />
              </div>
              
              <div className="flex flex-col gap-2 mt-2" style={{ transform: 'translateZ(25px)' }}>
                <h3 className="text-base font-black text-white tracking-wide uppercase">
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                  {feat.text}
                </p>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
