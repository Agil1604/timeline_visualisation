import axios from 'axios';

import { tokenService } from './TokenService';
import { AUTH } from './APIPaths';
import { LOGIN_PAGE } from '../routing/consts';

const api = axios.create();

api.interceptors.request.use(config => {
  let token;
  
  if (config.url.includes(AUTH.REFRESH)) {
    token = tokenService.getRefreshToken();
  } else {
    token = tokenService.getAccessToken();
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let refreshSubscribers = [];

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && 
        !originalRequest._retry &&
        !originalRequest.url.includes(AUTH.REFRESH)) {
      originalRequest._retry = true;

      const refreshToken = tokenService.getRefreshToken();
      if (!refreshToken) {
        tokenService.clearTokens();
        window.location = LOGIN_PAGE;
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const response = await api.post(AUTH.REFRESH, {});
          tokenService.setTokens({
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token
          });
          isRefreshing = false;
          refreshSubscribers.forEach(cb => cb());
          refreshSubscribers = [];
        } catch (refreshError) {
          refreshSubscribers = [];
          tokenService.clearTokens();
          window.location = LOGIN_PAGE;
          return Promise.reject(refreshError);
        }
      }

      return new Promise(resolve => {
        refreshSubscribers.push(() => {
          originalRequest.headers.Authorization = `Bearer ${tokenService.getAccessToken()}`;
          resolve(api(originalRequest));
        });
      });
    }

    if (error.config.url.includes(AUTH.REFRESH) && error.response?.status === 401) {
      tokenService.clearTokens();
      window.location = LOGIN_PAGE;
    }

    return Promise.reject(error);
  }
);

export default api;