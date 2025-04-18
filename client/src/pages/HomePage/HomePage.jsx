import { useState, useEffect } from 'react';
import styles from './HomePage.module.css';
import cardStyles from '../../components/ProjectCard/ProjectCard.module.css';
import Navbar from '../../components/Navbar/Navbar';
import { WELCOME_PAGE } from '../../routing/consts';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import Modal from './Modal';
import { projectService } from '../../services/ProjectService';
import { useAuth } from '../../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const items = [
    {
      title: 'Профиль',
      path: `/user/${user.nickname}/profile`,
    },
    {
      title: 'О нас',
      path: WELCOME_PAGE,
    }
  ];
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'linear',
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await projectService.getAll();
        setProjects(response);
      } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
      }
    };
    loadProjects();
  }, []);

  const handleCreateNew = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ title: '', description: '', type: 'linear' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await projectService.create(formData);
      setProjects(prev => [response, ...prev]);
      closeModal();
    } catch (error) {
      console.error('Ошибка при создании проекта:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAboutProject = (project) => {
    setSelectedProject(project);
    setIsInfoModalOpen(true);
  };

  const handleEditProject = (project) => {
    setFormData({
      title: project.title,
      description: project.description,
      type: project.type,
    });
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Вы уверены, что хотите удалить проект?')) {
      try {
        await projectService.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } catch (error) {
        console.error('Ошибка при удалении проекта:', error);
      }
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const sendData = {
        title: formData.title,
        description: formData.description,
      };
      await projectService.updateProject(selectedProject.id, sendData);
      setProjects(prev => prev.map(p =>
        p.id === selectedProject.id ? { ...p, ...formData } : p
      ));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Ошибка при обновлении проекта:', error);
    }
  };

  return (
    <div className={styles.container}>
      <Navbar
        items={items}
        addLogout={true}
        isMenuOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />
      <h1>Мои проекты</h1>

      <div className={styles.projectsGrid}>
        <div
          className={`${styles.newProjectCard} ${cardStyles.card}`}
          onClick={handleCreateNew}
        >
          <div className={cardStyles.icon}>+</div>
          <div className={cardStyles.title}>Новый проект</div>
        </div>

        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onAbout={() => handleAboutProject(project)}
            onEdit={() => handleEditProject(project)}
            onDelete={() => handleDeleteProject(project.id)}
          />
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <h2>Создать новый проект</h2>
          <div className={styles.formGroup}>
            <label>Название проекта:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={30}
            />
            <div className={styles.counter}>
              {formData.title.length}/30
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Описание:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={250}
            />
            <div className={styles.counter}>
              {formData.description.length}/250
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Тип проекта:</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="linear">Линейный</option>
              <option value="gantt">Гант</option>
            </select>
          </div>

          <div className={styles.formButtons}>
            <button type="button" onClick={closeModal}>
              Отмена
            </button>
            <button type="submit">
              Создать
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)}>
        <div className={styles.modalForm}>
          <h2>Информация о проекте</h2>
          {selectedProject && (
            <>
              <div className={styles.formGroup}>
                <label>Название:</label>
                <p>{selectedProject.title}</p>
              </div>
              <div className={styles.formGroup}>
                <label>Описание:</label>
                <p>{selectedProject.description || 'Нет описания'}</p>
              </div>
              <div className={styles.formGroup}>
                <label>Тип проекта:</label>
                <p>{selectedProject.type === 'linear' ? 'Линейный' : 'Гант'}</p>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <form onSubmit={handleUpdateProject} className={styles.modalForm}>
          <h2>Редактировать проект</h2>
          <div className={styles.formGroup}>
            <label>Тип проекта:</label>
            <p>{formData.type === 'linear' ? 'Линейный' : 'Гант'}</p>
          </div>
          <div className={styles.formGroup}>
            <label>Название проекта:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={30}
            />
            <div className={styles.counter}>
              {formData.title.length}/30
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Описание:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={250}
            />
            <div className={styles.counter}>
              {formData.description.length}/250
            </div>
          </div>

          <div className={styles.formButtons}>
            <button type="button" onClick={() => setIsEditModalOpen(false)}>
              Отмена
            </button>
            <button type="submit">
              Сохранить
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HomePage;