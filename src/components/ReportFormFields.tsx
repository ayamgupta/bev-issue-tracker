import {
  BATTERY_PACKS,
  CAR_MODELS,
  MAJOR_ISSUES,
  MINOR_ISSUES,
  TYRE_BRAND_SUGGESTIONS,
  VARIANTS_BY_MODEL,
  type BatteryPack,
  type CarModel,
} from '../data/carData'
import { CheckboxGroup } from './CheckboxGroup'
import { RatingInput } from './RatingInput'

const currentYear = new Date().getFullYear()

export interface ReportFormValues {
  carModel: CarModel
  variant: string
  batteryPack: BatteryPack
  purchaseYear: number
  odoKm: string
  city: string
  serviceCenter: string
  majorIssues: string[]
  minorIssues: string[]
  hardwareRating: number
  softwareRating: number
  serviceRating: number
  overallRating: number
  notes: string
  notesPublicOptIn: boolean
  softwareVersion: string
  tyreBrand: string
  tyreLifeRemainingPct: string
}

interface ReportFormFieldsProps {
  values: ReportFormValues
  onChange: <K extends keyof ReportFormValues>(key: K, value: ReportFormValues[K]) => void
}

export function ReportFormFields({ values, onChange }: ReportFormFieldsProps) {
  function handleModelChange(model: CarModel) {
    onChange('carModel', model)
    onChange('variant', VARIANTS_BY_MODEL[model][0])
  }

  return (
    <>
      <section className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <h2 className="font-semibold text-ink-900 dark:text-ink-50">Vehicle details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-ink-700 dark:text-ink-200">Car model *</span>
            <select
              value={values.carModel}
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
              value={values.variant}
              onChange={(e) => onChange('variant', e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
            >
              {VARIANTS_BY_MODEL[values.carModel].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink-700 dark:text-ink-200">Battery pack *</span>
            <select
              value={values.batteryPack}
              onChange={(e) => onChange('batteryPack', e.target.value as BatteryPack)}
              className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
            >
              {BATTERY_PACKS.map((b) => (
                <option key={b} value={b}>
                  {b}
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
              value={values.purchaseYear}
              onChange={(e) => onChange('purchaseYear', Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink-700 dark:text-ink-200">Current odometer (km) *</span>
            <input
              type="number"
              min={0}
              required
              value={values.odoKm}
              onChange={(e) => onChange('odoKm', e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink-700 dark:text-ink-200">City *</span>
            <input
              type="text"
              required
              value={values.city}
              onChange={(e) => onChange('city', e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink-700 dark:text-ink-200">Service centre</span>
            <input
              type="text"
              value={values.serviceCenter}
              onChange={(e) => onChange('serviceCenter', e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-ink-700 dark:text-ink-200">Current software version</span>
            <input
              type="text"
              value={values.softwareVersion}
              onChange={(e) => onChange('softwareVersion', e.target.value)}
              placeholder="e.g. A15.33.912"
              className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
            />
            <span className="mt-1 block text-xs text-ink-500">
              Enter the ECU Version exactly as shown, e.g. A15.33.912. To check: My Vehicle → External → press and
              hold the lock button for 10 seconds → ECU Version.
            </span>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink-700 dark:text-ink-200">Tyre brand</span>
            <input
              type="text"
              list="tyre-brand-suggestions"
              value={values.tyreBrand}
              onChange={(e) => onChange('tyreBrand', e.target.value)}
              placeholder="e.g. MRF"
              className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
            />
            <datalist id="tyre-brand-suggestions">
              {TYRE_BRAND_SUGGESTIONS.map((brand) => (
                <option key={brand} value={brand} />
              ))}
            </datalist>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink-700 dark:text-ink-200">Estimated tyre life remaining (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={values.tyreLifeRemainingPct}
              onChange={(e) => onChange('tyreLifeRemainingPct', e.target.value)}
              placeholder="e.g. 70"
              className="mt-1 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <h2 className="font-semibold text-ink-900 dark:text-ink-50">Major issues</h2>
        <p className="mt-1 text-sm text-ink-500">Safety- or drivability-affecting problems.</p>
        <div className="mt-4">
          <CheckboxGroup options={MAJOR_ISSUES} selected={values.majorIssues} onChange={(v) => onChange('majorIssues', v)} />
        </div>
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <h2 className="font-semibold text-ink-900 dark:text-ink-50">Minor issues</h2>
        <p className="mt-1 text-sm text-ink-500">Cosmetic or quality-of-life annoyances.</p>
        <div className="mt-4">
          <CheckboxGroup options={MINOR_ISSUES} selected={values.minorIssues} onChange={(v) => onChange('minorIssues', v)} />
        </div>
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <h2 className="font-semibold text-ink-900 dark:text-ink-50">Satisfaction *</h2>
        <div className="mt-2 divide-y divide-ink-100 dark:divide-ink-800">
          <RatingInput label="Hardware" value={values.hardwareRating} onChange={(v) => onChange('hardwareRating', v)} />
          <RatingInput label="Software" value={values.softwareRating} onChange={(v) => onChange('softwareRating', v)} />
          <RatingInput label="Service" value={values.serviceRating} onChange={(v) => onChange('serviceRating', v)} />
          <RatingInput label="Overall ownership" value={values.overallRating} onChange={(v) => onChange('overallRating', v)} />
        </div>
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <h2 className="font-semibold text-ink-900 dark:text-ink-50">Anything else?</h2>
        <textarea
          value={values.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Optional free-text details about your experience"
          className="mt-3 w-full rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950"
        />
        <label className="mt-3 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-brand-500"
            checked={values.notesPublicOptIn}
            onChange={(e) => onChange('notesPublicOptIn', e.target.checked)}
          />
          <span className="text-ink-600 dark:text-ink-300">
            Share the note above publicly as an anonymous quote on the dashboard (your model and city may be shown,
            never your name or contact details). Please don't include any personal information in it — it will be
            shown exactly as written.
          </span>
        </label>
      </section>
    </>
  )
}
