
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  orderBy, 
  limit, 
  where, 
  Timestamp, 
  addDoc,
  DocumentData 
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { sendEmailDirect } from "@/utils/emailUtil";
import { SupportRequest, Comment, RequestFormData } from "@/types/supportRequests";

// Sample data to ensure we always show some requests
export const sampleRequests: SupportRequest[] = [
  {
    id: "sample1",
    user_id: "user123",
    user_name: "John Smith",
    user_email: "john@example.com",
    subject: "Water Purifier Installation",
    message: "I need help setting up my new MYWATER purifier. The instructions are a bit confusing.",
    support_type: "installation",
    purifier_model: "MYWATER Pro",
    status: "new",
    created_at: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    id: "sample2",
    user_id: "user456",
    user_name: "Emily Johnson",
    user_email: "emily@example.com",
    subject: "Filter Replacement Question",
    message: "How often should I replace the filter in my MYWATER Classic model?",
    support_type: "maintenance",
    purifier_model: "MYWATER Classic",
    status: "in_progress",
    created_at: new Date(Date.now() - 86400000), // 1 day ago
    assigned_to: "Mike Technician",
    comments: [
      {
        id: "comment1",
        author: "Mike Technician",
        content: "Hi Emily, the recommended replacement schedule is every 6 months. I'll send you more details via email.",
        created_at: new Date(Date.now() - 43200000), // 12 hours ago
      }
    ]
  },
  {
    id: "sample3",
    user_id: "user789",
    user_name: "Robert Wilson",
    user_email: "robert@example.com",
    subject: "Water Quality Issue",
    message: "I've noticed a strange taste in the water from my purifier recently. Could there be something wrong?",
    support_type: "technical",
    purifier_model: "MYWATER Ultra",
    status: "resolved",
    created_at: new Date(Date.now() - 172800000), // 2 days ago
    comments: [
      {
        id: "comment2",
        author: "Sarah Support",
        content: "Hi Robert, this could be due to a filter that needs replacement. I'll help you troubleshoot.",
        created_at: new Date(Date.now() - 144000000), // 40 hours ago
      },
      {
        id: "comment3",
        author: "Sarah Support",
        content: "After our call, we've determined it was indeed a filter issue. Glad we could resolve it!",
        created_at: new Date(Date.now() - 86400000), // 24 hours ago
      }
    ]
  }
];

/**
 * Fetch support requests based on filter
 */
export const fetchSupportRequests = async (
  activeFilter: string,
  countLimit: number = 5
): Promise<SupportRequest[]> => {
  try {
    const requestsRef = collection(db, "support_requests");
    let requestsQuery;

    // For "all" filter, show most recent 20
    if (activeFilter === "all") {
      requestsQuery = query(
        requestsRef,
        orderBy("created_at", "desc"),
        limit(countLimit)
      );
    } 
    // For "new" filter, show all unresponded requests
    else if (activeFilter === "new") {
      requestsQuery = query(
        requestsRef,
        where("status", "==", "new"),
        orderBy("created_at", "desc"),
        limit(countLimit)
      );
    }
    // For other filters, show filtered by status
    else {
      requestsQuery = query(
        requestsRef,
        where("status", "==", activeFilter),
        orderBy("created_at", "desc"),
        limit(countLimit)
      );
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all requests
    const querySnapshot = await getDocs(requestsQuery);
    
    // If we got no real data, use sample data to always show something
    if (querySnapshot.empty) {
      // Filter sample data based on active filter
      let filteredSamples = sampleRequests;
      if (activeFilter !== "all") {
        filteredSamples = sampleRequests.filter(req => req.status === activeFilter);
      }
      return filteredSamples.slice(0, countLimit);
    }
    
    const requestsData: SupportRequest[] = [];
    
    // Today's requests and new requests
    const todayRequests: SupportRequest[] = [];
    const otherRequests: SupportRequest[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      const createdAt = data.created_at as Timestamp;
      const createdDate = createdAt ? createdAt.toDate() : new Date();
      
      // Ensure status is one of the allowed types
      let status = data.status || "new";
      if (status !== "new" && status !== "in_progress" && status !== "resolved") {
        status = "new"; // Default to "new" if it's an invalid status
      }
      
      const requestData: SupportRequest = {
        id: doc.id,
        user_id: data.user_id || "",
        user_name: data.user_name || "",
        user_email: data.user_email || "",
        subject: data.subject || "",
        message: data.message || "",
        support_type: data.support_type || "",
        purifier_model: data.purifier_model || "",
        status: status as "new" | "in_progress" | "resolved",
        created_at: createdDate,
        comments: data.comments || [],
        assigned_to: data.assigned_to || "",
      };
      
      // If today's request, add to today array
      if (createdDate >= today) {
        todayRequests.push(requestData);
      } else {
        otherRequests.push(requestData);
      }
    });
    
    // Combine arrays with today's requests first
    return [...todayRequests, ...otherRequests].slice(0, countLimit);
  } catch (error) {
    console.error("Error fetching support requests:", error);
    throw error;
  }
};

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

/**
 * Send an email reply to a support request
 */
export const sendReplyToRequest = async (request: SupportRequest): Promise<boolean> => {
  try {
    // Send email
    await sendEmailDirect(
      request.user_email,
      request.user_name,
      "MYWATER Support",
      `RE: ${request.subject}`,
      `Dear ${request.user_name},\n\nThank you for contacting MYWATER Support. A team member will assist you shortly.\n\nBest regards,\nMYWATER Support Team`
    );
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
