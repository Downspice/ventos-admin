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
  query LoyaltyPage {
    loyaltyRules {
      id
      name
      pointsPerCurrency
      isActive
    }
    customers {
      id
      firstName
      lastName
    }
  }
`;

const BALANCE = gql`
  query Balance($customerId: ID!) {
    customerLoyaltyBalance(customerId: $customerId) {
      points
    }
  }
`;

const CREATE = gql`
  mutation LoyaltyRule($name: String!, $pointsPerCurrency: Float!) {
    createLoyaltyRule(name: $name, pointsPerCurrency: $pointsPerCurrency) {
      id
    }
  }
`;

export default function LoyaltyPage() {
  const { data, refetch } = useQuery<{
    loyaltyRules?: { id: string; name: string; pointsPerCurrency: number }[];
    customers?: { id: string }[];
  }>(Q);
  const [createRule] = useMutation(CREATE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState("Default");
  const [points, setPoints] = useState("1");
  const customerId = data?.customers?.[0]?.id;
  const rulesPagination = useListPagination(data?.loyaltyRules ?? []);

  const { data: balData } = useQuery<{ customerLoyaltyBalance?: { points: number } }>(BALANCE, {
    variables: { customerId: customerId ?? "" },
    skip: !customerId,
  });

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await createRule({
      variables: { name, pointsPerCurrency: Number(points) },
    });
    setName("Default");
    setPoints("1");
    setDrawerOpen(false);
    await refetch();
  }

  return (
    <div>
      <PageHeader
        title="Loyalty & rewards"
        description="Points rules and customer balances."
        actions={<NewButton label="New rule" onClick={() => setDrawerOpen(true)} />}
      />
      <FormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="New loyalty rule"
        description="Configure how customers earn points."
        submitLabel="Create rule"
        onSubmit={onCreate}
      >
        <div className="grid gap-1">
          <Label>Rule name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <Label>Points per currency unit</Label>
          <Input type="number" step="0.1" value={points} onChange={(e) => setPoints(e.target.value)} required />
        </div>
      </FormDrawer>
      <ul className="mb-4 grid gap-2 text-sm">
        {rulesPagination.pageItems.map((r) => (
          <li key={r.id} className="rounded border px-3 py-2">
            {r.name}: {r.pointsPerCurrency} pts / unit
          </li>
        ))}
      </ul>
      {(data?.loyaltyRules ?? []).length > 0 ? (
        <ListPagination {...rulesPagination.paginationProps} className="mb-4" />
      ) : null}
      {customerId ? (
        <p className="text-sm">
          Sample balance (first customer): {balData?.customerLoyaltyBalance?.points ?? 0} points
        </p>
      ) : null}
    </div>
  );
}
