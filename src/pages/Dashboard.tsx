import { useEffect, useState } from 'react'
import { CAR_MODELS, type CarModel } from '../data/carData'
import { fetchIssueFrequency, fetchSatisfaction, fetchSummary } from '../lib/api'
import type { AnalyticsSummary, IssueFrequencyRow, SatisfactionRow } from '../lib/api'
import { IssueBarChart } from '../components/IssueBarChart'
import { SatisfactionCard } from '../components/SatisfactionCard'

type ModelFilter = 'All' | CarModel
type SeverityFilter = 'All' | 'major' | 'minor'

export function Dashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [issues, setIssues] = useState<IssueFrequencyRow[]>([])
  const [satisfaction, setSatisfaction] = useState<SatisfactionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modelFilter, setModelFilter] = useState<ModelFilter>('All')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('All')

  useEffect(() => {
    Promise.all([fetchSummary(), fetchIssueFrequency(), fetchSatisfaction()])
      .then(([s, i, sat]) => {
        setSummary(s)
        setIssues(i)
        setSatisfaction(sat)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const filteredIssues = issues
    .filter((row) => modelFilter === 'All' || row.car_model === modelFilter)
    .filter((row) => severityFilter === 'All' || row.severity === severityFilter)
    .reduce<IssueFrequencyRow[]>((acc, row) => {
      const existing = acc.find((r) => r.issue === row.issue && r.severity === row.severity)
      if (existing) {
        existing.occurrences += row.occurrences
      } else {
        acc.push({ ...row })
      }
      return acc
    }, [])
    .sort((a, b) => b.occurrences - a.occurrences)

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-ink-900 dark:text-ink-50">Owner-reported analytics</h1>
      <p className="mt-2 text-sm text-ink-500">
        Aggregated from community submissions. Unverified reports are included but flagged/removed entries are
        excluded.
      </p>

      {error && <p className="mt-6 text-sm text-rose-500">{error}</p>}
      {loading && <p className="mt-6 text-sm text-ink-500">Loading…</p>}

      {!loading && !error && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatTile label="Total reports" value={summary?.total_reports ?? 0} />
            <StatTile label="Verified reports" value={summary?.verified_reports ?? 0} />
            <StatTile label="Cities represented" value={summary?.cities_represented ?? 0} />
          </div>

          <section className="mt-10 rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-semibold text-ink-900 dark:text-ink-50">Most common issues</h2>
              <div className="flex flex-wrap gap-2">
                <FilterSelect
                  value={modelFilter}
                  onChange={(v) => setModelFilter(v as ModelFilter)}
                  options={['All', ...CAR_MODELS]}
                />
                <FilterSelect
                  value={severityFilter}
                  onChange={(v) => setSeverityFilter(v as SeverityFilter)}
                  options={['All', 'major', 'minor']}
                  capitalize
                />
              </div>
            </div>
            <div className="mt-6">
              <IssueBarChart rows={filteredIssues} />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-semibold text-ink-900 dark:text-ink-50">Satisfaction by model</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              {satisfaction.length === 0 && <p className="text-sm text-ink-500">No ratings yet.</p>}
              {satisfaction.map((row) => (
                <SatisfactionCard key={row.car_model} row={row} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-ink-900 dark:text-ink-50">{value}</p>
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  options,
  capitalize,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  capitalize?: boolean
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border border-ink-300 bg-white px-3 py-1.5 text-sm dark:border-ink-700 dark:bg-ink-950 ${capitalize ? 'capitalize' : ''}`}
    >
      {options.map((o) => (
        <option key={o} value={o} className={capitalize ? 'capitalize' : ''}>
          {o}
        </option>
      ))}
    </select>
  )
}
