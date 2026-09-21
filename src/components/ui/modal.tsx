"use client";

import * as React from "react";
import {
  Modal as AlignModal,
  ModalRoot as AlignModalRoot,
  ModalTrigger,
  ModalPortal,
  ModalClose,
  ModalOverlay,
  ModalContent as AlignModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter as AlignModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/align-ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Application Modal Component (components/ui/modal.tsx)
// Clean High-Level Usage with closeable parameter, secondary close button in the
// footer, size options, and renderActions prop for action buttons.
// ─────────────────────────────────────────────────────────────────────────────

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  closeable?: boolean;
  closeText?: string;
  renderActions?: React.ReactNode | (() => React.ReactNode);
  actions?: React.ReactNode | (() => React.ReactNode);
}

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
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
      <AlignModalFooter
        ref={ref}
        className={cn(className)}
        {...props}
      >
        {closeable && (
          <ModalClose asChild>
            <Button variant="secondary" type="button">
              {closeText}
            </Button>
          </ModalClose>
        )}
        {typeof actionsToRender === "function"
          ? actionsToRender()
          : actionsToRender}
        {children}
      </AlignModalFooter>
    );
  }
);
ModalFooter.displayName = "ModalFooter";

interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof AlignModalContent> {
  closeable?: boolean;
}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof AlignModalContent>,
  ModalContentProps
>(({ closeable = true, showCloseButton, ...props }, ref) => (
  <AlignModalContent
    ref={ref}
    showCloseButton={showCloseButton ?? closeable}
    {...props}
  />
));
ModalContent.displayName = "ModalContent";

interface ModalProps
  extends React.ComponentPropsWithoutRef<typeof AlignModal> {
  closeable?: boolean;
  renderActions?: React.ReactNode | (() => React.ReactNode);
  actions?: React.ReactNode | (() => React.ReactNode);
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  closeText?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  contentClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  headerClassName?: string;
  footer?: React.ReactNode;
  showFooter?: boolean;
  onInteractOutside?: React.ComponentPropsWithoutRef<
    typeof AlignModalContent
  >["onInteractOutside"];
  onEscapeKeyDown?: React.ComponentPropsWithoutRef<
    typeof AlignModalContent
  >["onEscapeKeyDown"];
}

const ModalComponent = ({
  closeable = true,
  renderActions,
  actions,
  trigger,
  title,
  description,
  closeText = "Close",
  size = "md",
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
}: ModalProps) => {
  return (
    <AlignModal {...rootProps}>
      {trigger && <ModalTrigger asChild>{trigger}</ModalTrigger>}
      <ModalContent
        size={size}
        closeable={closeable}
        className={cn(contentClassName, className)}
        onInteractOutside={onInteractOutside}
        onEscapeKeyDown={onEscapeKeyDown}
      >
        {(title || description) && (
          <ModalHeader className={headerClassName}>
            {title && <ModalTitle>{title}</ModalTitle>}
            {description && (
              <ModalDescription>{description}</ModalDescription>
            )}
          </ModalHeader>
        )}
        <ModalBody className={bodyClassName}>{children}</ModalBody>
        {showFooter &&
          (footer !== undefined ? (
            footer
          ) : (
            <ModalFooter
              closeable={closeable}
              renderActions={renderActions ?? actions}
              closeText={closeText}
              className={footerClassName}
            />
          ))}
      </ModalContent>
    </AlignModal>
  );
};

const Modal = Object.assign(ModalComponent, {
  Root: AlignModalRoot,
  Trigger: ModalTrigger,
  Portal: ModalPortal,
  Close: ModalClose,
  Overlay: ModalOverlay,
  Content: ModalContent,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Title: ModalTitle,
  Description: ModalDescription,
});

const ModalRoot = AlignModalRoot;

export {
  Modal,
  ModalRoot,
  ModalTrigger,
  ModalPortal,
  ModalClose,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
};
export type { ModalContentProps, ModalFooterProps, ModalProps };
