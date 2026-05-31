import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Wallet, CheckCircle2, AlertCircle } from 'lucide-react';

const RefillModal = ({ isOpen, onClose }) => {
  const { topUpBalance, user } = useAuth();
  const { formatPrice } = useCurrency();
  const [amount, setAmount] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  const showToastMsg = (msg, isError = false) => {
    setToast({ show: true, message: msg, isError });
    setTimeout(() => setToast({ show: false, message: '', isError: false }), 2500);
  };

  const handlePresetRefill = (value) => {
    const res = topUpBalance(value);
    if (res && res.success) {
      showToastMsg(`Successfully added +${formatPrice(value)}!`);
    } else {
      showToastMsg(res?.message || 'Top-up failed', true);
    }
  };

  const handleCustomRefill = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      showToastMsg('Please enter a valid amount', true);
      return;
    }
    const res = topUpBalance(val);
    if (res && res.success) {
      showToastMsg(`Successfully added +${formatPrice(val)}!`);
      setAmount('');
    } else {
      showToastMsg(res?.message || 'Top-up failed', true);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Refill Wallet Balance">
      <div className="flex flex-col gap-5 text-left font-sans relative">
        {toast.show && (
          <div className={`absolute -top-3 left-0 right-0 z-30 flex items-center justify-center p-3 rounded-xl border text-xs font-bold gap-2 shadow-lg backdrop-blur-md ${
            toast.isError
              ? 'bg-red-950/90 border-red-500/25 text-red-400'
              : 'bg-emerald-950/90 border-emerald-500/20 text-emerald-400'
          }`}>
            {toast.isError ? <AlertCircle className="w-4.5 h-4.5" /> : <CheckCircle2 className="w-4.5 h-4.5" />}
            <span>{toast.message}</span>
          </div>
        )}

        <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-xl">
          <Wallet className="w-5 h-5 text-accent-cyan" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Simulated Balance</span>
            <span className="text-xl font-black text-white">{user ? formatPrice(user.balance) : formatPrice(0)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Select Preset Amount</label>
          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 250, 500].map(val => (
              <button
                key={val}
                onClick={() => handlePresetRefill(val)}
                className="py-2.5 rounded-xl border border-white/5 bg-white/5 hover:border-accent-cyan/40 hover:bg-accent-cyan/5 text-xs font-bold text-gray-200 hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                +{formatPrice(val)}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleCustomRefill} className="flex flex-col gap-2 border-t border-white/5 pt-4">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Or Enter Custom Amount</label>
          <div className="flex gap-2">
            <input 
              type="number"
              placeholder="e.g. 100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-dark-950 border border-white/5 focus:border-accent-cyan/40 rounded-xl text-xs text-white focus:outline-none placeholder-gray-600"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-accent-cyan text-dark-950 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-98 active:scale-95 cursor-pointer shadow-lg hover:shadow-cyan-500/20"
            >
              Add Funds
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RefillModal;
