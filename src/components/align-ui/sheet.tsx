"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { tv, type VariantProps } from "@/utils/tv";
import { RiCloseLine } from "@remixicon/react";
import { cn } from "@/utils/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Sheet — AlignUI Design System
// Standalone sliding panel component based on Radix Dialog primitive.
// ─────────────────────────────────────────────────────────────────────────────

const Sheet = SheetPrimitive.Root;
const SheetTrigger = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Trigger> & { render?: React.ReactElement<any> }
>(({ asChild, render, children, ...props }, ref) => {
  if (render) {
    return (
      <SheetPrimitive.Trigger ref={ref} asChild {...props}>
        {React.isValidElement(render)
          ? React.cloneElement(render, {
              ...(render.props as any),
              children: (render.props as any)?.children ?? children,
            })
          : render}
      </SheetPrimitive.Trigger>
    );
  }
  return (
    <SheetPrimitive.Trigger ref={ref} asChild={asChild} {...props}>
      {children}
    </SheetPrimitive.Trigger>
  );
});
SheetTrigger.displayName = SheetPrimitive.Trigger.displayName;
const SheetClose = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Close> & { render?: React.ReactElement<any> }
>(({ asChild, render, children, ...props }, ref) => {
  if (render) {
    return (
      <SheetPrimitive.Close ref={ref} asChild {...props}>
        {React.isValidElement(render)
          ? React.cloneElement(render, {
              ...(render.props as any),
              children: (render.props as any)?.children ?? children,
            })
          : render}
      </SheetPrimitive.Close>
    );
  }
  return (
    <SheetPrimitive.Close ref={ref} asChild={asChild} {...props}>
      {children}
    </SheetPrimitive.Close>
  );
});
SheetClose.displayName = SheetPrimitive.Close.displayName;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-overlay backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = tv({
  base: [
    "fixed z-50 flex flex-col bg-bg-white-0 shadow-custom-lg outline-none",
    "transition ease-in-out duration-300",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
  ],
  variants: {
    side: {
      top: "inset-x-0 top-0 rounded-b-2xl border-b border-stroke-soft-200 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
      bottom:
        "inset-x-0 bottom-0 rounded-t-2xl border-t border-stroke-soft-200 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
      left: "inset-y-0 left-0 h-full w-3/4 border-r border-stroke-soft-200 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
      right:
        "inset-y-0 right-0 h-full w-3/4 border-l border-stroke-soft-200 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
    },
  },
  defaultVariants: { side: "right" },
});

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  showCloseButton?: boolean;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    { side = "right", showCloseButton = true, className, children, ...props },
    ref
  ) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            className={cn(
              "absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-[8px]",
              "text-text-soft-400 transition-all duration-150 outline-none",
              "hover:bg-bg-weak-50 hover:text-text-sub-600",
              "focus-visible:ring-2 focus-visible:ring-stroke-strong-950",
              "disabled:pointer-events-none"
            )}
          >
            <RiCloseLine className="size-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-1.5 px-6 pt-6 pb-4 border-b border-stroke-soft-200 shrink-0",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-end gap-3 px-6 py-4 border-t border-stroke-soft-200 mt-auto shrink-0",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-label-lg font-semibold text-text-strong-950", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-paragraph-xs text-text-soft-400", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  Sheet as SheetRoot,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
export type { SheetContentProps };
