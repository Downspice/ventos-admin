'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const checkboxVariants = tv({
  base: [
    'peer flex shrink-0 items-center justify-center rounded-[5px]',
    'ring-1 ring-inset ring-stroke-soft-200 bg-bg-white-0',
    'transition-all duration-150 outline-none',
    'hover:ring-stroke-sub-300',
    'focus-visible:ring-2 focus-visible:ring-stroke-strong-950',
    'data-[state=checked]:bg-primary-base data-[state=checked]:ring-primary-base data-[state=checked]:hover:bg-primary-dark data-[state=checked]:hover:ring-primary-dark',
    'data-[state=indeterminate]:bg-primary-base data-[state=indeterminate]:ring-primary-base',
    'disabled:pointer-events-none disabled:opacity-40',
  ],
  variants: {
    size: {
      sm: 'size-4',
      md: 'size-[18px]',
      lg: 'size-5',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ size }), className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <svg className="size-3 text-static-white" viewBox="0 0 12 12" fill="none">
        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = 'Checkbox';

export { Checkbox };
