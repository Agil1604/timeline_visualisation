import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import styles from './ProfilePage.module.css';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  return (
    <div className={styles.profilePageContainer}>
      <div className={styles.profileContainer}>
        <div className={styles.settingsPanel}>
          <Sidebar />
          <div className={styles.mainContent}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <h2 className={styles.sidebarTitle}>Настройки профиля</h2>

        <div className={styles.sectionGroup}>
          <h3>Основные</h3>
          <NavLink to="info" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            Профиль
          </NavLink>
        </div>

        <div className={styles.sectionGroup}>
          <h3>Настройки аккаунта</h3>
          <NavLink to="change-password" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            Сменить пароль
          </NavLink>
          <NavLink to="change-username" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            Сменить имя пользователя
          </NavLink>
          <button
            onClick={handleLogout}
            className={styles.navLinkButton}
          >
            Выход
          </button>
          <NavLink to="delete" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            Удалить аккаунт
          </NavLink>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;