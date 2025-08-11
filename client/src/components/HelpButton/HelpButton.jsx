import { useState } from 'react';
import { FiHelpCircle } from 'react-icons/fi';

import Modal from '../Modal/Modal';
import styles from './HelpButton.module.css';

const HelpButton = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  return (
    <>
      <button
        className={styles.helpButton}
        onClick={handleOpen}
        aria-label="Помощь"
      >
        <FiHelpCircle />
      </button>

      <Modal isOpen={isModalOpen} onClose={handleClose}>
        {children}
      </Modal>
    </>
  );
};

export default HelpButton;