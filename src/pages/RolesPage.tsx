import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { ROLES } from "../lib/apollo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
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

const CATALOG = gql`
  query PermCatalog {
    permissionsCatalog
  }
`;

const CREATE = gql`
  mutation CreateRole($input: RoleInput!) {
    createRole(input: $input) {
      id
      name
    }
  }
`;

const UPDATE = gql`
  mutation UpdateRole($id: ID!, $input: RoleInput!) {
    updateRole(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE = gql`
  mutation DeleteRole($id: ID!) {
    deleteRole(id: $id)
  }
`;

type RoleRow = {
  id: string;
  name: string;
  permissions: string[];
  isSystem: boolean;
};

export default function RolesPage() {
  const { data, loading, refetch } = useQuery<{ roles?: RoleRow[] }>(ROLES);
  const { data: catData } = useQuery<{ permissionsCatalog?: string[] }>(CATALOG);
  const [createRole] = useMutation(CREATE);
  const [updateRole] = useMutation(UPDATE);
  const [deleteRole] = useMutation(DELETE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRole, setEditRole] = useState<RoleRow | null>(null);
  const [viewRole, setViewRole] = useState<RoleRow | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>(["sales.read"]);
  const rolesPagination = useListPagination(data?.roles ?? []);

  function openEdit(r: RoleRow) {
    if (r.isSystem) return;
    setEditRole(r);
    setName(r.name);
    setDescription("");
    setSelected([...r.permissions]);
    setDrawerOpen(true);
  }

  function openCreate() {
    setEditRole(null);
    setName("");
    setDescription("");
    setSelected(["sales.read"]);
    setDrawerOpen(true);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const input = { name, description: description || undefined, permissions: selected };
    if (editRole) {
      await updateRole({ variables: { id: editRole.id, input } });
    } else {
      await createRole({ variables: { input } });
    }
    setEditRole(null);
    setName("");
    setDescription("");
    setSelected(["sales.read"]);
    setDrawerOpen(false);
    await refetch();
  }

  function togglePerm(p: string) {
    setSelected((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  return (
    <div>
      <PageHeader
        title="Roles & permissions"
        description="Custom roles and permission sets."
        actions={<NewButton label="New role" onClick={openCreate} />}
      />
      <FormDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setEditRole(null);
        }}
        title={editRole ? "Edit role" : "New role"}
        description="Define a role name and choose permissions."
        submitLabel={editRole ? "Save changes" : "Create role"}
        onSubmit={onSave}
      >
        <div className="grid gap-1">
          <Label>Role name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional summary for this role"
          />
        </div>
        <div className="grid gap-2">
          <Label>Permissions</Label>
          <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto rounded-md border p-3">
            {(catData?.permissionsCatalog ?? []).map((p) => (
              <Toggle
                key={p}
                variant="outline"
                size="sm"
                pressed={selected.includes(p)}
                onPressedChange={() => togglePerm(p)}
                className="text-xs"
                type="button"
              >
                {p}
              </Toggle>
            ))}
          </div>
        </div>
      </FormDrawer>
      <RecordViewDrawer
        open={viewRole != null}
        onOpenChange={(open) => {
          if (!open) setViewRole(null);
        }}
        title="Role"
        fields={
          viewRole
            ? [
                { label: "Name", value: viewRole.name },
                { label: "System role", value: viewRole.isSystem ? "Yes" : "No" },
                { label: "Permissions", value: viewRole.permissions.join(", ") },
              ]
            : []
        }
      />
      <PaginatedSection
        fill="page"
        footer={!loading ? <ListPagination {...rolesPagination.paginationProps} /> : null}
      >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead className="w-[1%]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRowsSkeleton rows={5} cols={3} />
          ) : (
            rolesPagination.pageItems.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  {r.name}
                  {r.isSystem ? " (system)" : ""}
                </TableCell>
                <TableCell className="max-w-md truncate text-muted-foreground">
                  {r.permissions.join(", ")}
                </TableCell>
                <TableCell>
                  <TableRowActions
                    onView={() => setViewRole(r)}
                    onEdit={r.isSystem ? undefined : () => openEdit(r)}
                    onDelete={
                      r.isSystem
                        ? undefined
                        : () => void deleteRole({ variables: { id: r.id } }).then(() => refetch())
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
