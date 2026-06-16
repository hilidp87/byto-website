import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import AdminEditor from "@/components/admin/outfit-config/AdminEditor";

export const dynamic = "force-dynamic";

export default async function OutfitConfigPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Try-On Editor</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload transparent-background PNGs for shirt and pants, drag to position them over the
          model, then save. The public animation will use these exact coordinates.
        </p>
      </div>
      <AdminEditor />
    </div>
  );
}
