# Netlify Deployment Guide for CodeFlow AI

This guide explains how to deploy CodeFlow AI to Netlify. Since CodeFlow AI is a full-stack application, we'll deploy the frontend to Netlify and the backend separately.

## 📋 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CodeFlow AI Deployment                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐         ┌──────────────┐              │
│  │   Netlify    │────────▶│   Backend    │              │
│  │  (Frontend)  │   API   │  (Heroku/    │              │
│  │              │  Calls  │   Render/    │              │
│  └──────────────┘         │   Railway)   │              │
│         │                 └──────────────┘              │
│         │                        │                       │
│         │                        ▼                       │
│         │                 ┌──────────────┐              │
│         │                 │   MongoDB    │              │
│         │                 │   Atlas      │              │
│         │                 └──────────────┘              │
│         │                                                │
│         └────────────────▶ Firebase (Optional)          │
│                            - Authentication              │
│                            - Firestore                   │
│                            - Storage                     │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Option 1: Frontend on Netlify + Backend on Heroku/Render

### Step 1: Prepare Your Repository

1. **Ensure your code is on GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Create Netlify configuration file**
   Already created: `netlify.toml` (see below)

### Step 2: Deploy Backend First

#### Option A: Deploy Backend to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku app**
   ```bash
   cd backend
   heroku create codeflow-ai-backend
   ```

4. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri
   heroku config:set GITHUB_CLIENT_ID=your_github_client_id
   heroku config:set GITHUB_CLIENT_SECRET=your_github_client_secret
   heroku config:set SESSION_SECRET=your_session_secret
   heroku config:set BOB_API_KEY=your_bob_api_key
   heroku config:set BOB_API_ENDPOINT=your_bob_endpoint
   heroku config:set FRONTEND_URL=https://your-netlify-app.netlify.app
   ```

5. **Deploy to Heroku**
   ```bash
   git subtree push --prefix backend heroku main
   ```

#### Option B: Deploy Backend to Render

1. Go to [Render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: codeflow-ai-backend
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (same as Heroku list above)
6. Click **"Create Web Service"**

#### Option C: Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Configure:
   - **Root Directory**: backend
   - Add environment variables
5. Deploy automatically

### Step 3: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string
6. Update backend environment variable `MONGODB_URI`

### Step 4: Deploy Frontend to Netlify

#### Method A: Deploy via Netlify UI (Recommended)

1. **Go to [Netlify](https://www.netlify.com)**
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
5. Click **"Show advanced"** and add environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.herokuapp.com
   REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```
6. Click **"Deploy site"**

#### Method B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Netlify in your project**
   ```bash
   cd frontend
   netlify init
   ```

4. **Build your React app**
   ```bash
   npm run build
   ```

5. **Deploy to Netlify**
   ```bash
   netlify deploy --prod
   ```

### Step 5: Configure Custom Domain (Optional)

1. In Netlify dashboard, go to **"Domain settings"**
2. Click **"Add custom domain"**
3. Follow instructions to configure DNS
4. Enable HTTPS (automatic with Netlify)

### Step 6: Update GitHub OAuth Callback URLs

1. Go to GitHub Developer Settings
2. Update OAuth App callback URLs:
   - Add: `https://your-netlify-app.netlify.app/auth/callback`
   - Add: `https://your-backend-url.herokuapp.com/api/auth/github/callback`

## 🔥 Option 2: Frontend on Netlify + Firebase (Serverless)

If you want to avoid managing a backend server, use Firebase:

### Step 1: Set Up Firebase (Follow FIREBASE_SETUP.md)

### Step 2: Update Frontend to Use Firebase

The frontend is already configured to use Firebase. Just ensure:
1. Firebase environment variables are set in Netlify
2. Firebase services are enabled (Auth, Firestore, Storage)

### Step 3: Deploy to Netlify

Same as Option 1, Step 4, but you don't need `REACT_APP_API_URL`

## 📝 Netlify Configuration File

Create `netlify.toml` in project root:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## 🔒 Environment Variables Setup

### Frontend Environment Variables (Netlify)

Go to **Site settings** → **Environment variables** and add:

```
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
REACT_APP_NAME=CodeFlow AI
REACT_APP_VERSION=1.0.0

# Firebase (if using)
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Backend Environment Variables (Heroku/Render)

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codeflow
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-backend.herokuapp.com/api/auth/github/callback
SESSION_SECRET=your_random_secret_key
BOB_API_KEY=your_bob_api_key
BOB_API_ENDPOINT=https://bob-api.ibm.com
BOB_MODEL=bob-default
FRONTEND_URL=https://your-app.netlify.app
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

## 🔄 Continuous Deployment

Netlify automatically deploys when you push to GitHub:

1. **Push to main branch** → Production deployment
2. **Push to other branches** → Preview deployments
3. **Pull requests** → Deploy previews

Configure in Netlify:
- **Site settings** → **Build & deploy** → **Continuous deployment**

## 🧪 Testing Your Deployment

1. **Check frontend**: Visit your Netlify URL
2. **Check backend**: Visit `https://your-backend-url.herokuapp.com/health`
3. **Test authentication**: Try GitHub OAuth login
4. **Test API**: Check repository connection features
5. **Test IBM Bob**: Try chat functionality

## 🐛 Troubleshooting

### Build Fails on Netlify

**Issue**: Build command fails
**Solution**: 
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version matches local environment

### CORS Errors

**Issue**: Frontend can't connect to backend
**Solution**:
- Add Netlify URL to backend CORS whitelist
- Update `FRONTEND_URL` in backend environment variables

### Environment Variables Not Working

**Issue**: App can't access environment variables
**Solution**:
- Ensure variables start with `REACT_APP_` for React
- Redeploy after adding variables
- Check variable names match exactly

### GitHub OAuth Not Working

**Issue**: OAuth redirect fails
**Solution**:
- Update GitHub OAuth app callback URLs
- Ensure URLs match exactly (https, no trailing slash)
- Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

### MongoDB Connection Fails

**Issue**: Backend can't connect to MongoDB
**Solution**:
- Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas
- Check connection string format
- Verify database user credentials

## 📊 Monitoring and Analytics

### Netlify Analytics
- Enable in **Site settings** → **Analytics**
- View traffic, performance, and errors

### Backend Monitoring
- **Heroku**: Use Heroku metrics or add-ons like Papertrail
- **Render**: Built-in metrics dashboard
- **Railway**: Built-in observability

## 💰 Cost Estimation

### Free Tier Limits

**Netlify Free Tier:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

**Heroku Free Tier (Deprecated):**
- Use Eco Dynos ($5/month)

**Render Free Tier:**
- 750 hours/month
- Sleeps after 15 min inactivity

**MongoDB Atlas Free Tier:**
- 512 MB storage
- Shared cluster

**Firebase Free Tier:**
- 10 GB storage
- 50K reads/day
- 20K writes/day

## 🚀 Production Checklist

- [ ] Backend deployed and accessible
- [ ] MongoDB Atlas configured and connected
- [ ] All environment variables set correctly
- [ ] GitHub OAuth configured with correct URLs
- [ ] Frontend deployed to Netlify
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled (automatic on Netlify)
- [ ] Error monitoring set up
- [ ] Analytics enabled
- [ ] Backup strategy in place
- [ ] Documentation updated with live URLs

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Firebase Documentation](https://firebase.google.com/docs)

## 🆘 Support

For deployment issues:
1. Check Netlify build logs
2. Check backend logs (Heroku/Render dashboard)
3. Review MongoDB Atlas metrics
4. Test API endpoints with Postman
5. Check browser console for frontend errors

---

**Congratulations!** 🎉 Your CodeFlow AI application is now live on Netlify!

Visit your site: `https://your-app.netlify.app`