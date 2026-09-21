import { useId, type FormEventHandler, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function NewButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" onClick={onClick} className="gap-1.5">
      <Plus className="size-4" />
      {label}
    </Button>
  );
}

type FormDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  readOnly?: boolean;
  submitLabel?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
};

export function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  readOnly = false,
  submitLabel = "Save",
  onSubmit,
  children,
}: FormDrawerProps) {
  const formId = useId();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {open ? (
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader className="border-b pb-4">
            <SheetTitle>{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {readOnly ? (
              <fieldset disabled className="grid gap-4 border-0 p-0 m-0 min-w-0">
                {children}
              </fieldset>
            ) : (
              <form id={formId} onSubmit={onSubmit} className="grid gap-4">
                {children}
              </form>
            )}
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                {readOnly ? "Close" : "Cancel"}
              </Button>
            </SheetClose>
            {!readOnly ? (
              <Button type="submit" form={formId}>
                {submitLabel}
              </Button>
            ) : null}
          </SheetFooter>
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
