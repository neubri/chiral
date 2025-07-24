import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";

// Typed hooks for better TypeScript support (works in JS too)
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Auth hooks
export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    access_token: auth.access_token,
    dispatch,
  };
};

// Articles hooks
export const useArticles = () => {
  const articles = useAppSelector((state) => state.articles);
  const dispatch = useAppDispatch();

  return {
    // Public articles
    publicArticles: articles.publicArticles,
    publicTotal: articles.publicTotal,
    publicCurrentPage: articles.publicCurrentPage,
    publicTag: articles.publicTag,
    publicPerPage: articles.publicPerPage,
    publicLoading: articles.publicLoading,
    publicError: articles.publicError,

    // Personalized articles
    personalizedArticles: articles.personalizedArticles,
    personalizedTotal: articles.personalizedTotal,
    personalizedCurrentPage: articles.personalizedCurrentPage,
    personalizedPerPage: articles.personalizedPerPage,
    personalizedLoading: articles.personalizedLoading,
    personalizedError: articles.personalizedError,

    // Current article
    currentArticle: articles.currentArticle,
    detailLoading: articles.detailLoading,
    detailError: articles.detailError,

    // Cache info
    lastFetchTime: articles.lastFetchTime,
    cacheExpiry: articles.cacheExpiry,

    dispatch,
  };
};

// Notes hooks
export const useNotes = () => {
  const notes = useAppSelector((state) => state.notes);
  const dispatch = useAppDispatch();

  return {
    notes: notes.notes,
    currentNote: notes.currentNote,
    pagination: notes.pagination,
    filters: notes.filters,
    stats: notes.stats,
    loading: notes.loading,
    detailLoading: notes.detailLoading,
    createLoading: notes.createLoading,
    updateLoading: notes.updateLoading,
    deleteLoading: notes.deleteLoading,
    error: notes.error,
    detailError: notes.detailError,
    dispatch,
  };
};

// Highlights hooks
export const useHighlights = () => {
  const highlights = useAppSelector((state) => state.highlights);
  const dispatch = useAppDispatch();

  return {
    highlights: highlights.highlights,
    articleHighlights: highlights.articleHighlights,
    currentHighlight: highlights.currentHighlight,
    pagination: highlights.pagination,
    articlePagination: highlights.articlePagination,
    filters: highlights.filters,
    currentArticleId: highlights.currentArticleId,
    stats: highlights.stats,
    loading: highlights.loading,
    articleLoading: highlights.articleLoading,
    detailLoading: highlights.detailLoading,
    createLoading: highlights.createLoading,
    updateLoading: highlights.updateLoading,
    deleteLoading: highlights.deleteLoading,
    explainLoading: highlights.explainLoading,
    error: highlights.error,
    detailError: highlights.detailError,
    dispatch,
  };
};

// UI hooks
export const useUI = () => {
  const ui = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();

  return {
    globalLoading: ui.globalLoading,
    modals: ui.modals,
    modalData: ui.modalData,
    notifications: ui.notifications,
    aiExplanation: ui.aiExplanation,
    searchQuery: ui.searchQuery,
    activeFilters: ui.activeFilters,
    sidebar: ui.sidebar,
    theme: ui.theme,
    preferences: ui.preferences,
    lastRefresh: ui.lastRefresh,
    needsRefresh: ui.needsRefresh,
    dispatch,
  };
};

// Combined dashboard hook for easier dashboard data management
export const useDashboard = () => {
  const auth = useAuth();
  const notes = useNotes();
  const highlights = useHighlights();
  const ui = useUI();

  const dashboardStats = useCallback(() => {
    const uniqueArticles = new Set(
      (highlights.highlights || []).map((h) => h.articleId)
    ).size;

    // Calculate stats from actual data arrays instead of stats objects
    const totalHighlights = (highlights.highlights || []).length;
    const totalNotes = (notes.notes || []).length;

    // Calculate this week's highlights
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekHighlights = (highlights.highlights || []).filter(
      (h) => new Date(h.createdAt) > oneWeekAgo
    ).length;

    return {
      totalHighlights,
      totalNotes,
      articlesRead: uniqueArticles,
      thisWeekHighlights,
      favoriteNotes: (notes.notes || []).filter((n) => n.isFavorite).length,
      bookmarkedHighlights: (highlights.highlights || []).filter(
        (h) => h.isBookmarked
      ).length,
    };
  }, [highlights.highlights, notes.notes]);

  const isLoading = auth.loading || notes.loading || highlights.loading;
  const hasError = auth.error || notes.error || highlights.error;

  return {
    user: auth.user,
    recentNotes: (notes.notes || []).slice(0, 5),
    recentHighlights: (highlights.highlights || []).slice(0, 5),
    stats: dashboardStats(),
    isLoading,
    hasError,
    needsRefresh: ui?.needsRefresh || false,
    lastRefresh: ui?.lastRefresh || null,
  };
};

// Cache management hook
export const useCache = () => {
  const articles = useArticles();

  const isDataStale = useCallback((lastFetchTime, cacheExpiry) => {
    if (!lastFetchTime) return true;
    return Date.now() - lastFetchTime > cacheExpiry;
  }, []);

  const shouldRefetchArticles = useCallback(() => {
    return isDataStale(articles.lastFetchTime, articles.cacheExpiry);
  }, [articles.lastFetchTime, articles.cacheExpiry, isDataStale]);

  return {
    isDataStale,
    shouldRefetchArticles,
  };
};

// Error handling hook
export const useErrorHandler = () => {
  const dispatch = useAppDispatch();

  const handleError = useCallback(
    (error, context = "") => {
      console.error(`Error in ${context}:`, error);

      // Add notification for user feedback
      dispatch({
        type: "ui/addNotification",
        payload: {
          type: "error",
          title: "Error",
          message: error.message || "An unexpected error occurred",
          duration: 5000,
        },
      });
    },
    [dispatch]
  );

  const handleSuccess = useCallback(
    (message, title = "Success") => {
      dispatch({
        type: "ui/addNotification",
        payload: {
          type: "success",
          title,
          message,
          duration: 3000,
        },
      });
    },
    [dispatch]
  );

  return {
    handleError,
    handleSuccess,
  };
};
