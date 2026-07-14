import type { SatisfactionRow } from '../lib/api'

const METRICS: { key: keyof SatisfactionRow; label: string }[] = [
  { key: 'avg_hardware', label: 'Hardware' },
  { key: 'avg_software', label: 'Software' },
  { key: 'avg_service', label: 'Service' },
  { key: 'avg_overall', label: 'Overall' },
]

// Fixed categorical order, same slots as the reference palette (blue/aqua/yellow),
// assigned per car model consistently across the whole dashboard.
const MODEL_COLOR: Record<string, string> = {
  'BE 6': '#2a78d6',
  'XEV 9e': '#1baf7a',
  'XEV 9S': '#eda100',
}

export function SatisfactionCard({ row }: { row: SatisfactionRow }) {
  const color = MODEL_COLOR[row.car_model] ?? '#2a78d6'

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ink-900 dark:text-ink-50">{row.car_model}</h3>
        <span className="text-xs text-ink-500">{row.report_count} reports</span>
      </div>
      <div className="mt-4 space-y-3">
        {METRICS.map((m) => {
          const value = Number(row[m.key])
          return (
            <div key={m.key}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="text-ink-600 dark:text-ink-300">{m.label}</span>
                <span className="tabular-nums text-ink-900 dark:text-ink-50">{value.toFixed(1)} / 5</span>
              </div>
              <div className="h-2 w-full rounded-full bg-ink-100 dark:bg-ink-800">
                <div className="h-2 rounded-full" style={{ width: `${(value / 5) * 100}%`, background: color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
