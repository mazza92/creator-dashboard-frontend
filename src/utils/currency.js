// Currency utility functions for multi-currency support
// Maintains Euro as default to avoid breaking existing functionality

// Supported currencies with their symbols (no conversion rates)
export const SUPPORTED_CURRENCIES = {
  EUR: { symbol: '€', name: 'Euro' },
  USD: { symbol: '$', name: 'US Dollar' },
  GBP: { symbol: '£', name: 'British Pound' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc' },
  SEK: { symbol: 'kr', name: 'Swedish Krona' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone' },
  DKK: { symbol: 'kr', name: 'Danish Krone' }
};

// Get user's preferred currency from localStorage, default to EUR
export function getUserCurrency() {
  const saved = localStorage.getItem('userCurrency');
  return saved && SUPPORTED_CURRENCIES[saved] ? saved : 'EUR';
}

// Set user's preferred currency
export function setUserCurrency(currency) {
  if (SUPPORTED_CURRENCIES[currency]) {
    localStorage.setItem('userCurrency', currency);
    return true;
  }
  return false;
}

// Get currency symbol for display
export function getCurrencySymbol(currency = null) {
  const userCurrency = currency || getUserCurrency();
  return SUPPORTED_CURRENCIES[userCurrency]?.symbol || '€';
}

// Get currency name for display
export function getCurrencyName(currency = null) {
  const userCurrency = currency || getUserCurrency();
  return SUPPORTED_CURRENCIES[userCurrency]?.name || 'Euro';
}

// Format price with user's preferred currency (no conversion)
export function formatPrice(price, currency = null) {
  if (price == null || price === '') return '';
  
  const userCurrency = currency || getUserCurrency();
  const symbol = getCurrencySymbol(userCurrency);
  const num = Number(price);
  
  const formatted = num % 1 === 0 
    ? num.toLocaleString() 
    : num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  return `${symbol}${formatted}`;
}

// Format price with symbol only (for input fields) - no conversion
export function formatPriceWithSymbol(price, currency = null) {
  if (price == null || price === '') return '';
  
  const userCurrency = currency || getUserCurrency();
  const symbol = getCurrencySymbol(userCurrency);
  
  return `${symbol}${price}`;
}

// Get currency options for dropdowns
export function getCurrencyOptions() {
  return Object.entries(SUPPORTED_CURRENCIES).map(([code, data]) => ({
    value: code,
    label: `${data.symbol} ${data.name}`,
    symbol: data.symbol,
    name: data.name
  }));
}

// Validate if currency is supported
export function isValidCurrency(currency) {
  return currency && SUPPORTED_CURRENCIES[currency];
}
