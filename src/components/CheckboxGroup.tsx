interface CheckboxGroupProps {
  options: readonly string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function CheckboxGroup({ options, selected, onChange }: CheckboxGroupProps) {
  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <label
          key={option}
          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
            selected.includes(option)
              ? 'border-brand-500 bg-brand-500/10 text-ink-900 dark:text-ink-50'
              : 'border-ink-200 text-ink-600 hover:border-ink-300 dark:border-ink-800 dark:text-ink-300'
          }`}
        >
          <input
            type="checkbox"
            className="h-4 w-4 accent-brand-500"
            checked={selected.includes(option)}
            onChange={() => toggle(option)}
          />
          {option}
        </label>
      ))}
    </div>
  )
}
