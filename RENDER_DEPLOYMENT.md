# Render Deployment Guide for CodeFlow AI

Complete guide to deploy CodeFlow AI on Render - a modern cloud platform with automatic deployments, free SSL, and global CDN.

## 🌟 Why Render?

- ✅ **Free Tier Available** - 750 hours/month free
- ✅ **Automatic Deployments** - Push to GitHub = instant deploy
- ✅ **Free SSL Certificates** - HTTPS enabled automatically
- ✅ **Global CDN** - Fast content delivery worldwide
- ✅ **Zero Configuration** - Detects Node.js automatically
- ✅ **Built-in Monitoring** - Logs, metrics, and alerts
- ✅ **No Credit Card Required** - Start for free

## 📋 Prerequisites

- GitHub account with CodeFlow AI repository
- Render account (sign up at [render.com](https://render.com))
- MongoDB Atlas account (free tier available)
- IBM Bob API credentials
- GitHub OAuth App credentials

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│              CodeFlow AI on Render                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐         ┌──────────────┐              │
│  │   Render     │────────▶│   Render     │              │
│  │  (Frontend)  │   API   │  (Backend)   │              │
│  │  Static Site │  Calls  │  Web Service │              │
│  └──────────────┘         └──────────────┘              │
│         │                        │                       │
│         │                        ▼                       │
│         │                 ┌──────────────┐              │
│         │                 │   MongoDB    │              │
│         │                 │    Atlas     │              │
│         │                 └──────────────┘              │
│         │                                                │
│         └────────────────▶ Firebase (Optional)          │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Deployment Options

### Option 1: Full Stack on Render (Recommended)
- Backend: Render Web Service
- Frontend: Render Static Site
- Database: MongoDB Atlas

### Option 2: Frontend Only on Render
- Frontend: Render Static Site
- Backend: Use Firebase or other service
- Database: Firebase Firestore

## 📦 Step-by-Step Deployment

### Part 1: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account
   - Create a new cluster (M0 Free tier)

2. **Configure Database Access**
   - Go to **Database Access**
   - Click **Add New Database User**
   - Create username and password
   - Set privileges to **Read and write to any database**

3. **Configure Network Access**
   - Go to **Network Access**
   - Click **Add IP Address**
   - Select **Allow Access from Anywhere** (0.0.0.0/0)
   - Click **Confirm**

4. **Get Connection String**
   - Go to **Database** → **Connect**
   - Choose **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your database password
   - Save for later: `mongodb+srv://username:password@cluster.mongodb.net/codeflow`

### Part 2: Deploy Backend to Render

1. **Sign Up / Log In to Render**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub (recommended)

2. **Create New Web Service**
   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Select **codeflow-ai** repository

3. **Configure Backend Service**
   
   **Basic Settings:**
   - **Name**: `codeflow-ai-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Add Environment Variables**
   
   Click **Advanced** → **Add Environment Variable** and add:

   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codeflow
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=https://codeflow-ai-backend.onrender.com/api/auth/github/callback
   SESSION_SECRET=your_random_secret_key_min_32_chars
   BOB_API_KEY=your_bob_api_key
   BOB_API_ENDPOINT=https://bob-api.ibm.com
   BOB_MODEL=bob-default
   FRONTEND_URL=https://codeflow-ai.onrender.com
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=104857600
   ```

   **Important Notes:**
   - Replace all `your_*` values with actual credentials
   - `GITHUB_CALLBACK_URL` will be your Render backend URL
   - `FRONTEND_URL` will be your Render frontend URL (update after frontend deployment)
   - Generate `SESSION_SECRET` with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

5. **Choose Plan**
   - **Free Plan**: 750 hours/month, sleeps after 15 min inactivity
   - **Starter Plan**: $7/month, always on, better performance

6. **Create Web Service**
   - Click **Create Web Service**
   - Render will automatically build and deploy
   - Wait 3-5 minutes for deployment
   - Note your backend URL: `https://codeflow-ai-backend.onrender.com`

### Part 3: Deploy Frontend to Render

1. **Create New Static Site**
   - Click **New +** → **Static Site**
   - Select same GitHub repository

2. **Configure Frontend Service**
   
   **Basic Settings:**
   - **Name**: `codeflow-ai`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

3. **Add Environment Variables**
   
   Click **Advanced** → **Add Environment Variable**:

   ```
   REACT_APP_API_URL=https://codeflow-ai-backend.onrender.com
   REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
   REACT_APP_NAME=CodeFlow AI
   REACT_APP_VERSION=1.0.0
   ```

   **If using Firebase, also add:**
   ```
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Create Static Site**
   - Click **Create Static Site**
   - Render will build and deploy
   - Wait 2-3 minutes
   - Your app will be live at: `https://codeflow-ai.onrender.com`

### Part 4: Update Backend Environment

1. **Update FRONTEND_URL**
   - Go to backend service dashboard
   - Click **Environment**
   - Update `FRONTEND_URL` to your frontend URL
   - Click **Save Changes**
   - Service will automatically redeploy

### Part 5: Configure GitHub OAuth

1. **Update GitHub OAuth App**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Select your OAuth App
   - Update **Authorization callback URL**:
     - Add: `https://codeflow-ai-backend.onrender.com/api/auth/github/callback`
     - Add: `https://codeflow-ai.onrender.com/auth/callback`
   - Click **Update application**

## 🔧 Render Configuration Files

### render.yaml (Optional - Infrastructure as Code)

Create `render.yaml` in project root for automated setup:

```yaml
services:
  # Backend Web Service
  - type: web
    name: codeflow-ai-backend
    runtime: node
    region: oregon
    plan: free
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGODB_URI
        sync: false
      - key: GITHUB_CLIENT_ID
        sync: false
      - key: GITHUB_CLIENT_SECRET
        sync: false
      - key: SESSION_SECRET
        generateValue: true
      - key: BOB_API_KEY
        sync: false
      - key: BOB_API_ENDPOINT
        sync: false
    healthCheckPath: /health

  # Frontend Static Site
  - type: web
    name: codeflow-ai-frontend
    runtime: static
    region: oregon
    plan: free
    rootDir: frontend
    buildCommand: npm install && npm run build
    staticPublishPath: build
    envVars:
      - key: REACT_APP_API_URL
        value: https://codeflow-ai-backend.onrender.com
      - key: REACT_APP_GITHUB_CLIENT_ID
        sync: false
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

## 🔄 Automatic Deployments

Render automatically deploys when you push to GitHub:

1. **Push to main branch**
   ```bash
   git add .
   git commit -m "Update application"
   git push origin main
   ```

2. **Render automatically:**
   - Detects the push
   - Builds the application
   - Deploys new version
   - Zero downtime deployment

3. **Monitor deployment:**
   - Go to Render dashboard
   - Click on your service
   - View **Events** tab for deployment status

## 🔍 Monitoring and Logs

### View Logs

1. **Backend Logs:**
   - Go to backend service dashboard
   - Click **Logs** tab
   - View real-time logs
   - Filter by time range

2. **Frontend Logs:**
   - Go to frontend service dashboard
   - Click **Logs** tab
   - View build and deploy logs

### Metrics

1. **Service Metrics:**
   - CPU usage
   - Memory usage
   - Request count
   - Response times

2. **Set Up Alerts:**
   - Go to service settings
   - Configure email alerts
   - Set thresholds for CPU, memory, errors

## 🐛 Troubleshooting

### Backend Won't Start

**Issue**: Service fails to start
**Solutions:**
- Check logs for error messages
- Verify all environment variables are set
- Ensure MongoDB connection string is correct
- Check Node.js version compatibility

### Frontend Build Fails

**Issue**: Build command fails
**Solutions:**
- Check build logs for specific errors
- Verify all dependencies in package.json
- Ensure environment variables are set correctly
- Check for ESLint errors (warnings treated as errors in CI)

### Database Connection Fails

**Issue**: Can't connect to MongoDB
**Solutions:**
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string format
- Ensure database user has correct permissions
- Test connection string locally first

### Service Sleeps (Free Plan)

**Issue**: Service becomes unresponsive after 15 minutes
**Solutions:**
- Upgrade to Starter plan ($7/month) for always-on service
- Use external monitoring service to ping every 10 minutes
- Accept cold starts (15-30 seconds) on free plan

### CORS Errors

**Issue**: Frontend can't connect to backend
**Solutions:**
- Verify `FRONTEND_URL` in backend environment variables
- Check CORS configuration in backend code
- Ensure URLs match exactly (https, no trailing slash)

## 💰 Pricing

### Free Tier
- **Web Services**: 750 hours/month
- **Static Sites**: Unlimited
- **Bandwidth**: 100 GB/month
- **Build Minutes**: 500 minutes/month
- **Limitations**: Services sleep after 15 min inactivity

### Starter Plan ($7/month per service)
- Always-on services
- No sleep/cold starts
- Better performance
- Priority support

### Professional Plan ($25/month per service)
- Horizontal scaling
- Custom domains
- Advanced metrics
- Team collaboration

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use Render's environment variable encryption
   - Rotate secrets regularly

2. **Database Security**
   - Use strong passwords
   - Enable MongoDB Atlas encryption
   - Regular backups

3. **HTTPS**
   - Automatic SSL certificates
   - Force HTTPS redirects
   - HSTS headers enabled

4. **Access Control**
   - Limit team access
   - Use GitHub OAuth for deployments
   - Enable 2FA on Render account

## 🚀 Performance Optimization

### Backend Optimization

1. **Enable Caching**
   - Use Redis for session storage
   - Cache API responses
   - Implement CDN for static assets

2. **Database Optimization**
   - Create indexes for frequent queries
   - Use connection pooling
   - Implement query optimization

### Frontend Optimization

1. **Build Optimization**
   - Enable production build
   - Code splitting
   - Tree shaking
   - Minification (automatic)

2. **Asset Optimization**
   - Compress images
   - Use WebP format
   - Lazy load components
   - Enable Render's CDN

## 📊 Custom Domains

1. **Add Custom Domain**
   - Go to service settings
   - Click **Custom Domains**
   - Add your domain
   - Update DNS records as instructed

2. **DNS Configuration**
   - Add CNAME record pointing to Render
   - Wait for DNS propagation (up to 48 hours)
   - SSL certificate issued automatically

## 🔄 Continuous Integration

### GitHub Actions Integration

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Trigger Render Deploy
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Render Status Page](https://status.render.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Render
- [ ] All environment variables set correctly
- [ ] GitHub OAuth configured with Render URLs
- [ ] Database connection tested
- [ ] Frontend can communicate with backend
- [ ] IBM Bob integration working
- [ ] Custom domain configured (optional)
- [ ] Monitoring and alerts set up
- [ ] Backup strategy in place

## 🆘 Support

**Render Support:**
- Email: support@render.com
- Community: community.render.com
- Status: status.render.com

**CodeFlow AI Issues:**
- GitHub Issues: Your repository issues page
- Documentation: Check README.md and other guides

---

**Congratulations!** 🎉 Your CodeFlow AI application is now live on Render!

**URLs:**
- Frontend: `https://codeflow-ai.onrender.com`
- Backend: `https://codeflow-ai-backend.onrender.com`
- API Health: `https://codeflow-ai-backend.onrender.com/health`