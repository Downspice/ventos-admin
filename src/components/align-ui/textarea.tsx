import * as React from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-[10px] bg-bg-white-0 px-3 py-2',
        'text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400',
        'ring-1 ring-inset ring-stroke-soft-200 shadow-regular-xs',
        'transition-all duration-200 outline-none resize-none',
        'hover:ring-stroke-sub-300',
        'focus:ring-2 focus:ring-stroke-strong-950',
        'disabled:pointer-events-none disabled:opacity-40',
        'aria-invalid:ring-error-base aria-invalid:focus:ring-error-base',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea };
