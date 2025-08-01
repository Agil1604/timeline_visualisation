import { toast } from 'react-toastify';
import styles from './ProfilePage.module.css';
import { useAuth } from '../../context/AuthContext';

const ProfileDelete = () => {
  const { delete_ } = useAuth();

  const handleDeleteAccount = async () => {
    if (window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить!')) {
      try {
        await delete_();
        toast.success('Аккаунт успешно удален');
      } catch (err) {
        toast.error(err.message || 'Не удалось удалить аккаунт');
      }
    }
  };

  return (
    <div className={styles.pageContent}>
      <h1 className={styles.pageTitle}>Удаление аккаунта</h1>
      
      <div className={styles.warningCard}>
        <div className={styles.warningMessage}>
          <h3>Внимание!</h3>
          <p>Удаление аккаунта является необратимой операцией. После удаления все ваши данные будут безвозвратно утеряны.</p>
        </div>
        
        <div className={styles.deleteActions}>
          <button
            onClick={handleDeleteAccount}
            className={styles.btnDanger}
          >
            Удалить аккаунт
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDelete;