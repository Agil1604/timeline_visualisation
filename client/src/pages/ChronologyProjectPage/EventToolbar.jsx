import { useState, useEffect, useRef } from 'react';
import ToolbarPanel from '../../components/ToolbarPanel/ToolbarPanel';
import ControlGroup from '../../components/ToolbarPanel/ControlGroup';
import ButtonControl from '../../components/ToolbarPanel/ButtonControl';
import Modal from '../../components/Modal/Modal';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import styles from './EventToolbar.module.css';

const EventToolbar = ({
  event,
  onClose,
  onUpdateEvent,
  onDeleteEvent,
  onMoveEvent
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    year: '',
    title: '',
    description: ''
  });
  const panelRef = useRef(null);

  useEffect(() => {
    if (isEditModalOpen) {
      return;
    }

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditModalOpen, onClose]);

  useEffect(() => {
    if (isEditModalOpen && event) {
      setEditForm({
        year: event.year,
        title: event.title,
        description: event.description
      });
    }
  }, [isEditModalOpen, event]);

  const handleSaveEdit = () => {
    if (editForm.year && editForm.title && editForm.description) {
      onUpdateEvent({
        ...event,
        year: parseInt(editForm.year),
        title: editForm.title,
        description: editForm.description
      });
      setIsEditModalOpen(false);
      onClose();
    }
  };

  const handleDelete = () => {
    onDeleteEvent(event.id);
    onClose();
  };

  const canMoveUp = event?.canMoveUp || false;
  const canMoveDown = event?.canMoveDown || false;

  if (!event) return null;

  return (
    <>
      <div ref={panelRef}>
        <ToolbarPanel title={"Управление событием"} position="right">
          <ControlGroup>
            <h3>{event.title}</h3>
          </ControlGroup>

          <ControlGroup>
            <div className={styles.orderControls}>
              <ButtonControl
                onClick={() => onMoveEvent(event.id, 'up')}
                disabled={!canMoveUp}
              >
                <FaArrowUp />
              </ButtonControl>
              <ButtonControl
                onClick={() => onMoveEvent(event.id, 'down')}
                disabled={!canMoveDown}
              >
                <FaArrowDown />
              </ButtonControl>
            </div>
          </ControlGroup>
          <ControlGroup>
            <ButtonControl onClick={() => setIsEditModalOpen(true)}>
              Редактировать
            </ButtonControl>
            <ButtonControl onClick={handleDelete} variant="primary">
              Удалить
            </ButtonControl>
          </ControlGroup>
        </ToolbarPanel>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div className={styles.modalForm}>
          <h3>Редактировать событие</h3>
          <input
            type="number"
            placeholder="Год"
            value={editForm.year}
            onChange={e => setEditForm(prev => ({ ...prev, year: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Событие"
            value={editForm.title}
            onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Описание события"
            value={editForm.description}
            onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
          />
          <button onClick={handleSaveEdit}>Сохранить</button>
        </div>
      </Modal>
    </>
  );
};

export default EventToolbar;