import { useState } from 'react';
  
const TimelineControls = ({ 
  lineSize,
  onLineSizeChange,
  ballSize,
  onBallSizeChange,
  onAddYear,
  isPanelOpen,
  onTogglePanel,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset
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
    <div className={`controls-panel ${isPanelOpen ? 'open' : 'closed'}`}>
      <button className="toggle-btn" onClick={onTogglePanel}>
        {isPanelOpen ? '◀' : '▶'}
      </button>

      {isPanelOpen && (
        <>
          <div className="control-group">
            <button onClick={onZoomIn}>+</button>
            <button onClick={onZoomOut}>-</button>
            <button onClick={onZoomReset}>Сбросить</button>
            <span>Масштаб: {Math.round(zoomLevel * 100)}%</span>
          </div>

          <div className="control-group">
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

          <div className="control-group">
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

          <div className="add-form">
            <h4>Добавить новый шарик</h4>
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