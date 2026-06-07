"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password");
    } else {
      toast.success("Welcome back");
      router.push("/profile");
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-3xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-muted">Sign in to your LOKYO account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full rounded-lg border border-line px-4 text-sm outline-none focus:border-primary"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 w-full rounded-lg border border-line px-4 text-sm outline-none focus:border-primary"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-ink-muted">
        <span className="h-px flex-1 bg-line" />
        OR
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/profile" })}
      >
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-ink-muted">
        New to LOKYO?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
