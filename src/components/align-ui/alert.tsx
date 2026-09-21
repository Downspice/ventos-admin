import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const alertVariants = tv({
  base: [
    'relative flex w-full gap-3 rounded-[12px] p-4 ring-1 ring-inset',
    '[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:mt-0.5',
  ],
  variants: {
    variant: {
      default:     'bg-bg-weak-50 ring-stroke-soft-200 text-text-sub-600 [&>svg]:text-text-soft-400',
      info:        'bg-information-lighter ring-information-light text-information-dark [&>svg]:text-information-base',
      success:     'bg-success-lighter ring-success-light text-success-dark [&>svg]:text-success-base',
      warning:     'bg-away-lighter ring-away-light text-away-dark [&>svg]:text-away-base',
      destructive: 'bg-error-lighter ring-error-light text-error-dark [&>svg]:text-error-base',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  ),
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn('text-label-sm mb-0.5', className)} {...props} />
  ),
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-paragraph-sm opacity-90', className)} {...props} />
  ),
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
