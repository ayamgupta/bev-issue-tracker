import type { PublicNoteRow } from '../lib/api'

interface PublicNotesProps {
  notes: PublicNoteRow[]
}

const MAX_QUOTE_LENGTH = 320

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

function groupByTheme(notes: PublicNoteRow[]): { theme: string; notes: PublicNoteRow[] }[] {
  const order: string[] = []
  const grouped = new Map<string, PublicNoteRow[]>()
  for (const note of notes) {
    if (!grouped.has(note.theme)) {
      order.push(note.theme)
      grouped.set(note.theme, [])
    }
    grouped.get(note.theme)!.push(note)
  }
  // Largest groups first; "General" (no theme keyword matched) always last.
  return order
    .sort((a, b) => {
      if (a === 'General') return 1
      if (b === 'General') return -1
      return grouped.get(b)!.length - grouped.get(a)!.length
    })
    .map((theme) => ({ theme, notes: grouped.get(theme)! }))
}

/**
 * Real owner quotes, shown verbatim — but only ever for reports where the
 * submitter explicitly opted in via the "share this publicly" checkbox on
 * the report form (see ReportFormFields.tsx). Grouped by the same theme
 * keywords as the issues taxonomy so related complaints stay clustered
 * instead of becoming a flat, unsorted feed.
 */
export function PublicNotes({ notes }: PublicNotesProps) {
  if (notes.length === 0) {
    return (
      <p className="text-sm text-ink-500">
        No owners have opted to share a public quote yet. When reporting your experience, check "share this note
        publicly" to be the first.
      </p>
    )
  }

  const groups = groupByTheme(notes)

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {groups.map(({ theme, notes: themeNotes }) => (
        <div key={theme} className="mb-4 break-inside-avoid">
          <h3 className="text-sm font-medium text-ink-500">
            {theme} <span className="tabular-nums">({themeNotes.length})</span>
          </h3>
          <div className="mt-3 space-y-3">
            {themeNotes.map((n) => (
              <figure
                key={n.id}
                className="flex flex-col justify-between rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"
              >
                <blockquote className="text-sm text-ink-700 dark:text-ink-200">
                  “{n.notes.length > MAX_QUOTE_LENGTH ? n.notes.slice(0, MAX_QUOTE_LENGTH).trimEnd() + '…' : n.notes}”
                </blockquote>
                <figcaption className="mt-4 text-xs text-ink-500">
                  {n.car_model} owner
                  {n.city ? ` · ${n.city}` : ''} · {formatDate(n.created_at)}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
