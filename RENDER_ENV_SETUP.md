# Render Environment Variables Setup Guide

Quick reference guide for setting up environment variables in Render for CodeFlow AI.

## 📋 Files Created

- **render-env-backend.txt** - Backend environment variables template
- **render-env-frontend.txt** - Frontend environment variables template

## 🚀 Quick Setup Steps

### Step 1: Get Your Credentials

Before setting up environment variables, gather these:

1. **MongoDB Atlas Connection String**
   - Go to [cloud.mongodb.com](https://cloud.mongodb.com)
   - Create cluster → Get connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/codeflow`

2. **IBM Bob API Credentials**
   - Get from your IBM Bob dashboard
   - You need: API Key and Endpoint URL

3. **GitHub OAuth Credentials** (optional)
   - Go to [github.com/settings/developers](https://github.com/settings/developers)
   - Create OAuth App
   - Get: Client ID and Client Secret

4. **Session Secret**
   - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Or let Render auto-generate

### Step 2: Set Up Backend Environment Variables

1. **Open render-env-backend.txt**
2. **Replace all `your_*` placeholders** with actual values
3. **Go to Render Dashboard**
   - Navigate to [dashboard.render.com](https://dashboard.render.com)
   - Click on your backend service (`codeflow-ai-backend`)
   - Click **"Environment"** in left sidebar

4. **Add Each Variable**
   - Click **"Add Environment Variable"**
   - Copy KEY from file (e.g., `MONGODB_URI`)
   - Copy VALUE from file (with your actual value)
   - Click **"Save Changes"**

5. **Repeat for all variables** in render-env-backend.txt

### Step 3: Set Up Frontend Environment Variables

1. **Open render-env-frontend.txt**
2. **Replace all `your_*` placeholders** with actual values
3. **Go to Render Dashboard**
   - Click on your frontend service (`codeflow-ai-frontend`)
   - Click **"Environment"** in left sidebar

4. **Add Each Variable**
   - Click **"Add Environment Variable"**
   - Copy KEY from file (e.g., `REACT_APP_API_URL`)
   - Copy VALUE from file (with your actual value)
   - Click **"Save Changes"**

5. **Repeat for all variables** in render-env-frontend.txt

## 📝 Environment Variables Reference

### Backend (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/codeflow` |
| `SESSION_SECRET` | Session encryption key | `32+ random characters` |
| `FRONTEND_URL` | Frontend URL | `https://codeflow-ai.onrender.com` |
| `BOB_API_KEY` | IBM Bob API key | Your IBM Bob API key |
| `BOB_API_ENDPOINT` | IBM Bob endpoint | `https://bob-api.ibm.com` |
| `BOB_MODEL` | IBM Bob model | `bob-default` |

### Backend (Optional)

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | From GitHub OAuth app |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | From GitHub OAuth app |
| `GITHUB_CALLBACK_URL` | OAuth callback URL | `https://your-backend.onrender.com/api/auth/github/callback` |
| `UPLOAD_DIR` | File upload directory | `./uploads` |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `104857600` (100MB) |

### Frontend (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://codeflow-ai-backend.onrender.com` |
| `REACT_APP_NAME` | App name | `CodeFlow AI` |
| `REACT_APP_VERSION` | App version | `1.0.0` |

### Frontend (Optional - Firebase)

| Variable | Description |
|----------|-------------|
| `REACT_APP_FIREBASE_API_KEY` | Firebase API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `REACT_APP_FIREBASE_APP_ID` | Firebase app ID |
| `REACT_APP_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |

## 🔒 Security Best Practices

1. **Never commit real values to Git**
   - Keep `render-env-*.txt` files local only
   - Add to `.gitignore` if needed

2. **Use strong secrets**
   - Session secret: 32+ random characters
   - MongoDB password: Strong, unique password
   - API keys: Keep secure, rotate regularly

3. **Limit access**
   - Only share credentials with team members who need them
   - Use Render's team features for collaboration

4. **Regular rotation**
   - Rotate secrets periodically
   - Update immediately if compromised

## 🔄 Updating Environment Variables

### To Update a Variable:

1. Go to Render dashboard
2. Click on your service
3. Click **"Environment"**
4. Find the variable
5. Click **"Edit"**
6. Update value
7. Click **"Save Changes"**
8. Service will automatically redeploy

### To Delete a Variable:

1. Find the variable in Environment tab
2. Click the **trash icon**
3. Confirm deletion
4. Service will redeploy

## ✅ Verification Checklist

After setting up environment variables:

### Backend Checklist:
- [ ] `NODE_ENV` set to `production`
- [ ] `PORT` set to `5000`
- [ ] `MONGODB_URI` set with valid connection string
- [ ] `SESSION_SECRET` set (32+ characters)
- [ ] `FRONTEND_URL` set to your frontend URL
- [ ] `BOB_API_KEY` set with valid key
- [ ] `BOB_API_ENDPOINT` set
- [ ] `BOB_MODEL` set
- [ ] GitHub OAuth variables set (if using)
- [ ] Service deployed successfully
- [ ] Health check returns 200 OK

### Frontend Checklist:
- [ ] `REACT_APP_API_URL` set to backend URL
- [ ] `REACT_APP_NAME` set
- [ ] `REACT_APP_VERSION` set
- [ ] Firebase variables set (if using)
- [ ] Service built successfully
- [ ] Site loads without errors
- [ ] Can connect to backend API

## 🧪 Testing Your Setup

### Test Backend:
```bash
# Health check
curl https://your-backend.onrender.com/health

# Expected response:
# {"status":"ok","database":"connected","timestamp":"..."}
```

### Test Frontend:
1. Open `https://your-frontend.onrender.com` in browser
2. Check browser console for errors
3. Try connecting a repository
4. Verify API calls work

## 🆘 Troubleshooting

### Backend won't start:
- Check all required variables are set
- Verify MongoDB connection string format
- Check logs for specific error messages

### Frontend can't connect to backend:
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

### MongoDB connection fails:
- Verify connection string format
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Verify database user credentials

## 📚 Additional Resources

- [Render Environment Variables Docs](https://render.com/docs/environment-variables)
- [MongoDB Atlas Connection Strings](https://docs.atlas.mongodb.com/driver-connection/)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Firebase Console](https://console.firebase.google.com/)

## 💡 Pro Tips

1. **Use Render's "Generate Value" button** for SESSION_SECRET
2. **Set up staging environment** with separate variables
3. **Document your variables** in a secure password manager
4. **Test locally first** with same environment variables
5. **Monitor logs** after deploying with new variables

---

**Need help?** Check [RENDER_TROUBLESHOOTING.md](./RENDER_TROUBLESHOOTING.md) for common issues and solutions.