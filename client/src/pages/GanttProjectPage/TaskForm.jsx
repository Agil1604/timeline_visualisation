
import React, { useState } from 'react';
import './sharedStyles.css';
import styles from './TaskForm.module.css';

const TaskForm = ({ onAddTask, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [isCritical, setIsCritical] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !start || !end) return;

    onAddTask({
      name,
      description,
      start,
      end,
      isCritical
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Создание новой задачи</h3>

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
          onChange={(e) => setStart(e.target.value)}
          required
        />
        <span>до</span>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
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
        <button type="submit" className="save-btn">Создать</button>
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
};


export default TaskForm;