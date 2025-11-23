// src/lib/googleAuth.ts
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";
import { getProfile, setProfile, type Profile } from "./profile";

/**
 * Sign in with Google (web) and sync into our local Profile.
 * Returns the updated profile.
 */
export async function signInWithGoogle(): Promise<Profile> {
  const provider = new GoogleAuthProvider();

  // Ask Google
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const prev = getProfile();

  const next = setProfile({
    uid: user.uid,
    userId: user.uid,
    name: user.displayName || prev.name || "Player",
    avatarUrl: user.photoURL || prev.avatarUrl,
    // we keep existing country if user already chose it
    country: prev.country || "US",
    source: "LOCAL",
  });

  return next;
}
