import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../components/AuthForm/AuthForm';
import Navbar from '../../components/Navbar/Navbar';
import { LOGIN_PAGE } from '../../routing/consts';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Введите корректный email');
      return;
    }

    setIsLoading(true);
    try {
      // Здесь будет логика отправки письма
      toast.success('Инструкции отправлены на ваш email');
      navigate(LOGIN_PAGE);
    } catch (err) {
      toast.error(err.message || 'Ошибка восстановления пароля');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navbar
        items={[]}
        addLogout={false}
        isMenuOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />
      <AuthForm
        title="Восстановление пароля"
        fields={[
          {
            id: 'email',
            label: 'Email',
            type: 'email',
            value: email,
            onChange: (e) => setEmail(e.target.value),
            maxLength: 255
          }
        ]}
        buttonText="Отправить инструкции"
        altText="Вспомнили пароль?"
        linkPath={LOGIN_PAGE}
        linkText="Войти"
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ForgotPassword;