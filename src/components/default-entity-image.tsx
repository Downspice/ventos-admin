import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

export const DEFAULT_ENTITY_IMAGE_SRC =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none">
      <rect width="160" height="160" fill="#e2e8f0"/>
      <rect x="24" y="36" width="112" height="88" rx="8" fill="#cbd5e1"/>
      <circle cx="56" cy="68" r="12" fill="#94a3b8"/>
      <path d="M40 108l28-28 20 20 16-16 16 24H40z" fill="#94a3b8"/>
    </svg>`,
  );

type EntityImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

export function EntityImage({ src, alt, className }: EntityImageProps) {
  const [failed, setFailed] = useState(false);
  const trimmed = src?.trim();
  const usePlaceholder = !trimmed || failed;

  useEffect(() => {
    setFailed(false);
  }, [trimmed]);

  return (
    <img
      src={usePlaceholder ? DEFAULT_ENTITY_IMAGE_SRC : trimmed}
      alt={usePlaceholder ? "" : alt}
      className={cn("bg-muted object-cover", className)}
      onError={() => setFailed(true)}
      aria-hidden={usePlaceholder && !alt ? true : undefined}
    />
  );
}
