import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { auth, db, storage, googleProvider, githubProvider } from '../config/firebase';

class FirebaseService {
  // Authentication Methods
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await this.createOrUpdateUser(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signInWithGithub() {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      await this.createOrUpdateUser(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signUpWithEmail(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await this.createOrUpdateUser(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  // User Management
  async createOrUpdateUser(user) {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (!userDoc.exists()) {
      userData.createdAt = serverTimestamp();
    }

    await setDoc(userRef, userData, { merge: true });
    return userData;
  }

  async getUserProfile(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() ? { success: true, data: userDoc.data() } : { success: false };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Repository Management
  async createRepository(userId, repositoryData) {
    try {
      const repoRef = await addDoc(collection(db, 'repositories'), {
        userId,
        ...repositoryData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: repoRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getRepositories(userId) {
    try {
      const q = query(
        collection(db, 'repositories'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const repositories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: repositories };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getRepository(repoId) {
    try {
      const repoRef = doc(db, 'repositories', repoId);
      const repoDoc = await getDoc(repoRef);
      return repoDoc.exists() 
        ? { success: true, data: { id: repoDoc.id, ...repoDoc.data() } }
        : { success: false, error: 'Repository not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateRepository(repoId, updates) {
    try {
      const repoRef = doc(db, 'repositories', repoId);
      await updateDoc(repoRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteRepository(repoId) {
    try {
      await deleteDoc(doc(db, 'repositories', repoId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Chat Session Management
  async createChatSession(userId, repositoryId, title) {
    try {
      const sessionRef = await addDoc(collection(db, 'chatSessions'), {
        userId,
        repositoryId,
        title,
        messages: [],
        context: { mode: 'ask' },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: sessionRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getChatSessions(userId, repositoryId = null) {
    try {
      let q = query(
        collection(db, 'chatSessions'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      if (repositoryId) {
        q = query(q, where('repositoryId', '==', repositoryId));
      }

      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: sessions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getChatSession(sessionId) {
    try {
      const sessionRef = doc(db, 'chatSessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);
      return sessionDoc.exists()
        ? { success: true, data: { id: sessionDoc.id, ...sessionDoc.data() } }
        : { success: false, error: 'Session not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addMessageToSession(sessionId, message) {
    try {
      const sessionRef = doc(db, 'chatSessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (!sessionDoc.exists()) {
        return { success: false, error: 'Session not found' };
      }

      const messages = sessionDoc.data().messages || [];
      messages.push({
        ...message,
        timestamp: new Date().toISOString()
      });

      await updateDoc(sessionRef, {
        messages,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateSessionContext(sessionId, context) {
    try {
      const sessionRef = doc(db, 'chatSessions', sessionId);
      await updateDoc(sessionRef, {
        context,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // File Storage
  async uploadFile(file, path) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { success: true, url: downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteFile(path) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getFileURL(path) {
    try {
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      return { success: true, url };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new FirebaseService();

// Made with Bob
