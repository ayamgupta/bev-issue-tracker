// Small dependency-free fuzzy matcher: scores a query against a set of text
// fields so free-text search can surface close matches, not just exact
// substrings, without pulling in a library for one search box.
function normalize(s: string): string {
  return s.toLowerCase().trim()
}

// Returns a score for how well `query` matches `text`, or 0 for no match.
// Exact substring matches score highest. Subsequence matching (all query
// characters appear in order, possibly with gaps) is opt-in per field — it's
// useful for short titles ("suspnsion" -> "Suspension issue") but far too
// permissive on long free-text paragraphs, where almost any short query is a
// coincidental subsequence of *something* in the text.
function scoreField(query: string, text: string, weight: number, allowSubsequence: boolean): number {
  const q = normalize(query)
  const t = normalize(text)
  if (!q) return 0
  if (t.includes(q)) return weight * (1 + q.length / t.length)
  if (!allowSubsequence) return 0

  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  if (qi === q.length) return weight * 0.3

  return 0
}

export function fuzzyScore(
  query: string,
  fields: { text: string; weight: number; allowSubsequence?: boolean }[],
): number {
  return fields.reduce((sum, f) => sum + scoreField(query, f.text, f.weight, f.allowSubsequence ?? false), 0)
}
