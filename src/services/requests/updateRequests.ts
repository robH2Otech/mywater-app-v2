
import { doc, updateDoc, DocumentData, addDoc, collection } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { sendEmailDirect } from "@/utils/email";
import { SupportRequest, Comment, RequestFormData } from "@/types/supportRequests";

/**
 * Update a request's status
 */
export const updateRequestStatus = async (
  id: string, 
  status: "new" | "in_progress" | "resolved",
  requests: SupportRequest[]
): Promise<SupportRequest[]> => {
  try {
    // Handle sample data
    if (id.startsWith("sample")) {
      return requests.map(request => 
        request.id === id ? { ...request, status } : request
      );
    }
    
    // Handle real data
    const requestRef = doc(db, "support_requests", id);
    await updateDoc(requestRef, { status });
    
    // Update the local state to reflect the change
    return requests.map(request => 
      request.id === id ? { ...request, status } : request
    );
  } catch (error) {
    console.error("Error updating request status:", error);
    throw error;
  }
};

/**
 * Add a comment to a request
 */
export const addCommentToRequest = async (
  request: SupportRequest,
  commentText: string,
  author: string,
  assignedTo: string,
  requests: SupportRequest[]
): Promise<SupportRequest[]> => {
  try {
    // Create new comment
    const comment: Comment = {
      id: Date.now().toString(),
      author: author || "Admin",
      content: commentText,
      created_at: new Date()
    };
    
    // Get existing comments or initialize empty array
    const existingComments = request.comments || [];
    
    // Handle sample data
    if (request.id.startsWith("sample")) {
      const updatedRequest: SupportRequest = { 
        ...request,
        comments: [...existingComments, comment],
        assigned_to: assignedTo || request.assigned_to,
        status: "in_progress"
      };
      
      return requests.map(req => 
        req.id === request.id ? updatedRequest : req
      );
    }
    
    // Handle real data
    const requestRef = doc(db, "support_requests", request.id);
    
    // Update request with new comment and assigned technician
    await updateDoc(requestRef, { 
      comments: [...existingComments, comment],
      assigned_to: assignedTo || null,
      status: "in_progress", // Ensure status is in_progress
    });
    
    // Send an email notification to the user
    try {
      await sendEmailDirect(
        request.user_email,
        request.user_name,
        "MYWATER Support",
        `Update on your support request: ${request.subject}`,
        `Dear ${request.user_name},\n\nYour support request has been updated. A technician has been assigned to your case.\n\nComment: ${commentText}\n\nThank you for your patience,\nMYWATER Support Team`
      );
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
    }
    
    // Update local state
    return requests.map(req => 
      req.id === request.id 
        ? { 
            ...req, 
            comments: [...(req.comments || []), comment],
            assigned_to: assignedTo || req.assigned_to,
            status: "in_progress" as const
          } 
        : req
    );
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

/**
 * Create a new support request
 */
export const createSupportRequest = async (formData: RequestFormData): Promise<SupportRequest> => {
  if (!formData.user_name || !formData.user_email || !formData.subject || !formData.message) {
    throw new Error("Missing required fields");
  }

  // Add new request to Firestore
  const newRequest = {
    user_id: Date.now().toString(), // Placeholder ID
    user_name: formData.user_name,
    user_email: formData.user_email,
    subject: formData.subject,
    message: formData.message,
    support_type: formData.support_type,
    purifier_model: formData.purifier_model,
    status: "new" as const,
    created_at: new Date()
  };

  const docRef = await addDoc(collection(db, "support_requests"), newRequest);
  
  // Return with the new ID
  return {
    ...newRequest,
    id: docRef.id
  };
};
