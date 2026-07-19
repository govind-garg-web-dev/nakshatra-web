import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/kundli", label: "Free Kundli" },
      { href: "/compatibility", label: "Compatibility" },
      { href: "/chat", label: "Ask Tara" },
      { href: "/timing", label: "Shubh Muhurat" },
      { href: "/career-timing", label: "Career Timing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/disclaimer", label: "Disclaimer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="night-gradient star-field mt-auto text-cream/80">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-2xl text-cream">
              Nakshatra<span className="text-accent">.</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-cream/60">
              Ancient wisdom, modern decisions. Vedic astrology and psychology,
              made for Gen Z and millennials — made in Bharat.
            </p>
            {/* TODO(founder): point this at the real WhatsApp bot number/link. */}
            <a
              href="https://wa.me/910000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream/10 px-4 py-2 text-sm text-cream hover:bg-cream/20"
            >
              💬 Continue on WhatsApp
            </a>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-gold">{col.title}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-cream/70 hover:text-cream">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-cream/10 pt-6 text-xs text-cream/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Nakshatra. All rights reserved.</p>
          <p className="max-w-2xl">
            Nakshatra offers astrology for guidance and self-reflection, not
            deterministic fact. We do not provide medical, legal, or financial
            advice or predictions of harm — please consult a qualified
            professional for those matters.
          </p>
        </div>
      </div>
    </footer>
  );
}
