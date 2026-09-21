import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const badgeVariants = tv({
  base: [
    'inline-flex items-center gap-1 whitespace-nowrap rounded-full',
    'font-medium leading-none transition-colors',
  ],
  variants: {
    variant: {
      gray:             'bg-bg-weak-50 text-text-sub-600',
      'gray-stroke':    'bg-bg-white-0 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200',
      green:            'bg-success-lighter text-success-dark',
      'green-stroke':   'bg-success-lighter text-success-dark ring-1 ring-inset ring-green-200',
      red:              'bg-error-lighter text-error-dark',
      'red-stroke':     'bg-error-lighter text-error-dark ring-1 ring-inset ring-red-200',
      blue:             'bg-information-lighter text-information-dark',
      'blue-stroke':    'bg-information-lighter text-information-dark ring-1 ring-inset ring-blue-200',
      yellow:           'bg-away-lighter text-away-dark',
      'yellow-stroke':  'bg-away-lighter text-away-dark ring-1 ring-inset ring-yellow-200',
      orange:           'bg-primary-lighter text-primary-dark',
      'orange-stroke':  'bg-primary-lighter text-primary-dark ring-1 ring-inset ring-orange-200',
      purple:           'bg-feature-lighter text-feature-dark',
      'purple-stroke':  'bg-feature-lighter text-feature-dark ring-1 ring-inset ring-purple-200',
      // Shadcn compat shims
      default:          'bg-gray-900 text-gray-0',
      secondary:        'bg-bg-weak-50 text-text-sub-600',
      destructive:      'bg-error-lighter text-error-dark',
      outline:          'bg-bg-white-0 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200',
    },
    size: {
      sm: 'px-1.5 py-0.5 text-subheading-2xs',
      md: 'px-2 py-1 text-subheading-xs',
      lg: 'px-2.5 py-1 text-label-xs',
    },
  },
  defaultVariants: {
    variant: 'gray',
    size: 'md',
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
