import Link from "next/link";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/products" },
      { label: "Outfits", href: "/outfits" },
      { label: "New Arrivals", href: "/products" },
      { label: "Sale", href: "/products" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Sustainability", href: "/#about" },
      { label: "Careers", href: "/#about" },
      { label: "Press", href: "/#about" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/#about" },
      { label: "Shipping", href: "/#about" },
      { label: "Returns", href: "/#about" },
      { label: "FAQ", href: "/#about" },
    ],
  },
];

export function Footer() {
  return (
    <footer id="about" className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="max-w-md">
            <h2 className="font-serif text-3xl font-bold">LOKYO</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Dress the Moment. Minimalist luxury fashion and curated outfits,
              designed for the way you live.
            </p>
            <form className="mt-6 flex max-w-sm gap-2">
              <input
                type="email"
                required
                placeholder="Your email"
                aria-label="Email for newsletter"
                className="h-11 flex-1 rounded-full border border-line bg-white px-4 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="h-11 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-sky-600"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-sans text-sm font-semibold text-ink">{col.title}</h3>
                <ul className="mt-4 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-muted hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-sm text-ink-muted sm:flex-row">
          <p>© {new Date().getFullYear()} LOKYO. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" aria-label="Instagram" className="hover:text-primary">Instagram</a>
            <a href="#" aria-label="Twitter" className="hover:text-primary">Twitter</a>
            <a href="#" aria-label="Pinterest" className="hover:text-primary">Pinterest</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
