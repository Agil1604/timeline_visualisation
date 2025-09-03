import api from './api';
import { PROJECTS } from './APIPaths';

class ProjectService {
  async create(formData) {
    try {
      const response = await api.post(PROJECTS.CREATE, formData);
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Ошибка при создании проекта');
    }
  }

  async getAll() {
    try {
      const response = await api.get(PROJECTS.GET_ALL);
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Ошибка при загрузке проектов');
    }
  }

  async getProject(id) {
    try {
      const response = await api.get(PROJECTS.GET_ONE(id));
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Ошибка при получении проекта');
    }
  }

  async updateProjectMetadata(id, formData) {
    try {
      const response = await api.put(PROJECTS.UPDATE(id), formData);
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Ошибка при обновлении проекта');
    }
  }

  async updateProject(id, formData) {
    try {
      const response = await api.patch(PROJECTS.UPDATE_PROJECT(id), formData);
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'Ошибка при частичном обновлении проекта');
    }
  }

  async deleteProject(id) {
    try {
      await api.delete(PROJECTS.DELETE(id));
    } catch (error) {
      throw this._handleError(error, 'Ошибка при удалении проекта');
    }
  }

  _handleError(error, defaultMessage) {
    const message = error.response?.data?.message || defaultMessage;
    return new Error(message);
  }
}

export const projectService = new ProjectService();