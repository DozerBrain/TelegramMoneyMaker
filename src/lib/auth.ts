// src/lib/auth.ts
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, User } from "firebase/auth";
import { getProfile, setProfile } from "./profile";

/**
 * Sign in with Google in the web app and merge into local Profile.
 * Returns the Firebase User if successful.
 */
export async function connectGoogleAccount(): Promise<User> {
  // Do popup sign-in
  const cred = await signInWithPopup(auth, googleProvider);
  const user = cred.user;

  const prev = getProfile();

  // Build new profile info from Google user
  setProfile({
    uid: user.uid,
    userId: user.uid,
    name: user.displayName || prev.name || "Player",
    username: user.email || prev.username,
    avatarUrl: user.photoURL || prev.avatarUrl,
    source: "GOOGLE",
  });

  return user;
}
