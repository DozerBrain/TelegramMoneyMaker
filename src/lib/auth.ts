// src/lib/auth.ts
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, User } from "firebase/auth";
import { getProfile, setProfile } from "./profile";

/**
 * Sign in with Google in the web app and merge into local Profile.
 * Returns the Firebase User if successful.
 */
export async function connectGoogleAccount(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  const user = cred.user;

  const prev = getProfile();

  setProfile({
    // use Firebase uid as our main uid, but fallback to previous if needed
    uid: user.uid || prev.uid || "",
    googleUid: user.uid,
    userId: prev.userId, // keep Telegram id if it existed
    name: user.displayName || prev.name || "Player",
    username: prev.username, // still for Telegram username
    email: user.email || prev.email,
    avatarUrl: user.photoURL || prev.avatarUrl,
    country: prev.country || "US",
    source: "GOOGLE",
  });

  return user;
}
