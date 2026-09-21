'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const switchVariants = tv({
  slots: {
    root: [
      'relative inline-flex shrink-0 cursor-pointer items-center rounded-full',
      'bg-gray-200 transition-all duration-200 outline-none',
      'focus-visible:ring-2 focus-visible:ring-stroke-strong-950 focus-visible:ring-offset-2',
      'data-[state=checked]:bg-text-strong-950',
      'disabled:pointer-events-none disabled:opacity-40',
    ],
    thumb: [
      'pointer-events-none block rounded-full bg-white',
      'shadow-switch-thumb transition-transform duration-200',
    ],
  },
  variants: {
    size: {
      sm: {
        root: 'h-4 w-7',
        thumb: 'size-3 translate-x-0.5 data-[state=checked]:translate-x-3.5',
      },
      md: {
        root: 'h-5 w-9',
        thumb: 'size-4 translate-x-0.5 data-[state=checked]:translate-x-[18px]',
      },
      lg: {
        root: 'h-6 w-11',
        thumb: 'size-5 translate-x-0.5 data-[state=checked]:translate-x-[22px]',
      },
    },
  },
  defaultVariants: { size: 'md' },
});

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size, ...props }, ref) => {
  const { root, thumb } = switchVariants({ size });
  return (
    <SwitchPrimitive.Root ref={ref} className={cn(root(), className)} {...props}>
      <SwitchPrimitive.Thumb className={thumb()} />
    </SwitchPrimitive.Root>
  );
});
Switch.displayName = 'Switch';

export { Switch };
