import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ListSkeleton, TableRowsSkeleton } from "@/components/loading-skeletons";
import { PageHeader } from "../components/PageHeader";
import { FormDrawer, NewButton } from "../components/FormDrawer";
import { TableRowActions } from "../components/TableRowActions";
import { currencyLabel, type CurrencyCode } from "@/utils/money";
import { useState, useEffect } from "react";
import { useListPagination } from "@/hooks/useListPagination";
import { ListPagination } from "@/components/ListPagination";
import { useAccess } from "@/hooks/useAccess";

type PaymentChannelType = "BANK_ACCOUNT" | "MOBILE_MONEY";

type PaymentChannelRow = {
  id: string;
  type: PaymentChannelType;
  name: string;
  accountNumber?: string | null;
  network?: string | null;
  number?: string | null;
  createdAt: string;
};

const MOBILE_NETWORKS = ["MTN", "Vodafone", "AirtelTigo", "Telecel", "Other"] as const;

const Q = gql`
  query SettingsPage {
    business {
      id
      name
      email
      phone
      address
      currency
    }
    sessions {
      id
      deviceLabel
      lastSeenAt
    }
    paymentChannels {
      id
      type
      name
      accountNumber
      network
      number
      createdAt
    }
    taxRules {
      id
      name
      rate
      mode
      isActive
    }
    permissionsCatalog
  }
`;

const UPDATE = gql`
  mutation UpdateBusiness($input: BusinessProfileInput!) {
    updateBusinessProfile(input: $input) {
      id
      name
      currency
    }
  }
`;

const CREATE_CHANNEL = gql`
  mutation CreatePaymentChannel($input: PaymentChannelInput!) {
    createPaymentChannel(input: $input) {
      id
    }
  }
`;

const UPDATE_CHANNEL = gql`
  mutation UpdatePaymentChannel($id: ID!, $input: PaymentChannelInput!) {
    updatePaymentChannel(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE_CHANNEL = gql`
  mutation DeletePaymentChannel($id: ID!) {
    deletePaymentChannel(id: $id)
  }
`;

const REVOKE = gql`
  mutation Revoke($sessionId: ID!) {
    revokeSession(sessionId: $sessionId)
  }
`;

const CREATE_TAX = gql`
  mutation CreateTaxRule($input: TaxRuleInput!) {
    createTaxRule(input: $input) {
      id
    }
  }
`;

const UPDATE_TAX = gql`
  mutation UpdateTaxRule($id: ID!, $input: TaxRuleInput!) {
    updateTaxRule(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE_TAX = gql`
  mutation DeleteTaxRule($id: ID!) {
    deleteTaxRule(id: $id)
  }
`;

type TaxRuleRow = {
  id: string;
  name: string;
  rate: number;
  mode: "INCLUSIVE" | "EXCLUSIVE";
  isActive: boolean;
};

type TaxForm = {
  name: string;
  rate: string;
  mode: "INCLUSIVE" | "EXCLUSIVE";
  isActive: boolean;
};

const emptyTaxForm = (): TaxForm => ({
  name: "",
  rate: "",
  mode: "EXCLUSIVE",
  isActive: true,
});

function taxModeLabel(mode: TaxRuleRow["mode"]) {
  return mode === "INCLUSIVE" ? "Included in price" : "Added on top";
}

function channelSummary(row: PaymentChannelRow) {
  if (row.type === "BANK_ACCOUNT") {
    return row.accountNumber ?? "—";
  }
  return [row.network, row.number].filter(Boolean).join(" · ") || "—";
}

function channelTypeLabel(type: PaymentChannelType) {
  return type === "BANK_ACCOUNT" ? "Bank account" : "Mobile money";
}

function emptyChannelForm(): {
  type: PaymentChannelType;
  name: string;
  accountNumber: string;
  networkPreset: string;
  networkCustom: string;
  number: string;
} {
  return {
    type: "BANK_ACCOUNT",
    name: "",
    accountNumber: "",
    networkPreset: "MTN",
    networkCustom: "",
    number: "",
  };
}

export default function SettingsPage() {
  const { can } = useAccess();
  const canEditTax = can("settings.update");
  const { data, loading, refetch } = useQuery<{
    business?: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      currency?: CurrencyCode;
    };
    sessions?: { id: string; deviceLabel?: string; lastSeenAt: string }[];
    paymentChannels?: PaymentChannelRow[];
    taxRules?: TaxRuleRow[];
    permissionsCatalog?: string[];
  }>(Q);
  const [updateBusiness] = useMutation(UPDATE);
  const [createChannel] = useMutation(CREATE_CHANNEL);
  const [updateChannel] = useMutation(UPDATE_CHANNEL);
  const [deleteChannel] = useMutation(DELETE_CHANNEL);
  const [revokeSession] = useMutation(REVOKE);
  const [createTaxRule] = useMutation(CREATE_TAX);
  const [updateTaxRule] = useMutation(UPDATE_TAX);
  const [deleteTaxRule] = useMutation(DELETE_TAX);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("GHS");

  const [channelDrawerOpen, setChannelDrawerOpen] = useState(false);
  const [editChannel, setEditChannel] = useState<PaymentChannelRow | null>(null);
  const [channelForm, setChannelForm] = useState(emptyChannelForm);

  const [taxDrawerOpen, setTaxDrawerOpen] = useState(false);
  const [editTaxRule, setEditTaxRule] = useState<TaxRuleRow | null>(null);
  const [taxForm, setTaxForm] = useState<TaxForm>(emptyTaxForm);

  useEffect(() => {
    if (data?.business) {
      setName(data.business.name);
      setPhone(data.business.phone ?? "");
      setCurrency(data.business.currency ?? "GHS");
    }
  }, [data?.business]);

  const sessionsPagination = useListPagination(data?.sessions ?? []);
  const channelsPagination = useListPagination(data?.paymentChannels ?? []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    await updateBusiness({ variables: { input: { name, phone, currency } } });
    await refetch();
  }

  function openCreateChannel() {
    setEditChannel(null);
    setChannelForm(emptyChannelForm());
    setChannelDrawerOpen(true);
  }

  function openEditChannel(row: PaymentChannelRow) {
    setEditChannel(row);
    const preset = MOBILE_NETWORKS.includes(row.network as (typeof MOBILE_NETWORKS)[number])
      ? (row.network as string)
      : row.network
        ? "Other"
        : "MTN";
    setChannelForm({
      type: row.type,
      name: row.name,
      accountNumber: row.accountNumber ?? "",
      networkPreset: preset,
      networkCustom: preset === "Other" ? (row.network ?? "") : "",
      number: row.number ?? "",
    });
    setChannelDrawerOpen(true);
  }

  function channelInputFromForm() {
    const network =
      channelForm.type === "MOBILE_MONEY"
        ? channelForm.networkPreset === "Other"
          ? channelForm.networkCustom.trim()
          : channelForm.networkPreset
        : undefined;
    return {
      type: channelForm.type,
      name: channelForm.name.trim(),
      accountNumber:
        channelForm.type === "BANK_ACCOUNT" ? channelForm.accountNumber.trim() : undefined,
      network,
      number: channelForm.type === "MOBILE_MONEY" ? channelForm.number.trim() : undefined,
    };
  }

  async function saveChannel(e: React.FormEvent) {
    e.preventDefault();
    const input = channelInputFromForm();
    if (editChannel) {
      await updateChannel({ variables: { id: editChannel.id, input } });
    } else {
      await createChannel({ variables: { input } });
    }
    setChannelDrawerOpen(false);
    setEditChannel(null);
    setChannelForm(emptyChannelForm());
    await refetch();
  }

  function openCreateTax() {
    setEditTaxRule(null);
    setTaxForm(emptyTaxForm());
    setTaxDrawerOpen(true);
  }

  function openEditTax(rule: TaxRuleRow) {
    setEditTaxRule(rule);
    setTaxForm({
      name: rule.name,
      rate: String(rule.rate),
      mode: rule.mode,
      isActive: rule.isActive,
    });
    setTaxDrawerOpen(true);
  }

  async function saveTax(e: React.FormEvent) {
    e.preventDefault();
    const rate = Number(taxForm.rate);
    if (!taxForm.name.trim() || !Number.isFinite(rate) || rate < 0 || rate > 100) return;
    const input = {
      name: taxForm.name.trim(),
      rate,
      mode: taxForm.mode,
      isActive: taxForm.isActive,
    };
    if (editTaxRule) {
      await updateTaxRule({ variables: { id: editTaxRule.id, input } });
    } else {
      await createTaxRule({ variables: { input } });
    }
    setTaxDrawerOpen(false);
    setEditTaxRule(null);
    setTaxForm(emptyTaxForm());
    await refetch();
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Business profile, taxes, payment channels, currency, sessions, and permission catalog."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={saveProfile} className="grid gap-3">
              <div className="grid gap-1">
                <Label>Business name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GHS">{currencyLabel("GHS")}</SelectItem>
                    <SelectItem value="USD">{currencyLabel("USD")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Prices are stored as pesewas or cents and shown in major units with the symbol above.
                </p>
              </div>
              <Button type="submit">Save profile</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-3 text-sm font-medium">Active sessions</h3>
            {loading ? (
              <ListSkeleton rows={4} />
            ) : (
              <ul className="grid gap-2 text-sm">
                {sessionsPagination.pageItems.map((s) => (
                  <li key={s.id} className="flex items-center justify-between border-b py-2">
                    <span>
                      {s.deviceLabel ?? "Device"} · {new Date(s.lastSeenAt).toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void revokeSession({ variables: { sessionId: s.id } }).then(() => refetch())}
                    >
                      Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {!loading && (data?.sessions ?? []).length > 0 ? (
              <ListPagination {...sessionsPagination.paginationProps} className="mt-3" />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium">Payment channels</h3>
              <p className="text-xs text-muted-foreground">
                Bank accounts and mobile money numbers customers can pay into.
              </p>
            </div>
            <NewButton label="Add channel" onClick={openCreateChannel} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-[1%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRowsSkeleton rows={3} cols={4} />
              ) : (data?.paymentChannels ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    No payment channels yet. Add a bank account or mobile money wallet.
                  </TableCell>
                </TableRow>
              ) : (
                channelsPagination.pageItems.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Badge variant="outline">{channelTypeLabel(row.type)}</Badge>
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="font-mono text-xs">{channelSummary(row)}</TableCell>
                    <TableCell>
                      <TableRowActions
                        onEdit={() => openEditChannel(row)}
                        onDelete={() =>
                          void deleteChannel({ variables: { id: row.id } }).then(() => refetch())
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!loading && (data?.paymentChannels ?? []).length > 0 ? (
            <ListPagination {...channelsPagination.paginationProps} className="mt-4" />
          ) : null}
        </CardContent>
      </Card>

      <FormDrawer
        open={channelDrawerOpen}
        onOpenChange={(open) => {
          setChannelDrawerOpen(open);
          if (!open) {
            setEditChannel(null);
            setChannelForm(emptyChannelForm());
          }
        }}
        title={editChannel ? "Edit payment channel" : "New payment channel"}
        description="Choose bank account or mobile money and fill in the account details."
        submitLabel={editChannel ? "Save changes" : "Add channel"}
        onSubmit={(e) => void saveChannel(e)}
      >
        <div className="grid gap-1">
          <Label>Channel type</Label>
          <Select
            value={channelForm.type}
            onValueChange={(v) =>
              setChannelForm((f) => ({ ...f, type: (v ?? "BANK_ACCOUNT") as PaymentChannelType }))
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BANK_ACCOUNT">Bank account</SelectItem>
              <SelectItem value="MOBILE_MONEY">Mobile money</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {channelForm.type === "BANK_ACCOUNT" ? (
          <>
            <div className="grid gap-1">
              <Label htmlFor="bank-name">Account name</Label>
              <Input
                id="bank-name"
                value={channelForm.name}
                onChange={(e) => setChannelForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Name on the account"
                required
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="bank-number">Account number</Label>
              <Input
                id="bank-number"
                value={channelForm.accountNumber}
                onChange={(e) => setChannelForm((f) => ({ ...f, accountNumber: e.target.value }))}
                placeholder="1234567890"
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-1">
              <Label>Network</Label>
              <Select
                value={channelForm.networkPreset}
                onValueChange={(v) => setChannelForm((f) => ({ ...f, networkPreset: v ?? "MTN" }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOBILE_NETWORKS.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {channelForm.networkPreset === "Other" ? (
              <div className="grid gap-1">
                <Label htmlFor="network-custom">Network name</Label>
                <Input
                  id="network-custom"
                  value={channelForm.networkCustom}
                  onChange={(e) => setChannelForm((f) => ({ ...f, networkCustom: e.target.value }))}
                  required
                />
              </div>
            ) : null}
            <div className="grid gap-1">
              <Label htmlFor="mobile-number">Mobile number</Label>
              <Input
                id="mobile-number"
                value={channelForm.number}
                onChange={(e) => setChannelForm((f) => ({ ...f, number: e.target.value }))}
                placeholder="0241234567"
                required
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="mobile-name">Name on number</Label>
              <Input
                id="mobile-name"
                value={channelForm.name}
                onChange={(e) => setChannelForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Registered name"
                required
              />
            </div>
          </>
        )}
      </FormDrawer>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium">Taxes</h3>
              <p className="text-xs text-muted-foreground">
                VAT and other rates applied at POS checkout and on new sales.
              </p>
            </div>
            {canEditTax ? <NewButton label="Add tax" onClick={openCreateTax} /> : null}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Application</TableHead>
                <TableHead>Status</TableHead>
                {canEditTax ? <TableHead className="w-[1%]" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRowsSkeleton rows={3} cols={canEditTax ? 5 : 4} />
              ) : (data?.taxRules ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canEditTax ? 5 : 4}
                    className="text-center text-sm text-muted-foreground"
                  >
                    No tax rules yet. Add VAT or other taxes used at checkout.
                  </TableCell>
                </TableRow>
              ) : (
                (data?.taxRules ?? []).map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.rate}%</TableCell>
                    <TableCell>{taxModeLabel(rule.mode)}</TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? "secondary" : "outline"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    {canEditTax ? (
                      <TableCell>
                        <TableRowActions
                          onEdit={() => openEditTax(rule)}
                          onDelete={() =>
                            void deleteTaxRule({ variables: { id: rule.id } }).then(() => refetch())
                          }
                          deleteTitle="Delete tax rule"
                          deleteConfirmMessage="This tax will no longer apply to new sales."
                        />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canEditTax ? (
        <FormDrawer
          open={taxDrawerOpen}
          onOpenChange={(open) => {
            setTaxDrawerOpen(open);
            if (!open) {
              setEditTaxRule(null);
              setTaxForm(emptyTaxForm());
            }
          }}
          title={editTaxRule ? "Edit tax" : "Add tax"}
          description="Configure how this tax applies to POS and other sales."
          submitLabel={editTaxRule ? "Save changes" : "Create tax"}
          onSubmit={(e) => void saveTax(e)}
        >
          <div className="grid gap-1">
            <Label htmlFor="tax-name">Name</Label>
            <Input
              id="tax-name"
              value={taxForm.name}
              onChange={(e) => setTaxForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="VAT"
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="tax-rate">Rate (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={taxForm.rate}
              onChange={(e) => setTaxForm((f) => ({ ...f, rate: e.target.value }))}
              placeholder="15"
              required
            />
          </div>
          <div className="grid gap-1">
            <Label>How tax is applied</Label>
            <Select
              value={taxForm.mode}
              onValueChange={(v) =>
                setTaxForm((f) => ({ ...f, mode: (v as TaxForm["mode"]) ?? "EXCLUSIVE" }))
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXCLUSIVE">Added on top of line prices</SelectItem>
                <SelectItem value="INCLUSIVE">Already included in line prices</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Exclusive taxes increase the amount due at checkout. Inclusive taxes are shown on
              receipts but do not change the total when prices are tax-inclusive.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={taxForm.isActive}
              onChange={(e) => setTaxForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Active
          </label>
        </FormDrawer>
      ) : null}

      <Card className="mt-6">
        <CardContent className="pt-6">
          <h3 className="mb-2 text-sm font-medium">Permission catalog ({data?.permissionsCatalog?.length ?? 0})</h3>
          <p className="text-xs text-muted-foreground">{(data?.permissionsCatalog ?? []).join(", ")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
