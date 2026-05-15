# Getting Started with CodeFlow AI Development

## Overview

This guide will help you get started with developing the CodeFlow AI platform. Follow these steps to set up your development environment and begin implementation.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **MongoDB** 6+ (local or cloud)
- **Git** for version control
- **Docker** (optional, for containerization)
- **VS Code** or your preferred IDE

## Required Accounts & Credentials

1. **IBM Bob API Access**
   - API Key
   - API Endpoint URL
   - Model identifier (if applicable)

2. **GitHub OAuth Application**
   - Client ID
   - Client Secret
   - Callback URL: `http://localhost:5000/api/auth/github/callback`

3. **MongoDB Connection**
   - Local: `mongodb://localhost:27017/codeflow-ai`
   - Cloud: MongoDB Atlas connection string

## Project Structure

```
codeflow-ai/
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   └── utils/           # Utilities
│   ├── package.json
│   └── Dockerfile
│
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   │   ├── bobService.js        # IBM Bob integration
│   │   │   ├── repositoryService.js # Repository management
│   │   │   └── chatService.js       # Chat functionality
│   │   └── server.js        # Entry point
│   ├── package.json
│   └── Dockerfile
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md
│   ├── TECHNICAL_SPEC.md
│   ├── IBM_BOB_INTEGRATION.md
│   ├── DEPLOYMENT.md
│   └── PROJECT_SUMMARY.md
│
├── docker-compose.yml        # Docker orchestration
├── .env.example             # Environment template
├── .gitignore
└── README.md
```

## Step-by-Step Setup

### Step 1: Initialize Project Structure

```bash
# Create main project directory
mkdir codeflow-ai
cd codeflow-ai

# Create subdirectories
mkdir -p frontend/src/{components,pages,services,store,utils}
mkdir -p frontend/public
mkdir -p backend/src/{config,controllers,middleware,models,routes,services,utils}
mkdir -p docs
```

### Step 2: Initialize Frontend

```bash
cd frontend

# Initialize React app
npx create-react-app . --template typescript

# Install dependencies
npm install @mui/material @emotion/react @emotion/styled
npm install @reduxjs/toolkit react-redux
npm install react-router-dom
npm install axios
npm install @monaco-editor/react
npm install react-syntax-highlighter
npm install @mui/icons-material
npm install react-markdown

# Install dev dependencies
npm install --save-dev @types/react-syntax-highlighter
```

### Step 3: Initialize Backend

```bash
cd ../backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express mongoose dotenv cors
npm install passport passport-github2 express-session
npm install connect-mongo
npm install multer adm-zip simple-git
npm install axios
npm install bcryptjs jsonwebtoken
npm install express-validator
npm install winston

# Install dev dependencies
npm install --save-dev nodemon
npm install --save-dev @types/node @types/express
```

### Step 4: Configure Environment Variables

Create `backend/.env` file:

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
SESSION_SECRET=your_random_session_secret_here

# IBM Bob Configuration
BOB_API_KEY=your_bob_api_key
BOB_API_ENDPOINT=https://bob-api.ibm.com
BOB_MODEL=bob-default

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

Create `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
```

### Step 5: Set Up MongoDB

**Option A: Local MongoDB**

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# Download and install from mongodb.com
```

**Option B: MongoDB Atlas (Cloud)**

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Step 6: Set Up GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: CodeFlow AI (Development)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
4. Copy Client ID and Client Secret to `.env` files

### Step 7: Obtain IBM Bob API Access

1. Contact IBM or your organization for Bob API credentials
2. Get API key and endpoint URL
3. Update `BOB_API_KEY` and `BOB_API_ENDPOINT` in `backend/.env`

## Development Workflow

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

**Terminal 3 - MongoDB (if local):**
```bash
mongod --dbpath /path/to/data
```

### Development Scripts

Add to `backend/package.json`:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  }
}
```

Add to `frontend/package.json`:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

## Implementation Order

Follow this order for efficient development:

### Phase 1: Foundation
1. ✅ Set up project structure
2. ✅ Configure environment variables
3. ⏳ Create database models
4. ⏳ Implement authentication
5. ⏳ Build basic UI layout

### Phase 2: Core Features
6. ⏳ Repository connection module
7. ⏳ File parsing service
8. ⏳ IBM Bob service integration
9. ⏳ Repository analysis
10. ⏳ File explorer UI

### Phase 3: AI Features
11. ⏳ Code explanation
12. ⏳ Documentation generation
13. ⏳ Test generation
14. ⏳ Chat interface
15. ⏳ Context management

### Phase 4: Polish
16. ⏳ Error handling
17. ⏳ UI/UX refinement
18. ⏳ Performance optimization
19. ⏳ Testing
20. ⏳ Documentation

## Key Files to Create First

### Backend

1. **`backend/src/server.js`** - Entry point
2. **`backend/src/config/database.js`** - MongoDB connection
3. **`backend/src/models/User.js`** - User model
4. **`backend/src/models/Repository.js`** - Repository model
5. **`backend/src/models/ChatSession.js`** - Chat session model
6. **`backend/src/services/bobService.js`** - IBM Bob integration
7. **`backend/src/routes/auth.js`** - Authentication routes
8. **`backend/src/routes/repositories.js`** - Repository routes
9. **`backend/src/routes/bob.js`** - Bob API routes

### Frontend

1. **`frontend/src/App.jsx`** - Main app component
2. **`frontend/src/services/api.js`** - API client
3. **`frontend/src/services/bobService.js`** - Bob service client
4. **`frontend/src/pages/Dashboard.jsx`** - Dashboard page
5. **`frontend/src/pages/Repository.jsx`** - Repository view
6. **`frontend/src/pages/Chat.jsx`** - Chat interface
7. **`frontend/src/components/Header.jsx`** - Header component
8. **`frontend/src/components/FileExplorer.jsx`** - File explorer

## Testing Strategy

### Backend Testing
```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

### Frontend Testing
```bash
# Tests are included with create-react-app
npm test
```

### Integration Testing
- Test API endpoints with Postman or Thunder Client
- Test IBM Bob integration with sample prompts
- Test repository connection with test repositories

## Debugging Tips

### Backend Debugging
```javascript
// Add to server.js for detailed logging
const winston = require('winston');
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Frontend Debugging
- Use React DevTools browser extension
- Use Redux DevTools for state debugging
- Check browser console for errors
- Use Network tab to inspect API calls

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution**: Ensure MongoDB is running and connection string is correct

### Issue: GitHub OAuth Not Working
**Solution**: Verify callback URL matches exactly in GitHub settings

### Issue: IBM Bob API Errors
**Solution**: Check API key, endpoint, and request format

### Issue: CORS Errors
**Solution**: Ensure backend CORS is configured for frontend URL

### Issue: Port Already in Use
**Solution**: Kill process on port or use different port

## Resources

### Documentation
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com)
- [Mongoose Docs](https://mongoosejs.com)
- [Material-UI](https://mui.com)

### IBM Bob Resources
- IBM Bob Documentation (refer to your organization)
- IBM Bob API Reference
- IBM Bob Best Practices

### Project Documentation
- [`README.md`](README.md) - Project overview
- [`ARCHITECTURE.md`](ARCHITECTURE.md) - System architecture
- [`TECHNICAL_SPEC.md`](TECHNICAL_SPEC.md) - Technical details
- [`IBM_BOB_INTEGRATION.md`](IBM_BOB_INTEGRATION.md) - Bob integration guide
- [`DEPLOYMENT.md`](DEPLOYMENT.md) - Deployment instructions

## Next Steps

1. **Review Planning Documents**: Read through all documentation
2. **Set Up Environment**: Complete all prerequisite installations
3. **Initialize Project**: Create project structure
4. **Start Development**: Begin with Phase 1 tasks
5. **Test Frequently**: Test each feature as you build
6. **Commit Often**: Use Git for version control

## Getting Help

- **Documentation**: Refer to project docs in `/docs` folder
- **IBM Bob Support**: Contact your IBM representative
- **GitHub Issues**: Create issues for bugs or questions
- **Team Communication**: Use your team's communication channel

---

Ready to start building? Switch to **Code mode** to begin implementation! 🚀