import api from './api';
import { PROJECTS} from './APIPaths';

class ProjectService {
  async create(formData) {
    const response = await api.post(PROJECTS.CREATE, formData);
    return response.data;
  }

  async getAll() {
    const response = await api.get(PROJECTS.GET_ALL);
    return response.data;
  }

  async getProject(id) {
    const response = await api.get(PROJECTS.GET_ONE(id));
    return response.data;
  }
  
  async updateProject(id, formData) {
    const response = await api.put(PROJECTS.UPDATE(id), formData)
    return response.data
  }

  async update(projectType, id, formData) {
    const response = await api.patch(PROJECTS.UPDATE_PROJECT(projectType, id), formData)
    return response.data
  }

  async deleteProject(id) {
    await api.delete(PROJECTS.DELETE(id))
  }
}

export const projectService = new ProjectService();