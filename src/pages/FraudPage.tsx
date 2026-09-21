import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListSkeleton } from "@/components/loading-skeletons";
import { PageHeader } from "../components/PageHeader";
import { FormDrawer, NewButton } from "../components/FormDrawer";
import { useState } from "react";
import { useListPagination } from "@/hooks/useListPagination";
import { ListPagination } from "@/components/ListPagination";

const Q = gql`
  query FraudPage {
    fraudRules {
      id
      name
      ruleType
      threshold
      isActive
    }
    activityFlags {
      id
      severity
      message
      resolvedAt
      createdAt
    }
  }
`;

const CREATE = gql`
  mutation CreateFraud($name: String!, $ruleType: String!, $threshold: Float!) {
    createFraudRule(name: $name, ruleType: $ruleType, threshold: $threshold) {
      id
    }
  }
`;

const RESOLVE = gql`
  mutation Resolve($id: ID!) {
    resolveActivityFlag(id: $id) {
      id
      resolvedAt
    }
  }
`;

const RULE_TYPES = [
  { value: "LARGE_DISCOUNT", label: "Large discount" },
  { value: "HIGH_VOID_RATE", label: "High void rate" },
  { value: "UNUSUAL_REFUND", label: "Unusual refund" },
];

export default function FraudPage() {
  const { data, loading, refetch } = useQuery<{
    fraudRules?: { id: string; name: string; ruleType: string; threshold: number }[];
    activityFlags?: { id: string; severity: string; message: string; resolvedAt?: string }[];
  }>(Q);
  const [createRule] = useMutation(CREATE);
  const [resolve] = useMutation(RESOLVE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState("Large discount");
  const [ruleType, setRuleType] = useState("LARGE_DISCOUNT");
  const [threshold, setThreshold] = useState("50");

  const rulesPagination = useListPagination(data?.fraudRules ?? []);
  const flagsPagination = useListPagination(data?.activityFlags ?? []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await createRule({
      variables: { name, ruleType, threshold: Number(threshold) },
    });
    setName("Large discount");
    setRuleType("LARGE_DISCOUNT");
    setThreshold("50");
    setDrawerOpen(false);
    await refetch();
  }

  return (
    <div>
      <PageHeader
        title="Fraud & activity"
        description="Monitoring rules and flagged activity."
        actions={<NewButton label="New rule" onClick={() => setDrawerOpen(true)} />}
      />
      <FormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="New fraud rule"
        description="Alert when activity crosses a threshold."
        submitLabel="Create rule"
        onSubmit={onCreate}
      >
        <div className="grid gap-1">
          <Label>Rule name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <Label>Rule type</Label>
          <Select value={ruleType} onValueChange={(value) => setRuleType(value ?? "LARGE_DISCOUNT")}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RULE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label>Threshold</Label>
          <Input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} required />
        </div>
      </FormDrawer>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium">Rules</h3>
          {loading ? (
            <ListSkeleton rows={4} />
          ) : (
            <ul className="grid gap-2 text-sm">
              {rulesPagination.pageItems.map((r) => (
                <li key={r.id} className="rounded border px-3 py-2">
                  {r.name} ({r.ruleType}) ≥ {r.threshold}
                </li>
              ))}
            </ul>
          )}
          {!loading && (data?.fraudRules ?? []).length > 0 ? (
            <ListPagination {...rulesPagination.paginationProps} className="mt-3" />
          ) : null}
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium">Activity flags</h3>
          <ul className="grid gap-2 text-sm">
            {flagsPagination.pageItems.map((f) => (
              <li key={f.id} className="flex items-start justify-between gap-2 rounded border px-3 py-2">
                <span>
                  [{f.severity}] {f.message}
                </span>
                {!f.resolvedAt ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void resolve({ variables: { id: f.id } }).then(() => refetch())}
                  >
                    Resolve
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
          {(data?.activityFlags ?? []).length > 0 ? (
            <ListPagination {...flagsPagination.paginationProps} className="mt-3" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
