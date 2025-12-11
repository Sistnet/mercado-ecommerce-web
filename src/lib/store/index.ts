/**
 * Redux Store Configuration
 * Baseado na estrutura de providers do Flutter (di_container.dart)
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Slices
import authReducer from './slices/auth.slice';
import configReducer from './slices/config.slice';
import cartReducer from './slices/cart.slice';
import productsReducer from './slices/products.slice';
import categoriesReducer from './slices/categories.slice';
import ordersReducer from './slices/orders.slice';
import profileReducer from './slices/profile.slice';
import addressReducer from './slices/address.slice';
import walletReducer from './slices/wallet.slice';
import wishlistReducer from './slices/wishlist.slice';
import couponReducer from './slices/coupon.slice';
import notificationsReducer from './slices/notifications.slice';
import searchReducer from './slices/search.slice';
import themeReducer from './slices/theme.slice';
import bannersReducer from './slices/banners.slice';
import tenantReducer from './slices/tenant.slice';

const rootReducer = combineReducers({
  auth: authReducer,
  config: configReducer,
  cart: cartReducer,
  products: productsReducer,
  categories: categoriesReducer,
  orders: ordersReducer,
  profile: profileReducer,
  address: addressReducer,
  wallet: walletReducer,
  wishlist: wishlistReducer,
  coupon: couponReducer,
  notifications: notificationsReducer,
  search: searchReducer,
  theme: themeReducer,
  banners: bannersReducer,
  tenant: tenantReducer,
});

export const makeStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore estas actions para serialização
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });

  setupListeners(store.dispatch);

  return store;
};

// Tipos inferidos
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];
