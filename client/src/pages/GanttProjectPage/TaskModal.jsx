import React, { useState, useRef, useEffect } from 'react';
import { MdModeEdit, MdDelete } from "react-icons/md";
import { FiMoreVertical, FiX } from "react-icons/fi";
import { timeParse, timeFormat } from 'd3';

import styles from './TaskModal.module.css';
import sharedStyles from './sharedStyles.module.css'

const TaskModal = ({ task, onClose, tasks, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState('');
  const menuRef = useRef(null);

  const getDependencyTypeName = (type) => {
    const types = {
      'fs': 'Finish-to-Start',
      'ss': 'Start-to-Start',
      'ff': 'Finish-to-Finish',
      'sf': 'Start-to-Finish'
    };
    return types[type] || 'Неизвестный тип';
  };

  const validateDates = (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    return startDate < endDate;
  };

  const handleDependencyChange = (taskId, checked) => {
    setEditedTask(prev => {
      const newDeps = checked
        ? [...prev.dependencies, { id: taskId, type: 'fs' }]
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
      setError('');
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
    setError('');
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  const handleSave = () => {
    if (!validateDates(editedTask.start, editedTask.end)) {
      setError('Дата окончания должна быть позже даты начала');
      return;
    }

    setError('');
    onEdit(editedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
    setShowMenu(false);
    setError('');
  };

  const handleClose = () => {
    setIsEditing(false);
    setShowMenu(false);
    setError('');
    onClose();
  };

  const handleChange = (field, value) => {
    setEditedTask(prev => {
      const updatedTask = { ...prev, [field]: value };

      if ((field === 'start' || field === 'end') && updatedTask.start && updatedTask.end) {
        if (!validateDates(updatedTask.start, updatedTask.end)) {
          setError('Дата окончания должна быть позже даты начала');
        } else {
          setError('');
        }
      }

      return updatedTask;
    });
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
              className={styles.editInput}
            />
          ) : (
            task.name
          )}
        </h3>
        <div className={styles.modalActions} ref={menuRef}>
          {!isEditing && (
            <button
              className={styles.menuDots}
              onClick={() => setShowMenu(!showMenu)}
            >
              <FiMoreVertical />
            </button>
          )}
          {showMenu && (
            <div className={styles.dropdownMenu}>
              <button onClick={handleEditClick}>
                <MdModeEdit fill="#ffb800" size={16} />
                Изменить
              </button>
              <button onClick={handleDelete}>
                <MdDelete fill="#ff3b30" size={16} />
                Удалить
              </button>
            </div>
          )}
          <button className={styles.closeBtn} onClick={handleClose}><FiX /></button>
        </div>
      </div>

      <div className={styles.modalBody}>
        {error && <div className={sharedStyles.error}>{error}</div>}

        <p>
          <strong>Описание: </strong>
          {isEditing ? (
            <textarea
              value={editedTask.description}
              onChange={e => handleChange('description', e.target.value)}
              className={styles.editTextarea}
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
              className={styles.editInput}
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
              className={styles.editInput}
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
              className={styles.editInput}
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
          <p className={sharedStyles.criticalText}><strong>Критический путь</strong></p>
        )}

        {task.dependencies.length > 0 && (
          <div>
            <p><strong>Зависимости: </strong></p>
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
                    value={editedTask.dependencies.find(d => d.id === t.id)?.type || 'fs'}
                    onChange={e => handleDependencyTypeChange(t.id, e.target.value)}
                    disabled={!editedTask.dependencies.some(d => d.id === t.id)}
                  >
                    <option value="fs">Finish-to-Start</option>
                    <option value="ss">Start-to-Start</option>
                    <option value="ff">Finish-to-Finish</option>
                    <option value="sf">Start-to-Finish</option>
                  </select>
                </div>
              ))}
          </div>
        )}
        {isEditing && (
          <div className={styles.editButtons}>
            <button
              className={sharedStyles.saveBtn}
              onClick={handleSave}
              disabled={!!error}
            >
              Сохранить
            </button>
            <button className={sharedStyles.cancelBtn} onClick={handleCancel}>Отмена</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskModal;