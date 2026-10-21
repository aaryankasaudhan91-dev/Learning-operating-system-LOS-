import {auth,login,signOut,onAuthStateChanged,resetPassword,type User} from '../lib/firebase';
export const authService={getCurrentUser:():User|null=>auth.currentUser,login,logout:()=>signOut(auth),resetPassword,onAuthChange:(callback:(user:User|null)=>void)=>onAuthStateChanged(auth,callback)};
