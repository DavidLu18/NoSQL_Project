'use client';

import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: BadgeProps) => {
  const baseStyles = 'inline-flex items-center font-bold border-2 border-black';

  const variants = {
    default: 'bg-neutral-200 text-neutral-900',
    primary: 'bg-secondary text-white',
    success: 'bg-accent-green text-white',
    warning: 'bg-accent-yellow text-neutral-900',
    danger: 'bg-red-500 text-white',
    info: 'bg-accent-blue text-white',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};

