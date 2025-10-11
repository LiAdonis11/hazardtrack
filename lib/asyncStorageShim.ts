// AsyncStorage shim for environments without localStorage (e.g., Node.js SSR)

import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const memoryStorage: Record<string, string> = {};

const AsyncStorageShim = {
  getItem: async (key: string): Promise<string | null> => {
    if (isWeb) {
      try {
        if (typeof sessionStorage !== 'undefined') {
          return sessionStorage.getItem(key);
        }
      } catch (error) {
        console.warn('AsyncStorageShim: Error getting item from sessionStorage:', error);
      }
      // Fallback to memoryStorage
      return memoryStorage[key] || null;
    }
    throw new Error('AsyncStorageShim: getItem called on non-web platform');
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(key, value);
          return;
        }
      } catch (error) {
        console.warn('AsyncStorageShim: Error setting item in sessionStorage:', error);
      }
      // Fallback to memoryStorage
      memoryStorage[key] = value;
      return;
    }
    throw new Error('AsyncStorageShim: setItem called on non-web platform');
  },

  removeItem: async (key: string): Promise<void> => {
    if (isWeb) {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(key);
          return;
        }
      } catch (error) {
        console.warn('AsyncStorageShim: Error removing item from sessionStorage:', error);
      }
      // Fallback to memoryStorage
      delete memoryStorage[key];
      return;
    }
    throw new Error('AsyncStorageShim: removeItem called on non-web platform');
  },

  mergeItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) {
      let mergedValue = value;
      try {
        let existingValue: string | null = null;
        if (typeof localStorage !== 'undefined') {
          existingValue = localStorage.getItem(key);
        }

        if (existingValue) {
          try {
            const existingObj = JSON.parse(existingValue);
            const newObj = JSON.parse(value);
            mergedValue = JSON.stringify({ ...existingObj, ...newObj });
          } catch {
            mergedValue = value;
          }
        }

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, mergedValue);
          return;
        }
      } catch (error) {
        console.warn('AsyncStorageShim: Error merging item in localStorage:', error);
      }
      // Fallback to memoryStorage
      memoryStorage[key] = mergedValue;
      return;
    }
    throw new Error('AsyncStorageShim: mergeItem called on non-web platform');
  },

  clear: async (): Promise<void> => {
    if (isWeb) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
          return;
        }
      } catch (error) {
        console.warn('AsyncStorageShim: Error clearing localStorage:', error);
      }
      // Fallback to memoryStorage
      for (const key in memoryStorage) {
        delete memoryStorage[key];
      }
      return;
    }
    throw new Error('AsyncStorageShim: clear called on non-web platform');
  },

  getAllKeys: async (): Promise<string[]> => {
    if (isWeb) {
      try {
        if (typeof localStorage !== 'undefined') {
          const keys: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) keys.push(key);
          }
          return keys;
        }
      } catch (error) {
        console.warn('AsyncStorageShim: Error getting all keys from localStorage:', error);
      }
      // Fallback to memoryStorage
      return Object.keys(memoryStorage);
    }
    throw new Error('AsyncStorageShim: getAllKeys called on non-web platform');
  },

  multiGet: async (keys: string[]): Promise<[string, string | null][]> => {
    if (isWeb) {
      try {
        if (typeof localStorage !== 'undefined') {
          const result: [string, string | null][] = [];
          for (const key of keys) {
            const value = localStorage.getItem(key);
            result.push([key, value]);
          }
          return result;
        }
      } catch (error) {
        console.warn('AsyncStorageShim: Error in multiGet from localStorage:', error);
      }
      // Fallback to memoryStorage
      return keys.map(key => [key, memoryStorage[key] || null]);
    }
    throw new Error('AsyncStorageShim: multiGet called on non-web platform');
  },

  multiSet: async (keyValuePairs: [string, string][]): Promise<void> => {
    if (isWeb) {
      try {
        if (typeof localStorage !== 'undefined') {
          for (const [key, value] of keyValuePairs) {
            localStorage.setItem(key, value);
          }
          return;
        }
      } catch (error) {
        console.warn('AsyncStorageShim: Error in multiSet to localStorage:', error);
      }
      // Fallback to memoryStorage
      for (const [key, value] of keyValuePairs) {
        memoryStorage[key] = value;
      }
      return;
    }
    throw new Error('AsyncStorageShim: multiSet called on non-web platform');
  },

  multiRemove: async (keys: string[]): Promise<void> => {
    if (isWeb) {
      try {
        if (typeof localStorage !== 'undefined') {
          for (const key of keys) {
            localStorage.removeItem(key);
          }
          return;
        }
      } catch (error) {
        console.warn('AsyncStorageShim: Error in multiRemove from localStorage:', error);
      }
      // Fallback to memoryStorage
      for (const key of keys) {
        delete memoryStorage[key];
      }
      return;
    }
    throw new Error('AsyncStorageShim: multiRemove called on non-web platform');
  },

  multiMerge: async (keyValuePairs: [string, string][]): Promise<void> => {
    if (isWeb) {
      try {
        for (const [key, value] of keyValuePairs) {
          await AsyncStorageShim.mergeItem(key, value);
        }
        return;
      } catch (error) {
        console.warn('AsyncStorageShim: Error in multiMerge to localStorage:', error);
      }
      // Fallback to memoryStorage
      for (const [key, value] of keyValuePairs) {
        memoryStorage[key] = value;
      }
      return;
    }
    throw new Error('AsyncStorageShim: multiMerge called on non-web platform');
  },

  flushGetRequests: async (): Promise<void> => {
    // No-op for web implementation
    return Promise.resolve();
  }
};

export default AsyncStorageShim;
