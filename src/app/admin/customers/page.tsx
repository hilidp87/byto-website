"use client";

import { useEffect, useState } from "react";
import CustomersTable, { AdminCustomer } from "@/components/admin/CustomersTable";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load customers");
        return r.json();
      })
      .then(setCustomers)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!customers && !error ? (
        <div className="h-64 animate-pulse rounded-xl border border-gray-200 bg-white" />
      ) : customers ? (
        <CustomersTable customers={customers} />
      ) : null}
    </div>
  );
}
