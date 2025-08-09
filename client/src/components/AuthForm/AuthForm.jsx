import React from 'react';
import { Link } from 'react-router-dom';

import styles from './AuthForm.module.css';

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
  <div className={styles.authContainer}>
    <form className={styles.authForm} onSubmit={onSubmit}>
      <h2 className={styles.authTitle}>{title}</h2>
      {error && <div className={styles.errorMessage}>{error}</div>}

      {fields.map((field) => (
        <div className={styles.formGroup} key={field.id}>
          <label className={styles.formLabel} htmlFor={field.id}>
            {field.label}:
          </label>
          <input
            type={field.type}
            id={field.id}
            className={styles.formInput}
            value={field.value}
            onChange={field.onChange}
            required
            maxLength={field.maxLength}
          />
        </div>
      ))}

      <button
        type="submit"
        className={styles.authButton}
        disabled={isLoading}
      >
        {isLoading ? 'Загрузка...' : buttonText}
      </button>

      {extraLink && (
        <div className={styles.extraLinkContainer}>
          {React.cloneElement(extraLink, {
            className: styles.extraLink
          })}
        </div>
      )}

      <div className={styles.authLink}>
        {altText}{' '}
        <Link to={linkPath} className={styles.authLinkText}>
          {linkText}
        </Link>
      </div>
    </form>
  </div>
);

export default AuthForm;