"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#0F172A",
            color: "#fff",
            borderRadius: "9999px",
            fontSize: "14px",
          },
        }}
      />
    </SessionProvider>
  );
}
