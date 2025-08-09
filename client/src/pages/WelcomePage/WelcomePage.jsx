import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiShield, FiCloud } from 'react-icons/fi';

import styles from './WelcomePage.module.css';
import { LOGIN_PAGE } from '../../routing/consts';
import { useAuth } from '../../context/AuthContext';

const Footer = lazy(() => import('../../components/Footer/Footer'));

const WelcomePage = () => {
  const { user, isLoading } = useAuth();
  const buttonPath = isLoading ? '#' : user ? `/user/${user.nickname}` : LOGIN_PAGE;

  const features = [
    {
      icon: <FiUser className={styles.featureIcon} />,
      title: 'Удобный интерфейс',
      description: 'Интуитивно понятное управление и современный дизайн'
    },
    {
      icon: <FiShield className={styles.featureIcon} />,
      title: 'Безопасность',
      description: 'Защита данных и шифрование передаваемой информации'
    },
    {
      icon: <FiCloud className={styles.featureIcon} />,
      title: 'Синхронизация',
      description: 'Работайте с любого устройства с автоматической синхронизацией'
    }
  ];

  return (
    <div className={styles.welcome}>
      <main className={styles.welcomeContent} aria-label="Основной контент">
        <section
          className={styles.heroSection}
          aria-labelledby="heroTitle"
        >
          <div className={styles.heroContent}>
            <h2 id="heroTitle" className={styles.heroTitle}>Добро пожаловать в TimeLine</h2>
            <p className={styles.heroDescription}>
              Инновационное решение для ваших бизнес-задач. Начните использовать уже сегодня!
            </p>
            <Link to={buttonPath} prefetch>
              <button
                className={styles.ctaButton}
                disabled={isLoading}
                aria-label={isLoading ? 'Загрузка данных пользователя' : 'Начать бесплатное использование'}
              >
                {isLoading ? 'Загрузка...' : 'Начать бесплатно'}
              </button>
            </Link>
          </div>
        </section>

        <section className={styles.featuresSection} id="features" aria-label="Наши преимущества">
          <h3 className={styles.sectionTitle}>Наши преимущества</h3>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <article className={styles.featureCard} key={index}>
                <header className={styles.cardHeader}>
                  <div className={styles.cardIcon} aria-hidden="true">
                    {feature.icon}
                  </div>
                  <h4 className={styles.cardTitle}>{feature.title}</h4>
                </header>
                <p className={styles.cardText}>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Suspense fallback={<div className={styles.footerLoader}>Загрузка футера...</div>}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default WelcomePage;