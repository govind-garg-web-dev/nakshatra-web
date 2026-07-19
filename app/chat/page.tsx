import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/db/client";
import { ChatWindow } from "@/components/ChatWindow";

export const metadata: Metadata = {
  title: "Ask Tara — AI Vedic Astrologer",
  description: "Chat with Tara, Nakshatra's AI astrologer — specific answers citing your actual chart and Dasha.",
  alternates: { canonical: "/chat" },
};

export default async function ChatPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink md:text-4xl">Ask Tara</h1>
      <p className="mt-2 text-ink/60">
        3 free questions a day. Tara always cites your actual planets, houses, and Dasha — never generic advice.
      </p>
      {!user && (
        <p className="mt-2 text-sm text-accent">
          <Link href="/login" className="underline">
            Sign in
          </Link>{" "}
          to save your chart and start chatting.
        </p>
      )}
      <div className="mt-8">
        <ChatWindow signedIn={Boolean(user)} />
      </div>
    </div>
  );
}
