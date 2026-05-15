# CodeFlow AI 🚀

A web-based platform that brings **IBM Bob**, the AI SDLC partner, to your browser. CodeFlow AI enables developers to leverage Bob's powerful capabilities for repository analysis, code understanding, and intelligent development assistance through an intuitive web interface.

![CodeFlow AI](https://img.shields.io/badge/AI-Powered-blue)
![IBM Bob](https://img.shields.io/badge/IBM-Bob-052FAD)
![React](https://img.shields.io/badge/React-18+-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248)

## 🌟 What is IBM Bob?

IBM Bob is an AI SDLC (Software Development Lifecycle) partner that augments your existing workflows and helps you work confidently with real codebases. CodeFlow AI provides a web-based interface to interact with Bob for repository analysis and development tasks.

### Bob's Key Capabilities

- **🎯 Generate Code**: Turn natural language into working code
- **✨ Code Completion**: Single-line and multi-line autocompletions
- **🔧 Refactor and Debug**: Clean up and fix existing code automatically
- **📝 Write and Update Docs**: Generate or update documentation from code
- **💬 Answer Questions**: Ask about your codebase and get explanations
- **⚡ Automate Tasks**: Streamline repetitive workflows and boilerplate
- **📁 Create Files and Projects**: Scaffold new files and entire projects

## 🎭 Bob's Specialized Modes

CodeFlow AI leverages Bob's purpose-built modes that optimize behavior for different development scenarios:

| Mode | Purpose | Use Cases |
|------|---------|-----------|
| **💻 Code Mode** | Write, modify, and refactor code with precision | Implementing features, fixing bugs, code improvements |
| **❓ Ask Mode** | Get answers and explanations about your codebase | Understanding code, learning concepts, documentation |
| **📝 Plan Mode** | Plan and design before implementation | Architecture design, task breakdown, technical specs |
| **🛠️ Advanced Mode** | Access extended capabilities for complex tasks | Complex refactoring, multi-file changes, integrations |
| **🔀 Orchestrator Mode** | Coordinate complex multi-step projects | Large features, system redesigns, workflow automation |

## ✨ CodeFlow AI Features

### 📊 Repository Understanding
- **Complete Context Analysis**: Bob analyzes entire repository structure
- **Architecture Summaries**: Generate high-level architecture overviews
- **Project Structure Insights**: Understand module organization and workflows
- **Dependency Mapping**: Identify and visualize project dependencies

### 🤖 AI-Powered Code Assistance (via Bob)
- **Code Explanation**: Bob explains complex code in simple language
- **Inline Documentation**: Generate comprehensive comments and docstrings
- **README Generation**: Automatically create project documentation
- **Refactoring Suggestions**: Get intelligent code improvement recommendations
- **Pattern Detection**: Identify repetitive code patterns

### 🧪 Automated Testing
- **Unit Test Generation**: Bob creates comprehensive test cases
- **Edge Case Coverage**: Identify and test edge cases
- **Mock Data Creation**: Generate realistic test data
- **Bug Detection**: Identify potential bugs and suggest fixes

### 💬 Interactive Chat with Bob
- **Repository-Aware Conversations**: Chat with full repository context
- **Multi-Step Workflows**: Maintain conversational memory
- **Code Snippet Support**: Reference and discuss specific code sections
- **Natural Language Queries**: Ask questions in plain English
- **Mode Switching**: Bob adapts to your needs automatically

### 🛠️ Developer Productivity
- **Task Automation**: Automate repetitive development tasks
- **Component Generation**: Convert boilerplate into reusable components
- **Code Quality**: Improve readability and maintainability
- **Onboarding Support**: Help new developers understand codebases quickly

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CodeFlow AI Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   React UI   │───▶│  Express API │───▶│   MongoDB    │  │
│  │  Dashboard   │    │   Backend    │    │   Database   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                               │
│         │                    ▼                               │
│         │            ┌──────────────┐                        │
│         │            │   IBM Bob    │                        │
│         └───────────▶│  AI Service  │                        │
│                      └──────────────┘                        │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Repository Sources: GitHub • Upload • Git URL       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** 6+ (local or cloud instance)
- **IBM Bob API Access** (API key and endpoint)
- **GitHub OAuth App** (for GitHub integration)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/codeflow-ai.git
cd codeflow-ai
```

2. **Set up environment variables**

Create `.env` file in the backend directory:
```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/codeflow-ai

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Session
SESSION_SECRET=your_random_session_secret

# IBM Bob Configuration
BOB_API_KEY=your_bob_api_key
BOB_API_ENDPOINT=https://bob-api.ibm.com
BOB_MODEL=bob-default

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

3. **Install dependencies**

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

4. **Start the application**

Backend (from backend directory):
```bash
npm run dev
```

Frontend (from frontend directory):
```bash
npm start
```

5. **Access the application**

Open your browser and navigate to `http://localhost:3000`

## 🐳 Docker Deployment

### Using Docker Compose

1. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
```

2. **Build and run**
```bash
docker-compose up -d
```

3. **Access the application**
```
Frontend: http://localhost:3000
Backend API: http://localhost:5000
```

## 📖 Usage Guide

### 1. Connect a Repository

**Option A: GitHub Integration**
- Click "Connect GitHub" on the dashboard
- Authorize CodeFlow AI to access your repositories
- Select the repository you want to analyze

**Option B: Upload ZIP**
- Click "Upload ZIP" on the dashboard
- Select a ZIP file containing your project
- Wait for the upload and extraction to complete

**Option C: Git URL**
- Click "Git URL" on the dashboard
- Enter the Git repository URL
- CodeFlow AI will clone the repository

### 2. Analyze Your Code with Bob

Once connected, Bob automatically:
- Parses the repository structure
- Identifies the primary language and framework
- Generates an architecture summary
- Maps dependencies and key modules

### 3. Interact with IBM Bob

**Ask Questions (Ask Mode):**
```
"Explain the authentication flow in this project"
"What does the UserService class do?"
"How is data validated in the API?"
```

**Generate Code (Code Mode):**
```
"Create a React component that displays a sortable table of user data"
"Add error handling to the payment processing function"
"Refactor this function to use async/await"
```

**Generate Documentation (Code Mode):**
```
"Generate documentation for the auth.js file"
"Create a README for this project"
"Add JSDoc comments to the database models"
```

**Create Tests (Code Mode):**
```
"Generate unit tests for the UserController"
"Create test cases for the payment processing function"
"What edge cases should I test in the login flow?"
```

**Plan and Design (Plan Mode):**
```
"Design the architecture for a new feature"
"Break down this task into implementation steps"
"Create a technical specification for the API"
```

**Complex Tasks (Orchestrator Mode):**
```
"Refactor the entire authentication system"
"Migrate from REST to GraphQL"
"Add comprehensive error handling across the application"
```

## 🎯 Bob's Powerful Tools

Bob comes with comprehensive tools that extend capabilities beyond text generation:

- **📁 File Access**: Read and write files directly within your project
- **⚡ Run Commands**: Execute terminal or shell commands
- **🔌 External Tools via MCP**: Use external tools through Model Context Protocol

These tools work together seamlessly in CodeFlow AI, allowing Bob to accomplish complex tasks without switching between applications.

## 🔧 Configuration

### GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - **Application name**: CodeFlow AI
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
3. Copy the Client ID and Client Secret to your `.env` file

### IBM Bob API Setup

1. Obtain IBM Bob API credentials from your IBM account
2. Get your API key and endpoint URL
3. Add credentials to your `.env` file:
   ```env
   BOB_API_KEY=your_bob_api_key
   BOB_API_ENDPOINT=https://bob-api.ibm.com
   ```

### MongoDB Setup

**Local MongoDB:**
```bash
# Install MongoDB
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath /path/to/data
```

**MongoDB Atlas (Cloud):**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## 📁 Project Structure

```
codeflow-ai/
├── frontend/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   └── utils/           # Utilities
│   ├── package.json
│   └── Dockerfile
│
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   │   └── bobService.js # IBM Bob integration
│   │   └── server.js        # Entry point
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml        # Docker orchestration
├── .env.example             # Environment template
├── ARCHITECTURE.md          # Architecture docs
├── TECHNICAL_SPEC.md        # Technical specs
└── README.md                # This file
```

## 🔒 Security

- **Authentication**: Secure GitHub OAuth flow with session management
- **Data Protection**: Encrypted storage of sensitive tokens
- **Input Validation**: Comprehensive validation of all user inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **Access Control**: User-scoped repository access

## 📊 API Documentation

### Authentication Endpoints

- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - OAuth callback
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout

### Repository Endpoints

- `GET /api/repositories` - List repositories
- `POST /api/repositories/github` - Connect GitHub repo
- `POST /api/repositories/upload` - Upload ZIP
- `POST /api/repositories/git-url` - Clone from URL
- `GET /api/repositories/:id` - Get repository details
- `DELETE /api/repositories/:id` - Delete repository

### Bob Analysis Endpoints

- `POST /api/bob/analyze/:repoId` - Analyze repository with Bob
- `POST /api/bob/explain` - Explain code with Bob
- `POST /api/bob/document` - Generate documentation
- `POST /api/bob/generate-tests` - Generate tests
- `POST /api/bob/refactor` - Get refactoring suggestions

### Chat Endpoints (Bob Integration)

- `GET /api/chat/sessions` - List chat sessions
- `POST /api/chat/sessions` - Create session with Bob
- `GET /api/chat/sessions/:id` - Get session
- `POST /api/chat/sessions/:id/messages` - Send message to Bob
- `POST /api/chat/sessions/:id/mode` - Switch Bob's mode

## 🚀 Deployment

### Deploy to IBM Cloud

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy:
```bash
# Build Docker images
docker-compose build

# Push to IBM Cloud Container Registry
ibmcloud cr login
docker tag codeflow-backend us.icr.io/your-namespace/codeflow-backend
docker push us.icr.io/your-namespace/codeflow-backend

# Deploy to Kubernetes
kubectl apply -f k8s/
```

## 💡 Best Practices for Using Bob

1. **Be Specific**: "Create a React component that displays a sortable table of user data" works better than "Make me a table component"

2. **Provide Context**: Give Bob information about your project structure, frameworks, and requirements

3. **Use the Right Mode**: Let Bob switch modes automatically or manually select the appropriate mode for your task

4. **Iterate**: Start with real problems rather than hypothetical scenarios

5. **Review Output**: Always review Bob's suggestions and test generated code

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **IBM Bob** for powering the AI capabilities
- **GitHub** for repository integration
- **MongoDB** for data storage
- **React** and **Node.js** communities

## 📧 Support

For support, email support@codeflow-ai.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] GitLab and Bitbucket integration
- [ ] Advanced Bob mode features
- [ ] Team collaboration features
- [ ] MCP server integration
- [ ] CI/CD integration
- [ ] Security vulnerability scanning
- [ ] Performance profiling
- [ ] Bobalytics integration

## 📈 Status

**Current Version**: 1.0.0 (Proof of Concept)

**Status**: Active Development

---

Built with ❤️ using IBM Bob - Your AI SDLC Partner