import { useState } from 'react';
import ToolbarPanel from '../../components/ToolbarPanel/ToolbarPanel';
import ControlGroup from '../../components/ToolbarPanel/ControlGroup';
// import RangeControl from '../../components/ToolbarPanel/RangeControl';
import ButtonControl from '../../components/ToolbarPanel/ButtonControl';
import Modal from '../../components/Modal/Modal';
import styles from './Toolbar.module.css';

const Toolbar = ({onAddEvent}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventYear, setNewEventYear] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');

  const handleAddNew = () => {
    if (newEventYear && newEventTitle && newEventDescription) {
      onAddEvent({
        year: parseInt(newEventYear),
        title: newEventTitle,
        description: newEventDescription
      });
      onCloseModal();
    }
  };

  const onCloseModal = () => {
    setNewEventYear('');
    setNewEventTitle('');
    setNewEventDescription('');
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
            value={newEventYear}
            onChange={e => setNewEventYear(e.target.value)}
          />
          <input
            type="text"
            placeholder="Событие"
            value={newEventTitle}
            onChange={e => setNewEventTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Описание события"
            value={newEventDescription}
            onChange={e => setNewEventDescription(e.target.value)}
          />
          <button onClick={handleAddNew}>Добавить</button>
        </div>
      </Modal>
      <ControlGroup>
        <ButtonControl onClick={() => setIsModalOpen(true)} variant="primary">
          Добавить событие
        </ButtonControl>
      </ControlGroup>
    </ToolbarPanel>
  );
};

export default Toolbar;