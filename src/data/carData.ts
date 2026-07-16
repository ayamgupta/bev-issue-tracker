// Mahindra BEV model + variant reference data.
// Source: mahindraelectricsuv.com and Mahindra press releases (2025-2026 lineup).
// Update this file as Mahindra adds/changes variants — it's the single source of truth
// for the dropdowns on the report form and the analytics filters.

export const CAR_MODELS = ['BE 6', 'XEV 9e', 'XEV 9S'] as const
export type CarModel = (typeof CAR_MODELS)[number]

export const BATTERY_PACKS = ['59 kWh', '79 kWh'] as const
export type BatteryPack = (typeof BATTERY_PACKS)[number]

export const VARIANTS_BY_MODEL: Record<CarModel, string[]> = {
  'BE 6': ['Pack One', 'Pack Two', 'Pack Three', 'Pack Three Select', 'BE 6 FE', 'BE 6 Batman Edition'],
  'XEV 9e': ['Pack One', 'Pack Two', 'Pack Three', 'Pack Three Select', 'XEV 9e Cineluxe'],
  'XEV 9S': ['Pack One Above', 'Pack Two Above', 'Pack Three', 'Pack Three Above'],
}

// import.meta.env.BASE_URL matches Vite's `base` config (see vite.config.ts) —
// on GitHub Pages that's "/<repo-name>/", not "/", so plain "/images/..."
// strings would 404 there even though they work in local dev.
const imagesBase = `${import.meta.env.BASE_URL}images/`

export const CAR_MODEL_INFO: Record<CarModel, { tagline: string; image: string }> = {
  'BE 6': {
    tagline: 'Coupe SUV · born electric origin',
    image: `${imagesBase}be6.png`,
  },
  'XEV 9e': {
    tagline: 'Coupe SUV · flagship electric',
    image: `${imagesBase}xev9e.png`,
  },
  'XEV 9S': {
    tagline: 'SUV · practical electric',
    image: `${imagesBase}xev9s.png`,
  },
}

export const MAJOR_ISSUES = [
  'Battery degradation / range loss',
  'Motor / drivetrain fault',
  'Charging failure (AC)',
  'Charging failure (DC fast charging)',
  'Software crash / infotainment freeze',
  'ADAS malfunction',
  'ADAS ghost braking (false activation)',
  'OTA update failure',
  'Braking system issue',
  'Steering failure / assist loss',
  'Coolant warning light',
  'Suspension issue',
  'Electrical system failure',
  'Vehicle immobilized / no-start',
  'Water leakage (major)',
  'Airbag / safety system warning',
  'Thermal / battery warning light',
  'Tyre issues (bursts / punctures / wear)',
  'Auto Hold malfunction',
  'Gear selector / Park switch malfunction',
  '12V / LV auxiliary battery malfunction',
] as const

export const MINOR_ISSUES = [
  'Infotainment lag / UI bugs',
  'Bluetooth / connectivity glitches',
  'App connectivity issues',
  'Secure360 / remote camera view issue',
  'Remote app commands not executing',
  'Panel gaps / fit & finish',
  'Paint defects',
  'Rattling / squeaky noises',
  'Minor water seepage',
  'Wiper / washer issues',
  'AC / climate control quirks',
  'Camera / sensor false alerts',
  'Charging port cover issue',
  'Seat / upholstery wear',
  'Seat / ORVM memory malfunction',
  'Auto lock / unlock malfunction',
  'Android Auto / CarPlay connectivity issue',
  'Audio bass cut issue',
  'Audio cracking / distortion',
  'Audio balance / speaker focus issue',
  'Minor software glitches (non-critical)',
  'Brake noise (squeal / vibration)',
  'Rodent damage to wiring',
  'Sunroof malfunction',
  'Horn malfunction',
  'Door handle / lock malfunction',
  'HUD display quality issue',
] as const

// Suggestions only (datalist) — not an enum, since owners may have fitted
// aftermarket brands we haven't listed. Free text is always accepted.
export const TYRE_BRAND_SUGGESTIONS = [
  'MRF',
  'CEAT',
  'Apollo',
  'JK Tyre',
  'Goodyear',
  'Bridgestone',
  'Continental',
  'Michelin',
  'Yokohama',
] as const

export const SERVICE_CENTER_ASPECTS = [
  'Spare parts availability',
  'Turnaround time',
  'Staff technical knowledge',
  'Cost transparency',
  'Pickup & drop service',
  'Communication / updates',
] as const

export type SatisfactionRating = 1 | 2 | 3 | 4 | 5
