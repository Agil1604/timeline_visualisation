import styles from './ToolbarControls.module.css';

const ButtonControl = ({ onClick, children, variant = 'default' }) => {
  return (
    <button 
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default ButtonControl;