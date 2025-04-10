import { useState } from 'react';
import styles from './ProfilePage.module.css';
import Navbar from '../../components/Navbar/Navbar';
import { WELCOME_PAGE } from '../../routing/consts';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  const { user, delete_, changePassword } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const items = [
    { title: 'Главная', path: `/user/${user.nickname}` },
    { title: 'О нас', path: WELCOME_PAGE }
  ];

  const validateForm = () => {
    const errors = {};
    if (!passwords.oldPassword) errors.oldPassword = 'Введите текущий пароль';
    if (!passwords.newPassword) errors.newPassword = 'Введите новый пароль';
    if (passwords.newPassword.length < 6) errors.newPassword = 'Пароль должен быть не менее 6 символов';
    if (passwords.newPassword !== passwords.confirmPassword) errors.confirmPassword = 'Пароли не совпадают';
    return errors;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return setFormErrors(errors);
    
    try {
      await changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      alert('Пароль успешно изменен!');
      setShowChangePasswordForm(false);
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setFormErrors({});
    } catch (err) {
      setError(err.message || 'Ошибка при смене пароля');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить!')) {
      try {
        await delete_();
      } catch (err) {
        setError('Не удалось удалить аккаунт');
      }
    }
  };

  return (
    <div className={styles.profileContainer}>
      <Navbar
        items={items}
        addLogout={true}
        isMenuOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />
      
      <div className={styles.content}>
        <div className={styles.profileHeader}>
          <h1>{user.nickname}</h1>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.infoItem}>
            <label>Email</label>
            <span>{user.email}</span>
          </div>
          <div className={styles.infoItem}>
            <label>Дата регистрации</label>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {showChangePasswordForm && (
          <form onSubmit={handlePasswordChange} className={styles.passwordForm}>
            <h3>Смена пароля</h3>
            
            <div className={styles.formGroup}>
              <label>Текущий пароль</label>
              <input
                type="password"
                value={passwords.oldPassword}
                onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
              />
              {formErrors.oldPassword && <span className={styles.errorText}>{formErrors.oldPassword}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Новый пароль</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              />
              {formErrors.newPassword && <span className={styles.errorText}>{formErrors.newPassword}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Подтвердите пароль</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              />
              {formErrors.confirmPassword && <span className={styles.errorText}>{formErrors.confirmPassword}</span>}
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.btnPrimary}>Сохранить</button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowChangePasswordForm(false)}
              >
                Отмена
              </button>
            </div>
          </form>
        )}

        <div className={styles.actions}>
          <button
            onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            {showChangePasswordForm ? 'Скрыть форму' : 'Сменить пароль'}
          </button>
          
          <button
            onClick={handleDeleteAccount}
            className={`${styles.btn} ${styles.btnDanger}`}
          >
            Удалить аккаунт
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    </div>
  );
};

export default ProfilePage;