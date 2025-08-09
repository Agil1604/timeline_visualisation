import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

import styles from './Navbar.module.css'
import { useAuth } from '../../context/AuthContext';
import { WELCOME_PAGE } from '../../routing/consts';

const Navbar = () => {
  const { logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const logoPath = user ? `/user/${user.nickname}` : WELCOME_PAGE;
  const addAvatar = user ? true : false;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContent}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🚀</span>
          <h1 className={styles.logoText}>
            <Link to={logoPath} className={styles.logoLink}>TimeLine</Link>
          </h1>
        </div>

        <div className={styles.navLinks}>
          {addAvatar && (
            <div className={styles.avatarDropdown} ref={dropdownRef}>
              <div
                className={styles.navbarAvatar}
                onClick={toggleDropdown}
              >
                {user.nickname[0].toUpperCase()}
              </div>

              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <Link
                    to={`/user/${user.nickname}`}
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Главная
                  </Link>
                  <Link
                    to={`/user/${user.nickname}/profile`}
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Профиль
                  </Link>
                  <Link
                    to={WELCOME_PAGE}
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    О нас
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className={styles.dropdownItem}
                  >
                    Выход
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;