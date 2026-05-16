import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchChatSessions = createAsyncThunk(
  'chat/fetchSessions',
  async (repositoryId, { rejectWithValue }) => {
    try {
      const url = repositoryId 
        ? `/chat/repository/${repositoryId}/sessions`
        : '/chat/sessions';
      const response = await api.get(url);
      return response.data.sessions;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createChatSession = createAsyncThunk(
  'chat/createSession',
  async ({ repositoryId, title }, { rejectWithValue }) => {
    try {
      const response = await api.post('/chat/sessions', { repositoryId, title });
      return response.data.session;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchChatSession = createAsyncThunk(
  'chat/fetchSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/sessions/${sessionId}`);
      return response.data.session;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ sessionId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/chat/sessions/${sessionId}/messages`, { message });
      return {
        userMessage: message,
        bobResponse: response.data.response
      };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const switchMode = createAsyncThunk(
  'chat/switchMode',
  async ({ sessionId, mode }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/chat/sessions/${sessionId}/mode`, { mode });
      return response.data.mode;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteChatSession = createAsyncThunk(
  'chat/deleteSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      return sessionId;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    sessions: [],
    currentSession: null,
    loading: false,
    sending: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    addMessageLocally: (state, action) => {
      if (state.currentSession) {
        state.currentSession.messages.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sessions
      .addCase(fetchChatSessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatSessions.fulfilled, (state, action) => {
        state.sessions = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchChatSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create session
      .addCase(createChatSession.fulfilled, (state, action) => {
        state.sessions.unshift(action.payload);
        state.currentSession = action.payload;
        state.error = null;
      })
      .addCase(createChatSession.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch single session
      .addCase(fetchChatSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchChatSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (state.currentSession) {
          const { userMessage, bobResponse } = action.payload;
          state.currentSession.messages.push(
            {
              role: 'user',
              content: userMessage,
              timestamp: new Date().toISOString()
            },
            {
              role: 'assistant',
              content: bobResponse.content,
              timestamp: bobResponse.timestamp,
              metadata: { mode: bobResponse.mode }
            }
          );
        }
        state.sending = false;
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })
      // Switch mode
      .addCase(switchMode.fulfilled, (state, action) => {
        if (state.currentSession) {
          state.currentSession.context.mode = action.payload;
        }
        state.error = null;
      })
      .addCase(switchMode.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete session
      .addCase(deleteChatSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(s => s.id !== action.payload);
        if (state.currentSession?.id === action.payload) {
          state.currentSession = null;
        }
        state.error = null;
      })
      .addCase(deleteChatSession.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentSession, addMessageLocally } = chatSlice.actions;
export default chatSlice.reducer;

// Made with Bob
