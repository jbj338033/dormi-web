'use client';

import ky from 'ky';
import { API_BASE_URL } from '@/shared/config/constants';
import { useAuthStore } from '@/shared/store/auth';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const instance = ky.create({
  prefixUrl: API_BASE_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().token;
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
  },
});

export const api = {
  get: async <T>(url: string, options?: Parameters<typeof instance.get>[1]): Promise<T> => {
    const res = await instance.get(url, options).json<ApiResponse<T>>();
    return res.data;
  },

  post: async <T>(url: string, options?: Parameters<typeof instance.post>[1]): Promise<T> => {
    const res = await instance.post(url, options).json<ApiResponse<T>>();
    return res.data;
  },

  put: async <T>(url: string, options?: Parameters<typeof instance.put>[1]): Promise<T> => {
    const res = await instance.put(url, options).json<ApiResponse<T>>();
    return res.data;
  },

  patch: async <T>(url: string, options?: Parameters<typeof instance.patch>[1]): Promise<T> => {
    const res = await instance.patch(url, options).json<ApiResponse<T>>();
    return res.data;
  },

  delete: async <T = void>(url: string, options?: Parameters<typeof instance.delete>[1]): Promise<T> => {
    const res = await instance.delete(url, options).json<ApiResponse<T>>();
    return res.data;
  },

  paginated: async <T>(url: string, options?: Parameters<typeof instance.get>[1]) => {
    const res = await instance.get(url, options).json<PaginatedApiResponse<T>>();
    return { data: res.data, meta: res.meta };
  },
};
