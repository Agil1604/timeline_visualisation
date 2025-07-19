import React from 'react';
import { Link } from 'react-router-dom';

import './AuthForm.css';

const AuthForm = ({
  title,
  fields,
  buttonText,
  altText,
  linkPath,
  linkText,
  onSubmit,
  error,
  isLoading,
  extraLink
}) => (
  <div className="auth-container">
    <form className="auth-form" onSubmit={onSubmit}>
      <h2>{title}</h2>
      {error && <div className="error-message">{error}</div>}

      {fields.map((field) => (
        <div className="form-group" key={field.id}>
          <label htmlFor={field.id}>{field.label}:</label>
          <input
            type={field.type}
            id={field.id}
            value={field.value}
            onChange={field.onChange}
            required
            maxLength={field.maxLength}
          />
        </div>
      ))}

      <button
        type="submit"
        className="auth-button"
        disabled={isLoading}
      >
        {isLoading ? 'Загрузка...' : buttonText}
      </button>

      {extraLink}

      <div className="auth-link">
        {altText} <Link to={linkPath}>{linkText}</Link>
      </div>
    </form>
  </div>
);

export default AuthForm;