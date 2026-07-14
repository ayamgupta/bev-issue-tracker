interface RatingInputProps {
  label: string
  value: number
  onChange: (value: number) => void
}

export function RatingInput({ label, value, onChange }: RatingInputProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${label}: ${n} out of 5`}
            onClick={() => onChange(n)}
            className={`h-8 w-8 rounded-md border text-sm font-semibold transition-colors ${
              n <= value
                ? 'border-brand-500 bg-brand-500 text-white'
                : 'border-ink-300 text-ink-400 hover:border-brand-400 dark:border-ink-700'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
