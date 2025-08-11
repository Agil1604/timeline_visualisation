import React, { useState, useRef, useEffect } from 'react';
import styles from './ProjectTitle.module.css';

const ProjectTitle = ({ initialTitle, onTitleChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef(null);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    setIsEditing(false);
    if (title.length === 0) {
      setTitle(initialTitle);
    } else {
      onTitleChange?.(title);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setTitle(initialTitle);
      setIsEditing(false);
    }
  };

  const containerClasses = `${styles.container} ${isEditing ? styles.editing : ''}`;

  return (
    <div
      className={containerClasses}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          className={styles.input}
          maxLength={30}
        />
      ) : (
        <span className={styles.span}>{title}</span>
      )}
    </div>
  );
};

export default ProjectTitle;