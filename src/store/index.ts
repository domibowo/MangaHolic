import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { reduxStorage } from './persist';
import libraryReducer from './librarySlice';
import { mangadexApi } from '../api/mangadexApi';

const rootReducer = combineReducers({
  library: libraryReducer,
  [mangadexApi.reducerPath]: mangadexApi.reducer,
});

const persistedReducer = persistReducer(
  // mangadexApi = cache server-state RTK Query, tidak perlu (dan tidak boleh)
  // di-persist ke MMKV — hanya `library` yang disimpan lokal.
  { key: 'root', storage: reduxStorage, blacklist: [mangadexApi.reducerPath] },
  rootReducer,
);

// Reactotron cuma ada di devDependencies — import lewat require() supaya
// tidak pernah masuk bundle release (lihat src/config/ReactotronConfig.ts).
// Dilewati juga di lingkungan test (Jest, tanpa XMLHttpRequest global).
const isTestEnv = typeof jest !== 'undefined';
const reactotronEnhancer: any =
  __DEV__ && !isTestEnv ? require('../config/ReactotronConfig').default.createEnhancer() : undefined;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(mangadexApi.middleware),
  enhancers: (getDefaultEnhancers) =>
    reactotronEnhancer ? getDefaultEnhancers().concat(reactotronEnhancer) : getDefaultEnhancers(),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
