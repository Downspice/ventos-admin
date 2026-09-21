import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableRowsSkeleton } from "@/components/loading-skeletons";
import { PageHeader } from "../components/PageHeader";
import { TableRowActions } from "../components/TableRowActions";
import { SaleViewDrawer } from "../components/sales/SaleViewDrawer";
import { useBusinessCurrency } from "@/hooks/useBusinessCurrency";
import { useListPagination } from "@/hooks/useListPagination";
import { ListPagination } from "@/components/ListPagination";
import { PaginatedSection } from "@/components/PaginatedSection";

const Q = gql`
  query AdminSalesPage($status: String) {
    sales(status: $status) {
      id
      status
      total
      customerId
      employeeId
      createdAt
    }
    customers {
      id
      firstName
      lastName
    }
    employees {
      id
      firstName
      lastName
    }
  }
`;

type StatusFilter = "ALL" | "FINALIZED" | "DRAFT" | "VOID";

function statusBadgeVariant(status: string): "secondary" | "outline" | "destructive" {
  if (status === "FINALIZED") return "secondary";
  if (status === "VOID") return "destructive";
  return "outline";
}

export default function SalesPage() {
  const { formatMoney } = useBusinessCurrency();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [viewSaleId, setViewSaleId] = useState<string | null>(null);

  const { data, loading } = useQuery<{
    sales?: {
      id: string;
      status: string;
      total: number;
      customerId?: string | null;
      employeeId?: string | null;
      createdAt: string;
    }[];
    customers?: { id: string; firstName: string; lastName: string }[];
    employees?: { id: string; firstName: string; lastName: string }[];
  }>(Q, {
    variables: { status: statusFilter === "ALL" ? null : statusFilter },
  });

  const customerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of data?.customers ?? []) {
      map.set(c.id, `${c.firstName} ${c.lastName}`.trim());
    }
    return map;
  }, [data?.customers]);

  const employeeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of data?.employees ?? []) {
      map.set(e.id, `${e.firstName} ${e.lastName}`.trim());
    }
    return map;
  }, [data?.employees]);

  const salesPagination = useListPagination(data?.sales ?? []);

  return (
    <div>
      <PageHeader
        title="Sales"
        description="All POS and checkout sales — view line items, totals, and who sold each order."
      />

      <SaleViewDrawer
        saleId={viewSaleId}
        customerNameById={customerNameById}
        open={viewSaleId != null}
        onOpenChange={(open) => {
          if (!open) setViewSaleId(null);
        }}
      />

      <div className="mb-4 grid max-w-xs gap-1">
        <Label>Status</Label>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter((v as StatusFilter) ?? "ALL")}
        >
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="FINALIZED">Finalized</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="VOID">Void</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PaginatedSection
        fill="page"
        footer={
          !loading && (data?.sales ?? []).length > 0 ? (
            <ListPagination {...salesPagination.paginationProps} />
          ) : null
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Sale</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Sold by</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[1%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRowsSkeleton rows={8} cols={7} />
            ) : (data?.sales ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  No sales match this filter.
                </TableCell>
              </TableRow>
            ) : (
              salesPagination.pageItems.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.id.slice(-8)}</TableCell>
                  <TableCell>
                    {s.customerId
                      ? customerNameById.get(s.customerId) ?? "—"
                      : "Walk-in"}
                  </TableCell>
                  <TableCell>
                    {s.employeeId ? employeeNameById.get(s.employeeId) ?? "—" : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(s.status)}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(s.total)}</TableCell>
                  <TableCell>
                    <TableRowActions onView={() => setViewSaleId(s.id)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </PaginatedSection>
    </div>
  );
}
