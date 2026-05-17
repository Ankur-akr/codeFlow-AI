# Firebase Setup Guide for CodeFlow AI

This guide will help you set up Firebase for CodeFlow AI, providing an alternative to MongoDB with additional features like authentication, real-time database, and file storage.

## 📋 Prerequisites

- Google account
- Node.js 18+ installed
- CodeFlow AI project cloned

## 🔥 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `codeflow-ai` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Click **"Create project"**

## 🔧 Step 2: Register Your Web App

1. In Firebase Console, click the **Web icon** (</>) to add a web app
2. Enter app nickname: `CodeFlow AI Web`
3. Check **"Also set up Firebase Hosting"** (optional)
4. Click **"Register app"**
5. Copy the Firebase configuration object - you'll need these values

## 🔑 Step 3: Configure Environment Variables

1. Open `frontend/.env.example` in your project
2. Copy it to create `frontend/.env`:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

3. Fill in your Firebase credentials in `frontend/.env`:
   ```env
   REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   REACT_APP_FIREBASE_AUTH_DOMAIN=codeflow-ai.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=codeflow-ai
   REACT_APP_FIREBASE_STORAGE_BUCKET=codeflow-ai.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
   REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

## 🔐 Step 4: Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **"Get started"**
3. Enable the following sign-in methods:

### Google Sign-In
- Click **Google** in the sign-in providers list
- Toggle **Enable**
- Enter support email
- Click **Save**

### GitHub Sign-In
- Click **GitHub** in the sign-in providers list
- Toggle **Enable**
- Go to [GitHub Developer Settings](https://github.com/settings/developers)
- Click **"New OAuth App"**
- Fill in:
  - **Application name**: CodeFlow AI
  - **Homepage URL**: `http://localhost:3000`
  - **Authorization callback URL**: Get from Firebase (shown in the GitHub provider settings)
- Copy Client ID and Client Secret to Firebase
- Click **Save**

### Email/Password Sign-In
- Click **Email/Password** in the sign-in providers list
- Toggle **Enable**
- Click **Save**

## 📊 Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll add security rules later)
4. Select your preferred location (choose closest to your users)
5. Click **"Enable"**

### Configure Security Rules

Go to **Rules** tab and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Repositories collection
    match /repositories/{repoId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    // Chat sessions collection
    match /chatSessions/{sessionId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
  }
}
```

Click **"Publish"** to save the rules.

## 📦 Step 6: Set Up Cloud Storage

1. In Firebase Console, go to **Build** → **Storage**
2. Click **"Get started"**
3. Choose **"Start in production mode"**
4. Select your preferred location
5. Click **"Done"**

### Configure Storage Rules

Go to **Rules** tab and update with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User uploads
    match /uploads/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Repository files
    match /repositories/{userId}/{repoId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **"Publish"** to save the rules.

## 📦 Step 7: Install Firebase Dependencies

In your frontend directory, install Firebase SDK:

```bash
cd frontend
npm install firebase
```

## 🧪 Step 8: Test Firebase Integration

1. Start your development server:
   ```bash
   npm start
   ```

2. Open browser console and check for Firebase initialization
3. Try signing in with Google or GitHub
4. Verify user data is stored in Firestore

## 🔄 Step 9: Firestore Data Structure

Your Firestore database will have the following collections:

### Users Collection
```javascript
users/{userId}
  - uid: string
  - email: string
  - displayName: string
  - photoURL: string
  - createdAt: timestamp
  - lastLogin: timestamp
  - updatedAt: timestamp
```

### Repositories Collection
```javascript
repositories/{repoId}
  - userId: string
  - name: string
  - source: string (github|upload|git-url)
  - language: string
  - fileCount: number
  - files: array
  - analysis: object
  - createdAt: timestamp
  - updatedAt: timestamp
```

### Chat Sessions Collection
```javascript
chatSessions/{sessionId}
  - userId: string
  - repositoryId: string
  - title: string
  - messages: array
    - role: string (user|assistant)
    - content: string
    - timestamp: string
    - metadata: object
  - context: object
    - mode: string
    - repository_context: object
  - createdAt: timestamp
  - updatedAt: timestamp
```

## 🚀 Step 10: Deploy to Firebase Hosting (Optional)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select **Hosting**
   - Choose your Firebase project
   - Set public directory to `build`
   - Configure as single-page app: **Yes**
   - Don't overwrite index.html

4. Build your React app:
   ```bash
   npm run build
   ```

5. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

## 🔒 Security Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use environment-specific configs** - Different configs for dev/staging/prod
3. **Enable App Check** - Protect your Firebase resources from abuse
4. **Set up billing alerts** - Monitor Firebase usage
5. **Review security rules regularly** - Ensure proper access control
6. **Enable audit logging** - Track database access

## 📊 Monitoring and Analytics

1. Go to **Analytics** → **Dashboard** to view user engagement
2. Check **Performance** tab for app performance metrics
3. Monitor **Firestore** usage in the Usage tab
4. Set up **Cloud Functions** for backend logic (optional)

## 🆘 Troubleshooting

### Authentication Issues
- Verify OAuth redirect URIs match exactly
- Check that authentication methods are enabled
- Ensure API keys are correct in `.env`

### Firestore Permission Errors
- Review security rules
- Check user authentication status
- Verify userId matches in documents

### Storage Upload Failures
- Check storage rules
- Verify file size limits
- Ensure proper authentication

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Storage](https://firebase.google.com/docs/storage)

## 🎉 You're All Set!

Your CodeFlow AI application is now configured with Firebase! You can now:
- ✅ Authenticate users with Google, GitHub, or Email
- ✅ Store repository data in Firestore
- ✅ Upload files to Cloud Storage
- ✅ Track analytics and performance
- ✅ Deploy to Firebase Hosting

For questions or issues, refer to the [Firebase Console](https://console.firebase.google.com/) or check the documentation.