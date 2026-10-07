import { Outlet } from "react-router";

/** App frame: mobile-first gutter (space-4) and a 1240px desktop container. */
export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-[1240px] px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
