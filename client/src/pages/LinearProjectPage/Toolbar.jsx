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
  onAddYear,
  onZoomRangeReset,
  visibleRange
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newYear, setNewYear] = useState('');
  const [newEvent, setNewEvent] = useState('');

  const handleAddNew = () => {
    if (newYear && newEvent) {
      onAddYear({
        year: parseInt(newYear),
        events: newEvent
      });
      setNewYear('');
      setNewEvent('');
      setIsModalOpen(false);
    }
  };

  const onCloseModal = () => {
    setNewYear('');
    setNewEvent('');
    setIsModalOpen(false);
  };

  return (
    <ToolbarPanel title="Панель управления">
      <Modal isOpen={isModalOpen} onClose={onCloseModal}>
        <div className={styles.modalForm}>
          <h3>Добавить событие</h3>
          <input
            type="number"
            placeholder="Год"
            value={newYear}
            onChange={e => setNewYear(e.target.value)}
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
        <span>Диапазон: {parseInt(visibleRange.start)} - {parseInt(visibleRange.end)}</span>
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