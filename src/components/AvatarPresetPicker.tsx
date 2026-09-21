import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils/cn";
import {
  AVATAR_PRESET_IDS,
  avatarInitials,
  avatarPresetPath,
  parseAvatarPresetId,
  resolveAvatarSrc,
  type AvatarPresetId,
} from "@/lib/avatar-presets";

export function AvatarPresetPicker({
  value,
  onChange,
  displayName = "User",
  className,
}: {
  value: string | null | undefined;
  onChange: (avatarUrl: string | undefined) => void;
  displayName?: string;
  className?: string;
}) {
  const selectedPreset = parseAvatarPresetId(value);
  const previewSrc = resolveAvatarSrc(value);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Avatar className="size-14 rounded-lg">
          {previewSrc ? <AvatarImage src={previewSrc} alt={displayName} /> : null}
          <AvatarFallback className="rounded-lg">{avatarInitials(displayName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 text-sm">
          <p className="font-medium">Profile photo</p>
          <p className="text-muted-foreground">Pick an avatar below, or leave blank for initials.</p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {AVATAR_PRESET_IDS.map((id) => {
          const path = avatarPresetPath(id);
          const selected = selectedPreset === id;
          return (
            <button
              key={id}
              type="button"
              aria-label={`Avatar ${id}`}
              aria-pressed={selected}
              onClick={() => onChange(selected ? undefined : path)}
              className={cn(
                "overflow-hidden rounded-lg ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-muted-foreground/40",
              )}
            >
              <img src={path} alt="" className="aspect-square size-full object-cover" loading="lazy" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type { AvatarPresetId };
