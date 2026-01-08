import React, { useState, useEffect } from 'react';
import { Select, Tooltip, message } from 'antd';
import { getCurrencyOptions, getUserCurrency, setUserCurrency, getCurrencySymbol } from '../utils/currency';

const { Option } = Select;

const CurrencySelector = ({ 
  size = 'default', 
  showLabel = true, 
  style = {},
  onChange = null,
  disabled = false 
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [currencyOptions] = useState(getCurrencyOptions());

  useEffect(() => {
    // Load user's current currency preference
    const currentCurrency = getUserCurrency();
    setSelectedCurrency(currentCurrency);
  }, []);

  const handleCurrencyChange = (value) => {
    if (setUserCurrency(value)) {
      setSelectedCurrency(value);
      
      // Use custom onChange handler if provided, otherwise just update currency
      if (onChange) {
        onChange(value);
      } else {
        // Show success message instead of reloading page
        const currencySymbol = getCurrencySymbol(value);
        message.success(`Currency updated to ${currencySymbol}`);
      }
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', ...style }}>
      {showLabel && (
        <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
          Currency:
        </span>
      )}
      <Tooltip title="Select your preferred currency for displaying prices">
        <Select
          value={selectedCurrency}
          onChange={handleCurrencyChange}
          size={size}
          disabled={disabled}
          style={{ minWidth: '120px' }}
        >
          {currencyOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: '500' }}>{option.symbol}</span>
                <span>{option.name}</span>
              </span>
            </Option>
          ))}
        </Select>
      </Tooltip>
    </div>
  );
};

export default CurrencySelector;
