import { useState, type FormEvent } from 'react'
import { BATTERY_PACKS, VARIANTS_BY_MODEL } from '../data/carData'
import { ReportFormFields, type ReportFormValues } from '../components/ReportFormFields'
import { Turnstile } from '../components/Turnstile'
import { submitReport } from '../lib/api'

const currentYear = new Date().getFullYear()

const initialValues: ReportFormValues = {
  carModel: 'BE 6',
  variant: VARIANTS_BY_MODEL['BE 6'][0],
  batteryPack: BATTERY_PACKS[0],
  purchaseYear: currentYear,
  odoKm: '',
  city: '',
  serviceCenter: '',
  majorIssues: [],
  minorIssues: [],
  hardwareRating: 0,
  softwareRating: 0,
  serviceRating: 0,
  overallRating: 0,
  notes: '',
  notesPublicOptIn: false,
  softwareVersion: '',
  tyreBrand: '',
  tyreLifeRemainingPct: '',
}

export function Report() {
  const [values, setValues] = useState<ReportFormValues>(initialValues)

  const [regNumber, setRegNumber] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [contactNumber, setContactNumber] = useState('')

  const [turnstileToken, setTurnstileToken] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [wasUpdate, setWasUpdate] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function handleFieldChange<K extends keyof ReportFormValues>(key: K, value: ReportFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!values.odoKm || !values.city.trim()) {
      setErrorMessage('Please fill in the required fields.')
      return
    }
    if (!values.hardwareRating || !values.softwareRating || !values.serviceRating || !values.overallRating) {
      setErrorMessage('Please rate all four satisfaction categories.')
      return
    }
    if (!turnstileToken) {
      setErrorMessage('Please complete the verification widget.')
      return
    }

    setStatus('submitting')
    try {
      const result = await submitReport({
        reg_number: regNumber || undefined,
        owner_name: ownerName || undefined,
        contact_number: contactNumber || undefined,
        car_model: values.carModel,
        variant: values.variant,
        battery_pack: values.batteryPack,
        purchase_year: values.purchaseYear,
        odo_km: Number(values.odoKm),
        city: values.city.trim(),
        service_center: values.serviceCenter || undefined,
        major_issues: values.majorIssues,
        minor_issues: values.minorIssues,
        hardware_rating: values.hardwareRating,
        software_rating: values.softwareRating,
        service_rating: values.serviceRating,
        overall_rating: values.overallRating,
        notes: values.notes || undefined,
        notes_public_opt_in: values.notesPublicOptIn,
        software_version: values.softwareVersion || undefined,
        tyre_brand: values.tyreBrand || undefined,
        tyre_life_remaining_pct: values.tyreLifeRemainingPct ? Number(values.tyreLifeRemainingPct) : undefined,
        turnstile_token: turnstileToken,
      })
      setWasUpdate(Boolean(result.updated))
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-ink-50">
          {wasUpdate ? 'Your report has been updated' : 'Thanks for sharing your experience'}
        </h1>
        <p className="mt-3 text-ink-500">
          {wasUpdate
            ? 'We matched this submission to your earlier report by registration number and replaced your previous answers. It will reappear in analytics once reviewed.'
            : 'Your report has been recorded and will appear in the public analytics once reviewed.'}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-ink-900 dark:text-ink-50">Report your ownership experience</h1>
      <p className="mt-2 text-sm text-ink-500">
        Every field below except your car model, mileage, city and ratings is optional. Already submitted before and
        want to update it? Just fill this out again with the same registration number — it replaces your previous
        answers instead of creating a duplicate.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <ReportFormFields values={values} onChange={handleFieldChange} />

        <section className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
          <h2 className="font-semibold text-ink-900 dark:text-ink-50">Help us verify this is real</h2>
          <p className="mt-1 text-sm text-ink-500">
            Never shown publicly, and stored in a separate, locked-down table from your report. Used only to (1)
            catch duplicate/fake submissions and (2) match this submission to an earlier one from the same
            registration number, so re-submitting updates your existing report instead of creating a new one. We
            never sell or share this data, and you can ask us to delete it at any time.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-ink-700 dark:text-ink-200">Vehicle Registration number</span>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-ink-700 dark:text-ink-200">Name</span>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-ink-700 dark:text-ink-200">Contact number</span>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
              />
            </label>
          </div>
        </section>

        <section>
          <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken('')} />
        </section>

        {errorMessage && <p className="text-sm text-rose-500">{errorMessage}</p>}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit report'}
        </button>
      </form>
    </div>
  )
}
