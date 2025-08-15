import { useState } from 'react';

import styles from './TimelineControls.module.css';

const TimelineControls = ({
  lineSize,
  onLineSizeChange,
  ballSize,
  onBallSizeChange,
  onAddYear,
  isPanelOpen,
  onTogglePanel,
  onZoomRangeReset,
  visibleRange
}) => {
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
    }
  };

  return (
    <div className={isPanelOpen ? styles.controlsPanel : styles.controlsPanelClosed}>
      <button className={styles.toggleBtn} onClick={onTogglePanel}>
        {isPanelOpen ? '◀' : '▶'}
      </button>

      {isPanelOpen && (
        <>
          <div className={styles.controlGroup}>
            <button onClick={onZoomRangeReset}>Сбросить вид</button>
            <span>Диапазон: {parseInt(visibleRange.start)} - {parseInt(visibleRange.end)}</span>
          </div>

          <div className={styles.controlGroup}>
            <label>Толщина линии:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={lineSize}
              onChange={e => onLineSizeChange(parseInt(e.target.value))}
            />
            <span>{lineSize}px</span>
          </div>

          <div className={styles.controlGroup}>
            <label>Радиус точек:</label>
            <input
              type="range"
              min="30"
              max="100"
              value={ballSize}
              onChange={e => onBallSizeChange(parseInt(e.target.value))}
            />
            <span>{ballSize}px</span>
          </div>

          <div className={styles.addForm}>
            <h4>Добавить событие</h4>
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
        </>
      )}
    </div>
  );
};

export default TimelineControls;