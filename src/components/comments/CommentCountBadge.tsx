
import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

interface CommentCountBadgeProps {
  entityId: string;
  entityType: "alert" | "filter" | "unit";
  className?: string;
}

export function CommentCountBadge({ 
  entityId, 
  entityType,
  className = "" 
}: CommentCountBadgeProps) {
  const { data: count = 0, isLoading } = useQuery({
    queryKey: [`${entityType}-comment-count-${entityId}`],
    queryFn: async () => {
      const commentsRef = collection(db, "field_comments");
      const q = query(
        commentsRef,
        where("entity_id", "==", entityId),
        where("entity_type", "==", entityType)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    },
    // Don't refetch this too often
    staleTime: 300000, // 5 minutes
  });

  if (isLoading || count === 0) return null;

  return (
    <Badge className={`bg-mywater-blue text-white flex items-center gap-1 ${className}`}>
      <MessageSquare className="h-3 w-3" />
      {count}
    </Badge>
  );
}
