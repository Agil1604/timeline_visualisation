import { useCallback } from 'react';
import { projectService } from '../services/ProjectService';

export const useProjectUpdate = (projectId, description) => {
  const updateTitle = useCallback(async (newTitle, setTitle) => {
    try {
      await projectService.updateProject(projectId, { 
        title: newTitle, 
        description 
      });
      setTitle(newTitle);
    } catch (error) {
      console.error('Ошибка сохранения заголовка:', error);
    }
  }, [projectId, description]);

  return { updateTitle };
};