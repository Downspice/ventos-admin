import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useState } from "react";
import { AvatarPresetPicker } from "@/components/AvatarPresetPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MY_ACCESS } from "../lib/apollo";

const UPDATE_MY_PROFILE = gql`
  mutation UpdateMyProfile($input: MyProfileInput!) {
    updateMyProfile(input: $input) {
      id
      name
      avatarUrl
    }
  }
`;

export function AccountProfileDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: string; email: string; name?: string | null; avatarUrl?: string | null };
}) {
  const [name, setName] = useState(user.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user.avatarUrl ?? undefined);
  const [save, { loading }] = useMutation(UPDATE_MY_PROFILE, {
    refetchQueries: [{ query: MY_ACCESS }],
  });

  async function onSave() {
    await save({
      variables: {
        input: {
          name: name.trim() || undefined,
          avatarUrl: avatarUrl ?? "",
        },
      },
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>Update how you appear in Control Hub.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="profile-name">Display name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={user.email.split("@")[0]}
            />
          </div>
          <AvatarPresetPicker
            value={avatarUrl}
            onChange={setAvatarUrl}
            displayName={name.trim() || user.email}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void onSave()} disabled={loading}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
