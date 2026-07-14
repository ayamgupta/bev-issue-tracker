import { useState } from 'react'
import type { ForumSignal } from '../data/forumIssues'

export interface RankedIssueRow {
  issue: string
  severity: 'major' | 'minor'
  occurrences: number
  forumWeight: number
  forumSignal?: ForumSignal
  forumNote?: string
  forumSources?: string[]
}

interface IssueBarChartProps {
  rows: RankedIssueRow[]
}

function forumTitle(row: RankedIssueRow): string | undefined {
  if (!row.forumSignal) return undefined
  const sourceCount = row.forumSources?.length ?? 0
  return `Owner-forum evidence (${row.forumSignal} signal, ${sourceCount} source${sourceCount === 1 ? '' : 's'}): ${row.forumNote ?? ''}`
}

/**
 * Horizontal bar chart of issue frequency. Sequential single-hue (blue ramp)
 * since this encodes magnitude, not category identity. See dataviz skill:
 * references/color-formula.md and references/marks-and-anatomy.md.
 */
export function IssueBarChart({ rows }: IssueBarChartProps) {
  const [showTable, setShowTable] = useState(false)
  const max = Math.max(1, ...rows.map((r) => r.occurrences))

  // Forum-only rows (no site reports yet) get a capped, visually-muted bar so they never
  // read as equal in magnitude to a real report count — the number itself says "forum-only".
  function barWidthPercent(r: RankedIssueRow): number {
    if (r.occurrences > 0) return (r.occurrences / max) * 100
    const forumFraction = Math.min(1, r.forumWeight / 5)
    return forumFraction * 25
  }

  return (
    <div className="viz-root">
      <style>{`
        .viz-root {
          --surface-1: #fcfcfb;
          --text-primary: #0b0b0b;
          --text-secondary: #52514e;
          --muted: #898781;
          --gridline: #e1e0d9;
          --seq-500: #256abf;
        }
        @media (prefers-color-scheme: dark) {
          :root:where(:not([data-theme="light"])) .viz-root {
            --surface-1: #1a1a19;
            --text-primary: #ffffff;
            --text-secondary: #c3c2b7;
            --muted: #898781;
            --gridline: #2c2c2a;
            --seq-500: #3987e5;
          }
        }
        :root[data-theme="dark"] .viz-root {
          --surface-1: #1a1a19;
          --text-primary: #ffffff;
          --text-secondary: #c3c2b7;
          --muted: #898781;
          --gridline: #2c2c2a;
          --seq-500: #3987e5;
        }
      `}</style>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          {rows.length === 0 ? 'No data yet for this filter.' : `Top ${Math.min(10, rows.length)} reported issues`}
        </p>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-xs font-medium text-[var(--text-secondary)] underline underline-offset-2"
        >
          {showTable ? 'Show chart' : 'Show table'}
        </button>
      </div>

      {showTable ? (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--gridline)' }}>
              <th className="py-2 font-medium text-[var(--text-secondary)]">Issue</th>
              <th className="py-2 font-medium text-[var(--text-secondary)]">Severity</th>
              <th className="py-2 text-right font-medium text-[var(--text-secondary)]">Reports</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.issue}-${r.severity}`} className="border-b" style={{ borderColor: 'var(--gridline)' }}>
                <td className="py-2 text-[var(--text-primary)]">
                  {r.issue}
                  {r.forumSignal && (
                    <span title={forumTitle(r)} className="ml-1.5 cursor-help">
                      🌐
                    </span>
                  )}
                </td>
                <td className="py-2 capitalize text-[var(--text-secondary)]">{r.severity}</td>
                <td className="py-2 text-right tabular-nums text-[var(--text-primary)]">{r.occurrences}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.slice(0, 10).map((r) => (
            <div key={`${r.issue}-${r.severity}`}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="text-[var(--text-primary)]">
                  {r.issue}
                  {r.forumSignal && (
                    <span title={forumTitle(r)} className="ml-1.5 cursor-help">
                      🌐
                    </span>
                  )}
                </span>
                <span className="tabular-nums text-[var(--text-secondary)]">
                  {r.occurrences > 0 ? r.occurrences : 'forum-only'}
                </span>
              </div>
              <div className="h-2 w-full rounded-full" style={{ background: 'var(--gridline)' }}>
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${barWidthPercent(r)}%`,
                    background: 'var(--seq-500)',
                    opacity: r.occurrences > 0 ? 1 : 0.5,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
