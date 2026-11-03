import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  const rows = await query<{ count: number }>(
    "select count(*)::int as count from orders where status in ('awaiting_whatsapp','awaiting_confirmation')",
  );

  return (
    <AdminShell admin={admin} pendingOrders={Number(rows[0]?.count ?? 0)}>
      {children}
    </AdminShell>
  );
}
