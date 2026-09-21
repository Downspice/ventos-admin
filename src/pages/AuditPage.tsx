import * as React from "react";
import { useQuery } from "@apollo/client/react";
import { Clock, Eye, RotateCw, Search, ShieldCheck } from "lucide-react";
import { AUDIT } from "../lib/apollo";
import { TableRowsSkeleton } from "@/components/loading-skeletons";
import { PageHeader } from "../components/PageHeader";
import { RecordViewDrawer } from "../components/RecordViewDrawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListPagination } from "@/hooks/useListPagination";
import { ListPagination } from "@/components/ListPagination";

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

function formatTimestamp(isoString: string) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function getActionBadgeVariant(action: string): "green" | "blue" | "red" | "yellow" | "gray" {
  const act = action.toLowerCase();
  if (act.includes("create") || act.includes("add") || act.includes("login") || act.includes("register")) {
    return "green";
  }
  if (act.includes("update") || act.includes("edit") || act.includes("modify") || act.includes("patch")) {
    return "blue";
  }
  if (act.includes("delete") || act.includes("remove") || act.includes("destroy") || act.includes("archive") || act.includes("void") || act.includes("refund")) {
    return "red";
  }
  if (act.includes("warn") || act.includes("flag") || act.includes("suspend") || act.includes("fraud")) {
    return "yellow";
  }
  return "gray";
}

export default function AuditPage() {
  const { data, loading, refetch } = useQuery<{
    auditLogs?: AuditLogItem[];
  }>(AUDIT, {
    fetchPolicy: "network-only",
  });

  const [search, setSearch] = React.useState("");
  const [entityFilter, setEntityFilter] = React.useState("ALL");
  const [viewAudit, setViewAudit] = React.useState<AuditLogItem | null>(null);
  const [isRefetching, setIsRefetching] = React.useState(false);

  const rawLogs = data?.auditLogs;
  const logs = React.useMemo(() => rawLogs ?? [], [rawLogs]);

  // Extract unique entity types for filtering
  const entityTypes = React.useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      if (log.entityType) set.add(log.entityType);
    });
    return Array.from(set).sort();
  }, [logs]);

  // Filter logs by search string and entity type
  const filteredLogs = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (entityFilter !== "ALL" && log.entityType !== entityFilter) {
        return false;
      }
      if (!q) return true;

      const matchesAction = log.action.toLowerCase().includes(q);
      const matchesEntityType = log.entityType.toLowerCase().includes(q);
      const matchesEntityId = (log.entityId ?? "").toLowerCase().includes(q);
      const matchesDate = log.createdAt.toLowerCase().includes(q);
      const matchesMeta = log.metadata
        ? JSON.stringify(log.metadata).toLowerCase().includes(q)
        : false;
      const matchesIp = (log.ipAddress ?? "").toLowerCase().includes(q);

      return (
        matchesAction ||
        matchesEntityType ||
        matchesEntityId ||
        matchesDate ||
        matchesMeta ||
        matchesIp
      );
    });
  }, [logs, search, entityFilter]);

  const auditPagination = useListPagination(filteredLogs);

  const handleRefresh = async () => {
    try {
      setIsRefetching(true);
      await refetch();
    } finally {
      setIsRefetching(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Audit log"
        description="Chronological record of system activities, entity modifications, and user actions."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || isRefetching}
            className="gap-2"
          >
            <RotateCw className={`size-4 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-soft-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search action, entity, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {entityTypes.length > 0 && (
          <div className="w-[180px]">
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All entity types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All entity types</SelectItem>
                {entityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {(search || entityFilter !== "ALL") && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setEntityFilter("ALL");
            }}
            className="text-text-sub-600 hover:text-text-strong-950"
          >
            Clear filters
          </Button>
        )}

        <div className="ml-auto text-xs text-text-sub-600">
          Showing {filteredLogs.length} of {logs.length} events
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Timestamp</TableHead>
              <TableHead className="w-[180px]">Action</TableHead>
              <TableHead className="w-[150px]">Entity Type</TableHead>
              <TableHead className="w-[180px]">Entity ID</TableHead>
              <TableHead className="w-[140px]">IP address</TableHead>
              <TableHead>Metadata Summary</TableHead>
              <TableHead className="w-[1%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRowsSkeleton rows={8} cols={7} />
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                    <ShieldCheck className="size-8 text-text-soft-400 stroke-1" />
                    <p className="text-paragraph-sm font-semibold text-text-strong-950">
                      No audit logs found
                    </p>
                    <p className="text-paragraph-xs text-text-sub-600">
                      {search || entityFilter !== "ALL"
                        ? "Try adjusting your search query or filter."
                        : "System events and activity will appear here once recorded."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              auditPagination.pageItems.map((log) => {
                const metaKeys = log.metadata ? Object.keys(log.metadata) : [];
                const metaSummary =
                  metaKeys.length > 0
                    ? `${metaKeys.slice(0, 3).join(", ")}${metaKeys.length > 3 ? ` +${metaKeys.length - 3} more` : ""}`
                    : "—";

                return (
                  <TableRow key={log.id} className="hover:bg-bg-weak-50/50">
                    <TableCell className="font-medium text-text-strong-950 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="size-3.5 text-text-soft-400 shrink-0" />
                        <span>{formatTimestamp(log.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-paragraph-sm font-medium text-text-sub-600">
                      {log.entityType}
                    </TableCell>
                    <TableCell>
                      {log.entityId ? (
                        <code className="rounded bg-bg-weak-50 px-1.5 py-0.5 font-mono text-xs text-text-sub-600 border border-stroke-soft-200">
                          {log.entityId}
                        </code>
                      ) : (
                        <span className="text-text-soft-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-sub-600 whitespace-nowrap">
                      {log.ipAddress ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate text-xs text-text-soft-400">
                      {metaSummary}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setViewAudit(log)}
                        aria-label="View audit record"
                        title="View details"
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {!loading && filteredLogs.length > 0 ? (
          <ListPagination {...auditPagination.paginationProps} className="border-t border-stroke-soft-200 px-4 py-3" />
        ) : null}
      </div>

      {/* Record View Drawer for Deep Inspection */}
      <RecordViewDrawer
        open={viewAudit != null}
        onOpenChange={(open) => {
          if (!open) setViewAudit(null);
        }}
        title="Audit record details"
        description="Complete recorded payload and metadata for this event."
        fields={
          viewAudit
            ? [
                { label: "Log ID", value: viewAudit.id },
                { label: "Action", value: viewAudit.action },
                { label: "Entity Type", value: viewAudit.entityType },
                { label: "Entity ID", value: viewAudit.entityId || "—" },
                { label: "IP address", value: viewAudit.ipAddress || "—" },
                { label: "Timestamp", value: formatTimestamp(viewAudit.createdAt) },
                { label: "Raw ISO Date", value: viewAudit.createdAt },
                {
                  label: "Metadata Payload",
                  value: viewAudit.metadata
                    ? JSON.stringify(viewAudit.metadata, null, 2)
                    : "No metadata recorded",
                },
              ]
            : []
        }
      />
    </div>
  );
}
