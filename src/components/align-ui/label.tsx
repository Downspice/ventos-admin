import * as React from 'react';
import { cn } from '@/utils/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, optional, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'flex items-center gap-1 text-label-sm text-text-sub-600',
        'peer-disabled:opacity-70',
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="text-error-base" aria-hidden="true">*</span>}
      {optional && <span className="text-text-soft-400 text-label-xs font-normal">(optional)</span>}
    </label>
  ),
);
Label.displayName = 'Label';

export { Label };
