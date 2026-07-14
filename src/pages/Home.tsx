import { Link } from 'react-router-dom'
import { CAR_MODEL_INFO, CAR_MODELS } from '../data/carData'
import { CarImage } from '../components/CarImage'

export function Home() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <CarImage
          src="/images/hero.svg"
          alt="Mahindra BEV lineup — BE 6, XEV 9e, XEV 9S"
          className="h-[420px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-6 pb-12 text-white">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              What's it really like to own one?
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ink-100/90">
              An independent, owner-driven issue tracker and analytics dashboard for the Mahindra BE 6, XEV 9e and
              XEV 9S. Anonymous by default. No affiliation with Mahindra.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/report"
                className="rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Report your experience
              </Link>
              <Link
                to="/dashboard"
                className="rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/20"
              >
                View analytics
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">The models we track</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {CAR_MODELS.map((model) => (
            <div
              key={model}
              className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm dark:border-ink-800 dark:bg-ink-900"
            >
              <CarImage src={CAR_MODEL_INFO[model].image} alt={model} className="h-40 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-ink-900 dark:text-ink-50">{model}</h3>
                <p className="mt-1 text-sm text-ink-500">{CAR_MODEL_INFO[model].tagline}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 rounded-2xl border border-ink-200 bg-white p-8 dark:border-ink-800 dark:bg-ink-900 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold text-ink-900 dark:text-ink-50">1. Share your experience</h3>
            <p className="mt-2 text-sm text-ink-500">
              Tell us your model, variant, mileage and any hardware, software or service issues you've hit. Contact
              details are optional and never shown publicly.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-ink-900 dark:text-ink-50">2. We keep it honest</h3>
            <p className="mt-2 text-sm text-ink-500">
              Every submission passes a bot check and duplicate detection before it counts toward the public
              analytics.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-ink-900 dark:text-ink-50">3. Everyone sees the patterns</h3>
            <p className="mt-2 text-sm text-ink-500">
              The dashboard surfaces the most common issues and satisfaction trends across all owners — useful for
              buyers and current owners alike.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
