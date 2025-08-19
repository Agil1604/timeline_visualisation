import React, { useState } from 'react';

import sharedStyles from './sharedStyles.module.css'
import styles from './TaskForm.module.css';

const TaskForm = ({ onAddTask, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  const [error, setError] = useState('');

  const validateDates = (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) < new Date(endDate);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !start || !end) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    if (!validateDates(start, end)) {
      setError('Дата окончания должна быть позже даты начала');
      return;
    }

    onAddTask({
      name,
      description,
      start,
      end,
      isCritical
    });
  };

  const handleStartChange = (e) => {
    const newStart = e.target.value;
    setStart(newStart);
    
    if (end && !validateDates(newStart, end)) {
      setError('Дата окончания должна быть позже даты начала');
    } else {
      setError('');
    }
  };

  const handleEndChange = (e) => {
    const newEnd = e.target.value;
    setEnd(newEnd);
    
    if (start && !validateDates(start, newEnd)) {
      setError('Дата окончания должна быть позже дата начала');
    } else {
      setError('');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Создание новой задачи</h3>

      {error && <div className={sharedStyles.error}>{error}</div>}

      <input
        type="text"
        placeholder="Название задачи"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <textarea
        placeholder="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className={styles.dateInputs}>
        <span>с</span>
        <input
          type="date"
          value={start}
          onChange={handleStartChange}
          required
        />
        <span>до</span>
        <input
          type="date"
          value={end}
          onChange={handleEndChange}
          required
        />
      </div>
      <label>
        <input
          type="checkbox"
          checked={isCritical}
          onChange={(e) => setIsCritical(!isCritical)}
        />
        Критический путь
      </label>
      <div className={styles.formButtons}>
        <button 
          type="submit" 
          className={sharedStyles.saveBtn}
          disabled={!!error}
        >
          Создать
        </button>
        <button type="button" className={sharedStyles.cancelBtn} onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
};

export default TaskForm;