import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Configurações" };

type SearchParams = Promise<{ salvo?: string }>;

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);

  return <SettingsForm settings={settings} saved={params.salvo === "1"} />;
}
