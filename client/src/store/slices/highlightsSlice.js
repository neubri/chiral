import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/http";

// Async thunks
export const fetchHighlights = createAsyncThunk(
  "highlights/fetchHighlights",
  async (
    { search, articleId, tags, isBookmarked, page = 1, limit = 10 } = {},
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (articleId) params.append("articleId", articleId);
      if (tags) params.append("tags", tags);
      if (isBookmarked !== undefined)
        params.append("isBookmarked", isBookmarked.toString());
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await api.get(`/highlights?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        highlights: response.data.highlights,
        pagination: response.data.pagination,
        filters: { search, articleId, tags, isBookmarked, page, limit },
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch highlights";
      return rejectWithValue(message);
    }
  }
);

export const fetchHighlightById = createAsyncThunk(
  "highlights/fetchHighlightById",
  async ({ highlightId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await api.get(`/highlights/${highlightId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.highlight;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch highlight";
      return rejectWithValue(message);
    }
  }
);

export const fetchArticleHighlights = createAsyncThunk(
  "highlights/fetchArticleHighlights",
  async ({ articleId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await api.get(
        `/articles/${articleId}/highlights?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return {
        highlights: response.data.highlights,
        pagination: response.data.pagination,
        articleId,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch article highlights";
      return rejectWithValue(message);
    }
  }
);

export const createHighlight = createAsyncThunk(
  "highlights/createHighlight",
  async (highlightData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await api.post("/highlights", highlightData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.highlight;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create highlight";
      return rejectWithValue(message);
    }
  }
);

export const updateHighlight = createAsyncThunk(
  "highlights/updateHighlight",
  async ({ highlightId, highlightData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await api.put(
        `/highlights/${highlightId}`,
        highlightData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.highlight;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update highlight";
      return rejectWithValue(message);
    }
  }
);

export const deleteHighlight = createAsyncThunk(
  "highlights/deleteHighlight",
  async ({ highlightId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      await api.delete(`/highlights/${highlightId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return highlightId;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete highlight";
      return rejectWithValue(message);
    }
  }
);

export const explainHighlight = createAsyncThunk(
  "highlights/explainHighlight",
  async ({ highlightId, regenerate = false }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await api.post(
        `/highlights/${highlightId}/explain`,
        { regenerate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data.highlight;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to explain highlight";
      return rejectWithValue(message);
    }
  }
);

// Initial state
const initialState = {
  highlights: [],
  articleHighlights: [], // Highlights for a specific article
  currentHighlight: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalHighlights: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  articlePagination: {
    currentPage: 1,
    totalPages: 1,
    totalHighlights: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    search: "",
    searchTerm: "", // For client-side filtering
    articleId: "",
    tags: "",
    isBookmarked: undefined,
    sortBy: "newest", // For client-side sorting
    filterBy: "all", // For client-side filtering
    page: 1,
    limit: 10,
  },
  currentArticleId: null,
  loading: false,
  articleLoading: false,
  detailLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  explainLoading: false,
  error: null,
  detailError: null,
  // Stats for dashboard
  stats: {
    total: 0,
    withExplanation: 0,
    bookmarked: 0,
    thisWeek: 0,
  },
};

const highlightsSlice = createSlice({
  name: "highlights",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.detailError = null;
    },
    clearCurrentHighlight: (state) => {
      state.currentHighlight = null;
      state.detailError = null;
    },
    clearArticleHighlights: (state) => {
      state.articleHighlights = [];
      state.currentArticleId = null;
      state.articlePagination = initialState.articlePagination;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to first page when filters change
      if (
        action.payload.search !== undefined ||
        action.payload.articleId !== undefined ||
        action.payload.tags !== undefined ||
        action.payload.isBookmarked !== undefined
      ) {
        state.filters.page = 1;
      }
    },
    updateHighlightInList: (state, action) => {
      const updatedHighlight = action.payload;

      // Update in main highlights list
      const index = state.highlights.findIndex(
        (h) => h.id === updatedHighlight.id
      );
      if (index !== -1) {
        state.highlights[index] = updatedHighlight;
      }

      // Update in article highlights list
      const articleIndex = state.articleHighlights.findIndex(
        (h) => h.id === updatedHighlight.id
      );
      if (articleIndex !== -1) {
        state.articleHighlights[articleIndex] = updatedHighlight;
      }

      // Update current highlight if it's the same
      if (
        state.currentHighlight &&
        state.currentHighlight.id === updatedHighlight.id
      ) {
        state.currentHighlight = updatedHighlight;
      }
    },
    updateStats: (state) => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      state.stats.total = state.highlights.length;
      state.stats.withExplanation = state.highlights.filter(
        (h) => h.explanation
      ).length;
      state.stats.bookmarked = state.highlights.filter(
        (h) => h.isBookmarked
      ).length;
      state.stats.thisWeek = state.highlights.filter(
        (h) => new Date(h.createdAt) > weekAgo
      ).length;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Highlights
      .addCase(fetchHighlights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHighlights.fulfilled, (state, action) => {
        state.loading = false;
        state.highlights = action.payload.highlights;
        state.pagination = action.payload.pagination;
        state.filters = { ...state.filters, ...action.payload.filters };

        // Update stats
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        state.stats.total = action.payload.pagination?.totalHighlights || 0;
        state.stats.withExplanation = action.payload.highlights.filter(
          (h) => h.explanation
        ).length;
        state.stats.bookmarked = action.payload.highlights.filter(
          (h) => h.isBookmarked
        ).length;
        state.stats.thisWeek = action.payload.highlights.filter(
          (h) => new Date(h.createdAt) > weekAgo
        ).length;
      })
      .addCase(fetchHighlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Highlight by ID
      .addCase(fetchHighlightById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchHighlightById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentHighlight = action.payload;
      })
      .addCase(fetchHighlightById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      })

      // Fetch Article Highlights
      .addCase(fetchArticleHighlights.pending, (state) => {
        state.articleLoading = true;
        state.error = null;
      })
      .addCase(fetchArticleHighlights.fulfilled, (state, action) => {
        state.articleLoading = false;
        state.articleHighlights = action.payload.highlights;
        state.articlePagination = action.payload.pagination;
        state.currentArticleId = action.payload.articleId;
      })
      .addCase(fetchArticleHighlights.rejected, (state, action) => {
        state.articleLoading = false;
        state.error = action.payload;
      })

      // Create Highlight
      .addCase(createHighlight.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createHighlight.fulfilled, (state, action) => {
        state.createLoading = false;
        const newHighlight = action.payload;

        // Add to main highlights list
        state.highlights.unshift(newHighlight);

        // Add to article highlights if it's for the current article
        if (state.currentArticleId === newHighlight.articleId) {
          state.articleHighlights.unshift(newHighlight);
        }

        // Update stats
        state.stats.total += 1;
        if (newHighlight.explanation) {
          state.stats.withExplanation += 1;
        }
        if (newHighlight.isBookmarked) {
          state.stats.bookmarked += 1;
        }
      })
      .addCase(createHighlight.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // Update Highlight
      .addCase(updateHighlight.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateHighlight.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedHighlight = action.payload;

        // Update in main highlights list
        const index = state.highlights.findIndex(
          (h) => h.id === updatedHighlight.id
        );
        if (index !== -1) {
          const oldHighlight = state.highlights[index];
          state.highlights[index] = updatedHighlight;

          // Update stats based on changes
          if (oldHighlight.isBookmarked !== updatedHighlight.isBookmarked) {
            state.stats.bookmarked += updatedHighlight.isBookmarked ? 1 : -1;
          }
          if (!!oldHighlight.explanation !== !!updatedHighlight.explanation) {
            state.stats.withExplanation += updatedHighlight.explanation
              ? 1
              : -1;
          }
        }

        // Update in article highlights list
        const articleIndex = state.articleHighlights.findIndex(
          (h) => h.id === updatedHighlight.id
        );
        if (articleIndex !== -1) {
          state.articleHighlights[articleIndex] = updatedHighlight;
        }

        // Update current highlight if it's the same
        if (
          state.currentHighlight &&
          state.currentHighlight.id === updatedHighlight.id
        ) {
          state.currentHighlight = updatedHighlight;
        }
      })
      .addCase(updateHighlight.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Delete Highlight
      .addCase(deleteHighlight.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteHighlight.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const highlightId = action.payload;

        // Remove from main highlights list
        const highlightIndex = state.highlights.findIndex(
          (h) => h.id === highlightId
        );
        if (highlightIndex !== -1) {
          const deletedHighlight = state.highlights[highlightIndex];
          state.highlights.splice(highlightIndex, 1);

          // Update stats
          state.stats.total -= 1;
          if (deletedHighlight.explanation) {
            state.stats.withExplanation -= 1;
          }
          if (deletedHighlight.isBookmarked) {
            state.stats.bookmarked -= 1;
          }
        }

        // Remove from article highlights list
        const articleHighlightIndex = state.articleHighlights.findIndex(
          (h) => h.id === highlightId
        );
        if (articleHighlightIndex !== -1) {
          state.articleHighlights.splice(articleHighlightIndex, 1);
        }

        // Clear current highlight if it was deleted
        if (
          state.currentHighlight &&
          state.currentHighlight.id === highlightId
        ) {
          state.currentHighlight = null;
        }
      })
      .addCase(deleteHighlight.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })

      // Explain Highlight
      .addCase(explainHighlight.pending, (state) => {
        state.explainLoading = true;
        state.error = null;
      })
      .addCase(explainHighlight.fulfilled, (state, action) => {
        state.explainLoading = false;
        const updatedHighlight = action.payload;

        // Update in main highlights list
        const index = state.highlights.findIndex(
          (h) => h.id === updatedHighlight.id
        );
        if (index !== -1) {
          const oldHighlight = state.highlights[index];
          state.highlights[index] = {
            ...state.highlights[index],
            ...updatedHighlight,
          };

          // Update stats if explanation was added
          if (!oldHighlight.explanation && updatedHighlight.explanation) {
            state.stats.withExplanation += 1;
          }
        }

        // Update in article highlights list
        const articleIndex = state.articleHighlights.findIndex(
          (h) => h.id === updatedHighlight.id
        );
        if (articleIndex !== -1) {
          state.articleHighlights[articleIndex] = {
            ...state.articleHighlights[articleIndex],
            ...updatedHighlight,
          };
        }

        // Update current highlight if it's the same
        if (
          state.currentHighlight &&
          state.currentHighlight.id === updatedHighlight.id
        ) {
          state.currentHighlight = {
            ...state.currentHighlight,
            ...updatedHighlight,
          };
        }
      })
      .addCase(explainHighlight.rejected, (state, action) => {
        state.explainLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentHighlight,
  clearArticleHighlights,
  setFilters,
  updateHighlightInList,
  updateStats,
} = highlightsSlice.actions;

export default highlightsSlice.reducer;
