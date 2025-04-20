
// Export all request-related services from this central file
export { fetchSupportRequests, fetchRecentRequests } from './fetchRequests';
export { updateRequestStatus, addCommentToRequest, createSupportRequest } from './updateRequests';
export { sendReplyToRequest } from './emailServices';
export { sampleRequests } from './types';
