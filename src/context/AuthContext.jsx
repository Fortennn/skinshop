import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api, ApiError } from '../api/client';

const AuthContext = createContext(null);

/**
 * AuthContext is now backed by the Express + SQLite API. All mutations
 * round-trip through the server, which holds the source of truth for
 * users, cart, inventory, and history.
 *
 * Successful mutation handlers return { success: boolean, message: string }
 * — same contract as before, so existing call sites don't need to change.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- Loaders ------------------------------------------------------------
  const refreshCart = useCallback(async () => {
    try {
      const { cart } = await api.getCart();
      setCart(cart || []);
    } catch {
      setCart([]);
    }
  }, []);

  const refreshInventory = useCallback(async () => {
    try {
      const { inventory } = await api.getInventory();
      setInventory(inventory || []);
    } catch {
      setInventory([]);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      const { history } = await api.getHistory();
      setHistory(history || []);
    } catch {
      setHistory([]);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshCart(), refreshInventory(), refreshHistory()]);
  }, [refreshCart, refreshInventory, refreshHistory]);

  // Boot: check current session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user } = await api.me();
        if (!cancelled) {
          setUser(user || null);
          if (user) {
            await refreshAll();
          }
        }
      } catch {
        // fall through
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshAll]);

  // ---- Auth actions -------------------------------------------------------
  const wrap = async (fn) => {
    try {
      const data = await fn();
      return { success: true, data };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Network error';
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    const r = await wrap(() => api.register({ name, email, password }));
    if (r.success) {
      setUser(r.data.user);
      await refreshAll();
      return { success: true, message: 'Welcome aboard!' };
    }
    return { success: false, message: r.message };
  };

  const loginWithEmail = async (email, password) => {
    const r = await wrap(() => api.login({ email, password }));
    if (r.success) {
      setUser(r.data.user);
      await refreshAll();
      return { success: true };
    }
    return { success: false, message: r.message };
  };

  // Google OAuth via @react-oauth/google -> sends credential to backend
  const login = async (credentialResponse) => {
    if (!credentialResponse?.credential) return { success: false, message: 'No credential' };
    const r = await wrap(() => api.loginGoogle(credentialResponse.credential));
    if (r.success) {
      setUser(r.data.user);
      await refreshAll();
      return { success: true };
    }
    return { success: false, message: r.message };
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore — clear local state anyway
    }
    setUser(null);
    setCart([]);
    setInventory([]);
    setHistory([]);
  };

  const updateProfile = async (payload) => {
    const r = await wrap(() => api.updateProfile(payload));
    if (r.success) {
      setUser(r.data.user);
      return { success: true };
    }
    return { success: false, message: r.message };
  };

  // ---- Cart actions -------------------------------------------------------
  const addToCart = async (item, quantity = 1) => {
    if (!user) return { success: false, message: 'Please login first' };
    const r = await wrap(() => api.addToCart(item.id, quantity));
    if (r.success) {
      setCart(r.data.cart || []);
      return { success: true, message: 'Added to cart!' };
    }
    return { success: false, message: r.message };
  };

  const updateCartQuantity = async (itemId, quantity) => {
    if (!user) return;
    try {
      const { cart } = await api.updateCartQty(itemId, quantity);
      setCart(cart || []);
    } catch {
      // refresh state from server on failure
      await refreshCart();
    }
  };

  const removeFromCart = async (itemId) => {
    if (!user) return;
    try {
      const { cart } = await api.removeFromCart(itemId);
      setCart(cart || []);
    } catch {
      await refreshCart();
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      const { cart } = await api.clearCart();
      setCart(cart || []);
    } catch {
      await refreshCart();
    }
  };

  const checkoutCart = async () => {
    if (!user) return { success: false, message: 'Please login first' };
    if (cart.length === 0) return { success: false, message: 'Your cart is empty!' };
    const r = await wrap(() => api.checkoutCart());
    if (r.success) {
      setUser(r.data.user);
      setCart(r.data.cart || []);
      await Promise.all([refreshInventory(), refreshHistory()]);
      return { success: true, message: `Successfully purchased ${r.data.totalItems} skins!` };
    }
    return { success: false, message: r.message };
  };

  // ---- Wallet / inventory -------------------------------------------------
  const topUpBalance = async (amount) => {
    if (!user) return { success: false, message: 'Please login first' };
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      return { success: false, message: 'Invalid amount' };
    }
    const r = await wrap(() => api.topUp(n));
    if (r.success) {
      setUser(r.data.user);
      await refreshHistory();
      return { success: true, message: `Successfully topped up $${n.toFixed(2)}!` };
    }
    return { success: false, message: r.message };
  };

  const sellItem = async (purchaseId) => {
    if (!user) return { success: false, message: 'Please login first' };
    const r = await wrap(() => api.sellItems([purchaseId]));
    if (r.success) {
      setUser(r.data.user);
      setInventory(r.data.inventory || []);
      await refreshHistory();
      return { success: true, message: 'Item sold successfully!' };
    }
    return { success: false, message: r.message };
  };

  const sellItems = async (purchaseIds) => {
    if (!user) return { success: false, message: 'Please login first' };
    if (!purchaseIds?.length) return { success: false, message: 'Select at least one item' };
    const r = await wrap(() => api.sellItems(purchaseIds));
    if (r.success) {
      setUser(r.data.user);
      setInventory(r.data.inventory || []);
      await refreshHistory();
      return {
        success: true,
        message: `Sold ${r.data.soldCount} items for $${r.data.soldValue.toFixed(2)}`,
      };
    }
    return { success: false, message: r.message };
  };

  // Kept for compatibility with the Upgrader. `targetItem` is the skin
  // record from the catalog (must include `id`).
  const applyUpgrade = async (sourcePurchaseId, targetItem, isWin, extraCost = 0) => {
    if (!user) return { success: false, message: 'Please login first' };
    const r = await wrap(() =>
      api.upgradeItem({
        sourcePurchaseId,
        targetSkinId: targetItem?.id,
        isWin: !!isWin,
        extraCost: Number(extraCost) || 0,
      })
    );
    if (r.success) {
      setUser(r.data.user);
      setInventory(r.data.inventory || []);
      await refreshHistory();
      return { success: true, message: isWin ? 'Upgrade Successful!' : 'Upgrade Failed' };
    }
    return { success: false, message: r.message };
  };

  // `buyItem` retained for Upgrader's free-grant path. For a normal purchase,
  // prefer using the cart + checkoutCart flow.
  const buyItem = async (item, isFree = false) => {
    if (!user) return { success: false, message: 'Please login first' };
    if (isFree) {
      // Treat as a zero-cost upgrade win: there's no real "source" item, so
      // surface a clear error and ask the caller to use a real flow.
      return { success: false, message: 'Free-grant flow is no longer supported on the client' };
    }
    // Buy via cart-as-single
    const add = await addToCart(item, 1);
    if (!add.success) return add;
    return await checkoutCart();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        cart,
        inventory,
        history,
        loading,
        // auth
        login,
        loginWithEmail,
        register,
        logout,
        updateProfile,
        // cart
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        checkoutCart,
        // wallet / inventory / upgrade
        topUpBalance,
        sellItem,
        sellItems,
        buyItem,
        applyUpgrade,
        // refreshers
        refreshAll,
        refreshCart,
        refreshInventory,
        refreshHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
