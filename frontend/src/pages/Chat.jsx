import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BobIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { fetchChatSession, sendMessage, switchMode } from '../store/slices/chatSlice';

function Chat() {
  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const { currentSession, sending } = useSelector((state) => state.chat);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchChatSession(sessionId));
  }, [dispatch, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    const messageText = message;
    setMessage('');
    await dispatch(sendMessage({ sessionId, message: messageText }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleModeChange = (event) => {
    dispatch(switchMode({ sessionId, mode: event.target.value }));
  };

  const getModeColor = (mode) => {
    const colors = {
      code: 'primary',
      ask: 'secondary',
      plan: 'info',
      advanced: 'warning',
      orchestrator: 'error',
    };
    return colors[mode] || 'default';
  };

  if (!currentSession) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', py: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {currentSession.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Repository: {currentSession.repository?.name}
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Bob Mode</InputLabel>
            <Select
              value={currentSession.context?.mode || 'ask'}
              label="Bob Mode"
              onChange={handleModeChange}
            >
              <MenuItem value="code">Code</MenuItem>
              <MenuItem value="ask">Ask</MenuItem>
              <MenuItem value="plan">Plan</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
              <MenuItem value="orchestrator">Orchestrator</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Messages */}
      <Paper sx={{ flexGrow: 1, overflow: 'auto', p: 2, mb: 2 }}>
        {currentSession.messages?.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <BobIcon sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Chat with IBM Bob
            </Typography>
            <Typography variant="body2" align="center">
              Ask questions about your code, request explanations, or get help with development tasks.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip label="Explain this code" size="small" />
              <Chip label="Generate tests" size="small" />
              <Chip label="Refactor suggestions" size="small" />
              <Chip label="Add documentation" size="small" />
            </Box>
          </Box>
        ) : (
          <Box>
            {currentSession.messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  mb: 3,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                    mx: 1,
                  }}
                >
                  {msg.role === 'user' ? <PersonIcon /> : <BobIcon />}
                </Avatar>
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: msg.role === 'user' ? 'primary.light' : 'grey.100',
                    color: msg.role === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  {msg.metadata?.mode && (
                    <Chip
                      label={`${msg.metadata.mode} mode`}
                      size="small"
                      color={getModeColor(msg.metadata.mode)}
                      sx={{ mb: 1 }}
                    />
                  )}
                  <Box sx={{ '& p': { margin: 0 }, '& pre': { bgcolor: 'rgba(0,0,0,0.05)', p: 1, borderRadius: 1 } }}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </Box>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {sending && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mx: 1 }}>
                  <BobIcon />
                </Avatar>
                <Paper sx={{ p: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                    Bob is thinking...
                  </Typography>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Paper>

      {/* Input */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask IBM Bob anything about your code..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!message.trim() || sending}
            sx={{ alignSelf: 'flex-end' }}
          >
            <SendIcon />
          </IconButton>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Current mode: <strong>{currentSession.context?.mode || 'ask'}</strong> • Press Enter to send, Shift+Enter for new line
        </Typography>
      </Paper>
    </Container>
  );
}

export default Chat;

// Made with Bob
