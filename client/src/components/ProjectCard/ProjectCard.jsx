import { Link } from 'react-router-dom';

import cardStyles from './ProjectCard.module.css';
import ProjectCardMenu from './ProjectCardMenu';
import { useAuth } from '../../context/AuthContext';

const ProjectCard = ({ project, onAbout, onEdit, onDelete }) => {
  const { user } = useAuth();
  return (
    <Link
      to={`/user/${user.nickname}/${project.type}/${project.id}`}
      className={cardStyles.card}
    >

      <div className={cardStyles.header}>
        <ProjectCardMenu
          onAbout={onAbout}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        <span className={cardStyles.typeBadge}>
          {project.type === 'linear' ? 'Линейный' : 'Гант'}
        </span>
        <h3 className={cardStyles.title}>{project.title}</h3>
      </div>

      <p className={cardStyles.description}>{project.description}</p>

      <div className={cardStyles.meta}>
        <span>Создан: {new Date(project.created_date).toLocaleDateString()}</span>
        <span>Изменен: {new Date(project.last_modified_date).toLocaleDateString()}</span>
      </div>
    </Link>
  );
};

export default ProjectCard;