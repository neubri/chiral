import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import articlesReducer from "./slices/articlesSlice";
import notesReducer from "./slices/notesSlice";
import highlightsReducer from "./slices/highlightsSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    articles: articlesReducer,
    notes: notesReducer,
    highlights: highlightsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

// Export store types for use in components
export default store;
