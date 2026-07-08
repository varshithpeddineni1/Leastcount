import type { HTMLAttributes } from 'react';

export function Panel({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const classes = ['panel', className].filter(Boolean).join(' ');
  return <div className={classes} {...rest} />;
}
