
import { createUser } from './simpleUserService';
import { sendInvitationEmail } from '../email/invitationService';
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
  password: string;
}

interface InvitationResult {
  success: boolean;
  message: string;
  userCreated: boolean;
  emailSent: boolean;
  errors: string[];
  password?: string;
}

/**
 * Comprehensive user invitation service that creates user and sends invitation email with credentials
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
    errors: [],
    password: userData.password
  };
  
  try {
    console.log(`Starting invitation process for ${userData.email}`);
    
    // Step 1: Create the user with the provided password
    console.log("Creating user account...");
    const userCreationResult = await createUser(userData);
    
    if (!userCreationResult.success) {
      result.errors.push(`User creation failed: ${userCreationResult.message}`);
      result.message = `Failed to create user: ${userCreationResult.message}`;
      return result;
    }
    
    result.userCreated = true;
    console.log("User created successfully, now sending invitation email with login credentials...");
    
    // Step 2: Send invitation email with login credentials
    const emailResult = await sendInvitationEmail(
      userData.email,
      `${userData.first_name} ${userData.last_name}`,
      userData.password,
      userData.company,
      senderName
    );
    
    if (emailResult.success) {
      result.emailSent = true;
      result.success = true;
      result.message = `Success: User ${userData.first_name} ${userData.last_name} has been created and invitation email with login credentials sent to ${userData.email}`;
      console.log("Invitation process completed successfully");
    } else {
      result.errors.push(`Email sending failed: ${emailResult.message}`);
      result.message = `User created successfully, but invitation email failed to send: ${emailResult.message}`;
      console.warn("User created but email failed:", emailResult.message);
    }
    
    return result;
    
  } catch (error) {
    console.error("Error in invitation process:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    result.errors.push(errorMessage);
    result.message = `Invitation process failed: ${errorMessage}`;
    
    return result;
  }
};
