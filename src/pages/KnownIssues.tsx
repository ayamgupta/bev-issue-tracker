import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { CAR_MODELS, type CarModel } from '../data/carData'
import {
  COMMUNITY_ISSUES,
  FREQUENCY_LABEL,
  FREQUENCY_RANK,
  ISSUE_CATEGORIES,
  CATEGORY_ICON,
  type CommunityIssue,
} from '../data/communityIssues'
import { fetchCommunityTips, submitCommunityTip } from '../lib/api'
import type { CommunityTipRow } from '../lib/types'
import { Turnstile } from '../components/Turnstile'
import { fuzzyScore } from '../lib/fuzzySearch'

type ModelFilter = 'All' | CarModel
type SeverityFilter = 'All' | 'major' | 'minor'
type CategoryFilter = 'All' | string

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

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white/60 px-5 py-4 backdrop-blur dark:border-ink-800 dark:bg-ink-900/60">
      <p className="text-2xl font-semibold text-ink-900 dark:text-ink-50">{value}</p>
      <p className="mt-0.5 text-xs text-ink-500">{label}</p>
    </div>
  )
}

function IssueCard({ item, isTopIssue }: { item: CommunityIssue; isTopIssue: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:bg-ink-900 ${
        item.severity === 'major'
          ? 'border-red-200 dark:border-red-900/50'
          : 'border-ink-200 dark:border-ink-800'
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${item.severity === 'major' ? 'bg-red-500' : 'bg-amber-400'}`}
      />
      {isTopIssue && (
        <span className="absolute right-4 top-4 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
          #1 most talked about
        </span>
      )}
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-xl leading-none">{CATEGORY_ICON[item.category] ?? '🔧'}</span>
        <h3 className="pr-16 font-semibold text-ink-900 dark:text-ink-50">{item.issue}</h3>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            item.severity === 'major'
              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}
        >
          {item.severity === 'major' ? 'Major' : 'Minor'}
        </span>
        {item.models.length > 0 ? (
          item.models.map((m) => (
            <span
              key={m}
              className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-600 dark:text-brand-400"
            >
              {m}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-ink-500/10 px-2 py-0.5 text-xs font-medium text-ink-500">
            Model not specified
          </span>
        )}
        <span className="rounded-full bg-ink-500/10 px-2 py-0.5 text-xs font-medium text-ink-500">
          {FREQUENCY_LABEL[item.frequency]}
        </span>
      </div>
      <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">{item.description}</p>
      {item.fix ? (
        <div className="mt-3 rounded-lg bg-emerald-500/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            ✓ Fix / workaround from owners
          </p>
          <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{item.fix}</p>
        </div>
      ) : (
        <p className="mt-3 text-xs italic text-ink-500">No reliable fix reported yet — ask your service centre.</p>
      )}
    </div>
  )
}

function TipCard({ tip }: { tip: CommunityTipRow }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex flex-wrap items-center gap-1.5">
        {tip.car_model && (
          <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-600 dark:text-brand-400">
            {tip.car_model}
          </span>
        )}
        <span className="rounded-full bg-ink-500/10 px-2 py-0.5 text-xs font-medium text-ink-500">
          Submitted by an owner
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-ink-900 dark:text-ink-50">{tip.issue}</p>
      <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{tip.fix}</p>
    </div>
  )
}

export function KnownIssues() {
  const [modelFilter, setModelFilter] = useState<ModelFilter>('All')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('All')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All')
  const [search, setSearch] = useState('')

  const [tips, setTips] = useState<CommunityTipRow[]>([])
  const [tipsLoading, setTipsLoading] = useState(true)

  const [tipCarModel, setTipCarModel] = useState<CarModel | ''>('')
  const [tipIssue, setTipIssue] = useState('')
  const [tipFix, setTipFix] = useState('')
  const [tipToken, setTipToken] = useState('')
  const [tipStatus, setTipStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [tipError, setTipError] = useState('')

  useEffect(() => {
    fetchCommunityTips()
      .then(setTips)
      .catch(() => setTips([]))
      .finally(() => setTipsLoading(false))
  }, [])

  const sorted = useMemo(
    () =>
      [...COMMUNITY_ISSUES].sort((a, b) => {
        const freqDiff = FREQUENCY_RANK[b.frequency] - FREQUENCY_RANK[a.frequency]
        if (freqDiff !== 0) return freqDiff
        if (a.severity !== b.severity) return a.severity === 'major' ? -1 : 1
        return 0
      }),
    [],
  )

  const filtered = useMemo(() => {
    const base = sorted.filter(
      (item) =>
        (modelFilter === 'All' || item.models.length === 0 || item.models.includes(modelFilter)) &&
        (severityFilter === 'All' || item.severity === severityFilter) &&
        (categoryFilter === 'All' || item.category === categoryFilter),
    )

    const query = search.trim()
    if (!query) return base

    return base
      .map((item) => ({
        item,
        score: fuzzyScore(query, [
          { text: item.issue, weight: 3, allowSubsequence: true },
          { text: item.category, weight: 1.5, allowSubsequence: true },
          { text: item.description, weight: 1 },
          { text: item.fix ?? '', weight: 1 },
        ]),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item)
  }, [sorted, modelFilter, severityFilter, categoryFilter, search])

  const majorCount = COMMUNITY_ISSUES.filter((i) => i.severity === 'major').length

  async function handleTipSubmit(e: FormEvent) {
    e.preventDefault()
    setTipError('')
    if (!tipIssue.trim() || !tipFix.trim()) {
      setTipError('Please describe both the issue and the fix.')
      return
    }
    if (!tipToken) {
      setTipError('Please complete the verification widget.')
      return
    }
    setTipStatus('submitting')
    try {
      await submitCommunityTip({
        car_model: tipCarModel || undefined,
        issue: tipIssue.trim(),
        fix: tipFix.trim(),
        turnstile_token: tipToken,
      })
      setTipStatus('success')
      setTipIssue('')
      setTipFix('')
      setTipCarModel('')
      fetchCommunityTips()
        .then(setTips)
        .catch(() => {})
    } catch (err) {
      setTipStatus('error')
      setTipError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <div>
      <div className="border-b border-ink-200/70 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent dark:border-ink-800/70">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h1 className="text-3xl font-semibold text-ink-900 dark:text-ink-50 sm:text-4xl">Known Issues &amp; Fixes</h1>
          <p className="mt-3 max-w-2xl text-ink-500">
            Battle scars and duct-tape wisdom from owners who've actually lived with these cars past the honeymoon
            phase — the problems that show up, and the fixes that got them unstuck. Independent of the self-reported
            analytics on the{' '}
            <a href="/dashboard" className="font-medium text-brand-500 hover:underline">
              Dashboard
            </a>
            .
          </p>
          <p className="mt-2 max-w-2xl text-xs text-ink-500">
            <strong className="font-semibold text-ink-600 dark:text-ink-300">Disclaimer:</strong> everything below
            comes from real owners describing their own experience, not from Mahindra, and hasn't been independently
            verified. Treat it as a starting point for troubleshooting, not a diagnosis — always confirm anything
            safety-related with an authorized service centre.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Known issues catalogued" value={COMMUNITY_ISSUES.length} />
            <StatTile label="Safety / drivability critical" value={majorCount} />
            <StatTile label="Categories covered" value={ISSUE_CATEGORIES.length} />
            <StatTile label="Owner-submitted tips" value={tips.length} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues and fixes — e.g. suspension, bass, charging…"
            className="w-full rounded-xl border border-ink-300 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm dark:border-ink-700 dark:bg-ink-950"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-ink-900 dark:text-ink-50">
            {search.trim() ? 'Best matches' : "Sorted by how often it's talked about"}
          </h2>
          <div className="flex flex-wrap gap-2">
            <FilterSelect value={modelFilter} onChange={(v) => setModelFilter(v as ModelFilter)} options={['All', ...CAR_MODELS]} />
            <FilterSelect
              value={severityFilter}
              onChange={(v) => setSeverityFilter(v as SeverityFilter)}
              options={['All', 'major', 'minor']}
              capitalize
            />
            <FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={['All', ...ISSUE_CATEGORIES]} />
          </div>
        </div>

        <p className="mt-3 text-sm text-ink-500">
          Showing {filtered.length} of {COMMUNITY_ISSUES.length} known issues.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <IssueCard
              key={item.issue}
              item={item}
              isTopIssue={i === 0 && modelFilter === 'All' && severityFilter === 'All' && categoryFilter === 'All' && !search.trim()}
            />
          ))}
        </div>

        <section className="mt-16 rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
          <h2 className="font-semibold text-ink-900 dark:text-ink-50">Know a fix that isn't listed?</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Seen an issue here, or a different one, and found what fixed it? Share it below — it'll show up publicly
            for other owners right away.
          </p>

          {tipStatus === 'success' ? (
            <div className="mt-4 rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
              Thanks — your tip is live below.
              <button
                type="button"
                onClick={() => setTipStatus('idle')}
                className="ml-2 font-medium text-brand-500 hover:underline"
              >
                Add another
              </button>
            </div>
          ) : (
            <form onSubmit={handleTipSubmit} className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-ink-700 dark:text-ink-200">Car model</label>
                  <select
                    value={tipCarModel}
                    onChange={(e) => setTipCarModel(e.target.value as CarModel | '')}
                    className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-950"
                  >
                    <option value="">Not specific to one model</option>
                    {CAR_MODELS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-ink-200">Issue *</label>
                <input
                  type="text"
                  value={tipIssue}
                  onChange={(e) => setTipIssue(e.target.value)}
                  maxLength={150}
                  placeholder="e.g. Boot doesn't open with the button, only the key"
                  className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-950"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-ink-200">Fix / workaround *</label>
                <textarea
                  value={tipFix}
                  onChange={(e) => setTipFix(e.target.value)}
                  maxLength={800}
                  rows={3}
                  placeholder="What actually fixed it, or what you do to work around it"
                  className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-950"
                />
              </div>
              <Turnstile onVerify={setTipToken} onExpire={() => setTipToken('')} />
              {tipError && <p className="text-sm text-rose-500">{tipError}</p>}
              <button
                type="submit"
                disabled={tipStatus === 'submitting'}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
              >
                {tipStatus === 'submitting' ? 'Submitting…' : 'Share this tip'}
              </button>
            </form>
          )}
        </section>

        {!tipsLoading && tips.length > 0 && (
          <section className="mt-10">
            <h2 className="font-semibold text-ink-900 dark:text-ink-50">Recently submitted by owners</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tips.map((tip) => (
                <TipCard key={tip.id} tip={tip} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
