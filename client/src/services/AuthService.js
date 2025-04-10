import { LOGIN_PAGE, WELCOME_PAGE } from '../routing/consts';
import api from './api';
import { AUTH } from './APIPaths';
import { tokenService } from './TokenService';

class AuthService {
  async register(formData) {
    const response = await api.post(AUTH.REGISTER, formData);
    return response.data.user;
  }

  async login(formData) {
    const response = await api.post(AUTH.LOGIN, formData);
    tokenService.setTokens({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token
    });
    return response.data.user;
  }

  logout() {
    tokenService.clearTokens();
    window.location = LOGIN_PAGE;
  }

  async changePassword(oldPassword, newPassword) {
    try {
      await api.post(AUTH.CHANGE_PASS, {
        "old_password": oldPassword, 
        "new_password": newPassword
      });
      tokenService.clearTokens();
      window.location = WELCOME_PAGE;
    } catch (error) {
      console.error('Change password failed:', error);
      throw error;
    }
  }

  async delete_() {
    try {
      await api.delete(AUTH.DELETE);
    } catch (error) {
      console.error('Delete account failed:', error);
      throw error;
    } finally {
      tokenService.clearTokens();
      window.location = WELCOME_PAGE;
    }
  }

  async checkAuth() {
    if (tokenService.getAccessToken() === null || tokenService.getAccessToken() === '') {
      return null;
    }
    try {
      const response = await api.get(AUTH.ME);
      return response.data;
    } catch (error) {
      this.logout();
      return null;
    }
  }
}

export const authService = new AuthService();