import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export const authService = {
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  async login(email: string, pass: string) {
    return await signInWithEmailAndPassword(auth, email, pass);
  },

  async register(email: string, pass: string) {
    return await createUserWithEmailAndPassword(auth, email, pass);
  },

  async logout() {
    return await signOut(auth);
  },

  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};
