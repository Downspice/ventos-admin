import type { ReactNode } from "react";
import { BarChart3, Package, ShoppingCart } from "lucide-react";
import { cn } from "@/utils/cn";

type AuthVariant = "business" | "admin";

type AuthLayoutProps = {
  title: string;
  description: string;
  variant?: AuthVariant;
  footer?: ReactNode;
  children: ReactNode;
};

const highlights: Record<
  AuthVariant,
  { icon: typeof ShoppingCart; text: string }[]
> = {
  business: [
    { icon: ShoppingCart, text: "Run POS, sales, and returns in one flow" },
    { icon: Package, text: "Inventory and purchasing stay in sync" },
    { icon: BarChart3, text: "Dashboards that show what matters today" },
  ],
  admin: [
    { icon: BarChart3, text: "Platform-wide visibility and controls" },
    { icon: Package, text: "Support businesses across the network" },
    { icon: ShoppingCart, text: "Secure access for internal operators" },
  ],
};

export function VentosMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-primary/10 p-1.5 shadow-regular-xs border border-primary/20",
        className,
      )}
    >
      <img
        src="/icon-square.png"
        alt="Ventos"
        className="size-full object-contain filter drop-shadow-2xs"
      />
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
    >
      {message}
    </p>
  );
}

export function AuthLayout({
  title,
  description,
  variant = "business",
  footer,
  children,
}: AuthLayoutProps) {
  const items = highlights[variant];
  const brandLine =
    variant === "admin"
      ? "Internal tools for the Ventos platform."
      : "Retail operations, simplified.";

  return (
    <div className="relative min-h-svh overflow-hidden bg-app-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 size-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 size-80 rounded-full bg-sky-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.08),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(202,231,238,0.5),transparent_50%)]"
      />

      <div className="relative z-10 flex min-h-svh flex-col lg:flex-row">
        <aside className="hidden flex-col justify-between border-r border-stroke-soft-200/80 bg-bg-white-0/40 p-10 backdrop-blur-sm lg:flex lg:w-[min(44%,520px)] lg:shrink-0 xl:p-14">
          <div>
            <div className="flex items-center gap-3">
              <VentosMark />
              <div>
                <p className="text-title-h6 text-text-strong-950">Ventos</p>
                <p className="text-paragraph-xs text-text-soft-400">{brandLine}</p>
              </div>
            </div>
            <p className="mt-12 max-w-sm text-title-h4 leading-snug text-text-strong-950">
              {variant === "admin"
                ? "Admin portal"
                : "Everything your store needs to sell and grow."}
            </p>
          </div>
          <ul className="mt-10 space-y-4">
            {items.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-paragraph-sm text-text-sub-600">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" strokeWidth={2} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-12 lg:py-14">
          <div className="w-full max-w-[420px]">
            <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="mb-4 flex items-center gap-3 lg:hidden">
                <VentosMark className="size-10 text-base" />
                <span className="text-title-h6 text-text-strong-950">Ventos</span>
              </div>
              <h1 className="text-title-h5 text-text-strong-950">{title}</h1>
              <p className="mt-2 text-paragraph-sm text-text-soft-400">{description}</p>
            </div>

            <div className="rounded-2xl bg-bg-white-0 p-6 shadow-regular-sm ring-1 ring-inset ring-stroke-soft-200 sm:p-8">
              {children}
            </div>

            {footer ? (
              <div className="mt-6 text-center text-paragraph-sm text-text-soft-400 lg:text-left">
                {footer}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
