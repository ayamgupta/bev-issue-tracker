import { useEffect, useState } from 'react'

type Choice = {
  label: string
  detail: string
  penalty: number
}

type Question = {
  prompt: string
  good: Choice
  bad: Choice
}

const QUESTIONS: Question[] = [
  {
    prompt: 'Day to day, how do you usually charge?',
    good: { label: 'Mostly Normal (AC/home) charging', detail: 'Easier on the pack long-term.', penalty: 0 },
    bad: {
      label: 'Fast (DC) charging whenever possible',
      detail: 'Convenient, but the manual says minimize this to help the pack last.',
      penalty: 14,
    },
  },
  {
    prompt: "Leaving the car for an extended trip — what's the SOC?",
    good: {
      label: 'Above 50%, then top up to 100% on return',
      detail: 'Exactly what the manual recommends.',
      penalty: 0,
    },
    bad: {
      label: 'Whatever it happens to be, even near empty',
      detail: 'Risks a deep discharge while parked and unattended.',
      penalty: 12,
    },
  },
  {
    prompt: "It's going to sit for over a month. What do you do?",
    good: {
      label: 'Disconnect the 12V negative terminal',
      detail: 'Cuts parasitic drain on both the 12V and HV battery.',
      penalty: 0,
    },
    bad: { label: 'Nothing, just leave it as-is', detail: 'Slow drain on both batteries the whole time.', penalty: 8 },
  },
  {
    prompt: 'How does it usually sit when parked at home?',
    good: {
      label: 'Charged to 100% only right before you need it',
      detail: 'No prolonged high-SOC stress on the pack.',
      penalty: 0,
    },
    bad: {
      label: 'Topped up to 100% and left that way for days',
      detail: 'The manual specifically warns against resting at 100% for long stretches.',
      penalty: 10,
    },
  },
  {
    prompt: 'Where does it usually park?',
    good: {
      label: 'Covered, shaded, or indoor parking',
      detail: 'Keeps the pack out of temperature extremes.',
      penalty: 0,
    },
    bad: {
      label: 'Direct sun / extreme heat or cold, no cover',
      detail: 'Extended extreme temps accelerate battery degradation.',
      penalty: 12,
    },
  },
  {
    prompt: "After a fast-charging session, what's your next charge?",
    good: {
      label: 'A full Normal (AC) charge, roughly every 3rd fast charge',
      detail: 'The manual’s recommended reset cycle.',
      penalty: 0,
    },
    bad: {
      label: 'Just another fast charge — whatever’s fastest',
      detail: 'Back-to-back fast charging adds up over time.',
      penalty: 14,
    },
  },
  {
    prompt: 'How low do you typically let it get?',
    good: { label: 'Rarely below 20%, never near 0%', detail: 'Avoids deep-discharge stress entirely.', penalty: 0 },
    bad: {
      label: 'Regularly down to under 5%, sometimes 0%',
      detail: 'The manual’s single biggest no-no — can cause permanent degradation.',
      penalty: 18,
    },
  },
]

const MAX_PENALTY = QUESTIONS.reduce((sum, q) => sum + q.bad.penalty, 0)

type Verdict = {
  emoji: string
  title: string
  blurb: string
}

function getVerdict(score: number): Verdict {
  if (score >= 90) {
    return {
      emoji: '🏆',
      title: 'Blade Battery Whisperer',
      blurb: 'Textbook habits. Your battery should comfortably outlast your patience for car payments.',
    }
  }
  if (score >= 70) {
    return {
      emoji: '👍',
      title: 'Solid, With Minor Tweaks',
      blurb: 'You’re doing most things right — a couple of small habit changes and you’re golden.',
    }
  }
  if (score >= 50) {
    return {
      emoji: '🤨',
      title: 'Your Battery Is Side-Eyeing You',
      blurb: 'Not disastrous, but a few habits here are quietly costing you range and lifespan.',
    }
  }
  return {
    emoji: '😬',
    title: "It's Time For a Battery Intervention",
    blurb: 'Several habits here are exactly what the manual warns against. Worth a rethink.',
  }
}

export function BatteryHealthGame() {
  const [step, setStep] = useState(0)
  const [penalties, setPenalties] = useState<number[]>([])
  const [picked, setPicked] = useState<Choice | null>(null)
  const [order, setOrder] = useState<[Choice, Choice] | null>(null)

  const question = QUESTIONS[step]

  useEffect(() => {
    if (!question) return
    setOrder(Math.random() < 0.5 ? [question.good, question.bad] : [question.bad, question.good])
    setPicked(null)
  }, [step, question])

  const finished = step >= QUESTIONS.length
  const totalPenalty = penalties.reduce((sum, p) => sum + p, 0)
  const score = Math.round(100 - (totalPenalty / MAX_PENALTY) * 100)

  function pick(choice: Choice) {
    setPicked(choice)
  }

  function next() {
    if (!picked) return
    setPenalties((prev) => [...prev, picked.penalty])
    setStep((prev) => prev + 1)
  }

  function reset() {
    setStep(0)
    setPenalties([])
    setPicked(null)
  }

  if (finished) {
    const verdict = getVerdict(score)
    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-6 text-center dark:border-ink-800 dark:bg-ink-900">
        <p className="text-sm text-ink-500">Your simulated 5-year battery health score</p>
        <div className="mx-auto mt-4 max-w-sm">
          <div className="h-5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(score, 4)}%` }}
            />
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-ink-900 dark:text-ink-50">{score}%</p>
        </div>
        <p className="mt-4 text-2xl">{verdict.emoji}</p>
        <p className="mt-1 font-semibold text-ink-900 dark:text-ink-50">{verdict.title}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">{verdict.blurb}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Play again
        </button>
        <p className="mx-auto mt-4 max-w-md text-xs text-ink-400">
          Illustrative only — not a real prediction of your battery&rsquo;s state of health. Scored against the
          Do&rsquo;s and Don&rsquo;ts below, not an official Mahindra or BYD model.
        </p>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
        Question {step + 1} of {QUESTIONS.length}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink-900 dark:text-ink-50">{question.prompt}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {order.map((choice) => {
          const isPicked = picked === choice
          const isGood = choice.penalty === 0
          const showResult = picked !== null

          return (
            <button
              key={choice.label}
              type="button"
              onClick={() => pick(choice)}
              disabled={picked !== null}
              className={`rounded-xl border p-4 text-left text-sm transition-colors ${
                showResult && isPicked && isGood
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : showResult && isPicked && !isGood
                    ? 'border-rose-400 bg-rose-500/10'
                    : showResult
                      ? 'border-ink-200 opacity-60 dark:border-ink-800'
                      : 'border-ink-200 bg-ink-50 hover:border-brand-500 hover:bg-brand-500/5 dark:border-ink-700 dark:bg-ink-950 dark:hover:border-brand-500'
              }`}
            >
              <span className="font-medium text-ink-900 dark:text-ink-50">{choice.label}</span>
              {showResult && isPicked && (
                <span className="mt-1.5 block text-xs text-ink-600 dark:text-ink-300">
                  {isGood ? '✅ ' : '⚠️ '}
                  {choice.detail}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {picked && (
        <button
          type="button"
          onClick={next}
          className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          {step + 1 < QUESTIONS.length ? 'Next question' : 'See my score'}
        </button>
      )}
    </div>
  )
}
