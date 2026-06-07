import type { Metadata } from "next";
import Image from "next/image";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your LOKYO account and start dressing the moment.",
};

export default function RegisterPage() {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80"
          alt="LOKYO fashion"
          fill
          className="object-cover"
        />
      </div>
      <div className="flex items-center justify-center p-8">
        <RegisterForm />
      </div>
    </div>
  );
}
