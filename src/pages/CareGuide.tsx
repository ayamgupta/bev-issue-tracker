import { usePageMeta } from '../lib/usePageMeta'

type Tip = {
  title: string
  body: string
}

const RANGE_TIPS: Tip[] = [
  {
    title: 'Drive smoothly, not in bursts',
    body:
      'Avoid frequent, rapid acceleration — it drains the battery faster and hurts range. Use Default or Range drive mode, set regeneration to Level 1 or Level 2 for the best efficiency, and switch to "Power Saving Mode" once you’re under 20% state of charge.',
  },
  {
    title: 'Keep your speed under ~100 km/h',
    body:
      'The manual’s own range table shows the drop-off clearly: city driving (up to 45 km/h, typical average 20–25 km/h) is rated 450–500 km; general highway cruising (up to 110 km/h, typical average up to 70 km/h) drops to 350–400 km; sustained "extra highway" speeds above 120 km/h for 10%+ of the trip fall below 300 km. Maintain a steady speed — adaptive cruise control helps — and keep highway speeds under 100 km/h for the best range.',
  },
  {
    title: 'Go easy on the accelerator pedal',
    body:
      'The BE 6 accelerates quicker than it feels. For the best range and a consistent drive, apply the pedal gradually and operate it with a light foot rather than stabbing at it.',
  },
  {
    title: 'Dial in your AC settings',
    body:
      'Recommended cabin setting is 23–24°C with AC in Auto mode 1 or 2. Avoid very low cabin temperatures and use "Economy" AC mode when idle. Use Driver-Only mode when only the driver is aboard, and if using Dual AC zones, keep the difference between driver and co-driver settings to 3°C or less (SYNC mode avoids this entirely).',
  },
  {
    title: 'Watch temperature and terrain',
    body:
      'Per the manual’s own figures: above 35°C, expect up to a 25% range hit in city driving and up to 15% on the highway; below 15°C, expect up to a 15% hit. Sustained uphill driving can cut range by 20–25% depending on grade and duration, and rain/snow reduce range further by interrupting regenerative braking.',
  },
  {
    title: 'Keep tyres and alignment in check',
    body:
      'Maintain the recommended tyre pressure per the TPMS reading, check tyre health periodically, and get wheel alignment/balancing checked if needed. Rotate tyres every 10,000 km and wash wheels regularly to clear road salt, grime and brake dust — all per the Warranty & Service Information Guide.',
  },
  {
    title: 'Travel light, avoid rough roads',
    body:
      'Vehicle load matters: the manual notes that a fully loaded (driver + 4) vehicle can reduce range by 10–15% versus a lighter load. Remove roof racks and unnecessary cargo when not needed, and avoid bumpy, rough or slippery roads where possible.',
  },
  {
    title: 'Mind AC use on short trips',
    body:
      'Short trips with long stops or long idling with the AC running hit range harder than the distance alone would suggest, due to climate-control and onboard-system draw. If cabin cooling feels noticeably weaker than usual, get the AC filter checked — Mahindra recommends replacing it every 10,000 km.',
  },
]

const BATTERY_TIPS: Tip[] = [
  {
    title: 'Never let it hit 0%',
    body:
      'Discharging the HV battery to 0% can damage vehicle components, and persistent deep discharges cause permanent degradation. The manual also separately warns against routinely draining below 5% SOC. If the battery does fully discharge, resulting repair/tow costs aren’t covered under warranty.',
  },
  {
    title: "...but don't leave it sitting at 100% either",
    body:
      'While a full charge session (100% SOC) is fine and expected, the manual cautions against leaving the vehicle parked at 100% SOC for prolonged periods, as it may reduce battery longevity. Charge fully when you need the range, not as a permanent resting state.',
  },
  {
    title: 'Before a long trip away, charge above 50% — then top up on return',
    body:
      'Before leaving the vehicle for an extended resting period, always charge to above 50% SOC. After the resting period is over, charge back up to 100% using a Normal (AC) charger before driving.',
  },
  {
    title: 'Disconnect the 12V battery for stays over 30 days',
    body:
      'If the vehicle will rest for more than 30 days, disconnect the negative terminal of the low-voltage (12V) battery — this reduces charge loss on both the 12V and the high-voltage battery. You’ll need to remove the frunk to access the battery cable (see the manual’s frunk-removal section).',
  },
  {
    title: 'Going on vacation? Run the AC first',
    body:
      'Anytime the vehicle will sit unused for two weeks or more, run the air conditioning at idle for about 5 minutes in fresh-air mode with the blower on high before parking it — this keeps the AC compressor lubricated and reduces the chance of compressor damage when the system starts back up.',
  },
  {
    title: 'Use fast charging sparingly',
    body:
      'Minimizing DC fast charging helps prolong high-voltage battery life. The manual specifically recommends doing one full Normal (AC) charge to 100% after every 3 fast-charge cycles to help maintain optimal battery performance. For everyday charging when the vehicle is driven less, Normal (Home) charging to 100% is called out as better for long-term battery life and range than relying on fast charging.',
  },
  {
    title: 'Barely driving it? Still plug in weekly',
    body:
      'If the vehicle is driven very little, the manual recommends charging it to 100% and leaving it connected overnight on slow/Normal charging at least once a week, rather than letting it sit unplugged.',
  },
  {
    title: 'Store it properly, away from extremes',
    body:
      'Store the vehicle in a covered, clean, dry, well-levelled, ventilated, closed place. Avoid parking or storing in extremely hot or freezing conditions for extended periods — this can lead to battery degradation, and high-voltage components are themselves sensitive to temperature extremes. Also avoid extended parking in high-heat-reflection areas.',
  },
  {
    title: 'Never use it as a power bank',
    body:
      'Do not use the HV battery as a stationary power source for other equipment — besides the safety risk, the manual states this will void the battery warranty. Also avoid any contact between the battery/vehicle and open flame.',
  },
  {
    title: 'Charge safely',
    body:
      'Always charge in a well-ventilated area away from flammable materials, avoid direct sunlight while charging where possible, never charge or plug in with wet hands or in exposed rain/water, and keep the EVSE (charger cable) stored safely and away from rain or spilled liquids.',
  },
]

export function CareGuide() {
  usePageMeta({
    title: 'EV Range & Battery Care Guide',
    description:
      'Curated best practices for maximizing EV driving range and caring for the BYD Blade LFP battery in the Mahindra BE 6, XEV 9e and XEV 9S.',
    path: '/care-guide',
  })

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-semibold text-ink-900 dark:text-ink-50">Range & Battery Care Guide</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Community-curated best practices for getting the most driving range out of your car and taking care of its
        LFP (LiFePO&#8322;) &ldquo;Blade&rdquo; battery pack, sourced from the official owner&rsquo;s manual&rsquo;s
        &ldquo;Best Practices for Maximizing EV Range,&rdquo; charging and vehicle-storage sections.
      </p>

      <div className="mt-6 rounded-2xl border border-amber-300/60 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        <p className="font-semibold">Disclaimer</p>
        <p className="mt-1.5">
          This page is an independent, owner-curated summary and is <strong>not official Mahindra guidance</strong>.
          The figures and recommendations below are paraphrased from the BE 6 owner&rsquo;s manual (see{' '}
          <a href={`${import.meta.env.BASE_URL}resources`} className="font-medium underline underline-offset-2">
            Resources
          </a>{' '}
          for the original PDF) &mdash; specifically its range best-practices table and charging/storage sections.
          Figures like range and percentage impacts are indicative, subject to driving pattern and environmental
          conditions, and may vary by variant or change with future manual revisions. Always defer to your printed
          manual, the in-car display, or an Authorized Mahindra Service Center for anything safety-critical or
          warranty-related. Not affiliated with Mahindra &amp; Mahindra Ltd or BYD.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">Driving for maximum range</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {RANGE_TIPS.map((tip) => (
            <div
              key={tip.title}
              className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm dark:border-ink-800 dark:bg-ink-900"
            >
              <h3 className="font-semibold text-ink-900 dark:text-ink-50">{tip.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{tip.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-200 dark:border-ink-800">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Manual&rsquo;s general range reference table under standard conditions</caption>
            <thead className="bg-ink-50 dark:bg-ink-900/60">
              <tr>
                <th className="px-4 py-3 font-semibold text-ink-900 dark:text-ink-50">Driving profile</th>
                <th className="px-4 py-3 font-semibold text-ink-900 dark:text-ink-50">Speed</th>
                <th className="px-4 py-3 font-semibold text-ink-900 dark:text-ink-50">Indicative range*</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
              <tr>
                <td className="px-4 py-3 text-ink-700 dark:text-ink-200">City</td>
                <td className="px-4 py-3 text-ink-500">Up to 45 km/h (typical avg. 20&ndash;25 km/h)</td>
                <td className="px-4 py-3 font-medium text-ink-900 dark:text-ink-50">450&ndash;500 km</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-ink-700 dark:text-ink-200">General highway</td>
                <td className="px-4 py-3 text-ink-500">Up to 110 km/h max (typical avg. up to 70 km/h)</td>
                <td className="px-4 py-3 font-medium text-ink-900 dark:text-ink-50">350&ndash;400 km</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-ink-700 dark:text-ink-200">Extra highway</td>
                <td className="px-4 py-3 text-ink-500">&gt;120 km/h for 10%+ of trip duration</td>
                <td className="px-4 py-3 font-medium text-ink-900 dark:text-ink-50">&lt;300 km</td>
              </tr>
            </tbody>
          </table>
          <p className="px-4 py-3 text-xs text-ink-500">
            *Manual&rsquo;s &ldquo;General Guidelines for Range Reference Under Standard Conditions&rdquo; table:
            driver + 1 passenger load, Default/Range drive mode, Regen Level 1/2, AC at 23&ndash;24&deg;C in Auto
            mode. Subject to driving pattern and environmental conditions.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">
          Battery care (BYD Blade LFP pack)
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">
          These cars use BYD&rsquo;s Blade cells, which are LFP (lithium iron phosphate) chemistry &mdash; generally
          more thermally stable and tolerant of high states of charge than NMC/NCA chemistries used in many other
          EVs. The manual&rsquo;s own care guidance below still applies regardless of chemistry.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {BATTERY_TIPS.map((tip) => (
            <div
              key={tip.title}
              className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm dark:border-ink-800 dark:bg-ink-900"
            >
              <h3 className="font-semibold text-ink-900 dark:text-ink-50">{tip.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{tip.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
