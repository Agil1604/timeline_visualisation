import api from './api';

class UserService {
  async getProfile(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }

  async updateProfile(userId, data) {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  }

}

export default new UserService();