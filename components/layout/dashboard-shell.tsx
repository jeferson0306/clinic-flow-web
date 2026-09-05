"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { Role } from "@/lib/types";

/**
 * Owns the mobile drawer's open/closed state so Topbar's hamburger button
 * and Sidebar's off-canvas panel — siblings, not parent/child — can share
 * it. Below md, Sidebar renders as a fixed overlay instead of taking up
 * permanent flex width; see its own component for the responsive classes.
 */
export function DashboardShell({
  username,
  role,
  children,
}: {
  username: string;
  role: Role;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh bg-[var(--bg-body)] overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} role={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar username={username} role={role} onOpenMobileNav={() => setMobileOpen(true)} />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
