import { useState, useEffect } from 'react';

import styles from './EditForm.module.css';

const EditForm = ({ ball, onUpdate, onDelete, onClose }) => {
  const [formData, setFormData] = useState(ball);

  useEffect(() => {
    setFormData(ball);
  }, [ball]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const year = parseInt(formData.year);
    if (isNaN(year)) {
      alert('Пожалуйста, введите корректный год');
      return;
    }
    onUpdate({
      ...formData,
      year: parseInt(formData.year)
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editForm}>
      <h3 className={styles.formHeader}>Редактирование</h3>
      <div className={styles.formGroup}>
        <label>Год:</label>
        <input
          type="number"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
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