import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, className = "", id, children, ...rest },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink/80">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`rounded-xl border border-black/10 bg-white px-4 py-3 text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 ${className}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
});
