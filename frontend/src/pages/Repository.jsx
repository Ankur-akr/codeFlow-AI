import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  ExpandLess,
  ExpandMore,
  Chat as ChatIcon,
  Analytics as AnalyticsIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { fetchRepository, analyzeRepository } from '../store/slices/repositorySlice';
import api from '../services/api';

function Repository() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentRepository, loading, analyzing } = useSelector((state) => state.repository);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({});

  useEffect(() => {
    dispatch(fetchRepository(id));
  }, [dispatch, id]);

  const handleAnalyze = () => {
    dispatch(analyzeRepository(id));
  };

  const handleCreateChat = async () => {
    try {
      const response = await api.post('/chat/sessions', { repositoryId: id });
      navigate(`/chat/${response.data.session.id}`);
    } catch (error) {
      console.error('Failed to create chat session:', error);
    }
  };

  const handleFileClick = async (filePath) => {
    setSelectedFile(filePath);
    setLoadingFile(true);
    try {
      const response = await api.get(`/repositories/${id}/files/${filePath}`);
      setFileContent(response.data.content);
    } catch (error) {
      console.error('Failed to load file:', error);
      setFileContent('// Failed to load file content');
    } finally {
      setLoadingFile(false);
    }
  };

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const renderFileTree = (tree, basePath = '') => {
    return Object.entries(tree).map(([name, value]) => {
      const currentPath = basePath ? `${basePath}/${name}` : name;

      if (value.type === 'file') {
        return (
          <ListItem key={currentPath} disablePadding sx={{ pl: basePath.split('/').length * 2 }}>
            <ListItemButton onClick={() => handleFileClick(value.path)}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <FileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={name}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>
        );
      } else {
        const isExpanded = expandedFolders[currentPath];
        return (
          <React.Fragment key={currentPath}>
            <ListItem disablePadding sx={{ pl: basePath.split('/').length * 2 }}>
              <ListItemButton onClick={() => toggleFolder(currentPath)}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <FolderIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={name}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                />
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              {renderFileTree(value, currentPath)}
            </Collapse>
          </React.Fragment>
        );
      }
    });
  };

  const getLanguage = (filePath) => {
    const ext = filePath?.split('.').pop()?.toLowerCase();
    const langMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      go: 'go',
      rb: 'ruby',
      php: 'php',
      cs: 'csharp',
      cpp: 'cpp',
      c: 'c',
      rs: 'rust',
      swift: 'swift',
      kt: 'kotlin',
      json: 'json',
      xml: 'xml',
      html: 'html',
      css: 'css',
      md: 'markdown',
    };
    return langMap[ext] || 'text';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentRepository) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Repository not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {currentRepository.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={currentRepository.metadata?.language || 'Unknown'} />
          <Chip label={currentRepository.metadata?.framework || 'Unknown'} variant="outlined" />
          <Chip label={`${currentRepository.metadata?.totalFiles || 0} files`} variant="outlined" />
          <Chip
            label={currentRepository.analysisStatus || 'pending'}
            color={currentRepository.analysisStatus === 'completed' ? 'success' : 'default'}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AnalyticsIcon />}
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? 'Analyzing...' : 'Analyze with Bob'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ChatIcon />}
            onClick={handleCreateChat}
          >
            Chat with Bob
          </Button>
        </Box>
      </Box>

      {/* Analysis Summary */}
      {currentRepository.analysis?.summary && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <DescriptionIcon sx={{ mr: 1 }} />
            Analysis Summary
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {currentRepository.analysis.summary}
          </Typography>
        </Paper>
      )}

      {/* File Explorer and Code Viewer */}
      <Grid container spacing={2}>
        {/* File Tree */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: '70vh', overflow: 'auto' }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">Files</Typography>
            </Box>
            <List dense>
              {currentRepository.fileStructure &&
                renderFileTree(currentRepository.fileStructure)}
            </List>
          </Paper>
        </Grid>

        {/* Code Viewer */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ height: '70vh', overflow: 'auto' }}>
            {selectedFile ? (
              <>
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {selectedFile}
                  </Typography>
                </Box>
                {loadingFile ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <SyntaxHighlighter
                    language={getLanguage(selectedFile)}
                    style={vscDarkPlus}
                    showLineNumbers
                    customStyle={{ margin: 0, borderRadius: 0 }}
                  >
                    {fileContent}
                  </SyntaxHighlighter>
                )}
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'text.secondary',
                }}
              >
                <Typography>Select a file to view its content</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Repository;

// Made with Bob
