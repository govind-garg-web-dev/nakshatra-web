"use client";

import { useEffect, useState } from "react";
import { Spinner } from "./Spinner";

/**
 * Cycles through a list of fun/reassuring phrases while `active` is true.
 * Used anywhere an AI call takes a few seconds, so the wait feels alive
 * instead of "is this stuck?" — which is exactly what leads users to
 * double-click a submit button.
 */
export function LoadingPhrases({
  phrases,
  active,
  intervalMs = 1800,
  className = "",
}: {
  phrases: string[];
  active: boolean;
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, phrases.length, intervalMs]);

  if (!active) return null;

  return (
    <div className={`flex items-center gap-2 text-sm text-ink/60 ${className}`}>
      <Spinner className="text-accent" />
      <span key={index} className="animate-[fadein_0.3s_ease-in]">
        {phrases[index]}
      </span>
    </div>
  );
}
