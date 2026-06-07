"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Registration failed");
      }
      await signIn("credentials", { email, password, redirect: false });
      toast.success("Account created");
      router.push("/profile");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-3xl font-bold">Create account</h1>
      <p className="mt-1 text-sm text-ink-muted">Join LOKYO. Dress the Moment.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="text"
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 w-full rounded-lg border border-line px-4 text-sm outline-none focus:border-primary"
        />
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
          minLength={6}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 w-full rounded-lg border border-line px-4 text-sm outline-none focus:border-primary"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create Account"}
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
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
