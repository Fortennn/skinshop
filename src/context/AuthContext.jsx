import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);


  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Check if user is logged in via Steam
      checkSteamAuth();
    }
    
    // Initialize users list if not exists
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([]));
    }
  }, []);

  const checkSteamAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/user', {
        credentials: 'include'
      });
      const steamUser = await response.json();
      
      if (steamUser) {
        const userData = {
          name: steamUser.displayName,
          email: steamUser.id + '@steam', // Steam doesn't provide email, use ID as placeholder
          picture: steamUser.photos[2]?.value || steamUser.photos[0]?.value,
          balance: 150.00,
          inventory: [],
          history: [],
          memberSince: new Date().toLocaleDateString(),
          isSteam: true
        };

        // Standard user sync logic
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.email === userData.email);
        if (!existingUser) {
          users.push({ ...userData, password: null });
          localStorage.setItem('users', JSON.stringify(users));
        } else {
          userData.balance = existingUser.balance;
          userData.inventory = existingUser.inventory;
          userData.history = existingUser.history;
          userData.memberSince = existingUser.memberSince;
        }

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Steam auth check failed:', error);
    }
  };

  const login = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const userData = {
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
      balance: 150.00,
      inventory: [],
      history: [],
      memberSince: new Date().toLocaleDateString()
    };

    // Save to local users list if new
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === userData.email);
    if (!existingUser) {
      users.push({ ...userData, password: null }); // Google users have no password
      localStorage.setItem('users', JSON.stringify(users));
    } else {
      // Preserve existing data if user already exists
      userData.balance = existingUser.balance;
      userData.inventory = existingUser.inventory;
      userData.history = existingUser.history;
      userData.memberSince = existingUser.memberSince;
    }

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const loginWithEmail = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userMatch = users.find(u => u.email === email && u.password === password);
    
    if (userMatch) {
      const { password: _, ...userData } = userMatch;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const register = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'User already exists' };
    }

    const newUser = {
      name,
      email,
      password,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      balance: 150.00,
      inventory: [],
      history: [],
      memberSince: new Date().toLocaleDateString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    const { password: _, ...userData } = newUser;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    if (user?.isSteam) {
      window.location.href = 'http://localhost:5000/auth/logout';
    }
    setUser(null);
    setCart([]);
    localStorage.removeItem('user');
  };

  const updateUserInStorage = (updatedUser) => {
    // Update active session
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update in "database"
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex(u => u.email === updatedUser.email);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      localStorage.setItem('users', JSON.stringify(users));
    }
  };

  // Cart Management
  const addToCart = (item, quantity = 1) => {
    if (!user) return { success: false, message: 'Please login first' };
    
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + quantity }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity }];
    });
    return { success: true, message: 'Added to cart!' };
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Balance Top-up
  const topUpBalance = (amount) => {
    if (!user) return { success: false, message: 'Please login first' };
    if (amount <= 0 || isNaN(amount)) return { success: false, message: 'Invalid amount' };

    const updatedUser = {
      ...user,
      balance: (user.balance || 0) + amount,
      history: [
        {
          id: Date.now(),
          type: 'Top Up',
          item: 'Demo Balance Credit',
          date: new Date().toISOString().split('T')[0],
          amount: `+${amount.toFixed(2)}`
        },
        ...(user.history || [])
      ]
    };

    setUser(updatedUser);
    updateUserInStorage(updatedUser);
    return { success: true, message: `Successfully topped up $${amount.toFixed(2)}!` };
  };

  // Checkout Shopping Cart items
  const checkoutCart = () => {
    if (!user) return { success: false, message: 'Please login first' };
    if (cart.length === 0) return { success: false, message: 'Your cart is empty!' };

    const totalPrice = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    if (user.balance < totalPrice) {
      return { success: false, message: 'Insufficient balance. Top up to complete purchase.' };
    }

    const currentInventory = user.inventory || [];
    const currentHistory = user.history || [];
    
    // Add purchase timestamp to items and expand by quantity
    const newItems = [];
    cart.forEach((item, itemIdx) => {
      const qty = item.quantity || 1;
      for (let i = 0; i < qty; i++) {
        // Create a copy without the quantity property for inventory
        const { quantity, ...itemData } = item;
        newItems.push({
          ...itemData,
          purchaseId: Date.now() + (itemIdx * 1000) + i
        });
      }
    });

    // Create history records
    const newHistoryRecords = cart.map((item, index) => ({
      id: Date.now() + index + 1000,
      type: 'Purchase',
      item: `${item.name}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`,
      date: new Date().toISOString().split('T')[0],
      amount: `-${(item.price * (item.quantity || 1)).toFixed(2)}`
    }));

    const updatedUser = {
      ...user,
      balance: (user.balance || 0) - totalPrice,
      inventory: [...currentInventory, ...newItems],
      history: [...newHistoryRecords, ...currentHistory]
    };

    setUser(updatedUser);
    updateUserInStorage(updatedUser);
    setCart([]); // Clear cart on success

    return { success: true, message: `Successfully purchased ${newItems.length} skins!` };
  };

  const buyItem = (item, isFree = false) => {
    if (!user) return { success: false, message: 'Please login first' };
    
    const priceToDeduct = isFree ? 0 : item.price;
    if (user.balance < priceToDeduct) return { success: false, message: 'Insufficient balance' };

    const currentInventory = user.inventory || [];
    const currentHistory = user.history || [];

    const updatedUser = {
      ...user,
      balance: (user.balance || 0) - priceToDeduct,
      inventory: [...currentInventory, { ...item, purchaseId: Date.now() }],
      history: [
        { 
          id: Date.now(), 
          type: isFree ? 'Upgrade Win' : 'Purchase', 
          item: item.name, 
          date: new Date().toISOString().split('T')[0], 
          amount: isFree ? '0.00' : `-${item.price.toFixed(2)}` 
        },
        ...currentHistory
      ]
    };

    setUser(updatedUser);
    updateUserInStorage(updatedUser);
    return { success: true, message: isFree ? 'Upgrade successful!' : 'Purchase successful!' };
  };

  const sellItem = (purchaseId) => {
    if (!user) return { success: false, message: 'Please login first' };
    
    const itemToSell = user.inventory.find(item => item.purchaseId === purchaseId);
    if (!itemToSell) return { success: false, message: 'Item not found in inventory' };

    const updatedInventory = user.inventory.filter(item => item.purchaseId !== purchaseId);
    const updatedUser = {
      ...user,
      balance: (user.balance || 0) + itemToSell.price,
      inventory: updatedInventory,
      history: [
        { 
          id: Date.now(), 
          type: 'Sale', 
          item: itemToSell.name, 
          date: new Date().toISOString().split('T')[0], 
          amount: `+${itemToSell.price.toFixed(2)}` 
        },
        ...user.history
      ]
    };

    setUser(updatedUser);
    updateUserInStorage(updatedUser);
    return { success: true, message: 'Item sold successfully!' };
  };

  const applyUpgrade = (sourcePurchaseId, targetItem, isWin, extraCost = 0) => {
    if (!user) return { success: false, message: 'Please login first' };
    if (user.balance < extraCost) return { success: false, message: 'Insufficient balance' };

    const sourceItem = user.inventory.find(item => item.purchaseId === sourcePurchaseId);
    if (!sourceItem) return { success: false, message: 'Source item not found' };

    const updatedInventory = user.inventory.filter(item => item.purchaseId !== sourcePurchaseId);
    
    if (isWin) {
      updatedInventory.push({ ...targetItem, purchaseId: Date.now() });
    }

    const historyRecord = {
      id: Date.now(),
      type: isWin ? 'Upgrade Win' : 'Upgrade Loss',
      item: isWin ? `${sourceItem.name} -> ${targetItem.name}` : sourceItem.name,
      date: new Date().toISOString().split('T')[0],
      amount: extraCost > 0 ? `-${extraCost.toFixed(2)}` : '0.00'
    };

    const updatedUser = {
      ...user,
      balance: user.balance - extraCost,
      inventory: updatedInventory,
      history: [historyRecord, ...user.history]
    };

    setUser(updatedUser);
    updateUserInStorage(updatedUser);

    return { success: true, message: isWin ? 'Upgrade Successful!' : 'Upgrade Failed' };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      cart, 
      login, 
      loginWithEmail, 
      register, 
      logout, 
      addToCart, 
      updateCartQuantity,
      removeFromCart, 
      clearCart, 
      topUpBalance, 
      checkoutCart, 
      buyItem, 
      sellItem,
      applyUpgrade
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
