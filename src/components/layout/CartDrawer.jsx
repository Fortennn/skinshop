import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { X, Trash2, CreditCard, ShoppingBag, PlusCircle, CheckCircle, AlertCircle, Minus, Plus, Loader2 } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose }) => {
  const { user, cart, removeFromCart, updateCartQuantity, checkoutCart, topUpBalance } = useAuth();
  const { formatPrice } = useCurrency();
  const toast = useToast();
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const hasFunds = user && user.balance >= totalPrice;

  const handleCheckout = async () => {
    if (busy) return;
    setBusy(true);
    const res = await checkoutCart();
    setBusy(false);
    if (res.success) {
      toast.success(res.message || 'Purchase complete!');
      setTimeout(onClose, 600);
    } else {
      toast.error(res.message || 'Checkout failed');
    }
  };

  const handleTopUpPreset = async (amount) => {
    if (busy) return;
    setBusy(true);
    const res = await topUpBalance(amount);
    setBusy(false);
    if (res && res.success) {
      toast.success(`Credited +${formatPrice(amount)}`);
    } else {
      toast.error(res?.message || 'Top-up failed');
    }
  };

  const handleCustomTopUp = async (e) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (busy) return;
    setBusy(true);
    const res = await topUpBalance(amount);
    setBusy(false);
    if (res && res.success) {
      toast.success(`Credited +${formatPrice(amount)}`);
      setTopUpAmount('');
      setShowTopUp(false);
    } else {
      toast.error(res?.message || 'Top-up failed');
    }
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#030507]/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-[400px] h-full bg-dark-900 border-l border-white/5 flex flex-col justify-between shadow-2xl z-10 text-left font-sans"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-accent-cyan" />
                <h2 className="text-sm font-bold tracking-widest text-white uppercase">Your Cart</h2>
                <span className="px-2 py-0.5 rounded bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-[10px] font-black">
                  {cart.length}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-accent-cyan text-gray-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              
              {/* Top Up Drawer Toggle */}
              <div className="flex flex-col rounded-xl bg-white/5 border border-white/5 p-4 gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Profile Balance</span>
                    <span className="text-base font-black text-accent-cyan">
                      {user ? formatPrice(user.balance) : formatPrice(0)}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowTopUp(!showTopUp)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan hover:text-black hover:border-transparent text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Refill Wallet</span>
                  </button>
                </div>

                {/* Collapsible Refill balance form */}
                {showTopUp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border-t border-white/5 pt-3 flex flex-col gap-3 text-left overflow-hidden"
                  >
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Select Preset Refill</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[50, 100, 500].map(amount => (
                        <button
                          key={amount}
                          onClick={() => handleTopUpPreset(amount)}
                          className="py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-accent-cyan/40 hover:bg-accent-cyan/5 text-[10px] font-bold text-gray-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                        >
                          +{formatPrice(amount)}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleCustomTopUp} className="flex gap-2 mt-1">
                      <input 
                        type="number" 
                        placeholder="Custom amount..." 
                        className="flex-1 px-3 py-2 bg-dark-950 border border-white/5 focus:border-accent-cyan/40 rounded-lg text-xs text-white focus:outline-none placeholder-gray-600"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                      />
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-accent-cyan text-dark-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all hover:scale-98 active:scale-95 cursor-pointer"
                      >
                        Credit
                      </button>
                    </form>
                  </motion.div>
                )}
              </div>

              {/* Cart Items list */}
              <div className="flex flex-col gap-3">
                {cart.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                    <span className="text-3xl">🛒</span>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Your cart is empty</p>
                    <p className="text-[10px] text-gray-600 max-w-[200px]">Add rare skins from the market to complete checkout.</p>
                  </div>
                ) : (
                  cart.map(item => {
                    const rarityColors = { 'Covert': '#eb4b4b', 'Classified': '#d32ce6', 'Restricted': '#8847ff', 'Mil-Spec': '#4b69ff' };
                    const rarityColor = rarityColors[item.rarity] || '#b0c3d9';
                    return (
                      <div 
                        key={item.id}
                        className="relative flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl transition-all group overflow-hidden"
                      >
                        {/* Left color glow strip */}
                        <div className="absolute top-0 bottom-0 left-0 w-[3px]" style={{ backgroundColor: rarityColor }} />
                        
                        <div className="flex items-center gap-3 pl-1 overflow-hidden">
                          <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center shrink-0">
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-contain" />
                          </div>
                          <div className="flex flex-col text-left overflow-hidden">
                            <span className="text-xs font-bold text-white truncate max-w-[170px]">{item.name}</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{item.wear} • {item.type}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Quantity selector in cart */}
                          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden h-7">
                            <button 
                              onClick={() => updateCartQuantity(item.id, (item.quantity || 1) - 1)}
                              className="w-6 h-full flex items-center justify-center hover:bg-white/5 transition-colors text-gray-400 active:scale-90"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-5 text-center text-[10px] font-black text-white">{item.quantity || 1}</span>
                            <button 
                              onClick={() => updateCartQuantity(item.id, (item.quantity || 1) + 1)}
                              className="w-6 h-full flex items-center justify-center hover:bg-white/5 transition-colors text-gray-400 active:scale-90"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <span className="text-xs font-black text-white">{formatPrice(item.price * (item.quantity || 1))}</span>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/15 hover:text-red-400 text-gray-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Checkout footer */}
            {cart.length > 0 && (
              <div className="p-6 bg-white/[0.01] border-t border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Sum</span>
                  <span className="text-xl font-black text-white">{formatPrice(totalPrice)}</span>
                </div>

                {!hasFunds && user && (
                  <div className="text-[10px] font-bold text-red-400 bg-red-950/20 border border-red-500/20 p-2.5 rounded-lg text-center">
                    INSUFFICIENT FUNDS. PLEASE REFILL WALLET.
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={!user || !hasFunds || busy}
                  className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    !hasFunds || !user || busy
                      ? 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-accent-cyan to-accent-blue text-dark-950 hover-glow cursor-pointer active:scale-98 shadow-xl'
                  }`}
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  <span>{busy ? 'Processing…' : 'Complete Purchase'}</span>
                </button>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CartDrawer;
