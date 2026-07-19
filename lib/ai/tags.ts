// Life-context tags detected from what a user asks Tara. Persisted per user
// so future conversations carry that context ("Known concerns: job_seeker")
// without the user having to repeat themselves.

const TAG_PATTERNS: { pattern: RegExp; tag: string }[] = [
  { pattern: /\b(job|naukri|career|interview|kaam)\b/i, tag: "job_seeker" },
  { pattern: /\b(girlfriend|boyfriend|relation|love|pyaar)\b/i, tag: "relationship_active" },
  { pattern: /\b(shaadi|wedding|marriage|shadi)\b/i, tag: "marriage_planning" },
  { pattern: /\b(health|tabiyat|bimari|doctor)\b/i, tag: "health_concern" },
  { pattern: /\b(abroad|foreign|visa|uk|usa|canada)\b/i, tag: "foreign_travel" },
  { pattern: /\b(paise|money|loan|paisa|financial)\b/i, tag: "financial_concern" },
  { pattern: /\b(exam|study|padhai|college|board)\b/i, tag: "student" },
];

export function detectTags(message: string): string[] {
  return TAG_PATTERNS.filter(({ pattern }) => pattern.test(message)).map(({ tag }) => tag);
}
