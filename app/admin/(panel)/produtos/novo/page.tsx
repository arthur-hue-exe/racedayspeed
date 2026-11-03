import { listAdminCategories } from "@/lib/admin-data";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Novo produto" };

export default async function AdminNewProductPage() {
  const categories = await listAdminCategories();

  return (
    <ProductForm
      categories={categories.map((category) => ({ id: category.id, name: category.name }))}
    />
  );
}
