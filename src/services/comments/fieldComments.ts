
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/integrations/firebase/client";
import { FieldComment } from "@/types/fieldComments";

interface AddCommentParams {
  content: string;
  entity_type: "alert" | "filter" | "unit";
  entity_id: string;
  field_verified: boolean;
}

/**
 * Fetch all field comments for a specific entity
 */
export const fetchFieldComments = async (
  entityType: "alert" | "filter" | "unit", 
  entityId: string
): Promise<FieldComment[]> => {
  try {
    const commentsRef = collection(db, "field_comments");
    const q = query(
      commentsRef, 
      where("entity_type", "==", entityType),
      where("entity_id", "==", entityId),
      orderBy("created_at", "desc")
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        content: data.content,
        author_name: data.author_name,
        author_id: data.author_id,
        author_role: data.author_role,
        created_at: data.created_at?.toDate() || new Date(),
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        field_verified: data.field_verified || false
      };
    });
  } catch (error) {
    console.error("Error fetching field comments:", error);
    throw error;
  }
};

/**
 * Add a new field comment
 */
export const addFieldComment = async ({
  content,
  entity_type,
  entity_id,
  field_verified
}: AddCommentParams): Promise<string> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User must be authenticated to add comments");
    }
    
    // Get user role from the database
    const userRef = collection(db, "users");
    const q = query(userRef, where("id", "==", user.uid));
    const userSnap = await getDocs(q);
    
    let userRole = "user"; // Default role
    let authorName = user.displayName || user.email || "Anonymous";
    
    if (!userSnap.empty) {
      const userData = userSnap.docs[0].data();
      userRole = userData.role || userRole;
      authorName = userData.first_name && userData.last_name 
        ? `${userData.first_name} ${userData.last_name}`
        : authorName;
    }
    
    // Validate that user has permission to add comments
    if (!["superadmin", "admin", "technician"].includes(userRole)) {
      throw new Error("Insufficient permissions to add field comments");
    }
    
    const commentData = {
      content,
      author_name: authorName,
      author_id: user.uid,
      author_role: userRole,
      created_at: serverTimestamp(),
      entity_type,
      entity_id,
      field_verified
    };
    
    const commentsRef = collection(db, "field_comments");
    const docRef = await addDoc(commentsRef, commentData);
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding field comment:", error);
    throw error;
  }
};
