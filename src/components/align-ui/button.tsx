import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const buttonVariants = tv({
  base: [
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-[10px] font-medium outline-none transition-all duration-200',
    'focus-visible:ring-2 focus-visible:ring-primary-base/40 focus-visible:ring-offset-1',
    'disabled:pointer-events-none disabled:opacity-40',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  variants: {
    variant: {
      primary: [
        'bg-primary-base text-static-white',
        'hover:bg-primary-dark',
        'active:bg-primary-darker',
        'shadow-regular-xs',
      ],
      secondary: [
        'bg-bg-white-0 text-text-strong-950 ring-1 ring-inset ring-stroke-soft-200',
        'hover:bg-bg-weak-50 hover:ring-stroke-sub-300',
        'active:bg-gray-100',
        'shadow-regular-xs',
      ],
      ghost: [
        'bg-transparent text-text-sub-600',
        'hover:bg-gray-100 hover:text-text-strong-950',
        'active:bg-gray-200',
      ],
      destructive: [
        'bg-error-base text-static-white',
        'hover:bg-error-dark',
        'active:bg-error-base',
        'shadow-regular-xs',
      ],
      'destructive-ghost': [
        'bg-transparent text-error-base',
        'hover:bg-error-lighter hover:text-error-dark',
        'active:bg-error-lighter',
      ],
      link: [
        'bg-transparent text-text-sub-600 underline-offset-4',
        'hover:text-text-strong-950 hover:underline',
        'h-auto px-0 py-0 shadow-none',
      ],
      // Shadcn compat shim
      default: [
        'bg-primary-base text-static-white',
        'hover:bg-primary-dark',
        'active:bg-primary-darker',
        'shadow-regular-xs',
      ],
      outline: [
        'bg-bg-white-0 text-text-strong-950 ring-1 ring-inset ring-stroke-soft-200',
        'hover:bg-bg-weak-50 hover:ring-stroke-sub-300',
        'active:bg-gray-100',
        'shadow-regular-xs',
      ],
    },
    size: {
      xs: 'h-7 px-2.5 text-label-xs rounded-[8px]',
      sm: 'h-8 px-3 text-label-sm',
      md: 'h-9 px-4 text-label-sm',
      lg: 'h-10 px-5 text-label-md',
      xl: 'h-12 px-6 text-label-lg',
      icon: 'size-9',
      'icon-sm': 'size-8',
      'icon-xs': 'size-7',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  render?: React.ReactElement<any>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, render, children, ...props }, ref) => {
    if (render) {
      return React.cloneElement(
        render,
        {
          ref,
          className: cn(buttonVariants({ variant, size }), className, render.props?.className),
          ...props,
        },
        children ?? render.props?.children
      );
    }
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
