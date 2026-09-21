import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TableRowsSkeleton } from "@/components/loading-skeletons";
import { PageHeader } from "../components/PageHeader";
import { FormDrawer, NewButton } from "../components/FormDrawer";
import { MoneyInput } from "@/components/money-input";
import { useBusinessCurrency } from "@/hooks/useBusinessCurrency";
import { useAccess } from "@/hooks/useAccess";

type CashRegisterRow = {
  id: string;
  name: string;
  locationId: string;
  isActive: boolean;
};

type RegisterSessionRow = {
  id: string;
  registerId: string;
  status: string;
  openingFloat: number;
  closingAmount?: number | null;
  openedAt: string;
  closedAt?: string | null;
};

const Q = gql`
  query RegistersPage {
    cashRegisters {
      id
      name
      locationId
      isActive
    }
    openRegisterSessions {
      id
      registerId
      status
      openingFloat
      openedAt
    }
    locations {
      id
      name
      isDefault
    }
  }
`;

const CREATE_REGISTER = gql`
  mutation CreateCashRegister($name: String!, $locationId: ID!) {
    createCashRegister(name: $name, locationId: $locationId) {
      id
    }
  }
`;

const OPEN_SESSION = gql`
  mutation OpenRegisterSession($registerId: ID!, $openingFloat: Float) {
    openRegisterSession(registerId: $registerId, openingFloat: $openingFloat) {
      id
    }
  }
`;

const CLOSE_SESSION = gql`
  mutation CloseRegisterSession($id: ID!, $closingAmount: Float!) {
    closeRegisterSession(id: $id, closingAmount: $closingAmount) {
      id
    }
  }
`;

export default function RegistersPage() {
  const { can } = useAccess();
  const { formatMoney } = useBusinessCurrency();
  const canManageRegisters = can("settings.update");
  const canOpenClose = can("sales.pos.access");

  const { data, loading, refetch } = useQuery<{
    cashRegisters?: CashRegisterRow[];
    openRegisterSessions?: RegisterSessionRow[];
    locations?: { id: string; name: string; isDefault: boolean }[];
  }>(Q);

  const [createRegister] = useMutation(CREATE_REGISTER);
  const [openSession] = useMutation(OPEN_SESSION);
  const [closeSession] = useMutation(CLOSE_SESSION);

  const [registerDrawerOpen, setRegisterDrawerOpen] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerLocationId, setRegisterLocationId] = useState("");

  const [openDrawerOpen, setOpenDrawerOpen] = useState(false);
  const [openForRegisterId, setOpenForRegisterId] = useState<string | null>(null);
  const [openingFloat, setOpeningFloat] = useState("0");

  const [closeTarget, setCloseTarget] = useState<RegisterSessionRow | null>(null);
  const [closingAmount, setClosingAmount] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const locationNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const loc of data?.locations ?? []) {
      map.set(loc.id, loc.name);
    }
    return map;
  }, [data?.locations]);

  const registerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of data?.cashRegisters ?? []) {
      map.set(r.id, r.name);
    }
    return map;
  }, [data?.cashRegisters]);

  const openSessionByRegisterId = useMemo(() => {
    const map = new Map<string, RegisterSessionRow>();
    for (const s of data?.openRegisterSessions ?? []) {
      map.set(s.registerId, s);
    }
    return map;
  }, [data?.openRegisterSessions]);

  const defaultLocationId =
    data?.locations?.find((l) => l.isDefault)?.id ?? data?.locations?.[0]?.id ?? "";

  function startOpenSession(registerId: string) {
    setOpenForRegisterId(registerId);
    setOpeningFloat("0");
    setActionError(null);
    setOpenDrawerOpen(true);
  }

  async function submitCreateRegister(e: React.FormEvent) {
    e.preventDefault();
    const locationId = registerLocationId || defaultLocationId;
    if (!registerName.trim() || !locationId) return;
    setBusy(true);
    setActionError(null);
    try {
      await createRegister({
        variables: { name: registerName.trim(), locationId },
      });
      setRegisterDrawerOpen(false);
      setRegisterName("");
      setRegisterLocationId("");
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not create register.");
    } finally {
      setBusy(false);
    }
  }

  async function submitOpenSession(e: React.FormEvent) {
    e.preventDefault();
    if (!openForRegisterId) return;
    const float = Number(openingFloat);
    if (!Number.isFinite(float) || float < 0) return;
    setBusy(true);
    setActionError(null);
    try {
      await openSession({
        variables: { registerId: openForRegisterId, openingFloat: float },
      });
      setOpenDrawerOpen(false);
      setOpenForRegisterId(null);
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not open session.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmCloseSession() {
    if (!closeTarget) return;
    const amount = Number(closingAmount);
    if (!Number.isFinite(amount) || amount < 0) return;
    setBusy(true);
    setActionError(null);
    try {
      await closeSession({
        variables: { id: closeTarget.id, closingAmount: amount },
      });
      setCloseTarget(null);
      setClosingAmount("");
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not close session.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Registers & sessions"
        description="Configure POS tills and open or close register shifts before checkout."
        actions={
          canManageRegisters ? (
            <NewButton
              label="Add register"
              onClick={() => {
                setRegisterName("");
                setRegisterLocationId(defaultLocationId);
                setActionError(null);
                setRegisterDrawerOpen(true);
              }}
            />
          ) : undefined
        }
      />

      {!canOpenClose ? (
        <p className="mb-4 text-sm text-muted-foreground">
          You need POS access to open or close sessions. Register setup requires settings update
          permission.
        </p>
      ) : null}

      {actionError && !registerDrawerOpen && !openDrawerOpen && !closeTarget ? (
        <p className="mb-4 text-sm text-destructive">{actionError}</p>
      ) : null}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="mb-1 text-sm font-medium">Open sessions</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Active till shifts linked to sales at the POS. Close at end of day with the counted cash
            in the drawer.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Register</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead className="text-right">Opening float</TableHead>
                {canOpenClose ? <TableHead className="w-[1%]" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRowsSkeleton rows={2} cols={canOpenClose ? 4 : 3} />
              ) : (data?.openRegisterSessions ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canOpenClose ? 4 : 3}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No open sessions. Open a till below or from the POS at checkout.
                  </TableCell>
                </TableRow>
              ) : (
                (data?.openRegisterSessions ?? []).map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {registerNameById.get(session.registerId) ?? session.registerId}
                    </TableCell>
                    <TableCell>{new Date(session.openedAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{formatMoney(session.openingFloat)}</TableCell>
                    {canOpenClose ? (
                      <TableCell>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCloseTarget(session);
                            setClosingAmount("");
                            setActionError(null);
                          }}
                        >
                          Close session
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-1 text-sm font-medium">Cash registers</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Each register belongs to a location. Staff open a session when starting a shift.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                {canOpenClose ? <TableHead className="w-[1%]" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRowsSkeleton rows={3} cols={canOpenClose ? 4 : 3} />
              ) : (data?.cashRegisters ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canOpenClose ? 4 : 3}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No registers yet.
                    {canManageRegisters
                      ? " Add a register so the POS can attach sales to a till."
                      : " Ask an admin to add a register in the control hub."}
                  </TableCell>
                </TableRow>
              ) : (
                (data?.cashRegisters ?? []).map((register) => {
                  const open = openSessionByRegisterId.get(register.id);
                  return (
                    <TableRow key={register.id}>
                      <TableCell className="font-medium">{register.name}</TableCell>
                      <TableCell>
                        {locationNameById.get(register.locationId) ?? register.locationId}
                      </TableCell>
                      <TableCell>
                        {open ? (
                          <Badge variant="secondary">Session open</Badge>
                        ) : register.isActive ? (
                          <Badge variant="outline">Ready</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      {canOpenClose ? (
                        <TableCell>
                          {open ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCloseTarget(open);
                                setClosingAmount("");
                                setActionError(null);
                              }}
                            >
                              Close
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              disabled={!register.isActive}
                              onClick={() => startOpenSession(register.id)}
                            >
                              Open session
                            </Button>
                          )}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canManageRegisters ? (
        <FormDrawer
          open={registerDrawerOpen}
          onOpenChange={setRegisterDrawerOpen}
          title="New cash register"
          description="Registers appear at the POS and in sales reporting."
          submitLabel="Create register"
          onSubmit={(e) => void submitCreateRegister(e)}
        >
          <div className="grid gap-1">
            <Label htmlFor="reg-name">Name</Label>
            <Input
              id="reg-name"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              placeholder="Front counter"
              required
            />
          </div>
          <div className="grid gap-1">
            <Label>Location</Label>
            <Select
              value={registerLocationId || defaultLocationId}
              onValueChange={(v) => setRegisterLocationId(v ?? "")}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {(data?.locations ?? []).map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                    {loc.isDefault ? " (default)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(data?.locations ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Create a stock location in the web app (Purchasing → Locations) first.
              </p>
            ) : null}
          </div>
          {actionError && registerDrawerOpen ? (
            <p className="text-sm text-destructive">{actionError}</p>
          ) : null}
        </FormDrawer>
      ) : null}

      {canOpenClose ? (
        <FormDrawer
          open={openDrawerOpen}
          onOpenChange={(open) => {
            setOpenDrawerOpen(open);
            if (!open) setOpenForRegisterId(null);
          }}
          title="Open register session"
          description={
            openForRegisterId
              ? `Start a shift on ${registerNameById.get(openForRegisterId) ?? "this register"}.`
              : undefined
          }
          submitLabel={busy ? "Opening…" : "Open session"}
          onSubmit={(e) => void submitOpenSession(e)}
        >
          <div className="grid gap-1">
            <Label htmlFor="opening-float">Opening float (cash in drawer)</Label>
            <MoneyInput
              id="opening-float"
              value={openingFloat}
              onChange={(e) => setOpeningFloat(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Amount of cash you are starting the shift with, for reconciliation at close.
            </p>
          </div>
          {actionError && openDrawerOpen ? (
            <p className="text-sm text-destructive">{actionError}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Your user must be linked to an employee record to open a session.
          </p>
        </FormDrawer>
      ) : null}

      <Dialog
        open={closeTarget != null}
        onOpenChange={(open) => {
          if (!open) {
            setCloseTarget(null);
            setClosingAmount("");
            setActionError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close register session</DialogTitle>
            <DialogDescription>
              {closeTarget
                ? `Count cash in ${registerNameById.get(closeTarget.registerId) ?? "the register"} and enter the total. Opening float was ${formatMoney(closeTarget.openingFloat)}.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1 py-2">
            <Label htmlFor="closing-amount">Closing amount</Label>
            <MoneyInput
              id="closing-amount"
              value={closingAmount}
              onChange={(e) => setClosingAmount(e.target.value)}
            />
          </div>
          {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCloseTarget(null)}>
              Cancel
            </Button>
            <Button type="button" disabled={busy} onClick={() => void confirmCloseSession()}>
              {busy ? "Closing…" : "Close session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
