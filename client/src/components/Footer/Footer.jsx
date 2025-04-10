import React from 'react';
import "./Footer.css"

const Footer = () => {
    return (
        <div className="footer-container">
            <footer className="footer">
                <div className="footer-content">
                    <p className="copyright">
                        © 2025 TimeLine
                    </p>
                    <div className="social-links">
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