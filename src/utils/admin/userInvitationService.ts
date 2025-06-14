import { createUser } from './simpleUserService';
import { sendInvitationEmail } from '../email/invitationEmail';
import { UserRole, UserStatus } from '@/types/users';

interface InviteUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  role: UserRole;
  status: UserStatus;
}

interface InvitationResult {
  success: boolean;
  message: string;
  userCreated: boolean;
  emailSent: boolean;
  errors: string[];
}

/**
 * Comprehensive user invitation service that creates user and sends invitation email
 */
export const inviteUser = async (
  userData: InviteUserData,
  senderName: string = "X-WATER Admin"
): Promise<InvitationResult> => {
  const result: InvitationResult = {
    success: false,
    message: '',
    userCreated: false,
    emailSent: false,
    errors: []
  };
  
  try {
    console.log(`Starting invitation process for ${userData.email}`);
    
    // Step 1: Create the user
    console.log("Creating user account...");
    const userCreationResult = await createUser(userData);
    
    if (!userCreationResult.success) {
      result.errors.push(`User creation failed: ${userCreationResult.message}`);
      result.message = `Failed to create user: ${userCreationResult.message}`;
      return result;
    }
    
    result.userCreated = true;
    console.log("User created successfully");
    
    // Step 2: Send invitation email
    console.log("Sending invitation email...");
    const emailResult = await sendInvitationEmail(
      userData.email,
      `${userData.first_name} ${userData.last_name}`,
      userData.company,
      senderName
    );
    
    if (emailResult.success) {
      result.emailSent = true;
      result.success = true;
      result.message = `User ${userData.first_name} ${userData.last_name} has been successfully created and invitation email sent to ${userData.email}`;
      console.log("Invitation process completed successfully");
    } else {
      result.errors.push(`Email sending failed: ${emailResult.message}`);
      result.message = `User created successfully, but invitation email failed to send. Please manually inform ${userData.email} about their account.`;
      console.warn("User created but email failed");
    }
    
    return result;
    
  } catch (error) {
    console.error("Error in invitation process:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMessage);
    result.message = `Invitation process failed: ${errorMessage}`;
    
    return result;
  }
};
