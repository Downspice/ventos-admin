import { cn } from "@/utils/cn";

type PaginatedSectionProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  fill?: boolean | "page";
};

export function PaginatedSection({
  children,
  footer,
  className,
  contentClassName,
  fill = true,
}: PaginatedSectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        fill === "page" && "min-h-[calc(100dvh-14rem)]",
        fill === true && "min-h-[min(50vh,28rem)]",
        className,
      )}
    >
      <div className={cn("min-h-0 flex-1", contentClassName)}>{children}</div>
      {footer}
    </div>
  );
}
