import styles from './ProfilePage.module.css';

const ProfileChangeUsername = () => {
  return (
    <div className={styles.pageContent}>
      <h1 className={styles.pageTitle}>Смена имени пользователя</h1>

      <div className={styles.infoCard}>
        <div className={styles.infoMessage}>
          <p>В данный момент нет возможности менять имя пользователя. Но в скором времени такая возможность добавится.</p>
          <p>Следите за обновлениями!</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileChangeUsername;