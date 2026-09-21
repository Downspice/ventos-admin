import { Input } from "@/components/ui/input";
import { useBusinessCurrency } from "@/hooks/useBusinessCurrency";
import { cn } from "@/utils/cn";

type MoneyInputProps = Omit<React.ComponentProps<typeof Input>, "type">;

export function MoneyInput({ className, ...props }: MoneyInputProps) {
  const { symbol } = useBusinessCurrency();
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        {symbol}
      </span>
      <Input type="number" step="0.01" min="0" className={cn("pl-10", className)} {...props} />
    </div>
  );
}
