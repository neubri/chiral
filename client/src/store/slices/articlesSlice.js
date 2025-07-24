import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/http";

// Async thunks
export const fetchPublicArticles = createAsyncThunk(
  "articles/fetchPublicArticles",
  async ({ tag, per_page = 10, page = 1 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (tag) params.append("tag", tag);
      params.append("per_page", per_page.toString());
      params.append("page", page.toString());

      const response = await api.get(`/articles?${params.toString()}`);
      return {
        articles: response.data.articles,
        total: response.data.total,
        currentPage: page,
        tag,
        per_page,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch articles";
      return rejectWithValue(message);
    }
  }
);

export const fetchArticleDetail = createAsyncThunk(
  "articles/fetchArticleDetail",
  async ({ articleId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/articles/${articleId}`);
      return response.data.article;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch article";
      return rejectWithValue(message);
    }
  }
);

export const fetchPersonalizedArticles = createAsyncThunk(
  "articles/fetchPersonalizedArticles",
  async ({ per_page = 20, page = 1 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const params = new URLSearchParams();
      params.append("per_page", per_page.toString());
      params.append("page", page.toString());

      const response = await api.get(`/my-articles?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        articles: response.data.articles,
        total: response.data.total,
        currentPage: page,
        per_page,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to fetch personalized articles";
      return rejectWithValue(message);
    }
  }
);

// Initial state
const initialState = {
  // Public articles
  publicArticles: [],
  publicTotal: 0,
  publicCurrentPage: 1,
  publicTag: "programming",
  publicPerPage: 10,

  // Personalized articles
  personalizedArticles: [],
  personalizedTotal: 0,
  personalizedCurrentPage: 1,
  personalizedPerPage: 20,

  // Article detail
  currentArticle: null,

  // Loading states
  publicLoading: false,
  personalizedLoading: false,
  detailLoading: false,

  // Error states
  publicError: null,
  personalizedError: null,
  detailError: null,

  // Cache management
  lastFetchTime: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
};

const articlesSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.publicError = null;
      state.personalizedError = null;
      state.detailError = null;
    },
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
      state.detailError = null;
    },
    setPublicFilter: (state, action) => {
      const { tag, per_page } = action.payload;
      if (tag !== undefined) state.publicTag = tag;
      if (per_page !== undefined) state.publicPerPage = per_page;
      state.publicCurrentPage = 1; // Reset to first page when filter changes
    },
    updateArticleInLists: (state, action) => {
      const updatedArticle = action.payload;

      // Update in public articles if exists
      const publicIndex = state.publicArticles.findIndex(
        (a) => a.id === updatedArticle.id
      );
      if (publicIndex !== -1) {
        state.publicArticles[publicIndex] = {
          ...state.publicArticles[publicIndex],
          ...updatedArticle,
        };
      }

      // Update in personalized articles if exists
      const personalizedIndex = state.personalizedArticles.findIndex(
        (a) => a.id === updatedArticle.id
      );
      if (personalizedIndex !== -1) {
        state.personalizedArticles[personalizedIndex] = {
          ...state.personalizedArticles[personalizedIndex],
          ...updatedArticle,
        };
      }

      // Update current article if it's the same
      if (
        state.currentArticle &&
        state.currentArticle.id === updatedArticle.id
      ) {
        state.currentArticle = { ...state.currentArticle, ...updatedArticle };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Public Articles
      .addCase(fetchPublicArticles.pending, (state) => {
        state.publicLoading = true;
        state.publicError = null;
      })
      .addCase(fetchPublicArticles.fulfilled, (state, action) => {
        state.publicLoading = false;
        state.publicArticles = action.payload.articles;
        state.publicTotal = action.payload.total;
        state.publicCurrentPage = action.payload.currentPage;
        state.publicTag = action.payload.tag;
        state.publicPerPage = action.payload.per_page;
        state.lastFetchTime = Date.now();
      })
      .addCase(fetchPublicArticles.rejected, (state, action) => {
        state.publicLoading = false;
        state.publicError = action.payload;
      })

      // Fetch Article Detail
      .addCase(fetchArticleDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchArticleDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentArticle = action.payload;
      })
      .addCase(fetchArticleDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      })

      // Fetch Personalized Articles
      .addCase(fetchPersonalizedArticles.pending, (state) => {
        state.personalizedLoading = true;
        state.personalizedError = null;
      })
      .addCase(fetchPersonalizedArticles.fulfilled, (state, action) => {
        state.personalizedLoading = false;
        state.personalizedArticles = action.payload.articles;
        state.personalizedTotal = action.payload.total;
        state.personalizedCurrentPage = action.payload.currentPage;
        state.personalizedPerPage = action.payload.per_page;
      })
      .addCase(fetchPersonalizedArticles.rejected, (state, action) => {
        state.personalizedLoading = false;
        state.personalizedError = action.payload;
      });
  },
});

export const {
  clearErrors,
  clearCurrentArticle,
  setPublicFilter,
  updateArticleInLists,
} = articlesSlice.actions;

export default articlesSlice.reducer;
