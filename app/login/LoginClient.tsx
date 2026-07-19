"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/db/browserClient";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type PhoneStep = "enter_phone" | "enter_code";

export function LoginClient() {
  const supabase = createBrowserSupabaseClient();

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("enter_phone");

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEmail(e: FormEvent) {
    e.preventDefault();
    setLoading("email");
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(null);
    if (error) setError(error.message);
    else setEmailSent(true);
  }

  async function handleGoogle() {
    setLoading("google");
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  }

  async function handlePhoneSend(e: FormEvent) {
    e.preventDefault();
    setLoading("phone");
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(null);
    if (error) setError(error.message);
    else setPhoneStep("enter_code");
  }

  async function handlePhoneVerify(e: FormEvent) {
    e.preventDefault();
    setLoading("phone-verify");
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
    setLoading(null);
    if (error) setError(error.message);
    else window.location.href = "/dashboard";
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <Button onClick={handleGoogle} disabled={loading === "google"} variant="secondary" className="w-full">
          Continue with Google
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg text-ink mb-4">Continue with email</h2>
        {emailSent ? (
          <p className="text-sm text-ink/60">Check your inbox — we&apos;ve sent a magic sign-in link to {email}.</p>
        ) : (
          <form onSubmit={handleEmail} className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading === "email"}>
              Send magic link
            </Button>
          </form>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg text-ink mb-4">Continue with phone (OTP)</h2>
        {phoneStep === "enter_phone" ? (
          <form onSubmit={handlePhoneSend} className="flex flex-col gap-3">
            <Input
              type="tel"
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading === "phone"}>
              Send OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePhoneVerify} className="flex flex-col gap-3">
            <Input
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading === "phone-verify"}>
              Verify &amp; sign in
            </Button>
          </form>
        )}
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
