"use client";

import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LoadingPhrases } from "@/components/ui/LoadingPhrases";
import { PaywallModal } from "@/components/PaywallModal";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const LOADING_PHRASES = [
  "Tara is thinking…",
  "Reading your chart…",
  "Checking your Dasha…",
  "Consulting the planets…",
];

export function ChatWindow({ signedIn }: { signedIn: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! Main Tara hoon. Apna sawaal poochiye — career, rishtey, ya kuch bhi jo mann mein hai.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (!signedIn) {
      setMessages((m) => [
        ...m,
        { role: "user", content: input },
        { role: "assistant", content: "Tara se baat karne ke liye pehle sign in karein." },
      ]);
      setInput("");
      return;
    }

    const userMessage = input;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (res.status === 402) {
        setPaywallOpen(true);
        setLoading(false);
        return;
      }

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.error ?? "Kuch gadbad ho gayi, dobara try karein." },
        ]);
        setLoading(false);
        return;
      }

      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { role: "assistant", content: next[next.length - 1].content + chunk };
          return next;
        });
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-2xl border border-black/10 bg-white shadow-sm">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === "user" ? "ml-auto bg-accent text-white" : "bg-black/5 text-ink"
            }`}
          >
            {m.content || (m.role === "assistant" && loading ? (
              <LoadingPhrases phrases={LOADING_PHRASES} active intervalMs={1400} />
            ) : (
              ""
            ))}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-black/10 p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Apna sawaal likhein…"
          className="flex-1 rounded-full border border-black/10 px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
        />
        <Button type="submit" size="sm" disabled={loading}>
          Send
        </Button>
      </form>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        productIds={["questions_20"]}
        title="Aapke free questions khatam ho gaye"
      />
    </div>
  );
}
