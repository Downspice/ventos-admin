import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBusinessCurrency } from "@/hooks/useBusinessCurrency";
import { useAccess } from "@/hooks/useAccess";
import { EntityImage } from "@/components/default-entity-image";

const SALE_DETAIL = gql`
  query SaleDetail($id: ID!) {
    sale(id: $id) {
      id
      status
      customerId
      registerSessionId
      employeeId
      subtotal
      discountTotal
      taxTotal
      total
      createdAt
      lines {
        lineType
        productId
        serviceId
        name
        quantity
        unitPrice
        discountAmount
        lineTotal
      }
    }
    cashRegisters {
      id
      name
    }
    customers {
      id
      firstName
      lastName
    }
  }
`;

const SALE_EMPLOYEES = gql`
  query SaleEmployees {
    employees {
      id
      firstName
      lastName
    }
  }
`;

const REGISTER_SESSION = gql`
  query SaleRegisterSession($id: ID!) {
    registerSession(id: $id) {
      id
      registerId
    }
  }
`;

const SALE_PRODUCT_IMAGES = gql`
  query SaleProductImages {
    products {
      id
      imageUrl
    }
  }
`;

const SALE_SERVICE_IMAGES = gql`
  query SaleServiceImages {
    services {
      id
      imageUrl
    }
  }
`;

type SaleLine = {
  lineType: string;
  productId?: string | null;
  serviceId?: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
};

type Props = {
  saleId: string | null;
  customerNameById?: Map<string, string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SaleViewDrawer({ saleId, customerNameById, open, onOpenChange }: Props) {
  const { formatMoney } = useBusinessCurrency();
  const { can } = useAccess();
  const { data, loading, error } = useQuery<{
    sale?: {
      id: string;
      status: string;
      customerId?: string | null;
      registerSessionId?: string | null;
      employeeId?: string | null;
      subtotal: number;
      discountTotal: number;
      taxTotal: number;
      total: number;
      createdAt: string;
      lines: SaleLine[];
    };
    cashRegisters?: { id: string; name: string }[];
    customers?: { id: string; firstName: string; lastName: string }[];
  }>(SALE_DETAIL, {
    variables: { id: saleId! },
    skip: !open || !saleId,
  });

  const { data: employeesData } = useQuery<{
    employees?: { id: string; firstName: string; lastName: string }[];
  }>(SALE_EMPLOYEES, {
    skip: !open || !can("employees.read"),
  });

  const sale = data?.sale;

  const { data: sessionData } = useQuery<{
    registerSession?: { id: string; registerId: string } | null;
  }>(REGISTER_SESSION, {
    variables: { id: sale?.registerSessionId! },
    skip: !open || !sale?.registerSessionId,
  });

  const { data: productImagesData } = useQuery<{
    products?: { id: string; imageUrl?: string | null }[];
  }>(SALE_PRODUCT_IMAGES, {
    skip: !open || !can("inventory.read"),
  });

  const { data: serviceImagesData } = useQuery<{
    services?: { id: string; imageUrl?: string | null }[];
  }>(SALE_SERVICE_IMAGES, {
    skip: !open || !can("appointments.read"),
  });

  const imageUrlByProductId = useMemo(() => {
    const map = new Map<string, string | null | undefined>();
    for (const p of productImagesData?.products ?? []) {
      map.set(p.id, p.imageUrl);
    }
    return map;
  }, [productImagesData?.products]);

  const imageUrlByServiceId = useMemo(() => {
    const map = new Map<string, string | null | undefined>();
    for (const s of serviceImagesData?.services ?? []) {
      map.set(s.id, s.imageUrl);
    }
    return map;
  }, [serviceImagesData?.services]);

  function lineImageUrl(line: SaleLine) {
    if (line.productId) return imageUrlByProductId.get(line.productId);
    if (line.serviceId) return imageUrlByServiceId.get(line.serviceId);
    return undefined;
  }

  const resolvedCustomerNames = useMemo(() => {
    const map = new Map(customerNameById ?? []);
    for (const c of data?.customers ?? []) {
      if (!map.has(c.id)) {
        map.set(c.id, `${c.firstName} ${c.lastName}`.trim());
      }
    }
    return map;
  }, [customerNameById, data?.customers]);

  const customerLabel = sale?.customerId
    ? resolvedCustomerNames.get(sale.customerId) ?? "Unknown customer"
    : "Walk-in";

  const employeeLabel = useMemo(() => {
    if (!sale?.employeeId) return null;
    const emp = employeesData?.employees?.find((e) => e.id === sale.employeeId);
    if (!emp) return null;
    return `${emp.firstName} ${emp.lastName}`.trim();
  }, [sale?.employeeId, employeesData?.employees]);

  const registerLabel = useMemo(() => {
    const registerId = sessionData?.registerSession?.registerId;
    if (!registerId) return null;
    return data?.cashRegisters?.find((r) => r.id === registerId)?.name ?? null;
  }, [sessionData?.registerSession?.registerId, data?.cashRegisters]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {open ? (
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
          <SheetHeader className="border-b pb-4">
            <SheetTitle>Sale details</SheetTitle>
            {sale ? (
              <p className="text-sm text-muted-foreground">
                {new Date(sale.createdAt).toLocaleString()} ·{" "}
                <span className="font-mono">{sale.id.slice(-8)}</span>
              </p>
            ) : null}
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-1 py-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading sale…</p>
            ) : error ? (
              <p className="text-sm text-destructive">Could not load this sale.</p>
            ) : !sale ? (
              <p className="text-sm text-muted-foreground">Sale not found.</p>
            ) : (
              <div className="space-y-6">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="mt-0.5 font-medium">{sale.status}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Customer</dt>
                    <dd className="mt-0.5 font-medium">{customerLabel}</dd>
                  </div>
                  {sale.registerSessionId ? (
                    <div>
                      <dt className="text-muted-foreground">Register</dt>
                      <dd className="mt-0.5 font-medium">{registerLabel ?? "Unknown register"}</dd>
                    </div>
                  ) : null}
                  {sale.employeeId ? (
                    <div>
                      <dt className="text-muted-foreground">Sold by</dt>
                      <dd className="mt-0.5 font-medium">{employeeLabel ?? "Unknown employee"}</dd>
                    </div>
                  ) : null}
                </dl>

                <div>
                  <h3 className="mb-2 text-sm font-medium">Line items</h3>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit</TableHead>
                          <TableHead className="text-right">Discount</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sale.lines.map((line, index) => (
                          <TableRow key={`${line.productId ?? line.serviceId ?? line.name}-${index}`}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <EntityImage
                                  src={lineImageUrl(line)}
                                  alt={line.name}
                                  className="size-10 shrink-0 rounded-md border object-cover"
                                />
                                <div className="min-w-0 space-y-1">
                                  <p className="font-medium leading-snug">{line.name}</p>
                                  <Badge variant="secondary" className="text-[10px] font-normal">
                                    {line.lineType}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{line.quantity}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatMoney(line.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {line.discountAmount > 0 ? formatMoney(line.discountAmount) : "—"}
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                              {formatMoney(line.lineTotal)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <dl className="space-y-2 border-t pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="tabular-nums">{formatMoney(sale.subtotal)}</dd>
                  </div>
                  {sale.discountTotal > 0 ? (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Discounts</dt>
                      <dd className="tabular-nums">−{formatMoney(sale.discountTotal)}</dd>
                    </div>
                  ) : null}
                  {sale.taxTotal > 0 ? (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Tax</dt>
                      <dd className="tabular-nums">{formatMoney(sale.taxTotal)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-base font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatMoney(sale.total)}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          <SheetFooter className="border-t">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
