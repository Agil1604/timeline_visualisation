import { useState } from 'react';
import ToolbarPanel from '../../components/ToolbarPanel/ToolbarPanel';
import ControlGroup from '../../components/ToolbarPanel/ControlGroup';
import RangeControl from '../../components/ToolbarPanel/RangeControl';
import ButtonControl from '../../components/ToolbarPanel/ButtonControl';
import Modal from '../../components/Modal/Modal';
import styles from './Toolbar.module.css';

const Toolbar = ({
  lineSize,
  onLineSizeChange,
  ballSize,
  onBallSizeChange,
  onAddDate,
  onZoomRangeReset,
  visibleRange
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newEvent, setNewEvent] = useState('');

  const handleAddNew = () => {
    if (newDate && newEvent) {
      onAddDate({
        date: new Date(newDate),
        events: newEvent
      });
      setNewDate('');
      setNewEvent('');
      setIsModalOpen(false);
    }
  };

  const onCloseModal = () => {
    setNewDate('');
    setNewEvent('');
    setIsModalOpen(false);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('ru-RU');
  };

  return (
    <ToolbarPanel title="Панель управления">
      <Modal isOpen={isModalOpen} onClose={onCloseModal}>
        <div className={styles.modalForm}>
          <h3>Добавить событие</h3>
          <input
            type="date"
            placeholder="Дата"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Событие"
            value={newEvent}
            onChange={e => setNewEvent(e.target.value)}
          />
          <button onClick={handleAddNew}>Добавить</button>
        </div>
      </Modal>
      
      {/* Группа сброса и информации */}
      <ControlGroup>
        <ButtonControl onClick={onZoomRangeReset}>
          Сбросить вид
        </ButtonControl>
        <span>Диапазон: {formatDate(visibleRange.start)} - {formatDate(visibleRange.end)}</span>
      </ControlGroup>

      {/* Контролы размеров */}
      <ControlGroup>
        <RangeControl
          label="Толщина линии"
          value={lineSize}
          onChange={onLineSizeChange}
          min="1"
          max="10"
          unit="px"
        />
        <RangeControl
          label="Радиус точек"
          value={ballSize}
          onChange={onBallSizeChange}
          min="30"
          max="100"
          unit="px"
        />
      </ControlGroup>

      {/* Форма добавления */}
      <ControlGroup>
        <ButtonControl onClick={() => setIsModalOpen(true)} variant="primary">
          Добавить событие
        </ButtonControl>
      </ControlGroup>
    </ToolbarPanel>
  );
};

export default Toolbar;