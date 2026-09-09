import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PortalHeader } from "@/components/layout/portal-header";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  // proxy.ts already gates /portal on session presence and role, but every
  // route group in this app checks again at the layout level (see
  // app/(dashboard)/layout.tsx) — the redirect above is UX, this is the
  // actual boundary a page's own data fetch runs behind.
  if (!session || session.role !== "PACIENTE") redirect("/login");

  return (
    <div className="min-h-dvh bg-[var(--bg-body)]">
      <PortalHeader email={session.email} />
      <div className="max-w-4xl mx-auto">{children}</div>
    </div>
  );
}
