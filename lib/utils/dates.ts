export function formatDateForDisplay(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isValidDobString(dob: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dob) && !Number.isNaN(new Date(dob).getTime());
}
