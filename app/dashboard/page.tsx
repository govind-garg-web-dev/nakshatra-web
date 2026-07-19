import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/db/client";
import { getProfile } from "@/lib/db/users";
import { listCharts } from "@/lib/db/charts";
import { getBalance } from "@/lib/db/credits";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDateForDisplay } from "@/lib/utils/dates";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const [profile, charts, credits] = await Promise.all([
    getProfile(user.id),
    listCharts(user.id),
    getBalance(user.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Namaste, {profile?.name ?? "there"}</h1>
        <form action="/auth/signout" method="post">
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <p className="text-xs uppercase tracking-wide text-ink/40">Tara questions left today</p>
          <p className="font-display mt-1 text-3xl text-ink">{credits}</p>
          <Button href="/chat" size="sm" className="mt-4">
            Ask Tara
          </Button>
        </Card>
        <Card className="p-6">
          <p className="text-xs uppercase tracking-wide text-ink/40">Saved charts</p>
          <p className="font-display mt-1 text-3xl text-ink">{charts.length}</p>
          <Button href="/kundli" size="sm" variant="secondary" className="mt-4">
            Add a chart
          </Button>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl text-ink mb-4">Your saved charts</h2>
        {charts.length === 0 ? (
          <p className="text-ink/50">
            No saved charts yet.{" "}
            <Link href="/kundli" className="text-accent underline">
              Create one
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {charts.map((c) => (
              <Card key={c.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-ink">{c.label}</p>
                  <p className="text-sm text-ink/50">
                    {c.dob} {c.tob ? `· ${c.tob}` : ""} · {c.pob}
                  </p>
                </div>
                <p className="text-xs text-ink/40">{formatDateForDisplay(c.created_at)}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
