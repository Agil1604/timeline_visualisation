import styles from './ProjectCard.module.css'

const NewProjectCard = ({ handleCreateNew }) => {
  return (
    <div
      className={`${styles.card} ${styles.newProjectCard}`}
      onClick={handleCreateNew}
    >
      <div className={styles.icon}>+</div>
      <div className={styles.title}>Новый проект</div>
    </div>
  )
}

export default NewProjectCard;