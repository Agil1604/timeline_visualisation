import { useState, Suspense, lazy } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import './WelcomePage.css'
import { Link } from 'react-router-dom';
import { LOGIN_PAGE } from '../../routing/consts';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiShield, FiCloud } from 'react-icons/fi';

const Footer = lazy(() => import('../../components/Footer/Footer'));

const WelcomePage = () => {
  const { user, isLoading } = useAuth();
  const buttonPath = isLoading ? '#' : user ? `/user/${user.nickname}` : LOGIN_PAGE;

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <FiUser className="feature-icon" />,
      title: 'Удобный интерфейс',
      description: 'Интуитивно понятное управление и современный дизайн'
    },
    {
      icon: <FiShield className="feature-icon" />,
      title: 'Безопасность',
      description: 'Защита данных и шифрование передаваемой информации'
    },
    {
      icon: <FiCloud className="feature-icon" />,
      title: 'Синхронизация',
      description: 'Работайте с любого устройства с автоматической синхронизацией'
    }
  ];

  return (
    <div className="welcome">
      <Navbar
        items={[]}
        addLogout={false}
        isMenuOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />

      <main className="welcome-content" aria-label="Основной контент">
        <section 
          className="hero-section" 
          aria-labelledby="heroTitle"
        >
          <div className="hero-content">
            <h2 id="heroTitle" className="hero-title">Добро пожаловать в TimeLine</h2>
            <p className="hero-description">
              Инновационное решение для ваших бизнес-задач. Начните использовать уже сегодня!
            </p>
            <Link to={buttonPath} prefetch>
              <button
                className="cta-button"
                disabled={isLoading}
                aria-label={isLoading ? 'Загрузка данных пользователя' : 'Начать бесплатное использование'}
              >
                {isLoading ? 'Загрузка...' : 'Начать бесплатно'}
              </button>
            </Link>
          </div>
        </section>

        <section className="features-section" id="features" aria-label="Наши преимущества">
          <h3 className="section-title">Наши преимущества</h3>
          <div className="features-grid">
            {features.map((feature, index) => (
              <article className="feature-card" key={index}>
                <header className="card-header">
                  <div className="card-icon" aria-hidden="true">
                    {feature.icon}
                  </div>
                  <h4 className="card-title">{feature.title}</h4>
                </header>
                <p className="card-text">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Suspense fallback={<div className="footer-loader">Загрузка футера...</div>}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default WelcomePage;