import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Upload as UploadIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon,
  Folder as FolderIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { fetchRepositories, deleteRepository } from '../store/slices/repositorySlice';
import api from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { repositories, loading } = useSelector((state) => state.repository);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [gitUrl, setGitUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setGitUrl('');
    setError(null);
  };

  const handleGitHubConnect = async () => {
    // For GitHub OAuth, redirect to backend
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/github`;
  };

  const handleGitUrlSubmit = async () => {
    if (!gitUrl) {
      setError('Please enter a Git URL');
      return;
    }

    setUploading(true);
    try {
      await api.post('/repositories/git-url', { gitUrl });
      handleCloseDialog();
      dispatch(fetchRepositories());
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to clone repository');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/repositories/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      handleCloseDialog();
      dispatch(fetchRepositories());
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to upload repository');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this repository?')) {
      await dispatch(deleteRepository(id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'analyzing':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Your Repositories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect repositories to start analyzing with IBM Bob
        </Typography>
      </Box>

      {/* Connection Options */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
            onClick={handleGitHubConnect}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <GitHubIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
              <Typography variant="h6" gutterBottom>
                Connect GitHub
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Import from GitHub repository
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
            onClick={() => handleOpenDialog('upload')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <UploadIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
              <Typography variant="h6" gutterBottom>
                Upload ZIP
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload repository as ZIP file
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
            onClick={() => handleOpenDialog('git-url')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <LinkIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
              <Typography variant="h6" gutterBottom>
                Git URL
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Clone from Git URL
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Repository List */}
      {repositories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No repositories yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connect a repository to get started
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {repositories.map((repo) => (
            <Grid item xs={12} md={6} key={repo.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
                onClick={() => navigate(`/repository/${repo.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {repo.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(repo.id, e)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={repo.language || 'Unknown'}
                      size="small"
                      icon={<CodeIcon />}
                    />
                    <Chip
                      label={`${repo.totalFiles || 0} files`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={repo.analysisStatus || 'pending'}
                      size="small"
                      color={getStatusColor(repo.analysisStatus)}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<FolderIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/repository/${repo.id}`);
                      }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ChatIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Create chat session and navigate
                        api.post('/chat/sessions', { repositoryId: repo.id })
                          .then(res => navigate(`/chat/${res.data.session.id}`));
                      }}
                    >
                      Chat
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'upload' ? 'Upload ZIP File' : 'Clone from Git URL'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {dialogType === 'git-url' ? (
            <TextField
              autoFocus
              margin="dense"
              label="Git Repository URL"
              type="url"
              fullWidth
              variant="outlined"
              value={gitUrl}
              onChange={(e) => setGitUrl(e.target.value)}
              placeholder="https://github.com/username/repo.git"
            />
          ) : (
            <Box>
              <input
                accept=".zip"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="raised-button-file">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<UploadIcon />}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Choose ZIP File'}
                </Button>
              </label>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={uploading}>
            Cancel
          </Button>
          {dialogType === 'git-url' && (
            <Button
              onClick={handleGitUrlSubmit}
              variant="contained"
              disabled={uploading}
            >
              {uploading ? <CircularProgress size={24} /> : 'Clone'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Dashboard;

// Made with Bob
