import { createMMKV } from 'react-native-mmkv';
import type { Storage } from 'redux-persist';

export const mmkvStorage = createMMKV({ id: 'mangaholic-storage' });

export const reduxStorage: Storage = {
  setItem: (key, value) => {
    mmkvStorage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key) => {
    const value = mmkvStorage.getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: (key) => {
    mmkvStorage.remove(key);
    return Promise.resolve();
  },
};
