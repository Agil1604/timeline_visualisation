import { useState } from 'react';
import styles from './ProjectCard.module.css';

const ProjectCardMenu = ({ project, onAbout, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={styles.menuContainer}>
      <button
        className={styles.menuButton}
        onClick={(e) => {
          e.preventDefault();
          setIsMenuOpen(!isMenuOpen);
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-5 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
            fill="currentColor" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className={styles.menuDropdown} onClick={(e) => e.preventDefault()}>
          <button onClick={() => { onAbout(); setIsMenuOpen(false); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#2d8cff">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            О проекте
          </button>
          <button onClick={() => { onEdit(); setIsMenuOpen(false); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffb800">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            Изменить
          </button>
          <button onClick={() => { onDelete(); setIsMenuOpen(false); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff3b30">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
            Удалить
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectCardMenu;