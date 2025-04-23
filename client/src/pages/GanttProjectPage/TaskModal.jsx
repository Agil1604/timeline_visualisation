import React, { useState, useRef, useEffect } from 'react';
import { timeParse } from 'd3';
import styles from './TaskModal.module.css';
import './sharedStyles.css';

const TaskModal = ({ task, onClose, tasks, timeFormat, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const getDependencyTypeName = (type) => {
    const types = {
      'FS': 'Finish-to-Start',
      'SS': 'Start-to-Start',
      'FF': 'Finish-to-Finish',
      'SF': 'Start-to-Finish'
    };
    return types[type] || 'Неизвестный тип';
  };

  const handleDependencyChange = (taskId, checked) => {
    setEditedTask(prev => {
      const newDeps = checked
        ? [...prev.dependencies, { id: taskId, type: 'FS' }]
        : prev.dependencies.filter(d => d.id !== taskId);
      return { ...prev, dependencies: newDeps };
    });
  };

  const handleDependencyTypeChange = (taskId, newType) => {
    setEditedTask(prev => ({
      ...prev,
      dependencies: prev.dependencies.map(d =>
        d.id === taskId ? { ...d, type: newType } : d
      )
    }));
  };

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setIsEditing(false);
      setShowMenu(false);
    }
  }, [task]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    setShowMenu(false);
  };
  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  const handleSave = () => {
    onEdit(editedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleClose = () => {
    setIsEditing(false);
    setShowMenu(false);
    onClose();
  };

  const handleChange = (field, value) => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
  };

  if (!task) return null;

  return (
    <div className={styles.modal} onClick={e => e.stopPropagation()}>
      <div className={styles.modalHeader}>
        <h3>
          {isEditing ? (
            <input
              value={editedTask.name}
              onChange={e => handleChange('name', e.target.value)}
              className="edit-input"
            />
          ) : (
            task.name
          )}
        </h3>
        <div className={styles.modalActions} ref={menuRef}>
          <button
            className={styles.menuDots}
            onClick={() => setShowMenu(!showMenu)}
          >
            ⋮
          </button>
          {showMenu && (
            <div className={styles.dropdownMenu}>
              <button onClick={handleEditClick}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffb800">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
                Изменить
              </button>
              <button onClick={handleDelete}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff3d3d">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
                Удалить
              </button>
            </div>
          )}
          <button className={styles.closeBtn} onClick={handleClose}>×</button>
        </div>
      </div>

      <div className={styles.modalBody}>
        <p>
          <strong>Описание: </strong>
          {isEditing ? (
            <textarea
              value={editedTask.description}
              onChange={e => handleChange('description', e.target.value)}
              className="edit-textarea"
            />
          ) : (
            task.description
          )}
        </p>

        <p>
          <strong>Начало: </strong>
          {isEditing ? (
            <input
              type="date"
              value={timeFormat('%Y-%m-%d')(editedTask.start)}
              onChange={e => handleChange('start', timeParse('%Y-%m-%d')(e.target.value))}
              className="edit-input"
            />
          ) : (
            timeFormat('%d %b %Y')(task.start)
          )}
        </p>

        <p>
          <strong>Конец: </strong>
          {isEditing ? (
            <input
              type="date"
              value={timeFormat('%Y-%m-%d')(editedTask.end)}
              onChange={e => handleChange('end', timeParse('%Y-%m-%d')(e.target.value))}
              className="edit-input"
            />
          ) : (
            timeFormat('%d %b %Y')(task.end)
          )}
        </p>

        <p>
          <strong>Прогресс: </strong>
          {isEditing ? (
            <input
              type="number"
              value={editedTask.progress}
              onChange={e => {
                let value = parseInt(e.target.value, 10);
                value = Math.max(0, Math.min(100, value));
                handleChange('progress', value);
              }}
              min="0"
              max="100"
              className="edit-input"
            />
          ) : (
            `${task.progress}%`
          )}
        </p>

        {isEditing && (
          <p>
            <label>
              <input
                type="checkbox"
                checked={editedTask.isCritical}
                onChange={e => handleChange('isCritical', e.target.checked)}
              />
              Критический путь
            </label>
          </p>
        )}

        {!isEditing && task.isCritical && (
          <p className="critical-text"><strong>Критический путь</strong></p>
        )}

        {task.dependencies.length > 0 && (
          <div>
            <p><strong>Зависимости:</strong></p>
            <ul>
              {task.dependencies.map(dep => {
                const depTask = tasks.find(t => t.id === dep.id);
                return (
                  <li key={dep.id}>
                    {depTask?.name || dep.id}
                    <span className={styles.dependencyType}>
                      ({getDependencyTypeName(dep.type)})
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {isEditing && (
          <div className={styles.dependenciesEdit}>
            <label>Зависимости:</label>
            {tasks
              .filter(t => t.id !== task.id)
              .map(t => (
                <div key={t.id} className={styles.dependencyItem}>
                  <label>
                    <input
                      type="checkbox"
                      checked={editedTask.dependencies.some(d => d.id === t.id)}
                      onChange={e => handleDependencyChange(t.id, e.target.checked)}
                    />
                    {t.name}
                  </label>
                  <select
                    value={editedTask.dependencies.find(d => d.id === t.id)?.type || 'FS'}
                    onChange={e => handleDependencyTypeChange(t.id, e.target.value)}
                    disabled={!editedTask.dependencies.some(d => d.id === t.id)}
                  >
                    <option value="FS">Finish-to-Start</option>
                    <option value="SS">Start-to-Start</option>
                    <option value="FF">Finish-to-Finish</option>
                    <option value="SF">Start-to-Finish</option>
                  </select>
                </div>
              ))}
          </div>
        )}
        {isEditing && (
          <div className={styles.editButtons}>
            <button className="save-btn" onClick={handleSave}>Сохранить</button>
            <button className="cancel-btn" onClick={handleCancel}>Отмена</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskModal;