import React from 'react';

import styles from "./Footer.module.css"

const Footer = () => {
  return (
    <div className={styles.footerContainer}>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.copyright}>
            © 2025 TimeLine
          </p>
          <div className={styles.socialLinks}>
            <a href="https://t.me/amirovagil" target="_blank" rel="noopener noreferrer">Telegram</a>
            <a href="https://github.com/Agil1604/timeline_visualisation" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="mailto:asamirov@edu.hse.ru">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;