import * as React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationModal } from "@/components/reusable/modals/delete-confirmation-modal";

type TableRowActionsProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void | Promise<void>;
  deleteTitle?: string;
  deleteConfirmMessage?: string;
  itemName?: string;
  itemDescription?: string;
};

export function TableRowActions({
  onView,
  onEdit,
  onDelete,
  deleteTitle = "Delete item",
  deleteConfirmMessage = "Are you sure you want to delete this item? It will be archived and recorded in the audit log.",
  itemName,
  itemDescription,
}: TableRowActionsProps) {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!onView && !onEdit && !onDelete) return null;

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete();
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex justify-end gap-0.5">
        {onView ? (
          <Button type="button" variant="outline" size="icon-sm" onClick={onView} aria-label="View">
            <Eye className="size-4" />
          </Button>
        ) : null}
        {onEdit ? (
          <Button type="button" variant="outline" size="icon-sm" onClick={onEdit} aria-label="Edit">
            <Pencil className="size-4" />
          </Button>
        ) : null}
        {onDelete ? (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteModalOpen(true)}
            aria-label="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        ) : null}
      </div>

      {onDelete && (
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title={deleteTitle}
          description={deleteConfirmMessage}
          item={
            itemName
              ? {
                  name: itemName,
                  description: itemDescription,
                }
              : undefined
          }
          isLoading={isDeleting}
          onDelete={handleDeleteConfirm}
        />
      )}
    </>
  );
}
