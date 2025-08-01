import { NavLink, Outlet } from 'react-router-dom';

import styles from './ProfilePage.module.css';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import { WELCOME_PAGE } from '../../routing/consts';

const ProfilePage = () => {
    const { user } = useAuth();
  
    const items = [
      { title: 'Главная', path: `/user/${user.nickname}` },
      { title: 'О нас', path: WELCOME_PAGE }
    ];

    return (
      <div className={styles.profilePageContainer}>
        <Navbar
          items={items}
          addLogout={true}
        />
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
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <h2 className={styles.sidebarTitle}>Настройки профиля</h2>
        
        <div className={styles.sectionGroup}>
          <h3>Основные</h3>
          <NavLink to="info" className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>
            Профиль
          </NavLink>
        </div>

        <div className={styles.sectionGroup}>
          <h3>Настройки аккаунта</h3>
          <NavLink to="change-password" className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>
            Сменить пароль
          </NavLink>
          <NavLink to="change-username" className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>
            Сменить имя пользователя
          </NavLink>
          <NavLink to="delete" className={({isActive}) => isActive ? styles.activeLink : styles.navLink}>
            Удалить аккаунт
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;