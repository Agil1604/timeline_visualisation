import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export const useProjectSave = (projectId, saveHandler, hasUnsavedChanges) => {
  const dataRef = useRef();

  useEffect(() => {
    dataRef.current = { saveHandler, hasUnsavedChanges, projectId };
  });

  const handleSave = useCallback(async () => {
    if (!projectId) return;
    
    try {
      await dataRef.current.saveHandler();
      toast.success('Изменения сохранены');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Ошибка при сохранении проекта');
    }
  }, [projectId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault();
        handleSave();
      }
    };

    const handleBeforeUnload = (e) => {
      if (dataRef.current.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleSave]);

  return { handleSave };
};