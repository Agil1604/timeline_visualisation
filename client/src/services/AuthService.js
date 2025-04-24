import api from './api';
import { AUTH } from './APIPaths';
import { tokenService } from './TokenService';

class AuthService {
  async register(formData) {
    try {
      const response = await api.post(AUTH.REGISTER, formData);
      return response.data.user;
    } catch (error) {
      throw this._handleError(error, 'Ошибка регистрации');
    }
  }

  async login(formData) {
    try {
      const response = await api.post(AUTH.LOGIN, formData);
      tokenService.setTokens({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      });
      return response.data.user;
    } catch (error) {
      throw this._handleError(error, 'Ошибка входа');
    }
  }

  logout() {
    tokenService.clearTokens();
  }

  async changePassword(oldPassword, newPassword) {
    try {
      await api.post(AUTH.CHANGE_PASS, {
        "old_password": oldPassword,
        "new_password": newPassword
      });
      tokenService.clearTokens();
    } catch (error) {
      throw this._handleError(error, 'Ошибка смены пароля');
    }
  }

  async deleteAccount() {
    try {
      await api.delete(AUTH.DELETE);
    } catch (error) {
      throw this._handleError(error, 'Ошибка удаления аккаунта');
    } finally {
      tokenService.clearTokens();
    }
  }

  async checkAuth() {
    if (!tokenService.getAccessToken()) return null;

    try {
      const response = await api.get(AUTH.ME);
      return response.data;
    } catch (error) {
      tokenService.clearTokens();
      throw this._handleError(error, 'Ошибка проверки авторизации');
    }
  }

  _handleError(error, defaultMessage) {
    const serverMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      defaultMessage;

    return new Error(
      typeof serverMessage === 'object'
        ? JSON.stringify(serverMessage)
        : serverMessage
    );
  }
}

export const authService = new AuthService();