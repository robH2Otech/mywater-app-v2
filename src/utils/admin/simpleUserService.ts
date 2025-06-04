
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UserRole, UserStatus } from "@/types/users";

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company: string;
  job_title?: string;
  role: UserRole;
  status: UserStatus;
}

export interface CreateUserResponse {
  success: boolean;
  userId: string;
  message: string;
}

/**
 * Simple user creation that only creates a Firestore document
 * User will need to sign up with their email later
 */
export const createUser = async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
  try {
    console.log('Creating user document:', userData.email);
    
    // Validate required fields
    if (!userData.email || !userData.first_name || !userData.last_name || !userData.company) {
      throw new Error('Missing required fields: first_name, last_name, email, and company are required');
    }

    // Generate a temporary user ID (will be replaced when user actually signs up)
    const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user document in Firestore
    const userDocData = {
      id: tempUserId,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone || '',
      company: userData.company,
      job_title: userData.job_title || '',
      role: userData.role,
      status: 'pending' as UserStatus, // Always start as pending until they sign up
      is_invited: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to Firestore
    await setDoc(doc(db, 'app_users_business', tempUserId), userDocData);
    
    console.log('User document created successfully');

    return {
      success: true,
      userId: tempUserId,
      message: 'User invited successfully. They will need to sign up with their email.'
    };
    
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    let errorMessage = 'Failed to create user';
    if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};
