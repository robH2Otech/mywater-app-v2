
import { signOut } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";

// Export everything from our separate auth utilities
export * from "./emailAuth";
export * from "./socialAuth";
export * from "./userVerification";
export * from "./authErrors";

/**
 * Sign Out
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
    // Clear any session data
    sessionStorage.removeItem('userDisplayName');
    sessionStorage.removeItem('userInitials');
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
