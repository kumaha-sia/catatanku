import React from 'react';
import { Delete } from 'lucide-react';

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({ value, onChange }) => {
  const handlePress = (key: string) => {
    if (key === 'delete') {
      onChange(value.slice(0, -1));
    } else if (key === '000') {
      if (value === '' || value === '0') onChange('0'); // Prevent multiple leading zeros
      else onChange(value + '000');
    } else {
      // Prevent leading zeros unless it's a decimal
      if (value === '0' && key !== ',00') {
        onChange(key);
      } else {
        onChange(value + key);
      }
    }
  };

  const keys = [
    ['1', '2', '3', 'delete'],
    ['4', '5', '6', '000'],
    ['7', '8', '9', ',00'],
    ['', '0', '', ''] // You can add logic for empty spaces if needed
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mt-4">
      {/* Row 1 */}
      <KeyButton label="1" onPress={() => handlePress('1')} />
      <KeyButton label="2" onPress={() => handlePress('2')} />
      <KeyButton label="3" onPress={() => handlePress('3')} />
      <KeyButton icon={<Delete size={24} />} onPress={() => handlePress('delete')} className="bg-error text-text-primary" />
      
      {/* Row 2 */}
      <KeyButton label="4" onPress={() => handlePress('4')} />
      <KeyButton label="5" onPress={() => handlePress('5')} />
      <KeyButton label="6" onPress={() => handlePress('6')} />
      <KeyButton label="000" onPress={() => handlePress('000')} className="bg-primary text-surface" />
      
      {/* Row 3 */}
      <KeyButton label="7" onPress={() => handlePress('7')} />
      <KeyButton label="8" onPress={() => handlePress('8')} />
      <KeyButton label="9" onPress={() => handlePress('9')} />
      <KeyButton label=",00" onPress={() => handlePress(',00')} className="bg-primary text-surface" />
      
      {/* Row 4 (centered 0) */}
      <div className="col-span-1" />
      <KeyButton label="0" onPress={() => handlePress('0')} />
      <div className="col-span-2" />
    </div>
  );
};

const KeyButton = ({ 
  label, 
  icon, 
  onPress,
  className = ''
}: { 
  label?: string, 
  icon?: React.ReactNode, 
  onPress: () => void,
  className?: string
}) => (
  <button 
    onClick={(e) => { e.preventDefault(); onPress(); }}
    className={`h-14 sm:h-12 rounded-none border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] flex items-center justify-center text-xl font-black uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all ${className || 'bg-surface text-text-primary'}`}
  >
    {icon || label}
  </button>
);
