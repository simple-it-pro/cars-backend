import apiClient from './client';
import type { User } from './auth';

export type PostStatus = 'PENDING' | 'PUBLISHED' | 'REJECTED';

export interface Post {
  id: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  status: PostStatus;
  rejectionReason?: string | null;
  userId: string;
  user: User;
}

export interface RejectPostData {
  reason: string;
}

export const postsApi = {
  // Admin endpoints
  adminGetAll: () => apiClient.get<Post[]>('/admin/posts'),

  adminGetPending: () => apiClient.get<Post[]>('/admin/posts/pending'),

  adminGetPublished: () => apiClient.get<Post[]>('/admin/posts/published'),

  adminApprove: (id: string) => apiClient.patch<Post>(`/admin/posts/${id}/approve`),

  adminReject: (id: string, data: RejectPostData) =>
    apiClient.patch<Post>(`/admin/posts/${id}/reject`, data),
};
