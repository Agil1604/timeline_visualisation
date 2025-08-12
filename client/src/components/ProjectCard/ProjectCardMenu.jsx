import { useState } from 'react';
import { FiMoreHorizontal } from "react-icons/fi";
import { MdInfo, MdModeEdit, MdDelete } from "react-icons/md";

import styles from './ProjectCard.module.css';

const ProjectCardMenu = ({ onAbout, onEdit, onDelete }) => {
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
        <FiMoreHorizontal />
      </button>

      {isMenuOpen && (
        <div className={styles.menuDropdown} onClick={(e) => e.preventDefault()}>
          <button onClick={() => { onAbout(); setIsMenuOpen(false); }}>
            <MdInfo fill="#2d8cff" size={16} />
            О проекте
          </button>
          <button onClick={() => { onEdit(); setIsMenuOpen(false); }}>
            <MdModeEdit fill="#ffb800" size={16} />
            Изменить
          </button>
          <button onClick={() => { onDelete(); setIsMenuOpen(false); }}>
            <MdDelete fill="#ff3b30" size={16} />
            Удалить
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectCardMenu;