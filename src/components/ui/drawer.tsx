"use client";

import * as React from "react";
import {
  Drawer as AlignDrawer,
  DrawerRoot as AlignDrawerRoot,
  DrawerTrigger,
  DrawerPortal,
  DrawerClose,
  DrawerOverlay,
  DrawerContent as AlignDrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerTitle,
  DrawerDescription,
} from "@/components/align-ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Application Drawer Component (components/ui/drawer.tsx)
// Option B: Clean High-Level Usage with closeable parameter, secondary close
// button in the footer, and renderActions prop for action buttons.
// ─────────────────────────────────────────────────────────────────────────────

interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  closeable?: boolean;
  closeText?: string;
  renderActions?: React.ReactNode | (() => React.ReactNode);
  actions?: React.ReactNode | (() => React.ReactNode);
}

const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  (
    {
      className,
      closeable = true,
      closeText = "Close",
      renderActions,
      actions,
      children,
      ...props
    },
    ref
  ) => {
    const actionsToRender = renderActions ?? actions;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-end gap-3 px-6 py-4 border-t border-stroke-soft-200 mt-auto shrink-0",
          className
        )}
        {...props}
      >
        {closeable && (
          <DrawerClose asChild>
            <Button variant="secondary" type="button">
              {closeText}
            </Button>
          </DrawerClose>
        )}
        {typeof actionsToRender === "function"
          ? actionsToRender()
          : actionsToRender}
        {children}
      </div>
    );
  }
);
DrawerFooter.displayName = "DrawerFooter";

interface DrawerContentProps extends React.ComponentPropsWithoutRef<
  typeof AlignDrawerContent
> {
  closeable?: boolean;
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof AlignDrawerContent>,
  DrawerContentProps
>(({ closeable = true, showCloseButton, ...props }, ref) => (
  <AlignDrawerContent
    ref={ref}
    showCloseButton={showCloseButton ?? closeable}
    {...props}
  />
));
DrawerContent.displayName = "DrawerContent";

interface DrawerProps extends React.ComponentPropsWithoutRef<
  typeof AlignDrawer
> {
  closeable?: boolean;
  renderActions?: React.ReactNode | (() => React.ReactNode);
  actions?: React.ReactNode | (() => React.ReactNode);
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  closeText?: string;
  side?: "right" | "left" | "top" | "bottom";
  className?: string;
  contentClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  headerClassName?: string;
  footer?: React.ReactNode;
  showFooter?: boolean;
  onInteractOutside?: React.ComponentPropsWithoutRef<
    typeof AlignDrawerContent
  >["onInteractOutside"];
  onEscapeKeyDown?: React.ComponentPropsWithoutRef<
    typeof AlignDrawerContent
  >["onEscapeKeyDown"];
}

const DrawerComponent = ({
  closeable = true,
  renderActions,
  actions,
  trigger,
  title,
  description,
  closeText = "Close",
  side = "right",
  className,
  contentClassName,
  bodyClassName,
  footerClassName,
  headerClassName,
  footer,
  showFooter = true,
  onInteractOutside,
  onEscapeKeyDown,
  children,
  ...rootProps
}: DrawerProps) => {
  return (
    <AlignDrawer {...rootProps}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent
        side={side}
        closeable={closeable}
        className={cn(contentClassName, className)}
        onInteractOutside={onInteractOutside}
        onEscapeKeyDown={onEscapeKeyDown}
      >
        {(title || description) && (
          <DrawerHeader className={headerClassName}>
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
        )}
        <DrawerBody className={bodyClassName}>{children}</DrawerBody>
        {showFooter &&
          (footer !== undefined ? (
            footer
          ) : (
            <DrawerFooter
              closeable={closeable}
              renderActions={renderActions ?? actions}
              closeText={closeText}
              className={footerClassName}
            />
          ))}
      </DrawerContent>
    </AlignDrawer>
  );
};

const Drawer = Object.assign(DrawerComponent, {
  Root: AlignDrawerRoot,
  Trigger: DrawerTrigger,
  Portal: DrawerPortal,
  Close: DrawerClose,
  Overlay: DrawerOverlay,
  Content: DrawerContent,
  Header: DrawerHeader,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Title: DrawerTitle,
  Description: DrawerDescription,
});

const DrawerRoot = AlignDrawerRoot;

export {
  Drawer,
  DrawerRoot,
  DrawerTrigger,
  DrawerPortal,
  DrawerClose,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
export type { DrawerContentProps, DrawerFooterProps, DrawerProps };
