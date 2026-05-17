# Render Deployment Troubleshooting Guide

## 🚨 Common Error: MongoDB Connection Failed

### Error Message:
```
Assertion failed: You must provide either mongoUrl|clientPromise|client in options
Error: Cannot init client. Please provide correct options
```

### ✅ Solution:

This error occurs when the `MONGODB_URI` environment variable is not set in Render. Follow these steps:

#### Step 1: Set MongoDB URI in Render

1. **Go to your Render dashboard**
   - Navigate to [dashboard.render.com](https://dashboard.render.com)
   - Click on your backend service (`codeflow-ai-backend`)

2. **Add Environment Variable**
   - Click **"Environment"** in the left sidebar
   - Click **"Add Environment Variable"**
   - Add the following:
     - **Key**: `MONGODB_URI`
     - **Value**: Your MongoDB Atlas connection string
       ```
       mongodb+srv://username:password@cluster.mongodb.net/codeflow?retryWrites=true&w=majority
       ```
   - Click **"Save Changes"**

3. **Service will automatically redeploy**
   - Wait 2-3 minutes for the redeploy
   - Check logs to verify successful connection

#### Step 2: Get MongoDB Connection String

If you don't have a MongoDB connection string:

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free

2. **Create Cluster**
   - Click **"Build a Database"**
   - Choose **"M0 Free"** tier
   - Select region closest to your Render service
   - Click **"Create"**

3. **Create Database User**
   - Go to **"Database Access"**
   - Click **"Add New Database User"**
   - Choose **"Password"** authentication
   - Create username and strong password
   - Set privileges to **"Read and write to any database"**
   - Click **"Add User"**

4. **Whitelist IP Addresses**
   - Go to **"Network Access"**
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Click **"Confirm"**

5. **Get Connection String**
   - Go to **"Database"** → **"Connect"**
   - Choose **"Connect your application"**
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `codeflow` (or your preferred name)

#### Step 3: Verify All Required Environment Variables

Make sure these are set in Render:

**Required Variables:**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codeflow
SESSION_SECRET=your_random_secret_32_chars_minimum
```

**GitHub OAuth (if using):**
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-backend.onrender.com/api/auth/github/callback
```

**IBM Bob Integration:**
```
BOB_API_KEY=your_bob_api_key
BOB_API_ENDPOINT=https://bob-api.ibm.com
BOB_MODEL=bob-default
```

**Frontend URL:**
```
FRONTEND_URL=https://your-frontend.onrender.com
```

**File Upload:**
```
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

## 🔧 Other Common Issues

### Issue: Build Fails with "Cannot find module"

**Solution:**
1. Check that all dependencies are in `package.json`
2. Delete `node_modules` and `package-lock.json` locally
3. Run `npm install` to regenerate
4. Commit and push changes

### Issue: Service Keeps Restarting

**Solution:**
1. Check logs for error messages
2. Verify all environment variables are set
3. Test locally with same environment variables
4. Check for port conflicts (use `process.env.PORT`)

### Issue: "Cannot GET /" Error

**Solution:**
1. Verify your routes are properly mounted
2. Check that Express app is listening on correct port
3. Add a root route handler:
   ```javascript
   app.get('/', (req, res) => {
     res.json({ message: 'CodeFlow AI Backend API' });
   });
   ```

### Issue: CORS Errors

**Solution:**
1. Verify `FRONTEND_URL` environment variable is set correctly
2. Update CORS configuration in `server.js`:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true
   }));
   ```

### Issue: GitHub OAuth Not Working

**Solution:**
1. Verify GitHub OAuth app callback URL matches Render URL
2. Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
3. Ensure `GITHUB_CALLBACK_URL` matches exactly (https, no trailing slash)

### Issue: Session Not Persisting

**Solution:**
1. Verify `MONGODB_URI` is set (sessions stored in MongoDB)
2. Check `SESSION_SECRET` is set and at least 32 characters
3. Ensure cookies are enabled in browser
4. For production, set `secure: true` in cookie config

### Issue: File Uploads Failing

**Solution:**
1. Check `UPLOAD_DIR` environment variable
2. Verify disk space on Render (free tier has limits)
3. Consider using cloud storage (S3, Firebase Storage) for production
4. Check `MAX_FILE_SIZE` setting

## 📊 Checking Logs

### View Real-Time Logs:
1. Go to Render dashboard
2. Click on your service
3. Click **"Logs"** tab
4. Logs update in real-time

### Filter Logs:
- Use search box to filter by keyword
- Look for ERROR or WARN messages
- Check timestamps for recent issues

### Download Logs:
- Click **"Download"** button
- Save for detailed analysis
- Share with support if needed

## 🔍 Testing Your Deployment

### Test Backend Health:
```bash
curl https://your-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

### Test API Endpoints:
```bash
# Test repositories endpoint
curl https://your-backend.onrender.com/api/repositories

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-backend.onrender.com/api/repositories
```

### Test Frontend:
1. Open `https://your-frontend.onrender.com` in browser
2. Check browser console for errors
3. Test navigation between pages
4. Try connecting a repository

## 🆘 Getting Help

### Render Support:
- **Email**: support@render.com
- **Community**: [community.render.com](https://community.render.com)
- **Status**: [status.render.com](https://status.render.com)
- **Docs**: [render.com/docs](https://render.com/docs)

### MongoDB Atlas Support:
- **Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Community**: [community.mongodb.com](https://community.mongodb.com)
- **Support**: Available in Atlas dashboard

### Quick Checklist:

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] IP whitelist set to 0.0.0.0/0
- [ ] Connection string copied correctly
- [ ] `MONGODB_URI` set in Render environment variables
- [ ] All other required environment variables set
- [ ] Service redeployed after adding variables
- [ ] Logs checked for errors
- [ ] Health endpoint returns 200 OK
- [ ] Frontend can connect to backend

## 💡 Pro Tips

1. **Always check logs first** - Most issues are visible in logs
2. **Test locally** - Replicate Render environment variables locally
3. **Use health checks** - Implement `/health` endpoint for monitoring
4. **Set up alerts** - Configure email alerts for service failures
5. **Monitor metrics** - Watch CPU, memory, and response times
6. **Keep secrets secure** - Never commit environment variables to Git
7. **Use staging environment** - Test changes before production deploy

## 🔄 Redeploying After Fixes

### Manual Redeploy:
1. Go to Render dashboard
2. Click on your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Automatic Redeploy:
1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Fix: MongoDB connection issue"
   git push origin main
   ```
3. Render automatically detects and deploys

---

**Still having issues?** Check the main deployment guide: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)