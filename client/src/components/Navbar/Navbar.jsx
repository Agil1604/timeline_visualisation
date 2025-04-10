import { Link, useLocation } from 'react-router-dom';
import React from 'react';
import './Navbar.css';
import { useAuth } from '../../context/AuthContext';
import { WELCOME_PAGE } from '../../routing/consts';

const Navbar = ({ items, addLogout, isMenuOpen, toggleMenu }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const logoPath = user ? `/user/${user.nickname}` : WELCOME_PAGE;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="logo">
          <span className="logo-icon">🚀</span>
          <h1 className="logo-text">
            <Link to={logoPath} className="logo-link">TimeLine</Link>
          </h1>
        </div>

        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          ☰
        </button>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
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