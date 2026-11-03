import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Painel administrativo",
    template: "%s | Painel Race Day",
  },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-ink">{children}</div>;
}
