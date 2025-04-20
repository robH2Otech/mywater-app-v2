
import { Comment, SupportRequest, RequestFormData } from "@/types/supportRequests";

// Export types that will be shared across request service files
export type {
  Comment,
  SupportRequest,
  RequestFormData
};

// Sample data constant to ensure we always have some data to display
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
