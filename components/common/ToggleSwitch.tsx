'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  const toggleVariants = {
    checked: { backgroundColor: '#6B46C1', borderColor: '#6B46C1' }, // accent
    unchecked: { backgroundColor: '#111111', borderColor: '#2D2D2D' }, // dark, border
  };

  const circleVariants = {
    checked: { x: '100%', backgroundColor: '#FFFFFF' }, // white
    unchecked: { x: '0%', backgroundColor: '#71717A' }, // text-muted
  };

  return (
    <div className={cn('flex items-center', disabled && 'opacity-50 cursor-not-allowed')}>
      {label && (
        <label htmlFor={id} className="mr-3 text-sm font-medium text-white cursor-pointer">
          {label}
        </label>
      )}
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
        disabled={disabled}
      >
        <span className="sr-only">{label ? `Toggle ${label}` : 'Toggle switch'}</span>
        <motion.span
          variants={toggleVariants}
          initial={checked ? 'checked' : 'unchecked'}
          animate={checked ? 'checked' : 'unchecked'}
          transition={{ duration: 0.2 }}
          className={cn(
            'pointer-events-none absolute inset-0 rounded-full',
            'border-2'
          )}
        />
        <motion.span
          variants={circleVariants}
          initial={checked ? 'checked' : 'unchecked'}
          animate={checked ? 'checked' : 'unchecked'}
          transition={{ duration: 0.2 }}
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
};
