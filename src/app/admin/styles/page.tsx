import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import StylesEditor from "./StylesEditor";

export const dynamic = "force-dynamic";

export default async function StylesPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Styles Editor</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload a garment, position it over the model, set the top/bottom split, then save.
        </p>
      </div>
      <StylesEditor />
    </div>
  );
}
