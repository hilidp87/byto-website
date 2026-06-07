import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 font-serif text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-ink-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/" className="mt-6 inline-block">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
