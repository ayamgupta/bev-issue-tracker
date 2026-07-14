import { useState, type FormEvent } from 'react'
import {
  CAR_MODELS,
  MAJOR_ISSUES,
  MINOR_ISSUES,
  VARIANTS_BY_MODEL,
  type CarModel,
} from '../data/carData'
import { CheckboxGroup } from '../components/CheckboxGroup'
import { RatingInput } from '../components/RatingInput'
import { Turnstile } from '../components/Turnstile'
import { submitReport } from '../lib/api'

const currentYear = new Date().getFullYear()

export function Report() {
  const [carModel, setCarModel] = useState<CarModel>('BE 6')
  const [variant, setVariant] = useState(VARIANTS_BY_MODEL['BE 6'][0])
  const [purchaseYear, setPurchaseYear] = useState(currentYear)
  const [odoKm, setOdoKm] = useState('')
  const [city, setCity] = useState('')
  const [serviceCenter, setServiceCenter] = useState('')
  const [majorIssues, setMajorIssues] = useState<string[]>([])
  const [minorIssues, setMinorIssues] = useState<string[]>([])
  const [hardwareRating, setHardwareRating] = useState(0)
  const [softwareRating, setSoftwareRating] = useState(0)
  const [serviceRating, setServiceRating] = useState(0)
  const [overallRating, setOverallRating] = useState(0)
  const [notes, setNotes] = useState('')

  const [regNumber, setRegNumber] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [contactNumber, setContactNumber] = useState('')

  const [turnstileToken, setTurnstileToken] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function handleModelChange(model: CarModel) {
    setCarModel(model)
    setVariant(VARIANTS_BY_MODEL[model][0])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!odoKm || !city.trim()) {
      setErrorMessage('Please fill in the required fields.')
      return
    }
    if (!hardwareRating || !softwareRating || !serviceRating || !overallRating) {
      setErrorMessage('Please rate all four satisfaction categories.')
      return
    }
    if (!turnstileToken) {
      setErrorMessage('Please complete the verification widget.')
      return
    }

    setStatus('submitting')
    try {
      await submitReport({
        reg_number: regNumber || undefined,
        owner_name: ownerName || undefined,
        contact_number: contactNumber || undefined,
        car_model: carModel,
        variant,
        purchase_year: purchaseYear,
        odo_km: Number(odoKm),
        city: city.trim(),
        service_center: serviceCenter || undefined,
        major_issues: majorIssues,
        minor_issues: minorIssues,
        hardware_rating: hardwareRating,
        software_rating: softwareRating,
        service_rating: serviceRating,
        overall_rating: overallRating,
        notes: notes || undefined,
        turnstile_token: turnstileToken,
      })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-ink-50">Thanks for sharing your experience</h1>
        <p className="mt-3 text-ink-500">
          Your report has been recorded and will appear in the public analytics once reviewed.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-ink-900 dark:text-ink-50">Report your ownership experience</h1>
      <p className="mt-2 text-sm text-ink-500">
        Every field below except your car model, mileage, city and ratings is optional. Registration number, name
        and phone number are used only to detect duplicate/fake entries and are never shown publicly.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
          <h2 className="font-semibold text-ink-900 dark:text-ink-50">Vehicle details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-ink-700 dark:text-ink-200">Car model *</span>
              <select
                value={carModel}
                onChange={(e) => handleModelChange(e.target.value as CarModel)}
                className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
              >
                {CAR_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-ink-700 dark:text-ink-200">Variant *</span>
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
              >
                {VARIANTS_BY_MODEL[carModel].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-ink-700 dark:text-ink-200">Purchase year *</span>
              <input
                type="number"
                min={2023}
                max={currentYear + 1}
                value={purchaseYear}
                onChange={(e) => setPurchaseYear(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-ink-700 dark:text-ink-200">Current odometer (km) *</span>
              <input
                type="number"
                min={0}
                required
                value={odoKm}
                onChange={(e) => setOdoKm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-ink-700 dark:text-ink-200">City *</span>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-ink-700 dark:text-ink-200">Service centre</span>
              <input
                type="text"
                value={serviceCenter}
                onChange={(e) => setServiceCenter(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
          <h2 className="font-semibold text-ink-900 dark:text-ink-50">Major issues</h2>
          <p className="mt-1 text-sm text-ink-500">Safety- or drivability-affecting problems.</p>
          <div className="mt-4">
            <CheckboxGroup options={MAJOR_ISSUES} selected={majorIssues} onChange={setMajorIssues} />
          </div>
        </section>

        <section className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
          <h2 className="font-semibold text-ink-900 dark:text-ink-50">Minor issues</h2>
          <p className="mt-1 text-sm text-ink-500">Cosmetic or quality-of-life annoyances.</p>
          <div className="mt-4">
            <CheckboxGroup options={MINOR_ISSUES} selected={minorIssues} onChange={setMinorIssues} />
          </div>
        </section>

        <section className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
          <h2 className="font-semibold text-ink-900 dark:text-ink-50">Satisfaction *</h2>
          <div className="mt-2 divide-y divide-ink-100 dark:divide-ink-800">
            <RatingInput label="Hardware" value={hardwareRating} onChange={setHardwareRating} />
            <RatingInput label="Software" value={softwareRating} onChange={setSoftwareRating} />
            <RatingInput label="Service" value={serviceRating} onChange={setServiceRating} />
            <RatingInput label="Overall ownership" value={overallRating} onChange={setOverallRating} />
          </div>
        </section>

        <section className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
          <h2 className="font-semibold text-ink-900 dark:text-ink-50">Anything else?</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Optional free-text details about your experience"
            className="mt-3 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
          />
        </section>

        <section className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
          <h2 className="font-semibold text-ink-900 dark:text-ink-50">Optional: help us verify this is real</h2>
          <p className="mt-1 text-sm text-ink-500">
            Never shown publicly. Stored separately from your report and used only to catch duplicate/fake
            submissions.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-ink-700 dark:text-ink-200">Registration number</span>
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
