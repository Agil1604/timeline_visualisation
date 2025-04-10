// SidePanel.jsx
import { useState } from 'react';
import { FiSettings, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './SidePanel.css'

const SidePanel = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`side-panel-container ${isOpen ? 'open' : 'closed'}`}>
      <div
        className="side-panel-content"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </div>

      <button
        className="toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Скрыть панель" : "Показать панель"}
      >
        {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
        {!isOpen && isHovered && <FiSettings className="settings-icon" />}
      </button>
    </div>
  );
};

export default SidePanel;