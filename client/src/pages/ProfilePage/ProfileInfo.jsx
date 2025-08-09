import React from "react";
import styles from './ProfilePage.module.css'
import { useAuth } from '../../context/AuthContext';

const ProfileInfo = () => {
  const { user } = useAuth();
  return (
    <div className={styles.pageContent}>
      <h1 className={styles.pageTitle}>Профиль</h1>

      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {user.nickname[0].toUpperCase()}
          </div>
          <h2>{user.nickname}</h2>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.infoItem}>
            <label>Email</label>
            <span>{user.email}</span>
          </div>
          <div className={styles.infoItem}>
            <label>Дата регистрации</label>
            <span>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;