import { useCallback } from 'react';
import { projectService } from '../services/ProjectService';

export const useProjectUpdate = (projectId) => {
  const updateTitle = useCallback(async (newTitle, setTitle) => {
    try {
      await projectService.updateProjectMetadata(projectId, { 
        title: newTitle, 
      });
      setTitle(newTitle);
    } catch (error) {
      console.error('Ошибка сохранения заголовка:', error);
    }
  }, [projectId]);

  return { updateTitle };
}; 