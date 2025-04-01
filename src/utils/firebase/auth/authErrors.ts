
import { currentDomain } from "@/integrations/firebase/client";

/**
 * Parse Firebase authentication errors
 */
export const getAuthErrorMessage = (error: any): string => {
  console.log("Processing auth error:", error.code, error.message);
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
    errorMessage = `This domain (${currentDomain}) is not authorized for OAuth operations. Please contact support.`;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  return errorMessage;
};
