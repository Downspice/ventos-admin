import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "../components/PageHeader";
import { FormDrawer, NewButton } from "../components/FormDrawer";
import { useState } from "react";
import { useListPagination } from "@/hooks/useListPagination";
import { ListPagination } from "@/components/ListPagination";

const Q = gql`
  query CommissionsPage {
    commissionRules {
      id
      name
      percent
      appliesTo
    }
    commissionEntries {
      id
      employeeId
      amount
      createdAt
    }
  }
`;

const CREATE = gql`
  mutation CommissionRule($name: String!, $percent: Float!, $appliesTo: String) {
    createCommissionRule(name: $name, percent: $percent, appliesTo: $appliesTo) {
      id
    }
  }
`;

export default function CommissionsPage() {
  const { data, refetch } = useQuery<{
    commissionRules?: { id: string; name: string; percent: number; appliesTo: string }[];
    commissionEntries?: { id: string; employeeId: string; amount: number; createdAt: string }[];
  }>(Q);
  const [createRule] = useMutation(CREATE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState("Default");
  const [percent, setPercent] = useState("5");
  const [appliesTo, setAppliesTo] = useState("all_sales");

  const rulesPagination = useListPagination(data?.commissionRules ?? []);
  const entriesPagination = useListPagination(data?.commissionEntries ?? []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await createRule({
      variables: { name, percent: Number(percent), appliesTo: appliesTo || undefined },
    });
    setName("Default");
    setPercent("5");
    setAppliesTo("all_sales");
    setDrawerOpen(false);
    await refetch();
  }

  return (
    <div>
      <PageHeader
        title="Commissions"
        description="Rules and earned commission entries."
        actions={<NewButton label="New rule" onClick={() => setDrawerOpen(true)} />}
      />
      <FormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="New commission rule"
        description="Set the rate and what sales it applies to."
        submitLabel="Create rule"
        onSubmit={onCreate}
      >
        <div className="grid gap-1">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <Label>Percent</Label>
          <Input type="number" step="0.01" value={percent} onChange={(e) => setPercent(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <Label>Applies to</Label>
          <Input
            value={appliesTo}
            onChange={(e) => setAppliesTo(e.target.value)}
            placeholder="e.g. all_sales, services"
          />
        </div>
      </FormDrawer>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <ul className="grid gap-2 text-sm">
            {rulesPagination.pageItems.map((r) => (
              <li key={r.id} className="rounded border px-3 py-2">
                {r.name}: {r.percent}% ({r.appliesTo})
              </li>
            ))}
          </ul>
          {(data?.commissionRules ?? []).length > 0 ? (
            <ListPagination {...rulesPagination.paginationProps} className="mt-3" />
          ) : null}
        </div>
        <div>
          <ul className="grid gap-2 text-sm">
            {entriesPagination.pageItems.map((e) => (
              <li key={e.id} className="flex justify-between border-b py-2">
                <span>{new Date(e.createdAt).toLocaleDateString()}</span>
                <span>{e.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          {(data?.commissionEntries ?? []).length > 0 ? (
            <ListPagination {...entriesPagination.paginationProps} className="mt-3" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
