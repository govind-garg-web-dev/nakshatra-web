import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Nakshatra collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink md:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink/40">Last updated: {new Date().toLocaleDateString("en-IN")}</p>

      <div className="prose-ink mt-6 flex flex-col gap-5 text-ink/70 leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-ink">What we collect</h2>
          <p className="mt-2">
            Your name, birth date/time/place (needed to compute your chart), account email, and your questions to
            Tara if you use the AI chat. We do not collect more than what each feature needs.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink">How we use it</h2>
          <p className="mt-2">
            Solely to generate your charts, readings, and reports, and to remember your saved charts and
            conversation history if you&apos;re signed in. We never sell your data to third parties.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink">Third parties</h2>
          <p className="mt-2">
            We use Anthropic (Claude) to generate readings, Razorpay to process payments, and Supabase to store your
            account data. Each processes data only as needed to provide their service to us.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink">Your rights</h2>
          <p className="mt-2">
            You can delete your account and all associated data at any time from your profile, in two taps. Email{" "}
            <a href="mailto:hello@nakshatra.app" className="text-accent underline">
              hello@nakshatra.app
            </a>{" "}
            if you need help.
          </p>
        </section>
      </div>
    </div>
  );
}
