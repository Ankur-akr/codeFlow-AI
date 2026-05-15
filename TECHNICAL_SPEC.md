# CodeFlow AI - Technical Specification

## Project Structure

```
codeflow-ai/
├── frontend/                    # React frontend application
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   ├── store/              # Redux store
│   │   ├── utils/              # Utility functions
│   │   ├── styles/             # Global styles
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── Dockerfile
│
├── backend/                     # Node.js backend application
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # Mongoose models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Utility functions
│   │   └── server.js           # Entry point
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml          # Docker orchestration
├── .env.example                # Environment variables template
├── ARCHITECTURE.md             # System architecture document
├── TECHNICAL_SPEC.md           # This file
└── README.md                   # Project documentation
```

## Detailed Implementation Guide

### 1. Project Initialization

#### Frontend Setup
```bash
# Create React app with TypeScript support
npx create-react-app frontend --template typescript
cd frontend

# Install dependencies
npm install @mui/material @emotion/react @emotion/styled
npm install @reduxjs/toolkit react-redux
npm install react-router-dom
npm install axios
npm install monaco-editor @monaco-editor/react
npm install react-syntax-highlighter
npm install react-markdown
npm install @mui/icons-material
```

#### Backend Setup
```bash
# Initialize Node.js project
mkdir backend && cd backend
npm init -y

# Install dependencies
npm install express mongoose dotenv cors
npm install passport passport-github2 express-session
npm install connect-mongo
npm install multer adm-zip simple-git
npm install @ibm-cloud/watsonx-ai
npm install bcryptjs jsonwebtoken
npm install express-validator
npm install winston

# Install dev dependencies
npm install --save-dev nodemon typescript @types/node @types/express
npm install --save-dev @types/passport @types/passport-github2
```

### 2. Environment Configuration

#### `.env.example`
```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/codeflow-ai

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Session Secret
SESSION_SECRET=your_session_secret_key

# IBM watsonx.ai Configuration
WATSONX_API_KEY=your_watsonx_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Models

#### User Model (`backend/src/models/User.js`)
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatarUrl: String,
  accessToken: {
    type: String,
    select: false // Don't return by default
  },
  repositories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

module.exports = mongoose.model('User', userSchema);
```

#### Repository Model (`backend/src/models/Repository.js`)
```javascript
const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['github', 'upload', 'git-url'],
    required: true
  },
  sourceUrl: String,
  localPath: String,
  fileStructure: {
    type: Object,
    default: {}
  },
  metadata: {
    language: String,
    framework: String,
    totalFiles: Number,
    totalLines: Number,
    size: Number
  },
  analysisStatus: {
    type: String,
    enum: ['pending', 'analyzing', 'completed', 'failed'],
    default: 'pending'
  },
  analysis: {
    summary: String,
    architecture: String,
    dependencies: [String],
    keyModules: [{
      name: String,
      path: String,
      description: String
    }],
    generatedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

repositorySchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Repository', repositorySchema);
```

#### Chat Session Model (`backend/src/models/ChatSession.js`)
```javascript
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    codeSnippet: String,
    filePath: String,
    action: String
  }
});

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [messageSchema],
  context: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

chatSessionSchema.index({ userId: 1, repositoryId: 1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
```

#### Analysis Cache Model (`backend/src/models/AnalysisCache.js`)
```javascript
const mongoose = require('mongoose');

const analysisCacheSchema = new mongoose.Schema({
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true
  },
  type: {
    type: String,
    enum: ['explanation', 'documentation', 'test', 'refactor'],
    required: true
  },
  filePath: String,
  inputHash: {
    type: String,
    required: true
  },
  input: String,
  output: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
});

analysisCacheSchema.index({ repositoryId: 1, type: 1, inputHash: 1 });
analysisCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AnalysisCache', analysisCacheSchema);
```

### 4. Backend Services Implementation

#### watsonx.ai Service (`backend/src/services/watsonxService.js`)
```javascript
const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

class WatsonXService {
  constructor() {
    this.client = WatsonXAI.newInstance({
      version: '2024-03-19',
      serviceUrl: process.env.WATSONX_URL,
      authenticator: new IamAuthenticator({
        apikey: process.env.WATSONX_API_KEY
      })
    });
    this.projectId = process.env.WATSONX_PROJECT_ID;
  }

  async generateText(prompt, options = {}) {
    const params = {
      projectId: this.projectId,
      modelId: options.model || 'ibm/granite-13b-chat-v2',
      input: prompt,
      parameters: {
        max_new_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 1,
        top_k: options.topK || 50
      }
    };

    try {
      const response = await this.client.generateText(params);
      return response.result.results[0].generated_text;
    } catch (error) {
      console.error('watsonx.ai error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async analyzeRepository(fileStructure, metadata) {
    const prompt = `You are IBM Bob, an expert software architect.

Analyze this repository and provide a comprehensive summary:

Repository Name: ${metadata.name}
Primary Language: ${metadata.language}
Total Files: ${metadata.totalFiles}
Total Lines: ${metadata.totalLines}

File Structure:
${JSON.stringify(fileStructure, null, 2)}

Provide:
1. High-level architecture summary (2-3 paragraphs)
2. Key modules and their purposes
3. Technology stack and frameworks
4. Main workflows and data flow
5. Potential improvement areas

Format your response in markdown.`;

    return await this.generateText(prompt, { maxTokens: 1000 });
  }

  async explainCode(code, context) {
    const prompt = `You are IBM Bob, a helpful code mentor.

Explain this code clearly and concisely:

File: ${context.filePath}
Language: ${context.language}
Project Type: ${context.projectType}

Code:
\`\`\`${context.language}
${code}
\`\`\`

Provide:
1. What does this code do? (high-level purpose)
2. How does it work? (key logic)
3. Important details or patterns used
4. Any potential issues or improvements

Keep explanations clear and beginner-friendly.`;

    return await this.generateText(prompt, { maxTokens: 600 });
  }

  async generateDocumentation(code, context) {
    const prompt = `You are IBM Bob, a documentation expert.

Generate comprehensive documentation for this code:

File: ${context.filePath}
Language: ${context.language}

Code:
\`\`\`${context.language}
${code}
\`\`\`

Generate:
1. Function/class description
2. Parameters and return values
3. Usage examples
4. Important notes or warnings

Format as JSDoc/docstring comments appropriate for ${context.language}.`;

    return await this.generateText(prompt, { maxTokens: 700 });
  }

  async generateTests(code, context) {
    const prompt = `You are IBM Bob, a testing expert.

Generate unit tests for this code:

File: ${context.filePath}
Language: ${context.language}
Testing Framework: ${context.testFramework || 'Jest'}

Code:
\`\`\`${context.language}
${code}
\`\`\`

Generate:
1. Test cases for normal scenarios
2. Edge cases
3. Error handling tests
4. Mock data if needed

Provide complete, runnable test code.`;

    return await this.generateText(prompt, { maxTokens: 800 });
  }

  async chatResponse(message, context) {
    const prompt = `You are IBM Bob, an AI development assistant.

Repository Context:
- Name: ${context.repositoryName}
- Language: ${context.language}
- Files: ${context.fileCount}

${context.recentFiles ? `Recent Files:\n${context.recentFiles}` : ''}

Conversation History:
${context.history || 'No previous messages'}

User: ${message}

IBM Bob:`;

    return await this.generateText(prompt, { maxTokens: 500, temperature: 0.8 });
  }
}

module.exports = new WatsonXService();
```

#### Repository Service (`backend/src/services/repositoryService.js`)
```javascript
const fs = require('fs').promises;
const path = require('path');
const AdmZip = require('adm-zip');
const simpleGit = require('simple-git');
const Repository = require('../models/Repository');

class RepositoryService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
  }

  async connectGitHub(userId, repoUrl, accessToken) {
    // Extract repo name from URL
    const repoName = repoUrl.split('/').pop().replace('.git', '');
    const localPath = path.join(this.uploadDir, userId.toString(), repoName);

    // Clone repository
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    const git = simpleGit();
    await git.clone(repoUrl, localPath);

    // Create repository record
    const repository = new Repository({
      userId,
      name: repoName,
      source: 'github',
      sourceUrl: repoUrl,
      localPath
    });

    await repository.save();
    
    // Parse and analyze
    await this.parseRepository(repository._id);
    
    return repository;
  }

  async uploadZip(userId, file) {
    const repoName = path.parse(file.originalname).name;
    const localPath = path.join(this.uploadDir, userId.toString(), repoName);

    // Extract ZIP
    await fs.mkdir(localPath, { recursive: true });
    const zip = new AdmZip(file.buffer);
    zip.extractAllTo(localPath, true);

    // Create repository record
    const repository = new Repository({
      userId,
      name: repoName,
      source: 'upload',
      localPath
    });

    await repository.save();
    
    // Parse and analyze
    await this.parseRepository(repository._id);
    
    return repository;
  }

  async cloneGitUrl(userId, gitUrl) {
    const repoName = gitUrl.split('/').pop().replace('.git', '');
    const localPath = path.join(this.uploadDir, userId.toString(), repoName);

    // Clone repository
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    const git = simpleGit();
    await git.clone(gitUrl, localPath);

    // Create repository record
    const repository = new Repository({
      userId,
      name: repoName,
      source: 'git-url',
      sourceUrl: gitUrl,
      localPath
    });

    await repository.save();
    
    // Parse and analyze
    await this.parseRepository(repository._id);
    
    return repository;
  }

  async parseRepository(repoId) {
    const repository = await Repository.findById(repoId);
    if (!repository) throw new Error('Repository not found');

    const fileStructure = await this.buildFileTree(repository.localPath);
    const metadata = await this.extractMetadata(repository.localPath, fileStructure);

    await Repository.updateOne(
      { _id: repoId },
      { fileStructure, metadata }
    );

    return { fileStructure, metadata };
  }

  async buildFileTree(dirPath, basePath = '') {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    const tree = {};

    for (const item of items) {
      // Skip node_modules, .git, etc.
      if (this.shouldIgnore(item.name)) continue;

      const itemPath = path.join(dirPath, item.name);
      const relativePath = path.join(basePath, item.name);

      if (item.isDirectory()) {
        tree[item.name] = await this.buildFileTree(itemPath, relativePath);
      } else {
        tree[item.name] = {
          type: 'file',
          path: relativePath,
          extension: path.extname(item.name)
        };
      }
    }

    return tree;
  }

  async extractMetadata(dirPath, fileStructure) {
    const files = this.flattenFileTree(fileStructure);
    const extensions = files.map(f => f.extension).filter(Boolean);
    
    // Detect primary language
    const languageMap = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rb': 'Ruby',
      '.php': 'PHP'
    };

    const languageCounts = {};
    extensions.forEach(ext => {
      const lang = languageMap[ext];
      if (lang) {
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      }
    });

    const primaryLanguage = Object.keys(languageCounts).sort(
      (a, b) => languageCounts[b] - languageCounts[a]
    )[0] || 'Unknown';

    // Count total lines
    let totalLines = 0;
    for (const file of files) {
      try {
        const content = await fs.readFile(
          path.join(dirPath, file.path),
          'utf-8'
        );
        totalLines += content.split('\n').length;
      } catch (error) {
        // Skip binary files
      }
    }

    return {
      language: primaryLanguage,
      framework: await this.detectFramework(dirPath),
      totalFiles: files.length,
      totalLines
    };
  }

  async detectFramework(dirPath) {
    try {
      const packageJson = await fs.readFile(
        path.join(dirPath, 'package.json'),
        'utf-8'
      );
      const pkg = JSON.parse(packageJson);
      
      if (pkg.dependencies?.react) return 'React';
      if (pkg.dependencies?.vue) return 'Vue';
      if (pkg.dependencies?.angular) return 'Angular';
      if (pkg.dependencies?.express) return 'Express';
      if (pkg.dependencies?.next) return 'Next.js';
    } catch (error) {
      // No package.json or error reading
    }

    return 'Unknown';
  }

  flattenFileTree(tree, result = []) {
    for (const [name, value] of Object.entries(tree)) {
      if (value.type === 'file') {
        result.push(value);
      } else {
        this.flattenFileTree(value, result);
      }
    }
    return result;
  }

  shouldIgnore(name) {
    const ignoreList = [
      'node_modules',
      '.git',
      '.vscode',
      'dist',
      'build',
      '.next',
      '__pycache__',
      'venv',
      '.env'
    ];
    return ignoreList.includes(name) || name.startsWith('.');
  }

  async getFileContent(repoId, filePath) {
    const repository = await Repository.findById(repoId);
    if (!repository) throw new Error('Repository not found');

    const fullPath = path.join(repository.localPath, filePath);
    return await fs.readFile(fullPath, 'utf-8');
  }
}

module.exports = new RepositoryService();
```

### 5. API Routes Structure

#### Authentication Routes (`backend/src/routes/auth.js`)
```javascript
const express = require('express');
const passport = require('passport');
const router = express.Router();

// GitHub OAuth
router.get('/github', passport.authenticate('github', {
  scope: ['user:email', 'repo']
}));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL + '/dashboard');
  }
);

// Get current user
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
```

### 6. Frontend Components

#### Dashboard Component (`frontend/src/pages/Dashboard.jsx`)
```jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box
} from '@mui/material';
import { Add, GitHub, Upload, Link } from '@mui/icons-material';
import api from '../services/api';

function Dashboard() {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const response = await api.get('/repositories');
      setRepositories(response.data);
    } catch (error) {
      console.error('Error fetching repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Your Repositories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect repositories to start analyzing with IBM Bob
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/connect/github')}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <GitHub sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
              <Typography variant="h6">Connect GitHub</Typography>
              <Typography variant="body2" color="text.secondary">
                Import from GitHub repository
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/connect/upload')}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Upload sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
              <Typography variant="h6">Upload ZIP</Typography>
              <Typography variant="body2" color="text.secondary">
                Upload repository as ZIP file
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/connect/git-url')}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Link sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
              <Typography variant="h6">Git URL</Typography>
              <Typography variant="body2" color="text.secondary">
                Clone from Git URL
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {repositories.map((repo) => (
          <Grid item xs={12} md={6} key={repo._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{repo.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {repo.metadata?.language} • {repo.metadata?.totalFiles} files
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/repository/${repo._id}`)}
                  >
                    Open
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Dashboard;
```

## Next Steps

This technical specification provides the foundation for implementing CodeFlow AI. The next phase involves:

1. Setting up the project structure
2. Implementing the backend services
3. Building the frontend components
4. Integrating watsonx.ai
5. Testing and deployment

Each component is designed to be modular and can be developed independently while maintaining clear interfaces between layers.