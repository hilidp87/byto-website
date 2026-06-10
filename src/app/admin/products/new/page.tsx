import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="text-sm text-gray-500 hover:text-sky-600"
        >
          ← Back to products
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">Add Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
