import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import {
  BarChart3,
  Boxes,
  CalendarRange,
  ClipboardList,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiGridSkeleton, TableRowsSkeleton } from "@/components/loading-skeletons";
import { PageHeader } from "../components/PageHeader";
import { useBusinessCurrency } from "@/hooks/useBusinessCurrency";
import { cn } from "@/utils/cn";
import { useListPagination } from "@/hooks/useListPagination";
import { ListPagination } from "@/components/ListPagination";

const LOW_STOCK = 5;

const REPORTS = gql`
  query Reports($days: Int) {
    salesReport(days: $days) {
      period
      total
      count
    }
    inventoryReport {
      productId
      productName
      quantity
    }
    employeeReport(days: $days) {
      id
      employeeId
      periodStart
      periodEnd
      salesTotal
      appointmentCount
    }
    financialReport(days: $days) {
      period
      total
      count
    }
    employees {
      id
      firstName
      lastName
    }
  }
`;

function formatPeriod(isoDate: string) {
  return new Date(isoDate + "T12:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatPeriodRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const e = new Date(end).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${s} – ${e}`;
}

function ReportTableShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs overflow-hidden">
      <div className="border-b border-stroke-soft-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-text-strong-950">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-text-sub-600">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function EmptyReportState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 py-16 text-center">
      <Icon className="size-9 text-text-soft-400 stroke-1" />
      <p className="text-sm font-semibold text-text-strong-950">{title}</p>
      <p className="max-w-sm text-xs text-text-sub-600">{description}</p>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-text-sub-600">{label}</CardTitle>
        <Icon className="size-4 text-text-soft-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums text-text-strong-950">{value}</div>
        {hint ? <p className="mt-1 text-xs text-text-sub-600">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const { formatMoney } = useBusinessCurrency();
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState("sales");

  const { data, loading, error } = useQuery<{
    salesReport?: { period: string; total: number; count: number }[];
    inventoryReport?: { productId: string; productName: string; quantity: number }[];
    employeeReport?: {
      id: string;
      employeeId: string;
      periodStart: string;
      periodEnd: string;
      salesTotal: number;
      appointmentCount: number;
    }[];
    financialReport?: { period: string; total: number; count: number };
    employees?: { id: string; firstName: string; lastName: string }[];
  }>(REPORTS, { variables: { days } });

  const employeeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of data?.employees ?? []) {
      map.set(e.id, `${e.firstName} ${e.lastName}`.trim());
    }
    return map;
  }, [data?.employees]);

  const salesRows = data?.salesReport ?? [];
  const salesTotals = useMemo(() => {
    const revenue = salesRows.reduce((s, r) => s + r.total, 0);
    const orders = salesRows.reduce((s, r) => s + r.count, 0);
    return { revenue, orders, avg: orders > 0 ? revenue / orders : 0 };
  }, [salesRows]);

  const inventoryRows = useMemo(() => {
    const byProduct = new Map<
      string,
      { productId: string; productName: string; quantity: number }
    >();
    for (const row of data?.inventoryReport ?? []) {
      const existing = byProduct.get(row.productId);
      if (existing) existing.quantity += row.quantity;
      else byProduct.set(row.productId, { ...row });
    }
    return [...byProduct.values()].sort((a, b) => a.quantity - b.quantity);
  }, [data?.inventoryReport]);

  const inventoryStats = useMemo(() => {
    const low = inventoryRows.filter((r) => r.quantity <= LOW_STOCK).length;
    return { skus: inventoryRows.length, low };
  }, [inventoryRows]);

  const employeeRows = [...(data?.employeeReport ?? [])].sort(
    (a, b) => b.salesTotal - a.salesTotal,
  );

  const showPeriodFilter = tab !== "inventory";

  const salesPagination = useListPagination(salesRows);
  const inventoryPagination = useListPagination(inventoryRows);
  const employeePagination = useListPagination(employeeRows);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Sales, inventory, team performance, and financial summaries."
      />

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </p>
      ) : null}

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="sales" className="gap-1.5">
              <BarChart3 className="size-3.5" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-1.5">
              <Boxes className="size-3.5" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="employee" className="gap-1.5">
              <Users className="size-3.5" />
              Employee
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-1.5">
              <Wallet className="size-3.5" />
              Financial
            </TabsTrigger>
          </TabsList>

          {showPeriodFilter ? (
            <div className="flex items-center gap-2 text-sm">
              <CalendarRange className="size-4 text-text-sub-600" />
              <span className="text-text-sub-600">Period</span>
              <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        <TabsContent value="sales" className="mt-6 space-y-4">
          {loading ? (
            <KpiGridSkeleton count={3} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <SummaryStat
                label="Total revenue"
                value={formatMoney(salesTotals.revenue)}
                hint={`${days} day window`}
                icon={TrendingUp}
              />
              <SummaryStat
                label="Orders"
                value={salesTotals.orders.toLocaleString()}
                icon={ClipboardList}
              />
              <SummaryStat
                label="Avg. order value"
                value={formatMoney(salesTotals.avg)}
                icon={BarChart3}
              />
            </div>
          )}

          <ReportTableShell
            title="Daily breakdown"
            description="Finalized sales grouped by date."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg. order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRowsSkeleton rows={7} cols={4} />
                ) : salesRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <EmptyReportState
                        icon={BarChart3}
                        title="No sales in this period"
                        description="Try a longer date range or confirm finalized sales exist."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  salesPagination.pageItems.map((r) => (
                    <TableRow key={r.period}>
                      <TableCell className="font-medium">{formatPeriod(r.period)}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(r.total)}</TableCell>
                      <TableCell className="text-right tabular-nums text-text-sub-600">
                        {formatMoney(r.count > 0 ? r.total / r.count : 0)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {!loading && salesRows.length > 0 ? (
              <ListPagination {...salesPagination.paginationProps} className="border-t px-4 py-3" />
            ) : null}
          </ReportTableShell>
        </TabsContent>

        <TabsContent value="inventory" className="mt-6 space-y-4">
          {loading ? (
            <KpiGridSkeleton count={2} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <SummaryStat
                label="Products in stock"
                value={inventoryStats.skus.toLocaleString()}
                hint="Totals across all locations"
                icon={Boxes}
              />
              <SummaryStat
                label="Low stock items"
                value={inventoryStats.low.toLocaleString()}
                hint={`Quantity at or below ${LOW_STOCK}`}
                icon={TrendingUp}
              />
            </div>
          )}

          <ReportTableShell
            title="Stock levels"
            description="Sorted by quantity ascending — low stock appears first."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRowsSkeleton rows={8} cols={3} />
                ) : inventoryRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <EmptyReportState
                        icon={Boxes}
                        title="No inventory records"
                        description="Stock levels appear when products track inventory and locations are set up."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  inventoryPagination.pageItems.map((r) => {
                    const low = r.quantity <= LOW_STOCK;
                    return (
                      <TableRow key={r.productId}>
                        <TableCell className="font-medium">{r.productName}</TableCell>
                        <TableCell
                          className={cn(
                            "text-right tabular-nums",
                            low && "font-medium text-amber-700 dark:text-amber-400",
                          )}
                        >
                          {r.quantity}
                        </TableCell>
                        <TableCell>
                          {low ? (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                              Low stock
                            </Badge>
                          ) : (
                            <Badge variant="outline">OK</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            {!loading && inventoryRows.length > 0 ? (
              <ListPagination {...inventoryPagination.paginationProps} className="border-t px-4 py-3" />
            ) : null}
          </ReportTableShell>
        </TabsContent>

        <TabsContent value="employee" className="mt-6 space-y-4">
          <ReportTableShell
            title="Performance metrics"
            description={`Computed metrics with period start in the last ${days} days.`}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Sales total</TableHead>
                  <TableHead className="text-right">Appointments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRowsSkeleton rows={6} cols={4} />
                ) : employeeRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <EmptyReportState
                        icon={Users}
                        title="No performance data"
                        description="Run compute performance metrics for employees or widen the date range."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  employeePagination.pageItems.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {employeeNameById.get(r.employeeId) ?? (
                          <span className="font-mono text-xs text-text-sub-600">
                            …{r.employeeId.slice(-8)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-text-sub-600">
                        {formatPeriodRange(r.periodStart, r.periodEnd)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(r.salesTotal)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{r.appointmentCount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {!loading && employeeRows.length > 0 ? (
              <ListPagination {...employeePagination.paginationProps} className="border-t px-4 py-3" />
            ) : null}
          </ReportTableShell>
        </TabsContent>

        <TabsContent value="financial" className="mt-6 space-y-4">
          {loading ? (
            <KpiGridSkeleton count={2} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <SummaryStat
                label="Net (sales − expenses)"
                value={formatMoney(data?.financialReport?.total ?? 0)}
                hint={data?.financialReport?.period ?? `${days}d`}
                icon={Wallet}
              />
              <SummaryStat
                label="Finalized sales"
                value={(data?.financialReport?.count ?? 0).toLocaleString()}
                hint="Order count in period"
                icon={ClipboardList}
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">About this summary</CardTitle>
              <CardDescription>
                Net figure is total finalized sales minus recorded expenses for the selected period.
                Use the Sales tab for a daily breakdown and Finance for expense detail.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-text-sub-600">
              {loading ? (
                <p>Loading…</p>
              ) : (
                <p>
                  Period: <span className="font-medium text-text-strong-950">last {days} days</span>
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
