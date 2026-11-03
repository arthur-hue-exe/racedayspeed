import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/products";

export async function GET(request: Request) {
  const query = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 80);
  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }
  const products = await getCatalog({ search: query, limit: 8 });
  return NextResponse.json({
    results: products.map((product) => ({
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      image: product.images[0]?.url ?? "",
      categoryName: product.categoryName,
    })),
  });
}
