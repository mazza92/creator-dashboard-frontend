import CryptoJS from 'crypto-js';
import env from '../config/env';

const ENCRYPTION_KEY = env.ENCRYPTION_KEY || 'your-fallback-encryption-key';

class SecureStorage {
  constructor() {
    this.storage = window.localStorage;
  }

  // Encrypt data before storing
  encrypt(data) {
    try {
      const jsonString = JSON.stringify(data);
      return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  // Decrypt data after retrieving
  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  // Store data securely
  setItem(key, value) {
    try {
      const encryptedValue = this.encrypt(value);
      if (encryptedValue) {
        this.storage.setItem(key, encryptedValue);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  }

  // Retrieve and decrypt data
  getItem(key) {
    try {
      const encryptedValue = this.storage.getItem(key);
      if (encryptedValue) {
        return this.decrypt(encryptedValue);
      }
      return null;
    } catch (error) {
      console.error('Retrieval error:', error);
      return null;
    }
  }

  // Remove data
  removeItem(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Removal error:', error);
      return false;
    }
  }

  // Clear all data
  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Clear error:', error);
      return false;
    }
  }

  // Store sensitive user data
  setUserData(data) {
    return this.setItem('userData', data);
  }

  // Get sensitive user data
  getUserData() {
    return this.getItem('userData');
  }

  // Store auth tokens
  setAuthTokens(tokens) {
    return this.setItem('authTokens', tokens);
  }

  // Get auth tokens
  getAuthTokens() {
    return this.getItem('authTokens');
  }

  // Clear auth data
  clearAuth() {
    this.removeItem('authTokens');
    this.removeItem('userData');
  }

  // Store temporary data (not encrypted)
  setTempData(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Temp storage error:', error);
      return false;
    }
  }

  // Get temporary data
  getTempData(key) {
    try {
      const value = this.storage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Temp retrieval error:', error);
      return null;
    }
  }
}

export const secureStorage = new SecureStorage();
export default secureStorage; 