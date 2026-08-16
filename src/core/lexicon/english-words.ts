/**
 * english-words v1 — curated open-class English root wordlist, used at the
 * Tier-2 root-lookup step once an affix has been tentatively stripped, and
 * for whole-word ENG lookup (row 19: "ATM" — a class noun, ENG not NE).
 *
 * This list is DELIBERATELY small and curated to what the worked examples
 * (docs/batch2-linguistic-spec.md Section 2.3) and this project's own
 * composed sample texts (eval/v0-set/) need. It is not, and does not claim
 * to be, an exhaustive English wordlist — any root outside it falls to
 * AMBIGUOUS/LOW confidence by design (Section 5.1, Section 6's disclosed
 * "reasoning against": "a real, known recall gap on any English root absent
 * from the maintained wordlist"). See docs/limitations for the fixture that
 * demonstrates this live.
 */
export const ENGLISH_ROOTS: ReadonlySet<string> = new Set([
  "book",
  "explain",
  "research",
  "order",
  "food",
  "download",
  "submit",
  "post",
  "message",
  "share",
  "text",
  "call",
  "chat",
  "reply",
  "check",
  "save",
  "load",
  "print",
  "click",
  "type",
  "send",
  "log",
  "grab", // common Taglish loanword (ride-hailing sense), lowercase and not brand-referring — contrast against gazetteer.ts's capitalized "Grab" (NE)
  "atm",
  "internet",
  "computer",
  "phone",
  "email",
  "meeting",
  "deadline",
  "project",
  "screenshot",
  "wifi",
  "late",
  "trip",
  "boss",
  "customer",
  "delivery",
  "meet",
  "number",
  "forum",
  "fix",
  "restart",
  "update",
  "lag",
  "problem",
  "part",
  "group",
  "video",
  "photo",
  "app",
  "account",
  "laptop",
  "file",
  "busy",
  "days",
  "okay",
  "after",
  "deliver",
  "selling",
  "miss",
  "focus",
  "review",
  "notes",
  "birthday",
  "camera",
  "enjoy",
  "goal",
  "hi",
  "exam",
]);
