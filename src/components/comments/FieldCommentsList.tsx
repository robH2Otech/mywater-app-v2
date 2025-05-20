
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchFieldComments } from "@/services/comments/fieldComments";
import { FieldComment } from "@/types/fieldComments";
import { MessageSquare, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

interface FieldCommentsListProps {
  entityId: string;
  entityType: "alert" | "filter" | "unit";
  onAddComment: () => void;
}

export function FieldCommentsList({ 
  entityId, 
  entityType,
  onAddComment 
}: FieldCommentsListProps) {
  const { user, userRole } = useFirebaseAuth();
  const canAddComments = userRole === "admin" || userRole === "technician" || userRole === "superadmin";
  
  const { data: comments = [], isLoading, error } = useQuery({
    queryKey: [`${entityType}-comments-${entityId}`],
    queryFn: () => fetchFieldComments(entityType, entityId),
  });

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="animate-pulse bg-spotify-accent/20 h-10 w-full rounded-md mb-2"></div>
        <div className="animate-pulse bg-spotify-accent/20 h-20 w-full rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center">
        <p className="text-red-400">Error loading field observations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Field Observations
        </h3>
        {canAddComments && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onAddComment}
            className="bg-mywater-blue hover:bg-mywater-blue/90 text-white border-none"
          >
            Add Observation
          </Button>
        )}
      </div>

      {comments.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No field observations yet</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment }: { comment: FieldComment }) {
  return (
    <Card className="p-4 bg-spotify-accent/10 border-spotify-accent/30">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-white">{comment.author_name}</p>
            <Badge variant={getRoleBadgeVariant(comment.author_role)}>
              {comment.author_role}
            </Badge>
            {comment.field_verified && (
              <Badge className="bg-green-600 text-white flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Field-verified
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-300">{comment.content}</p>
        </div>
        <p className="text-xs text-gray-400">
          {comment.created_at instanceof Date
            ? format(comment.created_at, 'MMM d, yyyy • HH:mm')
            : format(new Date(comment.created_at), 'MMM d, yyyy • HH:mm')}
        </p>
      </div>
    </Card>
  );
}

function getRoleBadgeVariant(role: string): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case "superadmin":
      return "destructive";
    case "admin":
      return "secondary";
    case "technician":
      return "default";
    default:
      return "outline";
  }
}
