
import { httpsCallable } from "firebase/functions";
import { functions } from "@/integrations/firebase/client";

/**
 * Initialize claims for the current user
 */
export const initializeUserClaims = async (): Promise<boolean> => {
  try {
    console.log('Calling initializeUserClaimsNew function...');
    
    const initializeFunction = httpsCallable(functions, 'initializeUserClaimsNew');
    const result = await initializeFunction({});
    
    console.log('Claims initialized:', result.data);
    return true;
  } catch (error: any) {
    console.error('Error initializing user claims:', error);
    
    if (error.code === 'functions/unauthenticated') {
      throw new Error('You must be authenticated to initialize claims');
    } else if (error.code === 'functions/not-found') {
      throw new Error('Claims initialization function not found. Please ensure Firebase Functions are deployed.');
    } else {
      throw new Error(error.message || 'Failed to initialize user claims');
    }
  }
};

/**
 * Set custom claims for a user (superadmin only)
 */
export const setUserClaims = async (userId: string, role: string, company: string): Promise<boolean> => {
  try {
    console.log('Setting user claims:', { userId, role, company });
    
    const setClaimsFunction = httpsCallable(functions, 'setUserCustomClaimsNew');
    const result = await setClaimsFunction({ userId, role, company });
    
    console.log('Claims set successfully:', result.data);
    return true;
  } catch (error: any) {
    console.error('Error setting user claims:', error);
    
    if (error.code === 'functions/unauthenticated') {
      throw new Error('You must be authenticated to set user claims');
    } else if (error.code === 'functions/permission-denied') {
      throw new Error('Only superadmins can set user claims');
    } else if (error.code === 'functions/not-found') {
      throw new Error('Claims management function not found. Please ensure Firebase Functions are deployed.');
    } else {
      throw new Error(error.message || 'Failed to set user claims');
    }
  }
};
