import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListSkeleton } from "@/components/loading-skeletons";
import { PageHeader } from "../components/PageHeader";
import { FormDrawer, NewButton } from "../components/FormDrawer";
import { useMemo, useState } from "react";
import { useListPagination } from "@/hooks/useListPagination";
import { ListPagination } from "@/components/ListPagination";

const Q = gql`
  query FinancePage {
    expenses {
      id
      category
      amount
      incurredAt
      description
    }
    invoices {
      id
      invoiceNumber
      employeeId
      status
      total
      issuedAt
    }
    employees {
      id
      firstName
      lastName
    }
    sales(status: "FINALIZED") {
      id
      total
    }
  }
`;

const EXPENSE = gql`
  mutation Expense($category: String!, $amount: Float!, $incurredAt: String!, $description: String) {
    createExpense(category: $category, amount: $amount, incurredAt: $incurredAt, description: $description) {
      id
    }
  }
`;

const INVOICE = gql`
  mutation Invoice($saleId: ID!) {
    createInvoiceFromSale(saleId: $saleId) {
      id
      invoiceNumber
    }
  }
`;

export default function FinancePage() {
  const { data, error, loading, refetch } = useQuery<{
    expenses?: { id: string; category: string; amount: number; incurredAt: string; description?: string }[];
    invoices?: {
      id: string;
      invoiceNumber: string;
      employeeId?: string | null;
      status: string;
      total: number;
    }[];
    employees?: { id: string; firstName: string; lastName: string }[];
    sales?: { id: string; total: number }[];
  }>(Q);

  const employeeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of data?.employees ?? []) {
      map.set(e.id, `${e.firstName} ${e.lastName}`.trim());
    }
    return map;
  }, [data?.employees]);
  const [createExpense] = useMutation(EXPENSE);
  const [createInvoice] = useMutation(INVOICE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [category, setCategory] = useState("General");
  const [amount, setAmount] = useState("0");
  const [incurredAt, setIncurredAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");

  const expensesPagination = useListPagination(data?.expenses ?? []);
  const invoicesPagination = useListPagination(data?.invoices ?? []);

  async function onCreateExpense(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const date = incurredAt ? new Date(incurredAt).toISOString() : new Date().toISOString();
    try {
      await createExpense({
        variables: {
          category,
          amount: Number(amount),
          incurredAt: date,
          description: description || undefined,
        },
      });
      setCategory("General");
      setAmount("0");
      setIncurredAt(new Date().toISOString().slice(0, 10));
      setDescription("");
      setDrawerOpen(false);
      await refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not add expense.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Finance"
        description="Expenses and invoices."
        actions={<NewButton label="New expense" onClick={() => setDrawerOpen(true)} />}
      />
      <FormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="New expense"
        description="Record a business expense."
        submitLabel="Add expense"
        onSubmit={onCreateExpense}
      >
        {formError ? <p className="text-sm text-red-500">{formError}</p> : null}
        <div className="grid gap-1">
          <Label>Category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <Label>Amount</Label>
          <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <Label>Date incurred</Label>
          <Input type="date" value={incurredAt} onChange={(e) => setIncurredAt(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional notes"
          />
        </div>
      </FormDrawer>
      {error ? <p className="mb-4 text-sm text-red-500">{error.message}</p> : null}
      {formError && !drawerOpen ? <p className="mb-4 text-sm text-red-500">{formError}</p> : null}
      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="expenses" className="mt-4">
          {loading ? (
            <ListSkeleton rows={5} />
          ) : (data?.expenses ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses yet. Add one to get started.</p>
          ) : (
            <ul className="grid gap-2 text-sm">
              {expensesPagination.pageItems.map((e) => (
                <li key={e.id} className="flex justify-between border-b py-2">
                  <span>
                    {e.category} · {new Date(e.incurredAt).toLocaleDateString()}
                    {e.description ? ` · ${e.description}` : ""}
                  </span>
                  <span>{e.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
          {!loading && (data?.expenses ?? []).length > 0 ? (
            <ListPagination {...expensesPagination.paginationProps} className="mt-4" />
          ) : null}
        </TabsContent>
        <TabsContent value="invoices" className="mt-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {(data?.sales ?? []).slice(0, 5).map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant="outline"
                onClick={() =>
                  void createInvoice({ variables: { saleId: s.id } })
                    .then(() => refetch())
                    .catch((err: unknown) => {
                      setFormError(err instanceof Error ? err.message : "Could not create invoice.");
                    })
                }
              >
                Invoice sale …{s.id.slice(-6)} ({s.total.toFixed(2)})
              </Button>
            ))}
          </div>
          {loading ? (
            <ListSkeleton rows={5} />
          ) : (data?.invoices ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <ul className="grid gap-2 text-sm">
              {invoicesPagination.pageItems.map((i) => (
                <li key={i.id} className="flex justify-between border-b py-2">
                  <span>
                    {i.invoiceNumber} · {i.status}
                    {i.employeeId ? (
                      <> · Sold by {employeeNameById.get(i.employeeId) ?? "—"}</>
                    ) : null}
                  </span>
                  <span>{i.total.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
          {!loading && (data?.invoices ?? []).length > 0 ? (
            <ListPagination {...invoicesPagination.paginationProps} className="mt-4" />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
