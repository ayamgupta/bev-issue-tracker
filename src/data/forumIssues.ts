// Owner-forum evidence for known issues, gathered 2026-07-14 from Team-BHP threads
// (Reddit turned up no substantive discussion — these models are too new there).
// This supplements our own self-reported data: an issue can rank here even with
// zero site reports if it's a well-documented forum complaint, so new site visitors
// see known risks early rather than waiting for enough owners to submit reports.
// Update by re-running the same kind of search periodically; only include issues
// with real, cited evidence — no guessing or extrapolating counts.
import type { CarModel } from './carData'

export type ForumSignal = 'low' | 'low-medium' | 'medium' | 'medium-high' | 'high'

export const FORUM_SIGNAL_WEIGHT: Record<ForumSignal, number> = {
  low: 1,
  'low-medium': 2,
  medium: 3,
  'medium-high': 4,
  high: 5,
}

export interface ForumIssueEvidence {
  issue: string
  severity: 'major' | 'minor'
  models: CarModel[]
  signal: ForumSignal
  note: string
  sources: string[]
}

export const FORUM_ISSUES: ForumIssueEvidence[] = [
  {
    issue: 'Vehicle immobilized / no-start',
    severity: 'major',
    models: ['XEV 9e'],
    signal: 'medium-high',
    note: '"High voltage system disconnected" fault causing sudden loss of power at highway speed, recurring across 4 separate incidents for one owner even after a service-centre firmware check.',
    sources: [
      'https://www.team-bhp.com/news/4-sudden-shutdowns-just-2-months-my-xev-9e-ownership-experience',
      'https://www.team-bhp.com/forum/electric-cars/305826-four-highway-shutdowns-under-two-months-my-mahindra-xev-9e-nightmare.html',
    ],
  },
  {
    issue: 'ADAS malfunction',
    severity: 'major',
    models: ['XEV 9e'],
    signal: 'medium',
    note: 'AEBS calibration reportedly worsened after an OTA update (late collision warnings), ADAS failing to detect unlit heavy vehicles at night, and a low-speed bump disabling ADAS with warning lights.',
    sources: ['https://www.team-bhp.com/forum/electric-cars/288186-mahindra-xev-9e-review-97.html'],
  },
  {
    issue: 'Motor / drivetrain fault',
    severity: 'major',
    models: ['XEV 9e'],
    signal: 'low',
    note: 'Reports of the gear selector failing to engage Drive from Park, defaulting to Neutral, requiring a restart.',
    sources: ['https://www.team-bhp.com/forum/electric-cars/288186-mahindra-xev-9e-review-97.html'],
  },
  {
    issue: 'Charging failure (DC fast charging)',
    severity: 'major',
    models: ['BE 6'],
    signal: 'low-medium',
    note: 'A 30kW DC charger reportedly delivered far below rated output (~25% charge after an hour); also covered independently by Cartoq as a wider "charging crisis" complaint.',
    sources: ['https://www.cartoq.com/car-life/ev-charging-crisis-mahindra-be6-owners-near-stranding-experience-delhi/'],
  },
  {
    issue: 'Software crash / infotainment freeze',
    severity: 'major',
    models: ['BE 6', 'XEV 9e'],
    signal: 'high',
    note: 'Touchscreen freezing and blank instrument cluster/infotainment for up to 5 minutes after ignition — recurring across multiple independent threads and covered by The Ken.',
    sources: [
      'https://www.team-bhp.com/forum/attachments/electric-cars/2755149d1746448029-mahindra-xev-9e-review-mahindra-6-xev-9e-10-real-world-issues-what-check.pdf',
      'https://the-ken.com/story/mahindras-new-evs-promise-the-future-but-the-software-is-still-loading/',
    ],
  },
  {
    issue: 'Infotainment lag / UI bugs',
    severity: 'minor',
    models: ['BE 6', 'XEV 9e'],
    signal: 'high',
    note: 'Audio mute bug (workaround: hold volume+home for 10s), CarPlay non-functional at launch, keyless entry glitches — recurring across multiple independent threads.',
    sources: [
      'https://www.team-bhp.com/forum/attachments/electric-cars/2755149d1746448029-mahindra-xev-9e-review-mahindra-6-xev-9e-10-real-world-issues-what-check.pdf',
      'https://www.team-bhp.com/forum/electric-cars/288186-mahindra-xev-9e-review-97.html',
    ],
  },
  {
    issue: 'App connectivity issues',
    severity: 'minor',
    models: ['BE 6', 'XEV 9e'],
    signal: 'medium',
    note: '"Me4U" companion app issues reported as part of the same real-world-issues roundup.',
    sources: [
      'https://www.team-bhp.com/forum/attachments/electric-cars/2755149d1746448029-mahindra-xev-9e-review-mahindra-6-xev-9e-10-real-world-issues-what-check.pdf',
    ],
  },
  {
    issue: 'Camera / sensor false alerts',
    severity: 'minor',
    models: ['BE 6'],
    signal: 'medium',
    note: 'Adaptive Cruise Control throwing "Cannot enter Adaptive Cruise Control" errors and unreliable TPMS readings — though the same thread notes some owners report no issues at all.',
    sources: ['https://www.team-bhp.com/forum/electric-cars/295566-mahindra-be6-ev-ownership-review-log.html'],
  },
  {
    issue: 'Minor software glitches (non-critical)',
    severity: 'minor',
    models: ['BE 6'],
    signal: 'low-medium',
    note: 'Unreliable trip A/B meter readings reported alongside the ACC/TPMS complaints above.',
    sources: ['https://www.team-bhp.com/forum/electric-cars/295566-mahindra-be6-ev-ownership-review-log.html'],
  },
  {
    issue: 'Panel gaps / fit & finish',
    severity: 'minor',
    models: ['XEV 9e'],
    signal: 'low-medium',
    note: 'Left rear door piano-black insert catching under the front insert, causing a loud noise on opening.',
    sources: ['https://www.team-bhp.com/forum/electric-cars/288186-mahindra-xev-9e-review-97.html'],
  },
]
