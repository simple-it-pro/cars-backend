import apiClient from './client';
import type { User } from './auth';

export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users/getAll'),

  getMe: () => apiClient.get<User>('/users/me'),

  updateMe: (data: Partial<User>) => apiClient.patch<User>('/users/me', data),
};
