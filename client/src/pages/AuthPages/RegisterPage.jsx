import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import AuthForm from '../../components/AuthForm/AuthForm';
import Navbar from '../../components/Navbar/Navbar';
import { REGISTER_FIELDS } from '../../components/AuthForm/consts';
import { useAuth } from '../../context/AuthContext';
import { LOGIN_PAGE } from '../../routing/consts';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: ''
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
    if (!formData.nickname.trim()) {
      setError('Введите никнейм');
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
      await register(formData);
      toast.success('Регистрация прошла успешно!');
      navigate(LOGIN_PAGE);
    } catch (err) {
      toast.error(err.message || 'Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navbar
        items={[]}
        addLogout={false}
      />
      <AuthForm
        title="Регистрация"
        fields={REGISTER_FIELDS.map(field => ({
          ...field,
          value: formData[field.id],
          onChange: handleInputChange
        }))}
        buttonText="Зарегистрироваться"
        altText="Уже есть аккаунт?"
        linkPath={LOGIN_PAGE}
        linkText="Войти"
        onSubmit={handleSubmit}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Register;