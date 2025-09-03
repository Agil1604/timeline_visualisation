import styles from './ToolbarPanel.module.css';

const ToolbarPanel = ({ 
  title,
  position = "left",
  children 
}) => {
  return (
    <div 
      className={styles.toolbarPanel}
      style={{ 
        [position]: 0,
      }}
    >
      <h3>{title}</h3>
      <div className={styles.panelContent}>
        {children}
      </div>
    </div>
  );
};

export default ToolbarPanel;