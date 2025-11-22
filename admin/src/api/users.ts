import apiClient from './client';
import type { User } from './auth';

export interface CreateUserData {
  phone: string;
  name?: string;
  nickname?: string;
  email?: string;
  city?: string;
  role?: 'COMMON' | 'ADVANCED' | 'ADMIN';
}

export interface UpdateUserData extends Partial<CreateUserData> {
  isDeactivated?: boolean;
}

export interface GetUsersFilter {
  name?: string;
}

export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users/getAll'),

  getMe: () => apiClient.get<User>('/users/me'),

  updateMe: (data: Partial<User>) => apiClient.patch<User>('/users/me', data),

  // Admin endpoints
  adminGetAll: (filter?: GetUsersFilter) =>
    apiClient.get<User[]>('/admin/users', { params: filter }),

  adminCreate: (data: CreateUserData) =>
    apiClient.post<User>('/admin/users', data),

  adminUpdate: (id: string, data: UpdateUserData) =>
    apiClient.patch<User>(`/admin/users/${id}`, data),

  adminDelete: (id: string) => apiClient.delete(`/admin/users/${id}`),
};
