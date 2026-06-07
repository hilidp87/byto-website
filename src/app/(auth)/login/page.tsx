import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your LOKYO account.",
};

export default function LoginPage() {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <LoginForm />
      </div>
      <div className="relative hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1200&q=80"
          alt="LOKYO fashion"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
