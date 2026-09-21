import { useMutation, useQuery } from "@apollo/client/react";
import { EMPLOYEES, ROLES } from "../lib/apollo";
import { gql } from "@apollo/client";
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
import { TableRowsSkeleton } from "@/components/loading-skeletons";
import { PageHeader } from "../components/PageHeader";
import { FormDrawer, NewButton } from "../components/FormDrawer";
import { RecordViewDrawer } from "../components/RecordViewDrawer";
import { TableRowActions } from "../components/TableRowActions";
import { useListPagination } from "@/hooks/useListPagination";
import { ListPagination } from "@/components/ListPagination";
import { PaginatedSection } from "@/components/PaginatedSection";
import { useState } from "react";
import { AvatarPresetPicker } from "@/components/AvatarPresetPicker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarInitials, resolveAvatarSrc } from "@/lib/avatar-presets";

const CREATE = gql`
  mutation CreateEmployee($input: EmployeeInput!) {
    createEmployee(input: $input) {
      id
    }
  }
`;

const UPDATE = gql`
  mutation UpdateEmployee($id: ID!, $input: EmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

type EmployeeRow = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  roleIds: string[];
  isActive: boolean;
  avatarUrl?: string | null;
};

const emptyForm = () => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  roleId: "",
  avatarUrl: undefined as string | undefined,
});

export default function EmployeesPage() {
  const { data, loading, refetch } = useQuery<{ employees?: EmployeeRow[] }>(EMPLOYEES);
  const { data: rolesData } = useQuery<{ roles?: { id: string; name: string }[] }>(ROLES);
  const [createEmployee] = useMutation(CREATE);
  const [updateEmployee] = useMutation(UPDATE);
  const [deleteEmployee] = useMutation(DELETE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<EmployeeRow | null>(null);
  const [viewEmployee, setViewEmployee] = useState<EmployeeRow | null>(null);
  const [form, setForm] = useState(emptyForm);

  const roleName = (id: string) => rolesData?.roles?.find((r) => r.id === id)?.name ?? id.slice(-6);
  const employeesPagination = useListPagination(data?.employees ?? []);

  function employeeInput() {
    const rid = form.roleId || rolesData?.roles?.[0]?.id;
    if (!rid) throw new Error("Role required");
    return {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || undefined,
      phone: form.phone || undefined,
      roleIds: [rid],
      avatarUrl: form.avatarUrl ?? "",
    };
  }

  function openEdit(e: EmployeeRow) {
    setEditEmployee(e);
    setForm({
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email ?? "",
      phone: e.phone ?? "",
      roleId: e.roleIds[0] ?? "",
      avatarUrl: e.avatarUrl ?? undefined,
    });
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await createEmployee({ variables: { input: employeeInput() } });
    setForm(emptyForm());
    setDrawerOpen(false);
    await refetch();
  }

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editEmployee) return;
    await updateEmployee({
      variables: { id: editEmployee.id, input: employeeInput() },
    });
    setEditEmployee(null);
    setForm(emptyForm());
    await refetch();
  }

  const defaultRoleId = form.roleId || rolesData?.roles?.[0]?.id || "";

  const formFields = (
    <>
      <AvatarPresetPicker
        value={form.avatarUrl}
        onChange={(avatarUrl) => setForm((f) => ({ ...f, avatarUrl }))}
        displayName={`${form.firstName} ${form.lastName}`.trim() || "Employee"}
      />
      <div className="grid gap-1">
        <Label>First name</Label>
        <Input
          value={form.firstName}
          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          required
        />
      </div>
      <div className="grid gap-1">
        <Label>Last name</Label>
        <Input
          value={form.lastName}
          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
          required
        />
      </div>
      <div className="grid gap-1">
        <Label>Email</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </div>
      <div className="grid gap-1">
        <Label>Phone</Label>
        <Input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
      </div>
      <div className="grid gap-1">
        <Label>Role</Label>
        <Select
          value={defaultRoleId || null}
          onValueChange={(value) => setForm((f) => ({ ...f, roleId: value ?? "" }))}
        >
          <SelectTrigger className="h-10 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(rolesData?.roles ?? []).map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Staff records and role assignment."
        actions={<NewButton label="New employee" onClick={() => setDrawerOpen(true)} />}
      />
      <FormDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setForm(emptyForm());
        }}
        title="New employee"
        description="Add a staff member and assign their role."
        submitLabel="Create employee"
        onSubmit={onCreate}
      >
        {formFields}
      </FormDrawer>
      <FormDrawer
        open={editEmployee != null}
        onOpenChange={(open) => {
          if (!open) {
            setEditEmployee(null);
            setForm(emptyForm());
          }
        }}
        title="Edit employee"
        description="Update staff details and role."
        submitLabel="Save changes"
        onSubmit={onUpdate}
      >
        {formFields}
      </FormDrawer>
      <RecordViewDrawer
        open={viewEmployee != null}
        onOpenChange={(open) => {
          if (!open) setViewEmployee(null);
        }}
        title="Employee"
        fields={
          viewEmployee
            ? [
                { label: "Name", value: `${viewEmployee.firstName} ${viewEmployee.lastName}` },
                { label: "Email", value: viewEmployee.email ?? "" },
                { label: "Phone", value: viewEmployee.phone ?? "" },
                {
                  label: "Role",
                  value: viewEmployee.roleIds.map(roleName).join(", "),
                },
                { label: "Status", value: viewEmployee.isActive ? "Active" : "Inactive" },
              ]
            : []
        }
      />
      <PaginatedSection
        fill="page"
        footer={
          !loading ? <ListPagination {...employeesPagination.paginationProps} /> : null
        }
      >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[1%]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRowsSkeleton rows={5} cols={4} />
          ) : (
            employeesPagination.pageItems.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8 rounded-lg">
                      {resolveAvatarSrc(e.avatarUrl) ? (
                        <AvatarImage src={resolveAvatarSrc(e.avatarUrl)} alt="" />
                      ) : null}
                      <AvatarFallback className="rounded-lg text-xs">
                        {avatarInitials(`${e.firstName} ${e.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {e.firstName} {e.lastName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{e.email ?? "—"}</TableCell>
                <TableCell>{e.isActive ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  <TableRowActions
                    onView={() => setViewEmployee(e)}
                    onEdit={() => openEdit(e)}
                    onDelete={() =>
                      void deleteEmployee({ variables: { id: e.id } }).then(() => refetch())
                    }
                  />
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
