import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/http";

// Async thunk for AI explanation
export const explainText = createAsyncThunk(
  "ui/explainText",
  async ({ highlightedText, context }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await api.post(
        "/gemini/explain",
        { highlightedText, context },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return {
        highlightedText: response.data.highlightedText,
        explanation: response.data.explanation,
        context: response.data.context,
      };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to explain text";
      return rejectWithValue(message);
    }
  }
);

// Initial state
const initialState = {
  // Loading states for global operations
  globalLoading: false,

  // Modal states
  modals: {
    createNote: false,
    editNote: false,
    createHighlight: false,
    editHighlight: false,
    confirmDelete: false,
    explainText: false,
  },

  // Current modal data
  modalData: {
    noteToEdit: null,
    highlightToEdit: null,
    itemToDelete: null,
    textToExplain: null,
  },

  // Toast/notification states
  notifications: [],

  // AI explanation state
  aiExplanation: {
    loading: false,
    error: null,
    result: null,
    highlightedText: "",
    context: "",
  },

  // Search and filter states
  searchQuery: "",
  activeFilters: {},

  // Layout states
  sidebar: {
    open: false,
    mobile: false,
  },

  // Theme and preferences
  theme: "light",
  preferences: {
    autoExplain: true,
    showTutorial: true,
    defaultNoteType: "traditional",
  },

  // Dashboard refresh state
  lastRefresh: null,
  needsRefresh: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Modal actions
    openModal: (state, action) => {
      const { modalType, data = null } = action.payload;
      state.modals[modalType] = true;
      if (data) {
        state.modalData[
          `${modalType.replace("create", "").replace("edit", "")}ToEdit`
        ] = data;
      }
    },
    closeModal: (state, action) => {
      const modalType = action.payload;
      state.modals[modalType] = false;
      // Clear modal data when closing
      if (modalType.includes("edit") || modalType.includes("create")) {
        const dataKey = `${modalType
          .replace("create", "")
          .replace("edit", "")}ToEdit`;
        state.modalData[dataKey] = null;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((modal) => {
        state.modals[modal] = false;
      });
      // Clear all modal data
      Object.keys(state.modalData).forEach((key) => {
        state.modalData[key] = null;
      });
    },

    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      state.notifications = state.notifications.filter(
        (notif) => notif.id !== notificationId
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Search and filter actions
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setActiveFilters: (state, action) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    clearActiveFilters: (state) => {
      state.activeFilters = {};
    },

    // Layout actions
    toggleSidebar: (state) => {
      state.sidebar.open = !state.sidebar.open;
    },
    setSidebarOpen: (state, action) => {
      state.sidebar.open = action.payload;
    },
    setSidebarMobile: (state, action) => {
      state.sidebar.mobile = action.payload;
    },

    // Global loading
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },

    // AI explanation actions
    clearAiExplanation: (state) => {
      state.aiExplanation.result = null;
      state.aiExplanation.error = null;
      state.aiExplanation.highlightedText = "";
      state.aiExplanation.context = "";
    },
    setTextToExplain: (state, action) => {
      const { highlightedText, context } = action.payload;
      state.aiExplanation.highlightedText = highlightedText;
      state.aiExplanation.context = context || "";
    },

    // Theme and preferences
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    // Dashboard refresh
    setLastRefresh: (state) => {
      state.lastRefresh = Date.now();
      state.needsRefresh = false;
    },
    setNeedsRefresh: (state, action) => {
      state.needsRefresh = action.payload;
    },

    // Batch actions for performance
    batchUpdate: (state, action) => {
      const updates = action.payload;
      Object.keys(updates).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(state, key)) {
          state[key] = { ...state[key], ...updates[key] };
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Explain Text
      .addCase(explainText.pending, (state) => {
        state.aiExplanation.loading = true;
        state.aiExplanation.error = null;
      })
      .addCase(explainText.fulfilled, (state, action) => {
        state.aiExplanation.loading = false;
        state.aiExplanation.result = action.payload;
        state.aiExplanation.highlightedText = action.payload.highlightedText;
        state.aiExplanation.context = action.payload.context;
      })
      .addCase(explainText.rejected, (state, action) => {
        state.aiExplanation.loading = false;
        state.aiExplanation.error = action.payload;
      });
  },
});

export const {
  // Modal actions
  openModal,
  closeModal,
  closeAllModals,

  // Notification actions
  addNotification,
  removeNotification,
  clearNotifications,

  // Search and filter actions
  setSearchQuery,
  setActiveFilters,
  clearActiveFilters,

  // Layout actions
  toggleSidebar,
  setSidebarOpen,
  setSidebarMobile,

  // Global loading
  setGlobalLoading,

  // AI explanation actions
  clearAiExplanation,
  setTextToExplain,

  // Theme and preferences
  setTheme,
  updatePreferences,

  // Dashboard refresh
  setLastRefresh,
  setNeedsRefresh,

  // Batch actions
  batchUpdate,
} = uiSlice.actions;

export default uiSlice.reducer;
