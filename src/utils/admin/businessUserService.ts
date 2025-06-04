
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
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
 * Create a new business user directly using Firebase Auth and Firestore
 */
export const createBusinessUser = async (userData: CreateBusinessUserRequest): Promise<CreateBusinessUserResponse> => {
  try {
    console.log('Creating business user directly via Firebase Auth:', userData.email);
    
    // Validate required fields
    if (!userData.email || !userData.password || !userData.first_name || !userData.last_name || !userData.company) {
      throw new Error('Missing required fields: first_name, last_name, email, password, and company are required');
    }

    // Store current user to restore after creation
    const currentUser = auth.currentUser;

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const newUser = userCredential.user;
    
    console.log('Firebase user created successfully:', newUser.uid);

    // Create user document in Firestore with proper structure
    const userDocData = {
      id: newUser.uid,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone || '',
      company: userData.company,
      job_title: userData.job_title || '',
      role: userData.role,
      status: userData.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to Firestore
    await setDoc(doc(db, 'app_users_business', newUser.uid), userDocData);
    
    console.log('Business user document created successfully in Firestore');

    // Immediately sign out the newly created user to avoid auth conflicts
    await auth.signOut();

    // Restore the original admin user session if it existed
    if (currentUser) {
      // Force a token refresh to ensure the admin is properly authenticated
      await currentUser.getIdToken(true);
    }

    const result = {
      success: true,
      userId: newUser.uid,
      message: 'Business user created successfully'
    };
    
    console.log('Business user creation completed:', result);
    return result;
    
  } catch (error: any) {
    console.error('Error creating business user:', error);
    
    // Provide more specific error messages based on Firebase Auth errors
    let errorMessage = 'Failed to create user';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email format';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Email/password authentication is not enabled';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};
