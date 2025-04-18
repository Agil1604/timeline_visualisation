import { useState, useEffect } from 'react';

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
    <form onSubmit={handleSubmit} className="edit-form">
      <h3>Редактирование</h3>
      <div className="form-group">
        <label>Год:</label>
        <input
          type="number"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Цвет:</label>
        <input
          type="color"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Описание:</label>
        <textarea
          value={formData.events[0]}
          onChange={(e) => setFormData({ ...formData, events: [e.target.value] })}
        />
      </div>
      <div className="form-actions">
        <button type="button" onClick={onClose}>Отмена</button>
        <button type="button" onClick={() => onDelete(ball)}>Удалить</button>
        <button type="submit">Сохранить</button>
      </div>
    </form>
  );
};

export default EditForm;