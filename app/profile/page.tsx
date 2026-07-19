import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/db/client";
import { getProfile } from "@/lib/db/users";
import { listCharts } from "@/lib/db/charts";
import { getBalance } from "@/lib/db/credits";
import { getRecentMessages } from "@/lib/db/conversations";
import { listReportsForUser } from "@/lib/db/reports";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDateForDisplay } from "@/lib/utils/dates";

export const metadata: Metadata = {
  title: "Your Profile",
  robots: { index: false },
};

const TAG_LABELS: Record<string, string> = {
  job_seeker: "Career",
  relationship_active: "Relationship",
  marriage_planning: "Marriage",
  health_concern: "Health",
  foreign_travel: "Foreign travel",
  financial_concern: "Finances",
  student: "Studies",
};

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profile");

  const [profile, charts, credits, recentMessages, reports] = await Promise.all([
    getProfile(user.id),
    listCharts(user.id),
    getBalance(user.id),
    getRecentMessages(user.id, 6),
    listReportsForUser(user.id),
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
      <p className="mt-1 text-sm text-ink/50">{user.email ?? user.phone}</p>

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

      {profile?.tags && profile.tags.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl text-ink mb-3">What Tara knows about you</h2>
          <div className="flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent"
              >
                {TAG_LABELS[tag] ?? tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-display text-xl text-ink mb-4">Your saved charts</h2>
        {charts.length === 0 ? (
          <p className="text-ink/50">
            No saved charts yet — every Kundli you generate while signed in is saved here automatically.{" "}
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

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink mb-4">Recent conversation with Tara</h2>
          <Link href="/chat" className="text-sm text-accent underline">
            Continue chatting
          </Link>
        </div>
        {recentMessages.length === 0 ? (
          <p className="text-ink/50">
            No conversation yet.{" "}
            <Link href="/chat" className="text-accent underline">
              Ask Tara something
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentMessages.map((m) => (
              <Card
                key={m.id}
                className={`p-4 ${m.role === "user" ? "bg-black/[0.02]" : ""}`}
              >
                <p className="text-xs uppercase tracking-wide text-ink/40">
                  {m.role === "user" ? "You" : "Tara"} · {formatDateForDisplay(m.created_at)}
                </p>
                <p className="mt-1 text-sm text-ink/80 line-clamp-3">{m.content}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {reports.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-ink mb-4">Your reports</h2>
          <div className="flex flex-col gap-3">
            {reports.map((r) => (
              <Card key={r.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium capitalize text-ink">{r.type.replace(/_/g, " ")}</p>
                  <p className="text-sm text-ink/50">{formatDateForDisplay(r.created_at)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
