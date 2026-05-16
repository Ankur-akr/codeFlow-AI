import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Code as CodeIcon,
  Chat as ChatIcon,
  Description as DescriptionIcon,
  BugReport as BugReportIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Home() {
  const handleGitHubLogin = () => {
    window.location.href = `${API_URL}/api/auth/github`;
  };

  const features = [
    {
      icon: <CodeIcon sx={{ fontSize: 40 }} />,
      title: 'Code Analysis',
      description: 'Analyze complete repository context and understand architecture',
    },
    {
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      title: 'AI Chat',
      description: 'Chat with IBM Bob about your codebase with full context',
    },
    {
      icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
      title: 'Documentation',
      description: 'Generate README files and inline documentation automatically',
    },
    {
      icon: <BugReportIcon sx={{ fontSize: 40 }} />,
      title: 'Testing',
      description: 'Create unit tests and identify edge cases automatically',
    },
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 40 }} />,
      title: 'Refactoring',
      description: 'Get intelligent suggestions to improve code quality',
    },
    {
      icon: <GitHubIcon sx={{ fontSize: 40 }} />,
      title: 'GitHub Integration',
      description: 'Connect repositories directly from GitHub',
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            CodeFlow AI
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Your AI Development Partner Powered by IBM Bob
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
            Analyze, understand, and improve your codebase with AI-driven insights.
            Connect your repositories and let IBM Bob help you code smarter and faster.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<GitHubIcon />}
            onClick={handleGitHubLogin}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Sign in with GitHub
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ mb: 6, fontWeight: 600 }}
        >
          Powered by IBM Bob
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* IBM Bob Modes Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ mb: 4, fontWeight: 600 }}
          >
            IBM Bob's Specialized Modes
          </Typography>
          <Grid container spacing={2}>
            {[
              { mode: 'Code', desc: 'Write, modify, and refactor code' },
              { mode: 'Ask', desc: 'Get answers and explanations' },
              { mode: 'Plan', desc: 'Plan and design before implementation' },
              { mode: 'Advanced', desc: 'Extended capabilities for complex tasks' },
              { mode: 'Orchestrator', desc: 'Coordinate multi-step projects' },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {item.mode} Mode
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Ready to accelerate your development?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Sign in with GitHub to start using CodeFlow AI with IBM Bob
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<GitHubIcon />}
          onClick={handleGitHubLogin}
          sx={{ px: 4, py: 1.5 }}
        >
          Get Started
        </Button>
      </Container>
    </Box>
  );
}

export default Home;

// Made with Bob
