import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import repositoryReducer from './slices/repositorySlice';
import chatReducer from './slices/chatSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    repository: repositoryReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setUser'],
      },
    }),
});

export default store;

// Made with Bob
