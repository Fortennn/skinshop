import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Wallet, Shield, History, Settings, LogOut, Copy, Check,
  ArrowUpRight, ArrowDownRight, Sparkles, Plus, Search,
  CheckSquare, Square, TrendingUp, ShoppingBag,
  PackageOpen, Tag, AtSign, Link as LinkIcon, Loader2,
} from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';

const RARITY_ORDER = ['Covert', 'Classified', 'Restricted', 'Mil-Spec', 'Industrial', 'Consumer', 'Extraordinary'];
const RARITY_COLORS = {
  Covert: '#eb4b4b',
  Classified: '#d32ce6',
  Restricted: '#8847ff',
  'Mil-Spec': '#4b69ff',
  Industrial: '#5e98d9',
  Consumer: '#b0c3d9',
  Extraordinary: '#eb4b4b',
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'inventory', label: 'Inventory', icon: Shield },
  { id: 'history', label: 'Trade Log', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function CopyButton({ value, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast.success(`${label} copied`);
    } catch {
      toast.error('Clipboard unavailable');
    }
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border transition-all duration-200 active:scale-95 ${
        copied
          ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
          : 'border-white/10 bg-white/5 text-gray-300 hover:border-accent-cyan/40 hover:text-accent-cyan hover:bg-accent-cyan/5'
      } ${className}`}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, accent = 'cyan' }) {
  const map = {
    cyan: 'text-accent-cyan bg-accent-cyan/8',
    purple: 'text-accent-purple bg-accent-purple/10',
    gold: 'text-accent-gold bg-accent-gold/10',
    pink: 'text-accent-pink bg-accent-pink/10',
  };
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.025] border border-white/[0.06]">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${map[accent]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{label}</span>
        <span className="text-base font-black text-white">{value}</span>
      </div>
    </div>
  );
}

// --- Inventory tab ---------------------------------------------------------

function InventoryTab({ inventory, loading }) {
  const { sellItems } = useAuth();
  const { formatPrice } = useCurrency();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sort, setSort] = useState('newest');
  const [selected, setSelected] = useState(() => new Set());
  const [confirm, setConfirm] = useState(null); // {ids, total, count}
  const [busy, setBusy] = useState(false);

  const types = useMemo(() => {
    const set = new Set(inventory.map((i) => i.type).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [inventory]);

  const rarities = useMemo(() => {
    const set = new Set(inventory.map((i) => i.rarity).filter(Boolean));
    return ['All', ...Array.from(set).sort((a, b) => RARITY_ORDER.indexOf(a) - RARITY_ORDER.indexOf(b))];
  }, [inventory]);

  const filtered = useMemo(() => {
    let result = inventory;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (rarityFilter !== 'All') result = result.filter((i) => i.rarity === rarityFilter);
    if (typeFilter !== 'All') result = result.filter((i) => i.type === typeFilter);
    const sorted = [...result];
    switch (sort) {
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rarity':
        sorted.sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
        break;
      default: // newest -> already DESC by purchaseId
        sorted.sort((a, b) => b.purchaseId - a.purchaseId);
    }
    return sorted;
  }, [inventory, search, rarityFilter, typeFilter, sort]);

  const totalValue = useMemo(
    () => inventory.reduce((sum, i) => sum + (i.price || 0), 0),
    [inventory]
  );
  const selectedValue = useMemo(
    () => filtered.filter((i) => selected.has(i.purchaseId)).reduce((s, i) => s + i.price, 0),
    [filtered, selected]
  );

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelected(new Set(filtered.map((i) => i.purchaseId)));
  };
  const clearSelection = () => setSelected(new Set());

  const confirmBulkSell = () => {
    const items = filtered.filter((i) => selected.has(i.purchaseId));
    if (!items.length) return;
    setConfirm({
      ids: items.map((i) => i.purchaseId),
      total: items.reduce((s, i) => s + i.price, 0),
      count: items.length,
      sample: items[0].name,
    });
  };

  const executeBulkSell = async () => {
    if (!confirm) return;
    setBusy(true);
    const res = await sellItems(confirm.ids);
    setBusy(false);
    setConfirm(null);
    clearSelection();
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message || 'Sale failed');
    }
  };

  const sellSingle = (item) => {
    setConfirm({ ids: [item.purchaseId], total: item.price, count: 1, sample: item.name });
  };

  if (loading && !inventory.length) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inventory…"
              className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/[0.08] focus:border-accent-cyan/50 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-3 sm:flex gap-2">
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="px-3 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs font-bold text-gray-200 focus:outline-none focus:border-accent-cyan/50 min-w-0"
            >
              {rarities.map((r) => (
                <option key={r} value={r}>{r === 'All' ? 'All rarities' : r}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs font-bold text-gray-200 focus:outline-none focus:border-accent-cyan/50 min-w-0"
            >
              {types.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All types' : t}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs font-bold text-gray-200 focus:outline-none focus:border-accent-cyan/50 min-w-0"
            >
              <option value="newest">Newest</option>
              <option value="price-high">Price: high → low</option>
              <option value="price-low">Price: low → high</option>
              <option value="name">Name (A–Z)</option>
              <option value="rarity">Rarity</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.05]">
            {filtered.length} of {inventory.length} items
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.05]">
            Total value · <span className="text-accent-cyan">{formatPrice(totalValue)}</span>
          </span>
          {selected.size > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan">
              {selected.size} selected · {formatPrice(selectedValue)}
            </span>
          )}
        </div>
      </div>

      {/* Bulk actions */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 sticky top-[110px] sm:top-[150px] z-20 -mx-1 sm:-mx-2 px-1 sm:px-2 py-2 bg-[#030508]/85 backdrop-blur-md border-y border-white/[0.04]">
          <button
            onClick={selectAllFiltered}
            className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:border-accent-cyan/40 hover:text-accent-cyan transition-all"
          >
            Select all ({filtered.length})
          </button>
          {selected.size > 0 && (
            <button
              onClick={clearSelection}
              className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:border-red-500/40 hover:text-red-400 transition-all"
            >
              Clear
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={confirmBulkSell}
            disabled={selected.size === 0 || busy}
            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border transition-all flex items-center gap-1.5 ${
              selected.size === 0
                ? 'border-white/5 bg-white/[0.02] text-gray-600 cursor-not-allowed'
                : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
            }`}
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
            Sell selected · {formatPrice(selectedValue)}
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-3 border border-dashed border-white/[0.06] rounded-2xl">
          <PackageOpen className="w-10 h-10 text-gray-700" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            {inventory.length === 0 ? 'Your inventory is empty' : 'No items match your filters'}
          </p>
          <p className="text-[10px] text-gray-600 max-w-sm">
            Visit the marketplace to add items, or relax your search and filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((item) => {
            const color = RARITY_COLORS[item.rarity] || '#b0c3d9';
            const isSelected = selected.has(item.purchaseId);
            return (
              <motion.div
                key={item.purchaseId}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className={`relative flex flex-col rounded-2xl border overflow-hidden transition-all ${
                  isSelected
                    ? 'border-accent-cyan/60 bg-accent-cyan/[0.05] shadow-[0_0_24px_-8px_rgba(0,242,254,0.4)]'
                    : 'border-white/[0.06] bg-[#0a0e16] hover:border-white/[0.12]'
                }`}
              >
                <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: color }} />
                <button
                  onClick={() => toggleSelect(item.purchaseId)}
                  className="absolute top-2.5 left-2.5 z-10 w-7 h-7 rounded-md flex items-center justify-center bg-black/60 border border-white/10 hover:border-accent-cyan/50 transition-all"
                  aria-label="Select"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-accent-cyan" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                <div
                  className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border z-10"
                  style={{ color, borderColor: `${color}55`, backgroundColor: `${color}11` }}
                >
                  {item.rarity || '—'}
                </div>

                <div className="relative h-32 sm:h-36 flex items-center justify-center px-4 pt-6 pb-2">
                  <div
                    className="absolute inset-x-0 top-0 mx-auto w-3/4 h-24 rounded-full blur-[40px] opacity-25 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
                  />
                  <img src={item.image} alt={item.name} className="relative max-h-full max-w-full object-contain drop-shadow-xl" loading="lazy" />
                </div>

                <div className="px-3.5 pb-3.5 flex flex-col gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white leading-tight line-clamp-2 min-h-[2.4em]">
                      {item.name}
                    </span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                      {item.wear || '—'} • {item.type || '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-sm font-black text-white">{formatPrice(item.price)}</span>
                    <button
                      onClick={() => sellSingle(item)}
                      className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all"
                    >
                      Sell
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirm modal */}
      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={() => !busy && setConfirm(null)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-dark-900 p-6 shadow-2xl"
            >
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Confirm sale</h3>
              <p className="text-xs text-gray-400 mt-2">
                You're about to sell{' '}
                <span className="text-white font-bold">{confirm.count}</span>{' '}
                {confirm.count === 1 ? 'item' : 'items'}
                {confirm.count === 1 ? ` (${confirm.sample})` : ''}.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-white/[0.04] border border-white/[0.05] flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">You receive</span>
                <span className="text-base font-black text-emerald-300">+{formatPrice(confirm.total)}</span>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  disabled={busy}
                  onClick={() => setConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-gray-300 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={busy}
                  onClick={executeBulkSell}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-black uppercase tracking-widest text-emerald-300 hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                >
                  {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- History tab -----------------------------------------------------------

function HistoryTab({ history, loading }) {
  const { formatPrice, convert, currentCurrency } = useCurrency();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const filtered = useMemo(() => {
    let result = history;
    if (filter !== 'All') result = result.filter((h) => h.type === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((h) => (h.item || '').toLowerCase().includes(q));
    }
    return result;
  }, [history, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);

  useEffect(() => { setPage(0); }, [filter, search]);

  if (loading && !history.length) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    );
  }

  const formatAmount = (raw) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return raw;
    const sign = n >= 0 ? '+' : '-';
    const abs = Math.abs(n);
    const converted = convert(abs);
    if (currentCurrency?.symbol === '₴') {
      return `${sign}${converted.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ${currentCurrency.symbol}`;
    }
    const sym = currentCurrency?.symbol || '$';
    return `${sign}${sym}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trade log…"
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/[0.08] focus:border-accent-cyan/50 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs font-bold text-gray-200 focus:outline-none focus:border-accent-cyan/50"
        >
          <option value="All">All actions</option>
          <option value="Purchase">Purchases</option>
          <option value="Sale">Sales</option>
          <option value="Top Up">Top-ups</option>
          <option value="Upgrade Win">Upgrade Wins</option>
          <option value="Upgrade Loss">Upgrade Losses</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center gap-2 border border-dashed border-white/[0.06] rounded-2xl">
          <History className="w-8 h-8 text-gray-700" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            {history.length === 0 ? 'No transactions yet' : 'No matches'}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_2fr_1fr_1fr] gap-2 px-4 py-3 bg-white/[0.025] text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/[0.04]">
              <span>Action</span>
              <span>Item</span>
              <span>Date</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="flex flex-col divide-y divide-white/[0.04]">
              {pageItems.map((h) => {
                const isCredit = h.type === 'Sale' || h.type === 'Top Up' || h.type === 'Upgrade Win';
                const Icon = isCredit ? ArrowUpRight : ArrowDownRight;
                const accent = isCredit ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' : 'text-red-300 bg-red-500/10 border-red-500/25';
                return (
                  <div key={h.id} className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[1fr_2fr_1fr_1fr] gap-2 px-4 py-3 items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${accent}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-gray-300">
                        {h.type}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">{h.item || '—'}</span>
                      <span className="sm:hidden text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                        {h.type} · {h.date}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {h.date}
                    </span>
                    <span className={`text-xs font-black text-right ${isCredit ? 'text-emerald-300' : 'text-red-300'}`}>
                      {formatAmount(h.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
                >
                  Prev
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- Settings tab ----------------------------------------------------------

function SettingsTab() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name || '');
  const [tradeUrl, setTradeUrl] = useState(user?.steamTradeUrl || '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setTradeUrl(user?.steamTradeUrl || '');
  }, [user]);

  const saveProfile = async () => {
    if (busy) return;
    setBusy(true);
    const res = await updateProfile({ name: name.trim(), steamTradeUrl: tradeUrl.trim() });
    setBusy(false);
    if (res.success) toast.success('Profile saved');
    else toast.error(res.message || 'Failed to save');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-white/[0.06] bg-[#0a0e16] p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Account</h3>
          <User className="w-5 h-5 text-accent-cyan" />
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Display name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1.5 px-3.5 py-2.5 bg-black/40 border border-white/[0.08] focus:border-accent-cyan/50 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Email</label>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 px-3.5 py-2.5 bg-black/30 border border-white/[0.04] rounded-xl text-xs text-gray-300 flex items-center gap-2 min-w-0">
                <AtSign className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <CopyButton value={user?.email || ''} label="Copy" />
            </div>
            <p className="text-[10px] text-gray-600 mt-1.5 pl-1">
              Authenticated via <span className="font-bold text-gray-400 uppercase">{user?.provider || 'local'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0a0e16] p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Trade configuration</h3>
          <LinkIcon className="w-5 h-5 text-accent-purple" />
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Steam trade URL</label>
            <input
              value={tradeUrl}
              onChange={(e) => setTradeUrl(e.target.value)}
              placeholder="https://steamcommunity.com/tradeoffer/new/?partner=…&token=…"
              className="w-full mt-1.5 px-3.5 py-2.5 bg-black/40 border border-white/[0.08] focus:border-accent-cyan/50 rounded-xl text-xs text-white focus:outline-none placeholder-gray-600"
            />
            <div className="flex items-center gap-2 mt-2">
              {tradeUrl && <CopyButton value={tradeUrl} label="Copy URL" />}
              <span className="text-[10px] text-gray-600">Must start with <code className="text-gray-400">steamcommunity.com</code>.</span>
            </div>
          </div>
        </div>

        <button
          onClick={saveProfile}
          disabled={busy}
          className="mt-2 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-blue text-dark-950 font-black text-xs uppercase tracking-widest disabled:opacity-50 active:scale-98 transition-all"
        >
          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save changes
        </button>
      </div>
    </div>
  );
}

// --- Overview tab ----------------------------------------------------------

function OverviewTab() {
  const { user, history, inventory, topUpBalance } = useAuth();
  const { formatPrice } = useCurrency();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const purchases = useMemo(() => history.filter((h) => h.type === 'Purchase').length, [history]);
  const sales = useMemo(() => history.filter((h) => h.type === 'Sale').length, [history]);
  const upgrades = useMemo(() => history.filter((h) => h.type?.startsWith('Upgrade')).length, [history]);
  const portfolioValue = useMemo(
    () => (inventory || []).reduce((s, i) => s + (i.price || 0), 0),
    [inventory]
  );

  const handleTopUp = async (amount) => {
    if (busy) return;
    setBusy(true);
    const res = await topUpBalance(amount);
    setBusy(false);
    if (res?.success) toast.success(`+${formatPrice(amount)} credited`);
    else toast.error(res?.message || 'Top-up failed');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Balance Card */}
      <div className="relative lg:col-span-1 rounded-2xl p-6 overflow-hidden flex flex-col gap-4 border border-white/[0.06] bg-[#0a0e16]">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Wallet</span>
          <Wallet className="w-5 h-5 text-accent-cyan" />
        </div>
        <div>
          <span className="text-4xl font-black text-white tabular-nums">{formatPrice(user.balance || 0)}</span>
          <p className="text-[10px] text-gray-500 font-medium mt-1">Simulated balance · instant refill</p>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-auto">
          {[50, 100, 250].map((amt) => (
            <button
              key={amt}
              onClick={() => handleTopUp(amt)}
              disabled={busy}
              className="py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/[0.08] bg-white/[0.04] hover:border-accent-cyan/50 hover:bg-accent-cyan/10 hover:text-accent-cyan text-gray-300 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <Plus className="w-3 h-3" />
              {formatPrice(amt)}
            </button>
          ))}
        </div>
      </div>

      {/* Market metrics */}
      <div className="relative lg:col-span-2 rounded-2xl p-6 border border-white/[0.06] bg-[#0a0e16] flex flex-col gap-4">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-purple/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Portfolio</span>
          <TrendingUp className="w-5 h-5 text-accent-purple" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-black text-white tabular-nums">{formatPrice(portfolioValue)}</span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pb-1.5">Inventory value</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Shield} label="Inventory" value={`${(inventory || []).length} items`} accent="cyan" />
          <StatCard icon={ShoppingBag} label="Purchases" value={`${purchases}`} accent="purple" />
          <StatCard icon={Tag} label="Sales" value={`${sales}`} accent="gold" />
          <StatCard icon={Sparkles} label="Upgrades" value={`${upgrades}`} accent="pink" />
        </div>
      </div>
    </div>
  );
}

// --- Profile page shell ----------------------------------------------------

export default function Profile() {
  const { user, logout, loading, inventory, history, refreshAll } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-accent-cyan animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/" />;

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0a0e16] via-[#0a0e16] to-[#10131c] overflow-hidden">
        <div className="relative p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-accent-cyan/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-1/4 w-60 h-60 bg-accent-purple/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative shrink-0">
            <img
              src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0b0f15&color=00f2fe`}
              alt={user.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-white/10"
            />
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest bg-accent-cyan text-dark-950 shadow-lg">
              {user.provider || 'local'}
            </span>
          </div>

          <div className="relative flex-1 min-w-0 flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-cyan">Welcome back</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white truncate">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Member since {user.memberSince ? new Date(user.memberSince).toLocaleDateString() : '—'}
              </span>
              <CopyButton value={user.email || ''} label="Copy email" />
              {user.steamTradeUrl && <CopyButton value={user.steamTradeUrl} label="Copy trade URL" />}
            </div>
          </div>

          <button
            onClick={logout}
            className="relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Sticky tab bar */}
      <div className="sticky top-[60px] sm:top-[68px] z-30 -mx-4 sm:mx-0 px-4 sm:px-0 pt-1 pb-2 bg-[#030508]/85 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0 transition-all ${
                  isActive
                    ? 'text-white bg-white/[0.06] border border-white/[0.1]'
                    : 'text-gray-500 hover:text-white border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {isActive && (
                  <motion.span
                    layoutId="profile-tab-underline"
                    className="absolute -bottom-2 left-2 right-2 h-[2px] bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'inventory' && (
            <InventoryTab inventory={inventory || []} loading={loading} />
          )}
          {activeTab === 'history' && <HistoryTab history={history || []} loading={loading} />}
          {activeTab === 'settings' && <SettingsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
