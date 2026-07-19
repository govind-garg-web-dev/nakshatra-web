import type { Metadata } from "next";
import { LoginClient } from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-5 py-12">
      <h1 className="font-display text-3xl text-ink">Sign in</h1>
      <p className="mt-2 text-ink/60">Save your charts, chat with Tara, and buy reports.</p>
      <div className="mt-8">
        <LoginClient />
      </div>
    </div>
  );
}
