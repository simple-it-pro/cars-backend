import apiClient from './client';

export interface RequestCodeResponse {
  message: string;
  testCode?: string;
}

export interface VerifyCodeResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  role: 'ADMIN' | 'ADVANCED' | 'COMMON';
  login: string | null;
  nickname: string | null;
  name: string | null;
  birthdate: string | null;
  email: string | null;
  phone: string;
  city: string | null;
  about: string | null;
  image: { url: string; name: string; size: number } | null;
  rating: number | null;
  isDeactivated: boolean;
}

export const authApi = {
  requestCode: (phone: string) =>
    apiClient.post<RequestCodeResponse>('/auth/request-code', { phone }),

  verifyCode: (phone: string, code: string) =>
    apiClient.post<VerifyCodeResponse>('/auth/verify-code', { phone, code }),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),
};
