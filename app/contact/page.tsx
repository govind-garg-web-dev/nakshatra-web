import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Nakshatra team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink md:text-4xl">Contact us</h1>
      <p className="mt-2 text-ink/60">Questions, feedback, or a bug to report — we read everything.</p>

      <Card className="mt-8 p-6">
        <p className="text-ink/70">
          Email us at{" "}
          <a href="mailto:hello@nakshatra.app" className="text-accent underline">
            hello@nakshatra.app
          </a>{" "}
          and we&apos;ll get back within 2 business days.
        </p>
        {/* TODO(founder): wire this to a real inbox/domain and add a Resend-backed
            contact form once RESEND_API_KEY is configured. */}
      </Card>
    </div>
  );
}
