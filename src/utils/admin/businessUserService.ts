
import { httpsCallable } from "firebase/functions";
import { functions } from "@/integrations/firebase/client";
import { UserRole, UserStatus } from "@/types/users";

export interface CreateBusinessUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company: string;
  job_title?: string;
  role: UserRole;
  status: UserStatus;
  password: string;
}

export interface CreateBusinessUserResponse {
  success: boolean;
  userId: string;
  message: string;
}

/**
 * Create a new business user using Firebase Cloud Functions
 * This prevents the current user from being signed out
 */
export const createBusinessUser = async (userData: CreateBusinessUserRequest): Promise<CreateBusinessUserResponse> => {
  try {
    console.log('Creating business user via cloud function:', userData.email);
    
    const createUserFunction = httpsCallable(functions, 'createBusinessUser');
    const result = await createUserFunction(userData);
    
    console.log('Business user created successfully:', result.data);
    return result.data as CreateBusinessUserResponse;
  } catch (error: any) {
    console.error('Error creating business user:', error);
    
    // Provide more specific error messages
    if (error.code === 'functions/unauthenticated') {
      throw new Error('You must be authenticated to create users');
    } else if (error.code === 'functions/permission-denied') {
      throw new Error('You don\'t have permission to create users or this role');
    } else if (error.code === 'functions/invalid-argument') {
      throw new Error('Invalid user data provided');
    } else if (error.code === 'functions/not-found') {
      throw new Error('User creation function not found. Please ensure Firebase Functions are deployed.');
    } else {
      throw new Error(error.message || 'Failed to create user');
    }
  }
};
