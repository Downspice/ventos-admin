import * as React from 'react';
import { cn } from '@/utils/cn';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-bg-soft-200', className)} {...props} />
  );
}

export { Skeleton };
