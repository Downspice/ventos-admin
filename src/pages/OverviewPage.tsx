import type { ComponentType } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { DollarSign, Package, ShieldAlert, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { DashboardBodySkeleton } from "@/components/loading-skeletons";
import { PageHeader } from "../components/PageHeader";
import { useListPagination } from "@/hooks/useListPagination";
import { ListPagination } from "@/components/ListPagination";

const OVERVIEW = gql`
  query AdminOverview($trendDays: Int) {
    homeDashboard(trendDays: $trendDays) {
      kpis {
        salesToday
        salesLast7Days
        salesLast30Days
        netRevenue30Days
        customerCount
        lowStockCount
        productCount
      }
      salesTrend {
        label
        value
      }
    }
    activityFlags {
      id
      message
      severity
    }
  }
`;

const salesChartConfig = {
  value: { label: "Revenue", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

function money(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function shortDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Stat({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const { data, loading, error } = useQuery<{
    homeDashboard?: {
      kpis: {
        salesToday: number;
        salesLast7Days: number;
        salesLast30Days: number;
        netRevenue30Days: number;
        customerCount: number;
        lowStockCount: number;
        productCount: number;
      };
      salesTrend: { label: string; value: number }[];
    };
    activityFlags?: { id: string; message: string; severity: string }[];
  }>(OVERVIEW, { variables: { trendDays: 14 } });

  const kpis = data?.homeDashboard?.kpis;
  const flagsPagination = useListPagination(data?.activityFlags ?? []);

  if (loading && !data?.homeDashboard) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Business-wide KPIs and compliance signals." />
        {error ? <p className="text-sm text-red-500">{error.message}</p> : null}
        <DashboardBodySkeleton kpiCount={6} chartCount={1} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Business-wide KPIs and compliance signals." />
      {error ? <p className="text-sm text-red-500">{error.message}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Stat title="Sales today" value={money(kpis?.salesToday ?? 0)} icon={DollarSign} />
        <Stat title="7-day sales" value={money(kpis?.salesLast7Days ?? 0)} icon={TrendingUp} />
        <Stat title="30-day net" value={money(kpis?.netRevenue30Days ?? 0)} icon={DollarSign} />
        <Stat title="Customers" value={String(kpis?.customerCount ?? 0)} icon={Users} />
        <Stat title="Products" value={String(kpis?.productCount ?? 0)} icon={Package} />
        <Stat title="Low stock" value={String(kpis?.lowStockCount ?? 0)} icon={ShieldAlert} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={salesChartConfig} className="h-[260px] w-full">
              <AreaChart data={data?.homeDashboard?.salesTrend ?? []}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickFormatter={shortDate} tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={48} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity flags</CardTitle>
            <CardDescription>Recent compliance alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(data?.activityFlags ?? []).length === 0 ? (
              <p className="text-muted-foreground">No open flags.</p>
            ) : (
              flagsPagination.pageItems.map((f) => (
                <div key={f.id} className="rounded-md border px-3 py-2">
                  <span className="font-medium text-muted-foreground">[{f.severity}]</span> {f.message}
                </div>
              ))
            )}
            {(data?.activityFlags ?? []).length > 0 ? (
              <ListPagination {...flagsPagination.paginationProps} className="pt-2" />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
