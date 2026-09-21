/** Preset avatar ids — images live in `public/avatars/` (synced from `shared/avatar-presets`). */
export const AVATAR_PRESET_IDS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
] as const;

export type AvatarPresetId = (typeof AVATAR_PRESET_IDS)[number];

export function avatarPresetPath(id: AvatarPresetId): string {
  return id === "11" ? "/avatars/11.jpg" : `/avatars/${id}.png`;
}

export function parseAvatarPresetId(url: string | null | undefined): AvatarPresetId | null {
  if (!url?.trim()) return null;
  const m = url.trim().match(/^\/avatars\/(\d{2})\.(png|jpg)$/);
  if (!m) return null;
  const id = m[1] as AvatarPresetId;
  return AVATAR_PRESET_IDS.includes(id) ? id : null;
}

export function resolveAvatarSrc(avatarUrl: string | null | undefined): string | undefined {
  if (!avatarUrl?.trim()) return undefined;
  const v = avatarUrl.trim();
  if (v.startsWith("/avatars/")) return v;
  if (v.startsWith("https://")) return v;
  return undefined;
}

export function avatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
