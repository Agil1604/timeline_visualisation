import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import './Navbar.css';
import { useAuth } from '../../context/AuthContext';
import { WELCOME_PAGE } from '../../routing/consts';

const Navbar = ({ items }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const logoPath = user ? `/user/${user.nickname}` : WELCOME_PAGE;
  const addLogout = user ? true : false;
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="logo">
          <span className="logo-icon">🚀</span>
          <h1 className="logo-text">
            <Link to={logoPath} className="logo-link">TimeLine</Link>
          </h1>
        </div>

        <div className={"nav-links"}>
          {items.map(({ title, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={title}
                to={path}
                className={isActive ? 'active' : ''}
              >
                {title}
              </Link>
            );
          })}

          {addLogout && (
            <button
              onClick={logout}
              className="nav-button logout-button"
            >
              Выход
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;