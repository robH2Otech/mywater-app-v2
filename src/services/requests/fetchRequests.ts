
import { collection, query, getDocs, orderBy, limit, where, Timestamp, DocumentData } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { SupportRequest } from "@/types/supportRequests";
import { sampleRequests } from "./types";

/**
 * Fetch support requests based on filter
 */
export const fetchSupportRequests = async (
  activeFilter: string,
  countLimit: number = 5
): Promise<SupportRequest[]> => {
  try {
    // Add console logs to debug the filter and count limits
    console.log(`Fetching requests with filter: ${activeFilter}, limit: ${countLimit}`);
    
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
    // For specific status filters, show filtered by status
    else {
      requestsQuery = query(
        requestsRef,
        where("status", "==", activeFilter),
        orderBy("created_at", "desc"),
        limit(countLimit)
      );
    }

    // Get all requests
    const querySnapshot = await getDocs(requestsQuery);
    console.log(`Query returned ${querySnapshot.size} documents`);
    
    // If we got no real data or there was an error, use sample data
    if (querySnapshot.empty) {
      console.log("Using sample data as no database results found");
      
      // Filter sample data based on active filter
      let filteredSamples = sampleRequests;
      if (activeFilter !== "all") {
        filteredSamples = sampleRequests.filter(req => req.status === activeFilter);
      }
      
      console.log(`Returning ${filteredSamples.length} filtered sample requests`);
      return filteredSamples.slice(0, countLimit);
    }
    
    const requestsData: SupportRequest[] = [];
    
    // Today's requests and new requests
    const todayRequests: SupportRequest[] = [];
    const otherRequests: SupportRequest[] = [];
    
    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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
    const result = [...todayRequests, ...otherRequests].slice(0, countLimit);
    console.log(`Returning ${result.length} database requests`);
    return result;
  } catch (error) {
    console.error("Error fetching support requests:", error);
    
    // On error, return filtered sample data instead of throwing
    console.log("Error occurred, using sample data as fallback");
    let filteredSamples = sampleRequests;
    if (activeFilter !== "all") {
      filteredSamples = sampleRequests.filter(req => req.status === activeFilter);
    }
    
    return filteredSamples.slice(0, countLimit);
  }
};

/**
 * Fetch recent support requests for the last 7 days
 */
export const fetchRecentRequests = async (days: number = 7): Promise<SupportRequest[]> => {
  try {
    // Calculate the date for N days ago
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    const requestsRef = collection(db, "support_requests");
    const requestsQuery = query(
      requestsRef,
      where("created_at", ">=", daysAgo),
      orderBy("created_at", "desc")
    );
    
    const querySnapshot = await getDocs(requestsQuery);
    console.log(`Retrieved ${querySnapshot.size} recent support requests for last ${days} days`);
    
    if (querySnapshot.empty) {
      // Return sample data filtered by date
      return sampleRequests.filter(req => {
        return req.created_at > daysAgo;
      });
    }
    
    const requestsData: SupportRequest[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      const createdAt = data.created_at as Timestamp;
      const createdDate = createdAt ? createdAt.toDate() : new Date();
      
      requestsData.push({
        id: doc.id,
        user_id: data.user_id || "",
        user_name: data.user_name || "",
        user_email: data.user_email || "",
        subject: data.subject || "",
        message: data.message || "",
        support_type: data.support_type || "",
        purifier_model: data.purifier_model || "",
        status: data.status as "new" | "in_progress" | "resolved",
        created_at: createdDate,
        comments: data.comments || [],
        assigned_to: data.assigned_to || "",
      });
    });
    
    return requestsData;
  } catch (error) {
    console.error("Error fetching recent support requests:", error);
    
    // Return filtered sample data on error
    return sampleRequests.filter(req => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);
      return req.created_at > daysAgo;
    });
  }
};
