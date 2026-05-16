import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchRepositories = createAsyncThunk(
  'repository/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/repositories');
      return response.data.repositories;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchRepository = createAsyncThunk(
  'repository/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/repositories/${id}`);
      return response.data.repository;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const analyzeRepository = createAsyncThunk(
  'repository/analyze',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/bob/analyze/${id}`);
      return { id, analysis: response.data.analysis };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteRepository = createAsyncThunk(
  'repository/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/repositories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const repositorySlice = createSlice({
  name: 'repository',
  initialState: {
    repositories: [],
    currentRepository: null,
    loading: false,
    error: null,
    analyzing: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRepository: (state, action) => {
      state.currentRepository = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all repositories
      .addCase(fetchRepositories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRepositories.fulfilled, (state, action) => {
        state.repositories = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single repository
      .addCase(fetchRepository.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRepository.fulfilled, (state, action) => {
        state.currentRepository = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchRepository.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Analyze repository
      .addCase(analyzeRepository.pending, (state) => {
        state.analyzing = true;
      })
      .addCase(analyzeRepository.fulfilled, (state, action) => {
        const { id, analysis } = action.payload;
        // Update repository in list
        const repo = state.repositories.find(r => r.id === id);
        if (repo) {
          repo.analysisStatus = 'completed';
        }
        // Update current repository
        if (state.currentRepository?.id === id) {
          state.currentRepository.analysis = { summary: analysis };
          state.currentRepository.analysisStatus = 'completed';
        }
        state.analyzing = false;
        state.error = null;
      })
      .addCase(analyzeRepository.rejected, (state, action) => {
        state.analyzing = false;
        state.error = action.payload;
      })
      // Delete repository
      .addCase(deleteRepository.fulfilled, (state, action) => {
        state.repositories = state.repositories.filter(r => r.id !== action.payload);
        if (state.currentRepository?.id === action.payload) {
          state.currentRepository = null;
        }
        state.error = null;
      })
      .addCase(deleteRepository.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentRepository } = repositorySlice.actions;
export default repositorySlice.reducer;

// Made with Bob
