
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";

export function useFirebaseAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/private-dashboard");
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (authMode === "login") {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check if user exists in private users collection
        await verifyPrivateUser(user.uid);
        
        console.log("Private user signed in:", user);
        navigate("/private-dashboard");
      } else {
        toast({
          title: "Please complete the registration form",
          description: "We need a few more details to set up your account.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      const authProvider = provider === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
      
      // Configure provider for better compatibility
      if (provider === 'google') {
        const googleProvider = authProvider as GoogleAuthProvider;
        googleProvider.setCustomParameters({
          prompt: 'select_account',
          login_hint: email || undefined
        });
      } else {
        const facebookProvider = authProvider as FacebookAuthProvider;
        facebookProvider.setCustomParameters({
          display: 'popup'
        });
      }
      
      const result = await signInWithPopup(auth, authProvider);
      
      // Get user info from credential
      const user = result.user;
      await handleSocialUserData(user, provider);
      
      // Navigate to the dashboard after successful sign-in or registration
      navigate("/private-dashboard");
    } catch (error: any) {
      console.error("Social auth error:", error);
      handleAuthError(error);
    } finally {
      setSocialLoading(null);
    }
  };
  
  return {
    isLoading,
    socialLoading,
    authMode,
    email,
    password,
    setAuthMode,
    setEmail,
    setPassword,
    handleEmailAuth,
    handleSocialAuth
  };
}

// Helper functions
async function verifyPrivateUser(uid: string) {
  // Check if user exists in app_users_privat collection
  const privateUsersRef = collection(db, "app_users_privat");
  const q = query(privateUsersRef, where("uid", "==", uid));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    // Check old collection as fallback
    const oldPrivateUsersRef = collection(db, "private_users");
    const oldQuery = query(oldPrivateUsersRef, where("uid", "==", uid));
    const oldSnapshot = await getDocs(oldQuery);
    
    if (oldSnapshot.empty) {
      throw new Error("No home user account found with these credentials.");
    } else {
      // Migrate to new collection
      const userData = oldSnapshot.docs[0].data();
      await addDoc(collection(db, "app_users_privat"), {
        ...userData,
        migrated_at: new Date().toISOString()
      });
    }
  }
}

async function handleSocialUserData(user: User, provider: string) {
  // First check if user already exists in app_users_privat collection
  const privateUsersRef = collection(db, "app_users_privat");
  const q = query(privateUsersRef, where("uid", "==", user.uid));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    // Check the old collection as fallback
    const oldPrivateUsersRef = collection(db, "private_users");
    const oldQuery = query(oldPrivateUsersRef, where("uid", "==", user.uid));
    const oldSnapshot = await getDocs(oldQuery);
    
    if (!oldSnapshot.empty) {
      // Migrate from old collection
      const userData = oldSnapshot.docs[0].data();
      await addDoc(collection(db, "app_users_privat"), {
        ...userData,
        migrated_at: new Date().toISOString()
      });
    } else {
      // Create a new user in app_users_privat collection
      // Extract user info from social login
      const name = user.displayName || '';
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      await addDoc(collection(db, "app_users_privat"), {
        uid: user.uid,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        created_at: new Date().toISOString(),
        auth_provider: provider
      });
    }
  }
}

function handleAuthError(error: any) {
  let errorMessage = "Authentication failed";
  
  if (error.code === 'auth/invalid-email') {
    errorMessage = "Invalid email address format";
  } else if (error.code === 'auth/user-disabled') {
    errorMessage = "This account has been disabled";
  } else if (error.code === 'auth/user-not-found') {
    errorMessage = "No account with this email exists";
  } else if (error.code === 'auth/wrong-password') {
    errorMessage = "Incorrect password";
  } else if (error.code === 'auth/email-already-in-use') {
    errorMessage = "An account with this email already exists";
  } else if (error.code === 'auth/weak-password') {
    errorMessage = "Password should be at least 6 characters";
  } else if (error.code === 'auth/account-exists-with-different-credential') {
    errorMessage = "An account already exists with the same email but different sign-in credentials.";
  } else if (error.code === 'auth/cancelled-popup-request') {
    errorMessage = "The sign-in popup was closed before completing authentication.";
  } else if (error.code === 'auth/popup-blocked') {
    errorMessage = "The sign-in popup was blocked by your browser.";
  } else if (error.code === 'auth/popup-closed-by-user') {
    errorMessage = "The sign-in popup was closed before completing authentication.";
  } else if (error.code === 'auth/unauthorized-domain') {
    errorMessage = "This domain is not authorized for OAuth operations. Please contact support.";
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  return errorMessage;
}
