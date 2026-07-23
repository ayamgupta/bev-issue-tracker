// Issues and fixes mined from two WhatsApp owner group chats (~89,000 messages,
// filtered to ~9,600 issue-related messages, reviewed 2026-07-16) covering the
// Mahindra BE 6, XEV 9e and XEV 9S. Sender phone numbers were redacted before
// review; no personal information from the source chats is reproduced here.
// This supplements self-reported site data and forum evidence (see forumIssues.ts)
// with concrete, community-sourced fixes and workarounds.
// Update by re-running the same kind of chat-mining pass periodically.
import type { CarModel } from './carData'

export type IssueFrequency = 'widespread' | 'common' | 'multiple-reports' | 'isolated'

export const FREQUENCY_LABEL: Record<IssueFrequency, string> = {
  widespread: 'Widely reported',
  common: 'Commonly reported',
  'multiple-reports': 'Reported by multiple owners',
  isolated: 'Reported by a few owners',
}

// Higher = talked about more. Drives the default sort order on the Known Issues page.
export const FREQUENCY_RANK: Record<IssueFrequency, number> = {
  widespread: 4,
  common: 3,
  'multiple-reports': 2,
  isolated: 1,
}

export const CATEGORY_ICON: Record<string, string> = {
  'Ride & handling': '🚗',
  'Infotainment & audio': '🔊',
  'Safety-critical': '⚠️',
  'Powertrain & battery': '🔋',
  Charging: '⚡',
  Tyres: '🛞',
  Reliability: '🔩',
  'Comfort & convenience': '🛋️',
  'Build quality': '🔍',
  Software: '💾',
  'Service & maintenance': '🛠️',
}

export interface CommunityIssue {
  issue: string
  severity: 'major' | 'minor'
  category: string
  models: CarModel[]
  frequency: IssueFrequency
  description: string
  fix: string | null
}

export const COMMUNITY_ISSUES: CommunityIssue[] = [
  {
    issue: 'Suspension issue',
    severity: 'major',
    category: 'Ride & handling',
    models: ['BE 6', 'XEV 9e', 'XEV 9S'],
    frequency: 'widespread',
    description:
      'The single most-discussed problem among the community. The semi-active (Pack 3) suspension randomly locks hard, stays overly stiff, or produces uncontrolled side-to-side body roll — often traced to the suspension failing to initialize properly on startup. XEV 9S owners separately report a persistently soft/wobbly ride suspected to be hardware-related rather than a software bug.',
    fix: 'A full power cycle (shut down completely, wait 20-30s for the shutdown click/animation, restart) resets the suspension controller and is the most reliable immediate fix.\n\nMahindra\'s FSWU017/019/021 OTA updates progressively improved damping for many owners.\n\nFor persistent cases, service centres reflash the Front/Mid/Rear Zonal ECUs, recalibrate or replace the suspension (G-)sensor, and Mahindra has run a suspension-sensor TSB/recall for cars built before June 2025.\n\nCustom Drive Mode (from software v5) lets you pin the firmer Race-mode suspension setting to avoid the softer modes that seem to trigger the fault.',
  },
  {
    issue: 'Audio bass cut issue',
    severity: 'minor',
    category: 'Infotainment & audio',
    models: ['BE 6', 'XEV 9e', 'XEV 9S'],
    frequency: 'widespread',
    description:
      'Bass disappears or cuts out sharply once volume passes roughly 25-40%, tracked by owners to specific amplifier firmware versions pushed in OTA updates (owners reference version tags like HD455/HD476, "v912", "v3.912/v5.312").',
    fix: 'Fixed for many owners once the amplifier ECU is updated to firmware HD476 or later — this can arrive via the FSWU021 OTA update, or can be requested/manually flashed at a service centre via the MIDA diagnostic tool if the OTA hasn\'t reached your car.\n\nDIY workaround reported by some: set all EQ sliders to minimum, tap Reset, then re-raise bass/sub toward max before other bands.',
  },
  {
    issue: 'Steering failure / assist loss',
    severity: 'major',
    category: 'Safety-critical',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'Power steering suddenly goes very heavy or locks up mid-drive, usually alongside an EPS/steering-malfunction warning and sometimes a hill-descent-control error. Traced by service centres to a faulty steering "pigtail" wiring connector.',
    fix: 'An immediate ignition off/on (or a 5-10 minute full shutdown) releases the lock as a stopgap.\n\nThe permanent fix is replacement of the steering pigtail connector, which Mahindra has been handling as an unofficial/reactive recall — owners report being contacted by service centres rather than receiving a public recall notice, so proactively ask your SC to check the pigtail if you experience this.',
  },
  {
    issue: 'Coolant warning light',
    severity: 'major',
    category: 'Powertrain & battery',
    models: ['BE 6', 'XEV 9e', 'XEV 9S'],
    frequency: 'common',
    description:
      'Low-coolant or cooling-system-malfunction warnings, sometimes accompanied by reduced DC fast-charge speed (the battery cooling loop feeds charge-rate throttling). Root causes reported include a faulty degassing/pressure valve cap and, in more serious cases, water pump failure.',
    fix: 'Ask the service centre to isolate the actual leak rather than just topping up coolant — top-ups alone tend to recur within weeks.\n\nMahindra has issued a recall covering the degassing tank cap; if that doesn\'t resolve it, the water pump may need replacement (has taken up to 8 days at some service centres due to parts availability).',
  },
  {
    issue: 'Charging failure (DC fast charging)',
    severity: 'major',
    category: 'Charging',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'DC fast-charge sessions throttle well below the rated rate (e.g. 110kW dropping to 60kW or lower), stop within minutes of starting, or the charging gun/port feels loose or won\'t lock. A subset of cases traced to a failed OCDC (on-board charger/DC-DC converter) module, which can also disconnect AC charging or trigger an HV-disconnect immobilization.',
    fix: 'For throttled/dropped sessions: lock the car, move it slightly, and reconnect the charger — this resets the negotiated rate for many owners.\n\nIf the same charger works fine on another EV, or the issue follows the car across multiple chargers, ask the service centre to check the OCDC module (may require a warranty replacement, and parts can take weeks to arrive).',
  },
  {
    issue: 'Charging failure (AC)',
    severity: 'major',
    category: 'Charging',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'Home/portable AC charging stops a few minutes after starting, shows a low-voltage or "charging disconnected by car" error, or repeatedly stalls at 99% instead of completing to 100%.',
    fix: 'Check your MCB rating and earthing first — several cases traced to weak home earthing or an undersized circuit; a voltage stabilizer resolved it for some.\n\nIf it stalls at 99%, this is often normal BMS cell-balancing behaviour that resolves after a few charge cycles, or try a slower charger (3.3kW reached 100% for some owners when 7.2kW didn\'t).\n\nPersistent AC-only failures with no wiring cause may indicate an OCDC fault — see DC fast-charging entry above.',
  },
  {
    issue: 'Auto Hold malfunction',
    severity: 'major',
    category: 'Safety-critical',
    models: ['XEV 9e'],
    frequency: 'multiple-reports',
    description:
      'Auto Hold occasionally sticks engaged on one wheel after the driver accelerates away, clamping that brake caliper and generating enough heat to smell burning rubber and overheat the tyre/rim.',
    fix: 'Turning Auto Hold off resolves it immediately for the current drive.\n\nIf it recurs, get the brake/Auto Hold system inspected at a service centre — some owners now avoid Auto Hold in stop-start traffic as a precaution.',
  },
  {
    issue: 'Gear selector / Park switch malfunction',
    severity: 'major',
    category: 'Safety-critical',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'The gear selector gets stuck shifting only between P and N (won\'t engage D or R), or the Park (P) button/switch stops responding — in some cases requiring the driver to remove their seatbelt to physically reach and re-engage parking.',
    fix: 'A deep-sleep restart (lock and leave the car for 15-30 minutes) clears it temporarily for some owners.\n\nThe lasting fix is replacement of the gear shifter/Park switch assembly under warranty — several owners report Mahindra covering the full shifter-set replacement at no cost once diagnosed.',
  },
  {
    issue: '12V / LV auxiliary battery malfunction',
    severity: 'major',
    category: 'Powertrain & battery',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'A "Low Voltage Malfunction, contact Mahindra dealer" warning appears, sometimes intermittently and harmlessly, but in worse cases the 12V/LV battery drains enough that the car won\'t unlock, charge, or start (one case traced to a software update itself draining the LV battery).',
    fix: 'If the warning is intermittent, driving normally recharges the LV battery from the HV pack and no action is needed per Mahindra technicians — but get it checked if it recurs often.\n\nIf the car becomes unresponsive (no unlock/no start), the LV battery usually needs replacement under warranty; Mahindra reportedly switched 12V battery brand after a cluster of early failures.',
  },
  {
    issue: 'Vehicle immobilized / no-start',
    severity: 'major',
    category: 'Safety-critical',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'The car refuses to move or enters "Safe Mode" — sometimes with an HV-disconnect error, a "front camera inoperative" fault, or no error at all — cutting drivetrain power and sometimes power-steering assist.',
    fix: '1. Try a deep-sleep reset first: lock the car and walk away with the key for 15-30 minutes for a full shutdown/reboot.\n2. If that doesn\'t clear it, check the 12V battery terminal is tight.\n3. Persistent cases usually need a flatbed tow to a service centre — reported root causes include a faulty OCDC module and a disconnected HV plug that SC technicians reseated.',
  },
  {
    issue: 'Tyre issues (bursts / punctures / wear)',
    severity: 'major',
    category: 'Tyres',
    models: ['BE 6', 'XEV 9e', 'XEV 9S'],
    frequency: 'widespread',
    description:
      'Stock Goodyear tyres are the most frequent complaint: sidewall cuts and punctures at low mileage, occasional highway bursts, and screeching/skidding noise on braking that some service advisors dismiss as "normal." Warranty claims for sidewall damage are often rejected as non-manufacturing defects.',
    fix: 'Escalating to Mahindra\'s central customer care (rather than the local SC alone) has gotten full 4-tyre replacements approved in some disputed cases.\n\nMany owners have proactively switched to aftermarket Michelin, Continental, Bridgestone or MRF tyres.\n\nMahindra has reportedly been discussing a Goodyear-to-MRF Markus tyre swap program — worth asking your SC if you\'re affected.',
  },
  {
    issue: 'ADAS malfunction',
    severity: 'major',
    category: 'Safety-critical',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'Front radar/camera reports "inoperative" or a service request after 8-10 minutes of driving, disabling adaptive cruise, AEB and lane assist for the rest of the trip. Note: XEV 9e Pack 2 doesn\'t physically have corner radars, so some "radar failure" errors on P2 cars are the system looking for hardware that was never fitted.',
    fix: 'A cold reboot (full shutdown, wait for the relay-disconnect click, ~2 minutes) temporarily restores it for most owners.\n\nIf it\'s a genuine radar/camera fault (confirm the car actually has that sensor for its pack level), the part gets replaced and recalibrated at a service centre — parts lead time has run up to ~10 days in reported cases.',
  },
  {
    issue: 'ADAS ghost braking (false activation)',
    severity: 'major',
    category: 'Safety-critical',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'Automatic emergency braking or autoregen triggers with no real obstacle present — or, less often, fails to react to a real one ahead. Several owners report near-misses or minor collisions (including a rear-boot dent from unnecessary AEB) caused by this.',
    fix: 'No confirmed permanent fix; owners describe it as a known industry-wide "phantom braking" limitation of camera/radar AEB systems.\n\nSome set the AEBS warning threshold to "early" to get 2-3 extra seconds of warning before auto-braking fires, or disable specific ADAS features in dense city traffic.',
  },
  {
    issue: 'Software crash / infotainment freeze',
    severity: 'major',
    category: 'Infotainment & audio',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'Centre/passenger/cluster screens randomly go blank or the whole infotainment stack reboots while driving — in a few cases with a loud noise from the speakers just before the crash. Instrument cluster and AC generally keep working through it.',
    fix: 'Usually clears itself after a restart or two, though it can recur over following months.\n\nIn one confirmed case a faulty LVDR cable was the root cause and replacing it fully resolved recurring screen restarts — worth asking your SC to check that cable if the issue is frequent rather than a one-off.',
  },
  {
    issue: 'Rodent damage to wiring',
    severity: 'major',
    category: 'Reliability',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'Rats/rodents chewing exposed wiring and pipes in the engine bay and underbody — the windshield-washer pipe, sensor cables, and the charging-flap release wire are frequently hit, sometimes repeatedly on the same car within months.',
    fix: 'Repair means wiring/pipe replacement at a service centre (₹2,500-₹35,000 depending on scope) and is not reliably covered under warranty since it\'s physical/pest damage — some owners claimed it via insurance instead.\n\nNo repellent (sprays, tobacco strands) has proven consistently effective; several owners consider the exposed wiring layout a design flaw worth raising with Mahindra directly.',
  },
  {
    issue: 'Seat / ORVM memory malfunction',
    severity: 'minor',
    category: 'Comfort & convenience',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'Saved seat position, mirror dip-on-reverse, and other "memory" settings stop restoring automatically, need repeated button presses, or reset every time the car goes into deep sleep.',
    fix: 'A manual seat-calibration procedure helps some cars: hold the seat-base switch backward together with the memory (M) button for about 20 seconds to relearn the position.\n\nService centres can also relearn it with a diagnostic laptop.\n\nFor persistent cases hardware (seat motor) replacement under warranty has been needed.',
  },
  {
    issue: 'Auto lock / unlock malfunction',
    severity: 'minor',
    category: 'Comfort & convenience',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'Proximity (walk-away) lock and approach-unlock are unreliable or stop working after an OTA update; less commonly, the car unlocks itself unexpectedly with no one nearby, or unlocks whenever an AC charger is disconnected even while locked.',
    fix: 'Toggling the proximity setting off/on and power-cycling the car fixes it for some.\n\nPersistent cases have needed a service-centre reflash of the HPCC and Front Zonal ECUs.\n\nThe self-unlocking-while-charging behaviour has no confirmed fix yet — worth flagging to your SC given the theft-risk implications.',
  },
  {
    issue: 'App connectivity issues',
    severity: 'minor',
    category: 'Infotainment & audio',
    models: ['BE 6', 'XEV 9e', 'XEV 9S'],
    frequency: 'widespread',
    description:
      'The Me4U companion app loses sync with the car — stuck charging %, login/PIN errors, or a full "network connection failure" that also breaks in-car YouTube/Alexa/Mapples. Several multi-day outages have been confirmed by owners as Mahindra-side server issues, not individual car faults.',
    fix: 'For app-only glitches: log out and back in, or uninstall/reinstall the app.\n\nServer-side outages resolve on their own within a day or two — no owner-side fix exists for those.\n\nPersistent in-car connectivity loss has occasionally been resolved by a service centre disconnecting/reconnecting the LV battery to reset the telematics module.',
  },
  {
    issue: 'Secure360 / remote camera view issue',
    severity: 'minor',
    category: 'Infotainment & audio',
    models: ['XEV 9e'],
    frequency: 'multiple-reports',
    description:
      'The Secure360 remote/live camera view stops working via the app, sometimes after a software update, and the 540°-view setting can reset every time the vehicle powers off.',
    fix: 'No consistent owner-side fix; some report it intermittently starting to work again with a 5-10s delay.\n\nOne service centre told an owner this specific reset-on-power-off behaviour would not be addressed even in the next software update — worth confirming current status with your SC before assuming it\'s fixable.',
  },
  {
    issue: 'Panel gaps / fit & finish',
    severity: 'minor',
    category: 'Build quality',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'Uneven body-panel gaps, matte-instead-of-glossy piano-black cladding after a repaint, cladding popping loose in heat, and the occasional panel (bumper trim, wheel cap) detaching while driving.',
    fix: 'Bodyshop realignment at the service centre resolves simple gap issues.\n\nFor paint-quality mismatches, note that replacement cladding often arrives unpainted from Mahindra and is painted locally by the SC — escalate directly to Mahindra if the finish doesn\'t match, since SC paint-shop experience varies.\n\nDetached panels have been replaced under warranty when/if evidence is presented.',
  },
  {
    issue: 'Brake noise (squeal / vibration)',
    severity: 'minor',
    category: 'Ride & handling',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'Squealing, screeching, or a "khat" clacking noise from the brakes during light or moderate braking — distinct from any loss of stopping power. Attributed by owners to rust/moisture buildup on the discs, since EVs use regen braking far more than friction brakes, so the pads rarely self-clean.',
    fix: 'A brake-cleaner spray on the caliper/disc at the service centre gives temporary relief for most owners, but it tends to recur within weeks since the underlying regen-brake-underuse cause isn\'t fixed by cleaning.\n\nIf it doesn\'t improve, ask the SC to check for a warped disc or misaligned caliper rather than accepting a repeat clean.',
  },
  {
    issue: 'Android Auto / CarPlay connectivity issue',
    severity: 'minor',
    category: 'Infotainment & audio',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'common',
    description:
      'Wireless Android Auto/CarPlay drops mid-drive (especially after a phone call ends) and doesn\'t reconnect without a manual toggle; some owners also see CarPlay screen pixelating/glitching or the on-screen trackpad not responding.',
    fix: 'Switch the audio source away from AA/CarPlay and back, or reconnect manually — usually restores it without a restart.\n\nSome owners traced part of this to a known Android Auto app-side bug (fixed by updating the Android Auto app itself, separate from the car\'s software); using a wired connection instead of wireless sidesteps it entirely for CarPlay pixelating.',
  },
  {
    issue: 'OTA update failure',
    severity: 'major',
    category: 'Software',
    models: ['BE 6', 'XEV 9e', 'XEV 9S'],
    frequency: 'common',
    description:
      'An over-the-air update appears to hang for hours at a percentage (commonly 90-99%), or shows an "update interrupted, contact service centre" error.',
    fix: '1. If stuck above ~90% for over an hour, it has very often actually finished — the on-screen percentage is just stale.\n2. Lock the car and leave the key away for 20-30 minutes to force a full clean shutdown/reboot, which usually registers the completed update.\n3. If it still shows as interrupted afterward, a service-centre visit is needed to re-flash.',
  },
  {
    issue: 'Sunroof malfunction',
    severity: 'minor',
    category: 'Comfort & convenience',
    models: ['XEV 9S'],
    frequency: 'multiple-reports',
    description:
      'Sunroof/sunshade gets stuck open or won\'t close, most notably after the FSWU019 update on the XEV 9S, which broke sunshade closing for a number of owners even after a restart.',
    fix: 'With the car in Park, hold the sunroof button for about 30 seconds to force a reset/relearn of the sunroof\'s end positions — this resolved it for several owners without a service visit.',
  },
  {
    issue: 'AC / climate control quirks',
    severity: 'minor',
    category: 'Comfort & convenience',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'widespread',
    description:
      'AC intermittently stops cooling (fan still runs), a persistent earthy/burnt smell from the vents with the cabin AQI display stuck high, or Auto mode only blowing from leg vents.',
    fix: 'A loose connector is a common root cause for cooling dropouts — SC reseating or replacing it fixes many cases; a full Climate Control Module replacement has been needed when reflashing doesn\'t help.\n\nFor persistent odor, replacing the cabin filter gives partial relief; evaporator cleaning (via the frunk access pipe) has helped when the SC agrees to do it, though some SCs decline saying it isn\'t needed.\n\nA recall exists for broken/faulty AC vents on some VINs — ask your SC directly if unsure it applies to your car.',
  },
  {
    issue: 'Horn malfunction',
    severity: 'minor',
    category: 'Reliability',
    models: [],
    frequency: 'isolated',
    description: 'Horn intermittently fails to sound when pressed, or makes a hollow/vibration noise from the mount.',
    fix: 'No consistent fix reported; a hollow-noise case self-resolved after several days for one owner. Get it checked at a service centre if the horn fails to sound at all, since that\'s a safety-relevant fault.',
  },
  {
    issue: 'Door handle / lock malfunction',
    severity: 'minor',
    category: 'Reliability',
    models: [],
    frequency: 'isolated',
    description:
      'Door handle stays retracted even when the car is unlocked, or a door releases from its lock but won\'t physically open, sometimes traced to a Door Control Module (DCM) communication error.',
    fix: 'For a stuck handle, holding the small square icon/sensor near the handle for about 20 seconds has fixed it for some owners.\n\nFor a door that releases but won\'t open, a service-centre DCM firmware reflash has resolved it; in the worst cases the entire door lock/handle unit needs replacement under warranty.',
  },
  {
    issue: 'HUD display quality issue',
    severity: 'minor',
    category: 'Infotainment & audio',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'isolated',
    description: 'Heads-up display appears blurry or shows a faint double image, noticeably worse than HUDs owners have seen on other brands.',
    fix: 'Manually adjusting the HUD position/height in settings improves it for some.\n\nService centres have offered a HUD glass replacement, but owners note this is a bigger electronics job with no guaranteed improvement — weigh that against how much it bothers you before requesting it.',
  },
  {
    issue: 'Wiper / washer issues',
    severity: 'minor',
    category: 'Reliability',
    models: [],
    frequency: 'common',
    description: 'Wipers streak/leave marks, drag with an audible noise, or (occasionally) make noise even in light rain due to a software calibration bug.',
    fix: 'Stock blades wear or were poor quality for several owners, who switched to aftermarket Bosch or other rigid-frame blades for smoother, quieter operation.\n\nIf the noise is a software issue rather than the blades, a wiper-calibration pass during an SC software reflash session has resolved it in at least one case.\n\nOne thing to know before you shop: the factory sizes are odd, non-standard lengths, so matching blades exactly can be a hunt. Going an inch over or under stock is fine though, which has given owners some easy aftermarket options — 26" driver / 21" passenger for the BE 6, and 24" driver / 16" passenger for the XEV 9e.',
  },
  {
    issue: 'Braking system issue',
    severity: 'major',
    category: 'Safety-critical',
    models: [],
    frequency: 'isolated',
    description:
      'A small number of owners report a genuine loss of braking response (not just noise) for a moment while driving, in one case leading to a collision. Distinct from the much more common cosmetic brake-noise complaint above.',
    fix: 'No confirmed owner-side fix.\n\nIf this happens to you, report it to Mahindra immediately and request the vehicle\'s driving logs be pulled — this is a safety-critical fault that warrants formal escalation rather than a workaround.',
  },
  {
    issue: 'Camera / sensor false alerts',
    severity: 'minor',
    category: 'Safety-critical',
    models: ['BE 6', 'XEV 9e'],
    frequency: 'multiple-reports',
    description: 'Parking sensors beep with no obstacle present, tyre-pressure/temperature sensors briefly show implausible readings, or a mirror camera feed doesn\'t display when indicating.',
    fix: 'A restart clears most of these false readings.\n\nPersistently wrong TPMS readings can be affected by RF interference or very low speed — a manual TPMS-learning routine at the service centre can help if it doesn\'t clear on its own.',
  },
  {
    issue: 'Service reminder popping up randomly',
    severity: 'minor',
    category: 'Service & maintenance',
    models: ['BE 6', 'XEV 9e', 'XEV 9S'],
    frequency: 'widespread',
    description:
      'A "service due"/service-reminder alert pops up in the cluster or Me4U app well before the actual service is due — often within 200-2,500km of a completed service, and sometimes on nearly every drive-cycle start. Widely reported and, per owners who\'ve asked their SC directly, treated by Mahindra as a known false-trigger bug rather than a real overdue-service condition. A minority of owners have had it recur every time no matter what they try.',
    fix: 'Owners self-reset it in-car using the "BE6/XEV9 Service Reminder Reset" video on the Mahindra DIY YouTube channel (youtu.be/zouTwpFCDdk).\n\nSteps:\n1. Turn the car on in ACC mode, without pressing any pedal.\n2. Check the CID/DID to confirm the alert is present.\n3. Press and hold the OK button (rightmost button on the steering wheel).\n4. While still holding OK, turn the ignition off and wait for the screen to go fully black.\n5. Still holding OK, turn the ignition back on and keep holding for about 10 seconds, until the car finishes booting.\n6. Release OK and check the CID/alert history to confirm the reminder is gone.\n\nIf it doesn\'t stick, ask the SC to do it for you — some do it as a quick in-and-out visit, and some proactively switch the reminder off before handing the car back after a scheduled service. That said, several owners report it reappearing within a few hundred km regardless, or the steps simply stopping working for them.\n\nAlso worth knowing: when the feature is working correctly, the alert is meant to start appearing about 400km before the scheduled service is actually due — if you\'re seeing it much earlier than that, it\'s the bug, not a real early-service signal.',
  },
]

export const ISSUE_CATEGORIES = Array.from(new Set(COMMUNITY_ISSUES.map((i) => i.category)))
