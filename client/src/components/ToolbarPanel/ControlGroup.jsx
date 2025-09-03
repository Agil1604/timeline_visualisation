import styles from './ToolbarControls.module.css';

const ControlGroup = ({ label, children, className = '' }) => {
  return (
    <div className={`${styles.controlGroup} ${className}`}>
      {label && <label>{label}</label>}
      {children}
    </div>
  );
};

export default ControlGroup;