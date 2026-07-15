import { useEffect, useMemo, useState } from 'react'
import { CAR_MODELS, VARIANTS_BY_MODEL, type CarModel } from '../data/carData'
import { FORUM_ISSUES, FORUM_SIGNAL_WEIGHT } from '../data/forumIssues'
import {
  fetchIssueFrequency,
  fetchPublicNotes,
  fetchSatisfaction,
  fetchSoftwareVersions,
  fetchSummary,
  fetchTyreBrands,
} from '../lib/api'
import type {
  AnalyticsSummary,
  IssueFrequencyRow,
  PublicNoteRow,
  SatisfactionRow,
  SoftwareVersionRow,
  TyreBrandRow,
} from '../lib/api'
import { IssueBarChart, type RankedIssueRow } from '../components/IssueBarChart'
import { PublicNotes } from '../components/PublicNotes'
import { SatisfactionCard } from '../components/SatisfactionCard'

type ModelFilter = 'All' | CarModel
type VariantFilter = 'All' | string
type SeverityFilter = 'All' | 'major' | 'minor'

const ALL_VARIANTS = Array.from(new Set(Object.values(VARIANTS_BY_MODEL).flat()))

export function Dashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [issues, setIssues] = useState<IssueFrequencyRow[]>([])
  const [satisfaction, setSatisfaction] = useState<SatisfactionRow[]>([])
  const [softwareVersions, setSoftwareVersions] = useState<SoftwareVersionRow[]>([])
  const [tyreBrands, setTyreBrands] = useState<TyreBrandRow[]>([])
  const [publicNotes, setPublicNotes] = useState<PublicNoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modelFilter, setModelFilter] = useState<ModelFilter>('All')
  const [variantFilter, setVariantFilter] = useState<VariantFilter>('All')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('All')

  useEffect(() => {
    Promise.all([
      fetchSummary(),
      fetchIssueFrequency(),
      fetchSatisfaction(),
      fetchSoftwareVersions(),
      fetchTyreBrands(),
      fetchPublicNotes(),
    ])
      .then(([s, i, sat, sv, tb, pn]) => {
        setSummary(s)
        setIssues(i)
        setSatisfaction(sat)
        setSoftwareVersions(sv)
        setTyreBrands(tb)
        setPublicNotes(pn)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const variantOptions = modelFilter === 'All' ? ALL_VARIANTS : VARIANTS_BY_MODEL[modelFilter]

  function handleModelFilterChange(value: ModelFilter) {
    setModelFilter(value)
    setVariantFilter('All')
  }

  const selfReportedIssues = issues
    .filter((row) => modelFilter === 'All' || row.car_model === modelFilter)
    .filter((row) => variantFilter === 'All' || row.variant === variantFilter)
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

  const relevantForumIssues = FORUM_ISSUES.filter(
    (f) => (modelFilter === 'All' || f.models.includes(modelFilter)) && (severityFilter === 'All' || f.severity === severityFilter),
  )

  // Blend our own owner reports with well-documented owner-forum complaints (Team-BHP) so a
  // known issue can surface here even before enough site visitors have reported it themselves.
  // Self-reports still dominate the ranking; forum signal mainly breaks ties and surfaces
  // forum-only issues rather than overriding a large volume of real submissions.
  const filteredIssues: RankedIssueRow[] = selfReportedIssues.map((row) => {
    const forumMatch = relevantForumIssues.find((f) => f.issue === row.issue && f.severity === row.severity)
    return {
      issue: row.issue,
      severity: row.severity,
      occurrences: row.occurrences,
      forumWeight: forumMatch ? FORUM_SIGNAL_WEIGHT[forumMatch.signal] : 0,
      forumSignal: forumMatch?.signal,
      forumNote: forumMatch?.note,
      forumSources: forumMatch?.sources,
    }
  })

  for (const forumIssue of relevantForumIssues) {
    if (!filteredIssues.some((row) => row.issue === forumIssue.issue && row.severity === forumIssue.severity)) {
      filteredIssues.push({
        issue: forumIssue.issue,
        severity: forumIssue.severity,
        occurrences: 0,
        forumWeight: FORUM_SIGNAL_WEIGHT[forumIssue.signal],
        forumSignal: forumIssue.signal,
        forumNote: forumIssue.note,
        forumSources: forumIssue.sources,
      })
    }
  }

  filteredIssues.sort((a, b) => b.occurrences + b.forumWeight - (a.occurrences + a.forumWeight) || b.occurrences - a.occurrences)

  const softwareVersionsByModel = useMemo(() => {
    const grouped = new Map<CarModel, SoftwareVersionRow[]>()
    for (const row of softwareVersions) {
      const list = grouped.get(row.car_model) ?? []
      list.push(row)
      grouped.set(row.car_model, list)
    }
    for (const list of grouped.values()) {
      list.sort((a, b) => b.occurrences - a.occurrences)
    }
    return grouped
  }, [softwareVersions])

  // Tyre life remaining is meaningless without mileage context (70% left means
  // very different things at 5,000km vs 50,000km), so group by model, then by
  // odometer range, then by brand within that range.
  const tyreRangesByModel = useMemo(() => {
    const byModel = new Map<CarModel, Map<string, { order: number; rows: TyreBrandRow[] }>>()
    for (const row of tyreBrands) {
      const ranges = byModel.get(row.car_model) ?? new Map()
      const range = ranges.get(row.odo_range) ?? { order: row.odo_range_order, rows: [] }
      range.rows.push(row)
      ranges.set(row.odo_range, range)
      byModel.set(row.car_model, ranges)
    }
    const result = new Map<CarModel, { range: string; rows: TyreBrandRow[] }[]>()
    for (const [model, ranges] of byModel) {
      const sorted = Array.from(ranges.entries())
        .sort((a, b) => a[1].order - b[1].order)
        .map(([range, { rows }]) => ({ range, rows: rows.sort((a, b) => b.occurrences - a.occurrences) }))
      result.set(model, sorted)
    }
    return result
  }, [tyreBrands])

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-ink-900 dark:text-ink-50">Owner-reported analytics</h1>
      <p className="mt-2 text-sm text-ink-500">
        Real owners, real gripes, zero brochure spin. Aggregated from community submissions — unverified reports are
        included, but flagged/removed entries are politely shown the door.
      </p>

      {error && <p className="mt-6 text-sm text-rose-500">{error}</p>}
      {loading && <p className="mt-6 text-sm text-ink-500">Loading…</p>}

      {!loading && !error && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Total reports" value={summary?.total_reports ?? 0} />
            <StatTile label="Unique owners reporting" value={summary?.unique_submitters ?? 0} />
            <StatTile label="Verified reports" value={summary?.verified_reports ?? 0} />
            <StatTile label="Cities represented" value={summary?.cities_represented ?? 0} />
          </div>
          <p className="mt-2 text-xs text-ink-500">
            "Unique owners reporting" is approximate — it counts distinct submitting connections, not verified
            identities.
          </p>

          <section className="mt-10 rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-semibold text-ink-900 dark:text-ink-50">Most common issues</h2>
              <div className="flex flex-wrap gap-2">
                <FilterSelect
                  value={modelFilter}
                  onChange={(v) => handleModelFilterChange(v as ModelFilter)}
                  options={['All', ...CAR_MODELS]}
                />
                <FilterSelect
                  value={variantFilter}
                  onChange={(v) => setVariantFilter(v)}
                  options={['All', ...variantOptions]}
                />
                <FilterSelect
                  value={severityFilter}
                  onChange={(v) => setSeverityFilter(v as SeverityFilter)}
                  options={['All', 'major', 'minor']}
                  capitalize
                />
              </div>
            </div>
            {filteredIssues.length > 0 && (
              <p className="mt-3 text-sm text-ink-500">
                🏆 Public Enemy No. 1:{' '}
                <span className="font-medium text-ink-900 dark:text-ink-50">{filteredIssues[0].issue}</span> —{' '}
                {filteredIssues[0].occurrences > 0
                  ? `reported ${filteredIssues[0].occurrences}× here and counting`
                  : 'not yet reported here, but well documented on owner forums'}
                . Brochure did not mention this.
              </p>
            )}
            <p className="mt-1 text-xs text-ink-500">
              Ranking is boosted by well-documented owner-forum reports (mostly Team-BHP) where our own submissions
              are still thin — look for the 🌐 badge.
            </p>
            <div className="mt-6">
              <IssueBarChart rows={filteredIssues} />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-semibold text-ink-900 dark:text-ink-50">Satisfaction by model</h2>
            <p className="mt-1 text-sm text-ink-500">Unfiltered opinions from people who actually have to live with it.</p>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              {satisfaction.length === 0 && (
                <p className="text-sm text-ink-500">
                  No ratings yet. Either everyone's thrilled, or everyone's still stuck in traffic composing their
                  review.
                </p>
              )}
              {satisfaction.map((row) => (
                <SatisfactionCard key={row.car_model} row={row} verdict={satisfactionVerdict(row.avg_overall)} />
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-semibold text-ink-900 dark:text-ink-50">Software versions in the wild</h2>
            <p className="mt-1 text-sm text-ink-500">
              Self-reported ECU Version at submission time (format: A15.33.912). Check yours: My Vehicle → External →
              press and hold the lock button for 10 seconds → ECU Version.
            </p>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              {softwareVersions.length === 0 && (
                <p className="text-sm text-ink-500">No software versions reported yet.</p>
              )}
              {CAR_MODELS.filter((m) => softwareVersionsByModel.has(m)).map((model) => (
                <div
                  key={model}
                  className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"
                >
                  <h3 className="font-semibold text-ink-900 dark:text-ink-50">{model}</h3>
                  <div className="mt-3 space-y-2">
                    {softwareVersionsByModel.get(model)!.map((row) => (
                      <div key={row.software_version} className="flex items-center justify-between text-sm">
                        <span className="text-ink-600 dark:text-ink-300">{row.software_version}</span>
                        <span className="tabular-nums text-ink-900 dark:text-ink-50">{row.occurrences}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-semibold text-ink-900 dark:text-ink-50">Tyres in the wild</h2>
            <p className="mt-1 text-sm text-ink-500">
              Self-reported brand and estimated remaining life, grouped by odometer reading — 70% life left means
              very different things at 5,000km vs 50,000km.
            </p>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              {tyreBrands.length === 0 && <p className="text-sm text-ink-500">No tyre data reported yet.</p>}
              {CAR_MODELS.filter((m) => tyreRangesByModel.has(m)).map((model) => (
                <div
                  key={model}
                  className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"
                >
                  <h3 className="font-semibold text-ink-900 dark:text-ink-50">{model}</h3>
                  <div className="mt-3 space-y-4">
                    {tyreRangesByModel.get(model)!.map(({ range, rows }) => (
                      <div key={range}>
                        <p className="text-xs font-medium text-ink-500">Owners with {range} on the odometer:</p>
                        <div className="mt-1.5 space-y-1.5">
                          {rows.map((row) => (
                            <div key={row.tyre_brand} className="flex items-center justify-between text-sm">
                              <span className="text-ink-600 dark:text-ink-300">{row.tyre_brand}</span>
                              <span className="tabular-nums text-ink-900 dark:text-ink-50">
                                {row.avg_life_remaining_pct !== null
                                  ? `${row.avg_life_remaining_pct}% tyre life left avg`
                                  : 'no data'}{' '}
                                ({row.occurrences} report{row.occurrences === 1 ? '' : 's'})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-semibold text-ink-900 dark:text-ink-50">What owners are saying</h2>
            <p className="mt-1 text-sm text-ink-500">
              Real quotes from the "Anything else?" field, grouped by topic — shown only for reports where the owner
              explicitly opted in to share it publicly.
            </p>
            <div className="mt-4 rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
              <PublicNotes notes={publicNotes} />
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function satisfactionVerdict(avgOverall: number): string {
  if (avgOverall >= 4.5) return 'Suspiciously happy owners. We double-checked for bots. They\'re real.'
  if (avgOverall >= 3.8) return 'Solidly liked, with the usual asterisks.'
  if (avgOverall >= 3) return "It's complicated — like most relationships."
  if (avgOverall >= 2) return 'Owners are coping. Bravely.'
  return 'Bring a folding chair to the service centre. You\'ll be there a while.'
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
