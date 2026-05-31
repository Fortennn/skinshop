import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext(null);

// Fallback rates if API fails
const defaultRates = {
  USD: 1,
  EUR: 0.92,
  UAH: 41.5
};

export const currencies = {
  USD: { symbol: '$', label: 'USD' },
  EUR: { symbol: '€', label: 'EUR' },
  UAH: { symbol: '₴', label: 'UAH' }
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState(defaultRates);

  useEffect(() => {
    // Load saved currency
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency && currencies[savedCurrency]) {
      setCurrency(savedCurrency);
    }

    // Fetch live rates
    const fetchRates = async () => {
      try {
        // Using a public API for demonstration (Free tier)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        if (data && data.rates) {
          setRates({
            USD: 1,
            EUR: data.rates.EUR,
            UAH: data.rates.UAH
          });
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates, using defaults', error);
      }
    };

    fetchRates();
  }, []);

  const changeCurrency = (newCurrency) => {
    if (currencies[newCurrency]) {
      setCurrency(newCurrency);
      localStorage.setItem('currency', newCurrency);
    }
  };

  const convert = (amount) => {
    return amount * (rates[currency] || defaultRates[currency]);
  };

  const formatPrice = (amount) => {
    const converted = convert(amount);
    const { symbol } = currencies[currency];
    
    if (currency === 'UAH') {
      return `${converted.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ${symbol}`;
    }
    
    return `${symbol}${converted.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      changeCurrency, 
      formatPrice, 
      convert,
      currentCurrency: { ...currencies[currency], rate: rates[currency] }
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
