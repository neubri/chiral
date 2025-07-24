import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/http";
import Swal from "sweetalert2";

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem("access_token", access_token);

      return { user, access_token };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ name, email, password, learningInterests }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        learningInterests,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      return rejectWithValue(message);
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async ({ googleToken }, { rejectWithValue }) => {
    try {
      const response = await api.post("/google-login", { googleToken });
      const { access_token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem("access_token", access_token);

      return { user, access_token };
    } catch (error) {
      const message = error.response?.data?.message || "Google login failed";
      return rejectWithValue(message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await api.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch profile";
      return rejectWithValue(message);
    }
  }
);

export const updateUserInterests = createAsyncThunk(
  "auth/updateUserInterests",
  async ({ learningInterests }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await api.put(
        "/auth/interests",
        { learningInterests },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.learningInterests;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update interests";
      return rejectWithValue(message);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  access_token: localStorage.getItem("access_token"),
  isAuthenticated: !!localStorage.getItem("access_token"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.access_token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("access_token");
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.access_token = action.payload.access_token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.access_token = action.payload.access_token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Don't set isAuthenticated to false here as it might be a network issue
      })

      // Update Interests
      .addCase(updateUserInterests.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserInterests.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.learningInterests = action.payload;
        }
      })
      .addCase(updateUserInterests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
