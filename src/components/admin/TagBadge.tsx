const TAG_STYLES: Record<string, string> = {
  New: "bg-sky-100 text-sky-700 border-sky-200",
  "Best Seller": "bg-amber-100 text-amber-700 border-amber-200",
  "Limited Edition": "bg-purple-100 text-purple-700 border-purple-200",
};

export default function TagBadge({ tag }: { tag: string }) {
  const cls = TAG_STYLES[tag] || "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {tag}
    </span>
  );
}
