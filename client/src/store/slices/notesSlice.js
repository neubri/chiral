import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/http";

// Async thunks
export const fetchNotes = createAsyncThunk(
  "notes/fetchNotes",
  async (
    { search, noteType, isFavorite, page = 1, limit = 10 } = {},
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (noteType) params.append("noteType", noteType);
      if (isFavorite !== undefined)
        params.append("isFavorite", isFavorite.toString());
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await api.get(`/notes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        notes: response.data.notes,
        pagination: response.data.pagination,
        filters: { search, noteType, isFavorite, page, limit },
      };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch notes";
      return rejectWithValue(message);
    }
  }
);

export const fetchNoteById = createAsyncThunk(
  "notes/fetchNoteById",
  async ({ noteId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await api.get(`/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.note;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch note";
      return rejectWithValue(message);
    }
  }
);

export const createNote = createAsyncThunk(
  "notes/createNote",
  async (noteData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await api.post("/notes", noteData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.note;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create note";
      return rejectWithValue(message);
    }
  }
);

export const updateNote = createAsyncThunk(
  "notes/updateNote",
  async ({ noteId, noteData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await api.put(`/notes/${noteId}`, noteData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.note;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update note";
      return rejectWithValue(message);
    }
  }
);

export const deleteNote = createAsyncThunk(
  "notes/deleteNote",
  async ({ noteId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      await api.delete(`/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return noteId;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete note";
      return rejectWithValue(message);
    }
  }
);

// Initial state
const initialState = {
  notes: [],
  currentNote: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalNotes: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    search: "",
    noteType: "",
    isFavorite: undefined,
    page: 1,
    limit: 10,
  },
  loading: false,
  detailLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  error: null,
  detailError: null,
  // Stats for dashboard
  stats: {
    total: 0,
    traditional: 0,
    highlight: 0,
    favorites: 0,
  },
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.detailError = null;
    },
    clearCurrentNote: (state) => {
      state.currentNote = null;
      state.detailError = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to first page when filters change
      if (
        action.payload.search !== undefined ||
        action.payload.noteType !== undefined ||
        action.payload.isFavorite !== undefined
      ) {
        state.filters.page = 1;
      }
    },
    updateNoteInList: (state, action) => {
      const updatedNote = action.payload;
      const index = state.notes.findIndex((note) => note.id === updatedNote.id);
      if (index !== -1) {
        state.notes[index] = updatedNote;
      }

      // Update current note if it's the same
      if (state.currentNote && state.currentNote.id === updatedNote.id) {
        state.currentNote = updatedNote;
      }
    },
    updateStats: (state) => {
      state.stats.total = state.notes.length;
      state.stats.traditional = state.notes.filter(
        (note) => note.noteType === "traditional"
      ).length;
      state.stats.highlight = state.notes.filter(
        (note) => note.noteType === "highlight"
      ).length;
      state.stats.favorites = state.notes.filter(
        (note) => note.isFavorite
      ).length;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notes
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload.notes;
        state.pagination = action.payload.pagination;
        state.filters = { ...state.filters, ...action.payload.filters };

        // Update stats
        state.stats.total = action.payload.pagination?.totalNotes || 0;
        state.stats.traditional = action.payload.notes.filter(
          (note) => note.noteType === "traditional"
        ).length;
        state.stats.highlight = action.payload.notes.filter(
          (note) => note.noteType === "highlight"
        ).length;
        state.stats.favorites = action.payload.notes.filter(
          (note) => note.isFavorite
        ).length;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Note by ID
      .addCase(fetchNoteById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentNote = action.payload;
      })
      .addCase(fetchNoteById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      })

      // Create Note
      .addCase(createNote.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.createLoading = false;
        state.notes.unshift(action.payload); // Add to beginning of list
        state.stats.total += 1;
        if (action.payload.noteType === "traditional") {
          state.stats.traditional += 1;
        } else if (action.payload.noteType === "highlight") {
          state.stats.highlight += 1;
        }
        if (action.payload.isFavorite) {
          state.stats.favorites += 1;
        }
      })
      .addCase(createNote.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // Update Note
      .addCase(updateNote.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedNote = action.payload;
        const index = state.notes.findIndex(
          (note) => note.id === updatedNote.id
        );

        if (index !== -1) {
          const oldNote = state.notes[index];
          state.notes[index] = updatedNote;

          // Update stats based on changes
          if (oldNote.isFavorite !== updatedNote.isFavorite) {
            state.stats.favorites += updatedNote.isFavorite ? 1 : -1;
          }
        }

        // Update current note if it's the same
        if (state.currentNote && state.currentNote.id === updatedNote.id) {
          state.currentNote = updatedNote;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Delete Note
      .addCase(deleteNote.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const noteId = action.payload;
        const noteIndex = state.notes.findIndex((note) => note.id === noteId);

        if (noteIndex !== -1) {
          const deletedNote = state.notes[noteIndex];
          state.notes.splice(noteIndex, 1);

          // Update stats
          state.stats.total -= 1;
          if (deletedNote.noteType === "traditional") {
            state.stats.traditional -= 1;
          } else if (deletedNote.noteType === "highlight") {
            state.stats.highlight -= 1;
          }
          if (deletedNote.isFavorite) {
            state.stats.favorites -= 1;
          }
        }

        // Clear current note if it was deleted
        if (state.currentNote && state.currentNote.id === noteId) {
          state.currentNote = null;
        }
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentNote,
  setFilters,
  updateNoteInList,
  updateStats,
} = notesSlice.actions;

export default notesSlice.reducer;
