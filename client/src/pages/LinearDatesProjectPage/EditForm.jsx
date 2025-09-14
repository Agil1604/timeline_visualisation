import { useState, useEffect } from 'react';

import styles from './EditForm.module.css';

const EditForm = ({ ball, onUpdate, onDelete, onClose }) => {
  const [formData, setFormData] = useState({
    ...ball,
    date: ball.date instanceof Date ? ball.date.toISOString().split('T')[0] : ball.date
  });

  useEffect(() => {
    setFormData({
      ...ball,
      date: ball.date instanceof Date ? ball.date.toISOString().split('T')[0] : ball.date
    });
  }, [ball]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const date = new Date(formData.date);
    if (isNaN(date.getTime())) {
      alert('Пожалуйста, введите корректную дату');
      return;
    }
    onUpdate({
      ...formData,
      date: date
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editForm}>
      <h3 className={styles.formHeader}>Редактирование</h3>
      <div className={styles.formGroup}>
        <label>Дата:</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>
      <div className={styles.formGroup}>
        <label>Цвет:</label>
        <input
          type="color"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
        />
      </div>
      <div className={styles.formGroup}>
        <label>Описание:</label>
        <textarea
          value={formData.events}
          onChange={(e) => setFormData({ ...formData, events: e.target.value })}
        />
      </div>
      <div className={styles.formActions}>
        <button className={`${styles.formButton} ${styles.cancelButton}`} type="button" onClick={onClose}>Отмена</button>
        <button className={`${styles.formButton} ${styles.deleteButton}`} type="button" onClick={() => onDelete(ball)}>Удалить</button>
        <button className={`${styles.formButton} ${styles.submitButton}`} type="submit">Сохранить</button>
      </div>
    </form>
  );
};

export default EditForm;