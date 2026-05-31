import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import skinsData from '../data/skins.json';
import { 
  Dices, 
  Trophy, 
  XCircle, 
  Search, 
  Sparkles,
  User,
  ShoppingBag,
  Info,
  Flame,
  Volume2,
  VolumeX,
  Zap,
  RotateCcw,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

// ============================================================================
// 1. SOUND EFFECTS SYNTHESIZER (WEB AUDIO API - NO EXTERNAL ASSETS NEEEDED)
// ============================================================================
class ForgeSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);
    
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (Major Chord)
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + idx * 0.08 + 0.25);
      
      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  }

  playLose() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.linearRampToValueAtTime(55, now + 0.4);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.45);
  }
}

// ============================================================================
// 2. CANVAS CELEBRATION PARTICLES (PLASMA FLARE WIN CEREMONY)
// ============================================================================
const CanvasParticles = ({ active }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let particles = [];
    
    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    const colors = ['#00f2fe', '#4facfe', '#00ffd2', '#ffffff'];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 + 15,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.75) * 12 - 2,
        size: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.02 + 0.012,
        gravity: 0.15,
        drag: 0.985
      });
    }
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      
      particles.forEach(p => {
        if (p.alpha <= 0) return;
        alive = true;
        
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      if (alive) {
        animationFrameId = requestAnimationFrame(render);
      }
    };
    
    render();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]);
  
  if (!active) return null;
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-30 rounded-3xl" />;
};

// ============================================================================
// 3. MAIN COMPONENT
// ============================================================================
const Upgrader = () => {
  const { user, applyUpgrade } = useAuth();
  const { formatPrice } = useCurrency();

  // Selection states
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [selectedShopItem, setSelectedShopItem] = useState(null);
  const [addedBalance, setAddedBalance] = useState(0); // Interactive slider balance

  // Active game states
  const [isRolling, setIsRolling] = useState(false);
  const [isFastRoll, setIsFastRoll] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customPresets, setCustomPresets] = useState(() => {
    const saved = localStorage.getItem('upgrader_presets');
    return saved ? JSON.parse(saved) : {
      multipliers: [2, 4, 10],
      chances: [10, 33, 66]
    };
  });

  const [result, setResult] = useState(null);
  const [rotationState, setRotationState] = useState(0);
  const [chance, setChance] = useState(0);
  const [rollMode, setRollMode] = useState('under'); // 'under' or 'over'

  // Listings filtering
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Shop Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Audio system Ref
  const [isMuted, setIsMuted] = useState(false);
  const synth = useRef(new ForgeSynth());
  const lastTickAngle = useRef(0);

  // Sync mute state
  useEffect(() => {
    synth.current.muted = isMuted;
  }, [isMuted]);

  // Reset page on shop search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [shopSearchQuery, minPrice, maxPrice]);

  // Compute upgrade chance percentage (Includes selected skin price + added slider balance)
  useEffect(() => {
    if (selectedInventoryItem && selectedShopItem) {
      const totalUsed = selectedInventoryItem.price + addedBalance;
      const calculatedChance = (totalUsed / selectedShopItem.price) * 100;
      setChance(Math.min(calculatedChance, 95));
    } else {
      setChance(0);
    }
  }, [selectedInventoryItem, selectedShopItem, addedBalance]);

  // Reset added balance if item changes
  useEffect(() => {
    setAddedBalance(0);
  }, [selectedInventoryItem]);

  // Auto-deselect shop item if it becomes cheaper than source + balance
  useEffect(() => {
    if (selectedInventoryItem && selectedShopItem) {
      const sourcePrice = selectedInventoryItem.price + addedBalance;
      if (selectedShopItem.price < sourcePrice) {
        setSelectedShopItem(null);
      }
    }
  }, [selectedInventoryItem, addedBalance, selectedShopItem]);

  // Filters for inventory items
  const filteredInventoryItems = useMemo(() => {
    if (!user?.inventory) return [];
    return user.inventory
      .filter(item => item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()))
      .sort((a, b) => b.price - a.price);
  }, [user?.inventory, inventorySearchQuery]);

  // Filters for shop items
  const availableShopItems = useMemo(() => {
    return skinsData
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(shopSearchQuery.toLowerCase());
        const priceNum = item.price;
        const matchesMin = minPrice === '' || priceNum >= parseFloat(minPrice);
        const matchesMax = maxPrice === '' || priceNum <= parseFloat(maxPrice);
        
        // Hide skins cheaper than selected + balance
        const sourcePrice = selectedInventoryItem ? (selectedInventoryItem.price + addedBalance) : 0;
        const isEligible = priceNum >= sourcePrice;

        return matchesSearch && matchesMin && matchesMax && isEligible;
      })
      .sort((a, b) => a.price - b.price);
  }, [shopSearchQuery, minPrice, maxPrice, selectedInventoryItem, addedBalance]);

  // Paginated shop items
  const paginatedShopItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return availableShopItems.slice(startIndex, startIndex + itemsPerPage);
  }, [availableShopItems, currentPage]);

  const totalPages = Math.ceil(availableShopItems.length / itemsPerPage) || 1;

  const toggleMute = () => {
    const muted = synth.current.toggleMute();
    setIsMuted(muted);
  };

  const handleRoll = () => {
    if (!selectedInventoryItem || !selectedShopItem || isRolling) return;
    
    // Check if user has enough balance for added slider balance
    if (addedBalance > 0 && (!user || user.balance < addedBalance)) {
      alert("Insufficient balance for added forge power!");
      return;
    }

    setIsRolling(true);
    setResult(null);
    synth.current.init();

    const randomValue = Math.random() * 100;
    const isWin = rollMode === 'under' 
      ? randomValue <= chance 
      : randomValue >= (100 - chance);

    const sectorSize = (chance / 100) * 360;
    const baseRotations = 8 + Math.floor(Math.random() * 4);

    // ----------------------------------------------------------------
    // ALIGNMENT FIX: Both the needle AND the sector use 12 o'clock
    // (top) as origin, going clockwise.
    //
    // Roll Under: winning sector occupies [0, sectorSize] degrees
    //             clockwise from 12 o'clock (the RIGHT/top arc).
    // Roll Over:  winning sector occupies [360-sectorSize, 360]
    //             clockwise from 12 o'clock (the LEFT/top arc).
    // ----------------------------------------------------------------
    let landingDegree;
    
    // Safety margin to prevent landing exactly on the line (feels "rigged" to users)
    // We use a small percentage of the sector/loss area as a buffer, capped at 4 degrees
    const getSafeDegree = (min, max) => {
      const range = max - min;
      const buffer = Math.min(range * 0.1, 4); // 10% buffer or 4deg max
      return (min + buffer) + Math.random() * (range - 2 * buffer);
    };

    if (rollMode === 'under') {
      landingDegree = isWin
        ? getSafeDegree(0, sectorSize)
        : getSafeDegree(sectorSize, 360);
    } else {
      landingDegree = isWin
        ? getSafeDegree(360 - sectorSize, 360)
        : getSafeDegree(0, 360 - sectorSize);
    }

    const finalRotation = baseRotations * 360 + landingDegree;
    lastTickAngle.current = 0;

    // Framer motion rotation physics
    animate(0, finalRotation, {
      duration: isFastRoll ? 1.2 : 5,
      ease: [0.15, 1, 0.3, 1], // Exact physical easing deceleration
      onUpdate: (latest) => {
        setRotationState(latest);
        
        // Play tick sound every 12 degrees
        const diff = latest - lastTickAngle.current;
        if (diff >= 12) {
          synth.current.playTick();
          lastTickAngle.current = latest;
        }
      },
      onComplete: () => {
        setIsRolling(false);
        if (isWin) {
          setResult('win');
          synth.current.playWin();
          handleUpgradeSuccess();
        } else {
          setResult('loss');
          synth.current.playLose();
          handleUpgradeFailure();
        }
      }
    });
  };

  const handleUpgradeSuccess = () => {
    applyUpgrade(selectedInventoryItem.purchaseId, selectedShopItem, true, addedBalance);
    setSelectedInventoryItem(null);
  };

  const handleUpgradeFailure = () => {
    applyUpgrade(selectedInventoryItem.purchaseId, selectedShopItem, false, addedBalance);
    setSelectedInventoryItem(null);
  };

  // Pre-sets calculations
  const handleSetMultiplier = (mult) => {
    if (!selectedInventoryItem) return;
    const targetPrice = (selectedInventoryItem.price + addedBalance) * mult;
    const closest = skinsData.reduce((prev, curr) => {
      return Math.abs(curr.price - targetPrice) < Math.abs(prev.price - targetPrice) ? curr : prev;
    });
    setSelectedShopItem(closest);
  };

  const handleSetChance = (targetChance) => {
    if (!selectedInventoryItem) return;
    const targetPrice = ((selectedInventoryItem.price + addedBalance) / targetChance) * 100;
    const closest = skinsData.reduce((prev, curr) => {
      return Math.abs(curr.price - targetPrice) < Math.abs(prev.price - targetPrice) ? curr : prev;
    });
    setSelectedShopItem(closest);
  };

  const formatSkinName = (fullName) => {
    const parts = fullName.split(' | ');
    return {
      weapon: parts[0] || '',
      skin: parts[1] || fullName
    };
  };

  const getRarityInfo = (rarity) => {
    const info = {
      'Covert': { color: '#eb4b4b', shadow: 'hover:shadow-[0_0_15px_rgba(235,75,75,0.25)]', border: 'hover:border-[#eb4b4b]/40' },
      'Classified': { color: '#d32ee6', shadow: 'hover:shadow-[0_0_15px_rgba(211,46,230,0.25)]', border: 'hover:border-[#d32ee6]/40' },
      'Restricted': { color: '#8847ff', shadow: 'hover:shadow-[0_0_15px_rgba(136,71,255,0.25)]', border: 'hover:border-[#8847ff]/40' },
      'Mil-Spec': { color: '#4b69ff', shadow: 'hover:shadow-[0_0_15px_rgba(75,105,255,0.25)]', border: 'hover:border-[#4b69ff]/40' }
    };
    return info[rarity] || { color: '#b0c3d9', shadow: 'hover:shadow-[0_0_10px_rgba(255,255,255,0.03)]', border: 'hover:border-white/5' };
  };

  const multiplierValue = chance > 0 ? (100 / chance).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 font-sans relative overflow-x-hidden selection:bg-cyan-500/20 selection:text-[#00f2fe]">
      {/* Cybernetic grid overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:45px_45px]" />
        
        {/* Symmetrical glowing ambient fields */}
        <div className="absolute top-[20%] left-[20%] w-[35%] h-[35%] bg-cyan-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] right-[20%] w-[35%] h-[35%] bg-purple-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
      </div>

      <div className="relative max-w-[1240px] mx-auto px-4 z-10 space-y-10">
        
        {/* ====================================================================
            1. TOP BLOCK: DUAL COMPACT PEDESTALS & CENTRAL COMPILER WHEEL
            ==================================================================== */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4 bg-[#0a0a0d]/60 border border-white/[0.04] rounded-[2.5rem] p-6 lg:p-8 backdrop-blur-md shadow-2xl">
          
          {/* Left Pedestal - Source Slot */}
          <div className="w-full max-w-[260px] lg:w-[250px] shrink-0 flex flex-col space-y-4">
            <div className="relative group w-full aspect-[4/5] bg-[#0c0c0f]/90 border border-white/[0.05] rounded-3xl flex flex-col overflow-hidden transition-all duration-300">
              
              {/* Header icons on left panel */}
              <div className="absolute left-4 top-4 flex gap-2.5 z-20">
                <div 
                  onClick={toggleMute}
                  className={`p-1 rounded bg-white/5 border border-white/10 transition-colors cursor-pointer ${isMuted ? 'text-red-400' : 'text-gray-400 hover:text-white'}`}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </div>
                <div 
                  onClick={() => setIsFastRoll(!isFastRoll)}
                  className={`p-1 rounded bg-white/5 border border-white/10 transition-colors cursor-pointer ${isFastRoll ? 'text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]' : 'text-gray-400 hover:text-white'}`}
                  title={isFastRoll ? "Fast Roll: ON" : "Fast Roll: OFF"}
                >
                  <Zap className={`w-3.5 h-3.5 ${isFastRoll ? 'fill-yellow-400' : ''}`} />
                </div>
                <div 
                  onClick={() => setShowSettings(true)}
                  className="p-1 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Reset button inside pedestal if skin selected */}
              {selectedInventoryItem && !isRolling && (
                <button 
                  onClick={() => setSelectedInventoryItem(null)} 
                  className="absolute right-4 top-4 p-1 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all z-20"
                  title="Deselect item"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              <AnimatePresence mode="wait">
                {selectedInventoryItem ? (
                  <motion.div
                    key="inv-selected"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full h-full flex flex-col justify-between p-5 relative"
                  >
                    <div className="text-right mt-1">
                      <span className="text-[8.5px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-500/10">ИНВЕНТАРЬ</span>
                    </div>

                    <motion.div 
                      animate={isRolling ? { rotate: [0, 1.5, -1.5, 0] } : { y: [-3.5, 3.5, -3.5] }}
                      transition={isRolling ? { repeat: Infinity, duration: 0.4 } : { repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="flex-1 flex items-center justify-center my-3 relative"
                    >
                      <div className="absolute w-24 h-24 bg-cyan-500/[0.04] blur-2xl rounded-full" />
                      <img 
                        src={selectedInventoryItem.image} 
                        alt="" 
                        className="max-h-[110px] max-w-[140px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] z-10 animate-float" 
                      />
                    </motion.div>

                    <div className="text-center pt-2 border-t border-white/[0.03]">
                      <p className="text-[8.5px] font-bold text-gray-500 truncate">{formatSkinName(selectedInventoryItem.name).weapon}</p>
                      <h4 className="text-xs font-black text-white truncate uppercase italic leading-tight mt-0.5">{formatSkinName(selectedInventoryItem.name).skin}</h4>
                      <p className="text-sm font-black text-cyan-400 mt-1.5">{formatPrice(selectedInventoryItem.price + addedBalance)}</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-5 my-auto h-full select-none">
                    <span className="text-[10px] font-black text-white/90 uppercase tracking-wider mb-0.5">Выберите скины</span>
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mb-8">или баланс для использования</p>
                    
                    <div className="relative flex items-center justify-center w-16 h-16 bg-white/[0.01] border border-white/[0.04] rounded-full">
                      <ChevronsDown className="w-7 h-7 text-cyan-400 animate-bounce" />
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Sum of balance progress & interactive Slider */}
            <div className="bg-[#0c0c0f]/60 border border-white/[0.04] rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between text-[9px] font-bold text-gray-400">
                <span>Добавить баланс к шансу:</span>
                <span className="text-cyan-400">{formatPrice(addedBalance)} <span className="text-gray-600">(max {formatPrice(user?.balance || 0)})</span></span>
              </div>
              
              <div className="flex items-center gap-4">
                <input 
                  type="range"
                  min="0"
                  max={user ? Math.max(user.balance, 10) : 100}
                  step="0.01"
                  value={addedBalance}
                  onChange={(e) => !isRolling && selectedInventoryItem && setAddedBalance(parseFloat(e.target.value))}
                  disabled={isRolling || !selectedInventoryItem}
                  className="flex-1 h-1 bg-white/[0.05] rounded-full appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
                />
                
                <div className="relative group">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-bold">$</span>
                  <input 
                    type="number"
                    value={addedBalance === 0 ? '' : addedBalance}
                    placeholder="0.00"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isRolling && selectedInventoryItem) {
                        setAddedBalance(isNaN(val) ? 0 : val);
                      }
                    }}
                    disabled={isRolling || !selectedInventoryItem}
                    className="w-20 bg-black/40 border border-white/5 focus:border-cyan-500/40 rounded-lg pl-5 pr-2 py-1.5 text-xs text-cyan-400 font-black focus:outline-none transition-all disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Central Upgrade Wheel & Controller Buttons */}
          <div className="flex-1 flex flex-col items-center py-2 space-y-6">
            
            {/* SVG viewBox-based Perfect Circular Wheel */}
            <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] aspect-square flex items-center justify-center">
              
              {/* Outer shadow / ring decor */}
              <div className="absolute inset-0 border border-white/[0.01] rounded-full scale-[1.03] shadow-[inset_0_0_30px_rgba(255,255,255,0.01)]" />

              <svg className="w-full h-full relative z-10" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="43" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="5.5" />
                
                {/* Dashed outer gauge marks */}
                <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" strokeDasharray="1.5 3.5" />

                {/* Dynamic Chance Sector
                     Sector origin = 12 o'clock (rotate -90 from default 3 o'clock).
                     Roll Under → sector at RIGHT of 12 (clockwise).  rotate(-90)
                     Roll Over  → sector at LEFT  of 12 (counter-cw). mirror via scale(-1 1)
                */}
                {chance > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="43"
                    fill="none"
                    stroke={result === 'win' ? '#00f2fe' : result === 'loss' ? '#ef4444' : 'url(#forge-gold-gradient)'}
                    strokeWidth="5.5"
                    strokeDasharray={`${(chance * 2.70176).toFixed(3)} 270.176`}
                    strokeDashoffset="0"
                    transform={
                      rollMode === 'over'
                        ? 'translate(100 0) scale(-1 1) rotate(-90 50 50)'
                        : 'rotate(-90 50 50)'
                    }
                    style={{
                      filter: `drop-shadow(0 0 8px ${result === 'win' ? '#00f2fe' : result === 'loss' ? '#ef4444' : 'rgba(255,179,0,0.3)'})`,
                      transition: 'stroke 0.4s ease, filter 0.4s ease'
                    }}
                  />
                )}

                {/* Centered Ticker Needle pointing straight up at baseline */}
                <g transform={`rotate(${rotationState + 180} 50 50)`} className="z-20">
                  <path
                    d="M48.5 50 L50 89 L51.5 50 Z"
                    fill={result === 'win' ? '#00f2fe' : result === 'loss' ? '#ef4444' : '#ffb300'}
                    style={{
                      filter: `drop-shadow(0 0 4px ${result === 'win' ? '#00f2fe' : result === 'loss' ? '#ef4444' : 'rgba(255, 179, 0, 0.7)'})`
                    }}
                  />
                  <circle cx="50" cy="50" r="2.5" fill="#ffffff" />
                </g>

                <defs>
                  <linearGradient id="forge-gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffb300" />
                    <stop offset="100%" stopColor="#ff5500" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Central Text readouts */}
              <div className="absolute inset-0 flex items-center justify-center z-15">
                <motion.div 
                  animate={isRolling ? { scale: [1, 1.03, 0.98, 1], transition: { repeat: Infinity, duration: 0.6 } } : {}}
                  className="absolute inset-[18%] bg-[#08080b]/95 rounded-full border border-white/[0.04] backdrop-blur-md shadow-[inset_0_0_25px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    {result ? (
                      <motion.div 
                        key="result-overlay" 
                        initial={{ scale: 0.7, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 0.7, opacity: 0 }}
                        className="flex flex-col items-center text-center px-4"
                      >
                        <h2 className={`text-lg font-black uppercase italic tracking-tighter ${result === 'win' ? 'text-cyan-400 text-glow-cyan' : 'text-red-500 text-glow-red'}`}>
                          {result === 'win' ? 'SUCCESS' : 'FORGE FAIL'}
                        </h2>
                        <button 
                          onClick={() => setResult(null)} 
                          className="mt-2 flex items-center gap-1 text-[7.5px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                        >
                          <RotateCcw className="w-2.5 h-2.5" /> СБРОСИТЬ
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div key="chance-text" className="flex flex-col items-center text-center">
                        <span className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-none text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.08)]">
                          {chance.toFixed(2)}<span className="text-lg sm:text-xl ml-0.5 text-gray-400">%</span>
                        </span>
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1.5">средний шанс</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>

            {/* COMPACT ACTIONS BUTTONS BAR */}
            <div className="w-full max-w-[420px] flex flex-col sm:flex-row items-center gap-3 relative z-10 px-4">
              
              {/* Massive Golden Upgrade Button */}
              <motion.button
                whileHover={!selectedInventoryItem || !selectedShopItem || isRolling ? {} : { scale: 1.02, y: -0.5 }}
                whileTap={!selectedInventoryItem || !selectedShopItem || isRolling ? {} : { scale: 0.98 }}
                onClick={handleRoll}
                disabled={!selectedInventoryItem || !selectedShopItem || isRolling}
                className={`relative flex-1 py-3 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-500 overflow-hidden flex items-center justify-center gap-2 ${
                  !selectedInventoryItem || !selectedShopItem || isRolling
                    ? 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
                    : 'bg-[#ffb300] hover:bg-[#ffa200] text-black shadow-[0_8px_25px_rgba(255,179,0,0.25)]'
                }`}
              >
                <ChevronsUp className="w-4 h-4 text-black stroke-[3.5] animate-pulse" />
                <span>Прокачать</span>
              </motion.button>

              {/* Pre-sets controls */}
              <div className="flex flex-wrap justify-center gap-1.5">
                {/* Roll Under/Over Toggle */}
                <button
                  onClick={() => !isRolling && setRollMode(rollMode === 'under' ? 'over' : 'under')}
                  disabled={isRolling}
                  className="px-3 py-2 rounded-xl bg-white/[0.015] border border-white/[0.05] text-[7.5px] font-black text-gray-400 hover:text-white uppercase tracking-wider transition-all"
                >
                  {rollMode === 'under' ? 'Under' : 'Over'}
                </button>
                
                {/* Multipliers */}
                {customPresets.multipliers.map((m) => (
                  <button
                    key={m}
                    onClick={() => !isRolling && handleSetMultiplier(m)}
                    disabled={isRolling || !selectedInventoryItem}
                    className="w-8 h-8 rounded-xl bg-white/[0.015] border border-white/[0.05] text-[9px] font-black text-gray-400 hover:text-white hover:border-[#ffb300]/40 transition-all flex items-center justify-center"
                  >
                    x{m}
                  </button>
                ))}

                {/* Preset chances */}
                {customPresets.chances.map((c) => (
                  <button
                    key={c}
                    onClick={() => !isRolling && handleSetChance(c)}
                    disabled={isRolling || !selectedInventoryItem}
                    className="px-2 py-2 rounded-xl bg-white/[0.015] border border-white/[0.05] text-[9px] font-black text-gray-400 hover:text-white hover:border-[#ffb300]/40 transition-all flex items-center justify-center"
                  >
                    {c}%
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Right Selected Card (Target Slot) */}
          <div className="w-full max-w-[260px] lg:w-[250px] shrink-0 flex flex-col">
            <div className="relative group w-full aspect-[4/5] bg-[#0c0c0f]/90 border border-white/[0.05] rounded-3xl flex flex-col overflow-hidden transition-all duration-500">
              
              {/* Particle canvas in case of win */}
              <CanvasParticles active={result === 'win'} />

              {/* Reset button inside pedestal if target selected */}
              {selectedShopItem && !isRolling && (
                <button 
                  onClick={() => setSelectedShopItem(null)} 
                  className="absolute right-4 top-4 p-1 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all z-20"
                  title="Deselect target"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              <AnimatePresence mode="wait">
                {selectedShopItem ? (
                  <motion.div
                    key="shop-selected"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full h-full flex flex-col justify-between p-5 relative"
                  >
                    <div className="text-right mt-1">
                      <span className="text-[8.5px] font-black text-purple-400 uppercase tracking-widest bg-purple-950/20 px-2 py-0.5 rounded border border-purple-500/10">МАГАЗИН</span>
                    </div>

                    <motion.div 
                      animate={result === 'win' ? { scale: [1, 1.06, 1], y: [-2, 2, -2] } : { y: [-3, 3, -3] }}
                      transition={result === 'win' ? { duration: 1.5 } : { repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="flex-1 flex items-center justify-center my-3 relative"
                    >
                      <div className="absolute w-24 h-24 bg-purple-500/[0.04] blur-2xl rounded-full" />
                      <img 
                        src={selectedShopItem.image} 
                        alt="" 
                        className="max-h-[110px] max-w-[140px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] z-10 animate-float" 
                      />
                    </motion.div>

                    <div className="text-center pt-2 border-t border-white/[0.03]">
                      <p className="text-[8.5px] font-bold text-gray-500 truncate">{formatSkinName(selectedShopItem.name).weapon}</p>
                      <h4 className="text-xs font-black text-white uppercase italic leading-tight truncate mt-0.5">{formatSkinName(selectedShopItem.name).skin}</h4>
                      <p className="text-sm font-black text-purple-400 mt-1.5">{formatPrice(selectedShopItem.price)}</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-5 my-auto h-full select-none">
                    <span className="text-[10px] font-black text-white/90 uppercase tracking-wider mb-0.5">Выберите скин</span>
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mb-8">для апгрейда</p>
                    
                    <div className="relative flex items-center justify-center w-16 h-16 bg-white/[0.01] border border-white/[0.04] rounded-full">
                      <ChevronsUp className="w-7 h-7 text-[#ffb300] animate-bounce" />
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* ====================================================================
            2. BOTTOM BLOCK: INVENTORY AND MARKET COMPACT SKIN CARDS LISTS
            ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          
          {/* Inventory Selection Column (Left) */}
          <div className="bg-[#0a0a0d]/30 border border-white/[0.04] rounded-[2.5rem] p-5.5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full" />
                <h2 className="text-xs font-black uppercase italic tracking-wider text-cyan-400">Мои скины</h2>
              </div>
              <div className="relative w-full sm:w-52">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Поиск скина..." 
                  value={inventorySearchQuery}
                  onChange={(e) => setInventorySearchQuery(e.target.value)}
                  disabled={isRolling}
                  className="w-full bg-white/[0.01] border border-white/[0.05] rounded-xl pl-9.5 pr-4 py-2 text-[10.5px] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-all"
                />
              </div>
            </div>

            {/* Shrunk Inventory Items card layout to 6 columns on desktop (xl:grid-cols-6) and smaller heights */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2 h-[300px] overflow-y-auto pr-1.5 custom-scrollbar">
              {!filteredInventoryItems.length ? (
                <div className="col-span-full h-full flex flex-col items-center justify-center text-gray-600 opacity-50 py-12">
                  <Info className="w-6 h-6 mb-2" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Инвентарь пуст</p>
                </div>
              ) : (
                filteredInventoryItems.map((item) => {
                  const rarity = getRarityInfo(item.rarity);
                  const isSelected = selectedInventoryItem?.purchaseId === item.purchaseId;
                  return (
                    <motion.div
                      key={item.purchaseId}
                      whileHover={isRolling ? {} : { y: -3, scale: 1.02 }}
                      whileTap={isRolling ? {} : { scale: 0.97 }}
                      onClick={() => !isRolling && setSelectedInventoryItem(item)}
                      className={`relative p-2 pb-2.5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.12)]'
                          : 'bg-[#0a0a0c]/80 border-white/[0.04] hover:bg-white/[0.02]'
                      } ${isRolling ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <div className="relative z-10 flex flex-col justify-between h-full">
                        {/* Compact card header */}
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-[8px] font-black text-gray-500">{formatPrice(item.price)}</span>
                          <span className="text-[7px] font-bold text-gray-600">FN</span>
                        </div>

                        {/* Weapon image */}
                        <div className="h-11 flex items-center justify-center my-0.5">
                          <img 
                            src={item.image} 
                            alt="" 
                            className="max-h-10 max-w-full object-contain group-hover:scale-105 transition-transform duration-500 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]" 
                          />
                        </div>

                        {/* Weapon Name split layout */}
                        <div className="text-left leading-none mt-1">
                          <p className="text-[7px] font-bold text-gray-500 uppercase truncate" title={item.name}>{formatSkinName(item.name).weapon}</p>
                          <p className="text-[8.5px] font-black text-white truncate uppercase" title={item.name}>{formatSkinName(item.name).skin}</p>
                        </div>
                      </div>
                      
                      {/* Rarity color block bottom bar */}
                      <div className="absolute bottom-0 inset-x-0 h-[2px]" style={{ backgroundColor: rarity.color }} />
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Shop Selection Column (Right) */}
          <div className="bg-[#0a0a0d]/30 border border-white/[0.04] rounded-[2.5rem] p-5.5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-purple-400 rounded-full" />
                  <h2 className="text-xs font-black uppercase italic tracking-wider text-purple-400">Выберите скин</h2>
                </div>
                
                {/* Filter tools (Min/Max inputs + Search input) */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/[0.01] border border-white/[0.05] rounded-xl px-2 py-1 text-[10px]">
                    <span className="text-gray-600 text-[8.5px]">от</span>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      disabled={isRolling}
                      className="w-10 bg-transparent text-white focus:outline-none placeholder-gray-700"
                    />
                    <span className="text-gray-600 text-[8.5px]">до</span>
                    <input 
                      type="number" 
                      placeholder="999k" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      disabled={isRolling}
                      className="w-12 bg-transparent text-white focus:outline-none placeholder-gray-700"
                    />
                  </div>

                  <div className="relative w-full sm:w-40">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Поиск..." 
                      value={shopSearchQuery}
                      onChange={(e) => setShopSearchQuery(e.target.value)}
                      disabled={isRolling}
                      className="w-full bg-white/[0.01] border border-white/[0.05] rounded-xl pl-7.5 pr-3 py-1.5 text-[10.5px] text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/40 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Shrunk Shop Cards to 5 columns with pagination content */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5 h-[230px] overflow-y-auto pr-1.5 custom-scrollbar">
                {!paginatedShopItems.length ? (
                  <div className="col-span-full h-full flex flex-col items-center justify-center text-gray-600 opacity-50 py-12">
                    <Info className="w-6 h-6 mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Ничего не найдено</p>
                  </div>
                ) : (
                  paginatedShopItems.map((item, idx) => {
                    const rarity = getRarityInfo(item.rarity);
                    const isSelected = selectedShopItem?.name === item.name;
                    
                    // Compute chance micro indicator for this card
                    let relativeChance = 0;
                    if (selectedInventoryItem) {
                      relativeChance = Math.min(((selectedInventoryItem.price + addedBalance) / item.price) * 100, 95);
                    }
                    
                    return (
                      <motion.div
                        key={idx}
                        whileHover={isRolling ? {} : { y: -3, scale: 1.02 }}
                        whileTap={isRolling ? {} : { scale: 0.97 }}
                        onClick={() => !isRolling && setSelectedShopItem(item)}
                        className={`relative p-2 pb-2.5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group ${
                          isSelected
                            ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_12px_rgba(138,43,226,0.12)]'
                            : 'bg-[#0a0a0c]/80 border-white/[0.04] hover:bg-white/[0.02]'
                        } ${isRolling ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <div className="relative z-10 flex flex-col justify-between h-full">
                          
                          {/* Compact card header */}
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-[8px] font-black text-gray-500">{formatPrice(item.price)}</span>
                            
                            {/* Micro Chance Indicator */}
                            {selectedInventoryItem ? (
                              <div className={`px-1 py-0.5 rounded text-[6.5px] font-black tracking-wider transition-all ${
                                relativeChance > 50 
                                  ? 'text-green-400 bg-green-500/5' 
                                  : relativeChance > 20 
                                    ? 'text-amber-400 bg-amber-500/5' 
                                    : 'text-red-400 bg-red-500/5'
                              }`}>
                                {relativeChance.toFixed(0)}%
                              </div>
                            ) : (
                              <span className="text-[7px] font-bold text-gray-600">FN</span>
                            )}
                          </div>

                          {/* Weapon image */}
                          <div className="h-11 flex items-center justify-center my-0.5">
                            <img 
                              src={item.image} 
                              alt="" 
                              className="max-h-10 max-w-full object-contain group-hover:scale-105 transition-transform duration-500 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]" 
                            />
                          </div>
                          
                          {/* Weapon Name split layout */}
                          <div className="text-left leading-none mt-1">
                            <p className="text-[7px] font-bold text-gray-500 uppercase truncate" title={item.name}>{formatSkinName(item.name).weapon}</p>
                            <p className="text-[8.5px] font-black text-white truncate uppercase" title={item.name}>{formatSkinName(item.name).skin}</p>
                          </div>
                        </div>
                        {/* Rarity Stripe at the bottom */}
                        <div className="absolute bottom-0 inset-x-0 h-[2px]" style={{ backgroundColor: rarity.color }} />
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* PAGINATION CONTROLS (PRO STYLE) */}
            <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 text-[10px] text-gray-500 font-bold">
              <span>Всего скинов: <span className="text-white">{availableShopItems.length}</span></span>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isRolling}
                  className="p-1 rounded bg-white/[0.01] border border-white/[0.05] text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>Страница <span className="text-white">{currentPage}</span> из <span className="text-white">{totalPages}</span></span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || isRolling}
                  className="p-1 rounded bg-white/[0.01] border border-white/[0.05] text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0d] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <Settings className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-black uppercase italic tracking-wider">Налаштування</h2>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Multiplier Presets */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Пресет множників (x)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {customPresets.multipliers.map((m, idx) => (
                      <div key={idx} className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-bold">x</span>
                        <input 
                          type="number"
                          value={m}
                          onChange={(e) => {
                            const newMults = [...customPresets.multipliers];
                            newMults[idx] = parseFloat(e.target.value) || 0;
                            const newPresets = { ...customPresets, multipliers: newMults };
                            setCustomPresets(newPresets);
                            localStorage.setItem('upgrader_presets', JSON.stringify(newPresets));
                          }}
                          className="w-full bg-white/[0.02] border border-white/5 focus:border-cyan-500/40 rounded-xl pl-6 pr-3 py-3 text-sm text-white font-black focus:outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chance Presets */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Пресет шансу (%)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {customPresets.chances.map((c, idx) => (
                      <div key={idx} className="relative group">
                        <input 
                          type="number"
                          value={c}
                          onChange={(e) => {
                            const newChances = [...customPresets.chances];
                            newChances[idx] = parseFloat(e.target.value) || 0;
                            const newPresets = { ...customPresets, chances: newChances };
                            setCustomPresets(newPresets);
                            localStorage.setItem('upgrader_presets', JSON.stringify(newPresets));
                          }}
                          className="w-full bg-white/[0.02] border border-white/5 focus:border-cyan-500/40 rounded-xl px-3 py-3 text-sm text-white font-black focus:outline-none transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-bold">%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-black shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                  >
                    Зберегти та вийти
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Upgrader;
