import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "sale" | "primary" | "muted";
  className?: string;
}

const styles = {
  default: "bg-ink text-white",
  sale: "bg-sale text-white",
  primary: "bg-primary text-white",
  muted: "bg-surface text-ink-muted border border-line",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
