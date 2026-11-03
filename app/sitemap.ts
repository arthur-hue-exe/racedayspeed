import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const products = await getCatalog().catch(() => []);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/catalogo`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/catalogo?novidades=1`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/catalogo?categoria=camisetas`, changeFrequency: "weekly", priority: 0.7 },
    {
      url: `${base}/catalogo?categoria=jaquetas-e-equipamentos`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/catalogo?categoria=colecionaveis`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    { url: `${base}/sobre`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/politicas/privacidade`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politicas/termos-de-uso`, changeFrequency: "yearly", priority: 0.3 },
    {
      url: `${base}/politicas/trocas-e-devolucoes`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/produto/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
