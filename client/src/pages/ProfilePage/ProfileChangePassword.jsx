import { useState } from 'react';
import { toast } from 'react-toastify';

import styles from './ProfilePage.module.css';
import { useAuth } from '../../context/AuthContext';

const ProfileChangePassword = () => {
  const { changePassword } = useAuth();
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});

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
      toast.success('Пароль успешно изменен!');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setFormErrors({});
    } catch (err) {
      toast.error(err.message || 'Ошибка при смене пароля');
    }
  };

  return (
    <div className={styles.pageContent}>
      <h1 className={styles.pageTitle}>Смена пароля</h1>
      
      <div className={styles.formCard}>
        <form onSubmit={handlePasswordChange} className={styles.passwordForm}>
          <div className={styles.formGroup}>
            <label>Текущий пароль</label>
            <input
              type="password"
              value={passwords.oldPassword}
              onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
              className={formErrors.oldPassword ? styles.inputError : ''}
            />
            {formErrors.oldPassword && <span className={styles.errorText}>{formErrors.oldPassword}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Новый пароль</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className={formErrors.newPassword ? styles.inputError : ''}
            />
            {formErrors.newPassword && <span className={styles.errorText}>{formErrors.newPassword}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Подтвердите пароль</label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className={formErrors.confirmPassword ? styles.inputError : ''}
            />
            {formErrors.confirmPassword && <span className={styles.errorText}>{formErrors.confirmPassword}</span>}
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.btnPrimary}>Сохранить изменения</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileChangePassword;