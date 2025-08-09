import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import AuthForm from '../../components/AuthForm/AuthForm';
import { LOGIN_FIELDS } from '../../components/AuthForm/consts';
import { useAuth } from '../../context/AuthContext';
import { REGISTER_PAGE, FORGOT_PASSWORD_PAGE } from '../../routing/consts';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const validateForm = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Пожалуйста, введите корректный email');
      return false;
    }
    if (formData.password.length < 6 || formData.password.length > 64) {
      setError('Пароль должен быть от 6 до 64 символов');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = await login(formData);
      toast.success('Вход выполнен успешно!');
      navigate(`/user/${user.nickname}`);
    } catch (err) {
      toast.error(err.message || 'Ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <AuthForm
        title="Авторизация"
        fields={LOGIN_FIELDS.map(field => ({
          ...field,
          value: formData[field.id],
          onChange: handleInputChange
        }))}
        buttonText="Войти"
        altText="Нет аккаунта?"
        linkPath={REGISTER_PAGE}
        linkText="Зарегистрироваться"
        onSubmit={handleSubmit}
        error={error}
        isLoading={isLoading}
        extraLink={<Link to={FORGOT_PASSWORD_PAGE}>Забыли пароль?</Link>}
      />
    </div>
  );
};

export default Login;