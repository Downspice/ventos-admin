import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/utils/cn";

export function TableRowsSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, row) => (
        <TableRow key={row}>
          {Array.from({ length: cols }).map((__, col) => (
            <TableCell key={col}>
              <Skeleton className={cn("h-4", col === cols - 1 ? "ml-auto w-16" : "w-full max-w-[14rem]")} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function KpiCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-4 shrink-0 rounded-md" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-40" />
      </CardContent>
    </Card>
  );
}

export function KpiGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartCardSkeleton({ className = "h-[280px]" }: { className?: string }) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-3 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className={cn("w-full rounded-lg", className)} />
      </CardContent>
    </Card>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-6 space-y-2">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
  );
}

export function MediaGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="overflow-hidden rounded-lg border bg-card">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="size-7 rounded-md" />
              <Skeleton className="size-7 rounded-md" />
              <Skeleton className="size-7 rounded-md" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function TableBlockSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2 rounded-lg border p-2">
      <Skeleton className="mx-2 h-9 w-full max-w-none" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full rounded-md" />
      ))}
    </div>
  );
}

export function CardListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-2 pt-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RequireAccessSkeleton() {
  return (
    <div className="space-y-4">
      <PageHeaderSkeleton />
      <KpiGridSkeleton count={4} />
      <TableBlockSkeleton rows={5} />
    </div>
  );
}

export function DashboardBodySkeleton({ kpiCount = 6, chartCount = 1 }: { kpiCount?: number; chartCount?: number }) {
  return (
    <>
      <KpiGridSkeleton count={kpiCount} />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: chartCount }).map((_, i) => (
          <ChartCardSkeleton key={i} className="h-[260px]" />
        ))}
        <ListSkeleton rows={4} />
      </div>
    </>
  );
}

export function HomeDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <DashboardBodySkeleton kpiCount={6} chartCount={1} />
    </div>
  );
}
