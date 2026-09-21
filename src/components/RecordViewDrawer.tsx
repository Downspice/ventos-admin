import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export type RecordViewField = { label: string; value: string };

type RecordViewDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: RecordViewField[];
};

export function RecordViewDrawer({
  open,
  onOpenChange,
  title,
  description,
  fields,
}: RecordViewDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {open ? (
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader className="border-b pb-4">
            <SheetTitle>{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
          <dl className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 text-sm">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-muted-foreground">{f.label}</dt>
                <dd className="mt-0.5 font-medium whitespace-pre-wrap break-words">{f.value || "—"}</dd>
              </div>
            ))}
          </dl>
          <SheetFooter className="border-t">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
