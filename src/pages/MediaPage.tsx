import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaGridSkeleton } from "@/components/loading-skeletons";
import { PageHeader } from "@/components/PageHeader";
import { FormDrawer, NewButton } from "@/components/FormDrawer";
import { RecordViewDrawer } from "@/components/RecordViewDrawer";
import { TableRowActions } from "@/components/TableRowActions";
import { useAccess } from "@/hooks/useAccess";
import { useListPagination } from "@/hooks/useListPagination";
import { ListPagination } from "@/components/ListPagination";
import { EntityImage } from "@/components/default-entity-image";

const MEDIA = gql`
  query MediaPage($entityType: MediaEntityType, $entityId: ID, $search: String) {
    mediaAssets(entityType: $entityType, entityId: $entityId, search: $search) {
      id
      filename
      url
      mimeType
      sizeBytes
      altText
      entityType
      entityId
      createdAt
    }
    business {
      id
      name
    }
  }
`;

const PRODUCTS = gql`
  query MediaProducts {
    products {
      id
      name
    }
  }
`;

const SERVICES = gql`
  query MediaServices {
    services {
      id
      name
    }
  }
`;

const CUSTOMERS = gql`
  query MediaCustomers {
    customers {
      id
      firstName
      lastName
    }
  }
`;

const EMPLOYEES = gql`
  query MediaEmployees {
    employees {
      id
      firstName
      lastName
    }
  }
`;

const CREATE = gql`
  mutation CreateMedia($input: CreateMediaAssetInput!) {
    createMediaAsset(input: $input) {
      id
    }
  }
`;

const UPDATE = gql`
  mutation UpdateMedia($id: ID!, $input: UpdateMediaAssetInput!) {
    updateMediaAsset(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE = gql`
  mutation DeleteMedia($id: ID!) {
    deleteMediaAsset(id: $id)
  }
`;

const LINK_ENTITY_TYPES = [
  { value: "BUSINESS", label: "Business" },
  { value: "PRODUCT", label: "Product" },
  { value: "SERVICE", label: "Service" },
  { value: "EMPLOYEE", label: "Employee" },
  { value: "CUSTOMER", label: "Customer" },
] as const;

type MediaRow = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  createdAt: string;
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function MediaPage() {
  const { can, business } = useAccess();
  const canManage = can("media.manage");
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editItem, setEditItem] = useState<MediaRow | null>(null);
  const [viewItem, setViewItem] = useState<MediaRow | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [linkType, setLinkType] = useState("");
  const [linkId, setLinkId] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [editLinkType, setEditLinkType] = useState("");
  const [editLinkId, setEditLinkId] = useState("");

  const { data, loading, refetch } = useQuery<{
    mediaAssets?: MediaRow[];
    business?: { id: string; name: string };
  }>(MEDIA, {
    variables: {
      entityType: filterType === "ALL" ? undefined : filterType,
      search: search.trim() || undefined,
    },
  });

  const { data: productsData } = useQuery<{ products?: { id: string; name: string }[] }>(PRODUCTS, {
    skip: !can("inventory.read"),
  });
  const { data: servicesData } = useQuery<{ services?: { id: string; name: string }[] }>(SERVICES, {
    skip: !can("appointments.read"),
  });
  const { data: customersData } = useQuery<{
    customers?: { id: string; firstName: string; lastName: string }[];
  }>(CUSTOMERS, { skip: !can("customers.read") });
  const { data: employeesData } = useQuery<{
    employees?: { id: string; firstName: string; lastName: string }[];
  }>(EMPLOYEES, { skip: !can("employees.read") });

  const mediaPagination = useListPagination(data?.mediaAssets ?? []);

  const [createMedia] = useMutation(CREATE);
  const [updateMedia] = useMutation(UPDATE);
  const [deleteMedia] = useMutation(DELETE);

  const entityOptions = (type: string) => {
    if (type === "BUSINESS" && business) {
      return [{ id: business.id, label: business.name }];
    }
    if (type === "PRODUCT") {
      return (productsData?.products ?? []).map((p) => ({ id: p.id, label: p.name }));
    }
    if (type === "SERVICE") {
      return (servicesData?.services ?? []).map((s) => ({ id: s.id, label: s.name }));
    }
    if (type === "CUSTOMER") {
      return (customersData?.customers ?? []).map((c) => ({
        id: c.id,
        label: `${c.firstName} ${c.lastName}`,
      }));
    }
    if (type === "EMPLOYEE") {
      return (employeesData?.employees ?? []).map((e) => ({
        id: e.id,
        label: `${e.firstName} ${e.lastName}`,
      }));
    }
    return [];
  };

  function resetUpload() {
    setUploadFile(null);
    setAltText("");
    setLinkType("");
    setLinkId("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile) return;
    const dataBase64 = await fileToBase64(uploadFile);
    await createMedia({
      variables: {
        input: {
          filename: uploadFile.name,
          mimeType: uploadFile.type,
          dataBase64,
          altText: altText || undefined,
          entityType: linkType || undefined,
          entityId: linkType ? linkId || entityOptions(linkType)[0]?.id : undefined,
        },
      },
    });
    resetUpload();
    setUploadOpen(false);
    await refetch();
  }

  function openEdit(item: MediaRow) {
    setEditItem(item);
    setEditAlt(item.altText ?? "");
    setEditLinkType(item.entityType ?? "");
    setEditLinkId(item.entityId ?? "");
  }

  async function onEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    const clearEntityLink = !editLinkType;
    await updateMedia({
      variables: {
        id: editItem.id,
        input: clearEntityLink
          ? { altText: editAlt, clearEntityLink: true }
          : {
              altText: editAlt,
              entityType: editLinkType,
              entityId: editLinkId || entityOptions(editLinkType)[0]?.id,
            },
      },
    });
    setEditItem(null);
    await refetch();
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this image? This cannot be undone.")) return;
    await deleteMedia({ variables: { id } });
    await refetch();
  }

  return (
    <div>
      <PageHeader
        title="Media library"
        description="Upload and link images used across products, services, people, and your business profile."
        actions={
          canManage ? <NewButton label="Upload image" onClick={() => setUploadOpen(true)} /> : undefined
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="grid min-w-[160px] gap-1">
          <Label>Entity type</Label>
          <Select value={filterType} onValueChange={(v) => setFilterType(v ?? "ALL")}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              {LINK_ENTITY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid min-w-[200px] flex-1 gap-1">
          <Label>Search</Label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filename or alt text"
          />
        </div>
      </div>

      {loading ? (
        <MediaGridSkeleton count={8} />
      ) : (data?.mediaAssets ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <ImageIcon className="mb-2 size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No images yet. Upload your first asset.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mediaPagination.pageItems.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-lg border bg-card">
              <div className="aspect-square bg-muted">
                <EntityImage
                  src={item.url}
                  alt={item.altText ?? item.filename}
                  className="size-full"
                />
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate text-sm font-medium" title={item.filename}>
                  {item.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(item.sizeBytes)} · {new Date(item.createdAt).toLocaleDateString()}
                </p>
                {item.entityType ? (
                  <Badge variant="outline" className="text-xs">
                    {item.entityType}
                    {item.entityId ? ` · …${item.entityId.slice(-6)}` : ""}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Unlinked
                  </Badge>
                )}
                {canManage ? (
                  <div className="flex justify-end pt-1">
                    <TableRowActions
                      onView={() => setViewItem(item)}
                      onEdit={() => openEdit(item)}
                      onDelete={() => void onDelete(item.id)}
                    />
                  </div>
                ) : (
                  <div className="flex justify-end pt-1">
                    <TableRowActions onView={() => setViewItem(item)} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {!loading && (data?.mediaAssets ?? []).length > 0 ? (
        <ListPagination {...mediaPagination.paginationProps} className="mt-4" />
      ) : null}

      <FormDrawer
        open={uploadOpen}
        onOpenChange={(open) => {
          setUploadOpen(open);
          if (!open) resetUpload();
        }}
        title="Upload image"
        description="JPEG, PNG, WebP, or GIF up to 5 MB."
        submitLabel="Upload"
        onSubmit={onUpload}
      >
        <div className="grid gap-1">
          <Label>Image file</Label>
          <Input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
            onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="grid gap-1">
          <Label>Alt text</Label>
          <Input value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe the image" />
        </div>
        <div className="grid gap-1">
          <Label>Link to entity (optional)</Label>
          <Select value={linkType || "none"} onValueChange={(v) => { setLinkType(v === "none" ? "" : v ?? ""); setLinkId(""); }}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {LINK_ENTITY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {linkType ? (
          <div className="grid gap-1">
            <Label>Entity</Label>
            <Select
              value={linkId || entityOptions(linkType)[0]?.id || null}
              onValueChange={(v) => setLinkId(v ?? "")}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {entityOptions(linkType).map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </FormDrawer>

      <RecordViewDrawer
        open={viewItem != null}
        onOpenChange={(open) => {
          if (!open) setViewItem(null);
        }}
        title="Media asset"
        fields={
          viewItem
            ? [
                { label: "Filename", value: viewItem.filename },
                { label: "Alt text", value: viewItem.altText ?? "" },
                { label: "Size", value: formatBytes(viewItem.sizeBytes) },
                { label: "Type", value: viewItem.mimeType },
                { label: "Linked entity", value: viewItem.entityType ?? "Unlinked" },
                {
                  label: "Entity ID",
                  value: viewItem.entityId ?? "",
                },
                {
                  label: "Uploaded",
                  value: new Date(viewItem.createdAt).toLocaleString(),
                },
              ]
            : []
        }
      />

      <FormDrawer
        open={editItem != null}
        onOpenChange={(open) => {
          if (!open) setEditItem(null);
        }}
        title="Edit image"
        description="Update accessibility text or change which entity uses this image."
        submitLabel="Save changes"
        onSubmit={onEdit}
      >
        <div className="grid gap-1">
          <Label>Alt text</Label>
          <Input value={editAlt} onChange={(e) => setEditAlt(e.target.value)} />
        </div>
        <div className="grid gap-1">
          <Label>Linked entity type</Label>
          <Select value={editLinkType || "none"} onValueChange={(v) => { setEditLinkType(v === "none" ? "" : v ?? ""); setEditLinkId(""); }}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {LINK_ENTITY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {editLinkType ? (
          <div className="grid gap-1">
            <Label>Entity</Label>
            <Select
              value={editLinkId || entityOptions(editLinkType)[0]?.id || null}
              onValueChange={(v) => setEditLinkId(v ?? "")}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {entityOptions(editLinkType).map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </FormDrawer>
    </div>
  );
}
