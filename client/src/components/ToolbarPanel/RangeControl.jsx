import styles from './ToolbarControls.module.css';

const RangeControl = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  unit = "",
  ...props 
}) => {
  return (
    <div className={styles.rangeControl}>
      <label>{label}:</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        {...props}
      />
      <span>{value}{unit}</span>
    </div>
  );
};

export default RangeControl;