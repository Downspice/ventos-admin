import * as React from 'react';
import { tv } from '@/utils/tv';
import { cn } from '@/utils/cn';

const inputVariants = tv({
  base: [
    'flex w-full rounded-[10px] bg-bg-white-0 px-3',
    'text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400',
    'ring-1 ring-inset ring-stroke-soft-200',
    'transition-all duration-200 outline-none',
    'hover:ring-stroke-sub-300',
    'focus:ring-2 focus:ring-stroke-strong-950',
    'disabled:pointer-events-none disabled:opacity-40',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'aria-invalid:ring-error-base aria-invalid:focus:ring-error-base',
    'shadow-regular-xs',
  ],
  variants: {
    size: {
      sm: 'h-8 text-paragraph-xs',
      md: 'h-9',
      lg: 'h-10',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg' | number;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...props }, ref) => {
    const variantSize = typeof size === 'string' ? size : undefined;
    const htmlSize = typeof size === 'number' ? size : undefined;
    return (
      <input
        type={type}
        ref={ref}
        size={htmlSize}
        className={cn(inputVariants({ size: variantSize }), className)}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
