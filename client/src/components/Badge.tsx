import type { HTMLAttributes } from 'react';

type BadgeVariant = 'primary' | 'accent' | 'danger' | 'success' | 'warn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'primary', className, ...rest }: BadgeProps) {
  const classes = ['badge', `badge--${variant}`, className].filter(Boolean).join(' ');
  return <span className={classes} {...rest} />;
}
