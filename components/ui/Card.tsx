import { HTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
  ...rest
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-black/5 bg-white shadow-sm shadow-black/5 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
