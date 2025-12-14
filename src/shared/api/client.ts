'use client';

import ky from 'ky';
import { API_BASE_URL } from '@/shared/config/constants';
import { useAuthStore } from '@/shared/store/auth';

export const api = ky.create({
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
