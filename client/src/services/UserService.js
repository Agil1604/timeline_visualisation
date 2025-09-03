import api from './api';
import { USERS } from './APIPaths';
import { tokenService } from './TokenService';

class UserService {
  async register(formData) {
    try {
      const response = await api.post(USERS.REGISTER, formData);
      return response.data.user;
    } catch (error) {
      throw this._handleError(error, 'Ошибка регистрации');
    }
  }

  async changePassword(oldPassword, newPassword) {
    try {
      await api.post(USERS.CHANGE_PASS, {
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
      await api.delete(USERS.DELETE);
    } catch (error) {
      throw this._handleError(error, 'Ошибка удаления аккаунта');
    } finally {
      tokenService.clearTokens();
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

export const userService = new UserService();