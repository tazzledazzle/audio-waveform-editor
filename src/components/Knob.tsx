import React, { useState, useEffect, useRef } from 'react';

interface KnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
  unit?: string;
  valueDisplay?: (value: number) => number | string;
}

const Knob: React.FC<KnobProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
  label,
  unit = '',
  valueDisplay
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  
  // Calculate rotation angle based on value
  const getRotation = () => {
    const range = max - min;
    const percentage = (value - min) / range;
    return percentage * 270 - 135; // -135 to 135 degrees
  };
  
  const rotation = getRotation();
  
  // Handle mouse events for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || disabled) return;
      
      const deltaY = startY - e.clientY;
      const sensitivity = 0.5; // Adjust for sensitivity
      const deltaValue = deltaY * sensitivity * ((max - min) / 100);
      
      // Calculate new value with step
      let newValue = Math.min(max, Math.max(min, startValue + deltaValue));
      
      // Round to nearest step
      if (step !== 0) {
        newValue = Math.round(newValue / step) * step;
      }
      
      onChange(newValue);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startValue, min, max, step, onChange, disabled]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  };
  
  // Format the display value
  const displayValue = valueDisplay ? valueDisplay(value) : value.toFixed(step < 1 ? 1 : 0);
  
  return (
    <div className="flex flex-col items-center">
      {label && <span className="text-xs text-dark-300 mb-1">{label}</span>}
      
      <div 
        ref={knobRef}
        className={`knob ${disabled ? 'opacity-50' : 'hover:border-primary-500'}`}
        onMouseDown={handleMouseDown}
        style={{ cursor: disabled ? 'not-allowed' : 'ns-resize' }}
      >
        <div 
          className="knob-indicator" 
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
        <span className="text-xs font-medium">{displayValue}{unit}</span>
      </div>
    </div>
  );
};

export default Knob;