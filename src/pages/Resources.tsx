import { CAR_MODELS, type CarModel } from '../data/carData'
import { usePageMeta } from '../lib/usePageMeta'

type ResourceDoc = {
  title: string
  description: string
  file: string
  models: CarModel[]
  sizeMb: number
}

const brochuresBase = `${import.meta.env.BASE_URL}brochures/`

const BROCHURES: ResourceDoc[] = [
  {
    title: 'BE 6 Brochure (V29)',
    description: 'Official model brochure covering variants, specs and features.',
    file: `${brochuresBase}be6-brochure-v29.pdf`,
    models: ['BE 6'],
    sizeMb: 2.9,
  },
  {
    title: 'BE 6 Formula E Edition Brochure',
    description: 'Official brochure for the limited-run Formula E Edition.',
    file: `${brochuresBase}be6-formula-e-edition.pdf`,
    models: ['BE 6'],
    sizeMb: 10.2,
  },
  {
    title: 'XEV 9e Brochure',
    description: 'Official model brochure covering variants, specs and features.',
    file: `${brochuresBase}xev9e-brochure.pdf`,
    models: ['XEV 9e'],
    sizeMb: 2.9,
  },
  {
    title: 'XEV 9e Cineluxe Edition Brochure',
    description: 'Official brochure for the Cineluxe special edition.',
    file: `${brochuresBase}xev9s-cineluxe-brochure.pdf`,
    models: ['XEV 9e'],
    sizeMb: 3.7,
  },
  {
    title: 'XEV 9S Brochure (V5)',
    description: 'Official model brochure covering variants, specs and features.',
    file: `${brochuresBase}xev9s-brochure-v5.pdf`,
    models: ['XEV 9S'],
    sizeMb: 3.3,
  },
]

const SERVICE_GUIDES: ResourceDoc[] = [
  {
    title: 'BE 6 Warranty & Service Info Guide',
    description: 'Official service schedule and warranty terms.',
    file: `${brochuresBase}be6-warranty-service-guide.pdf`,
    models: ['BE 6'],
    sizeMb: 3.8,
  },
  {
    title: 'XEV 9e Warranty & Service Info Guide',
    description: 'Official service schedule and warranty terms.',
    file: `${brochuresBase}xev9e-warranty-service-guide.pdf`,
    models: ['XEV 9e'],
    sizeMb: 3.8,
  },
  {
    title: 'XEV 9S Warranty & Service Info Guide',
    description: 'Official service schedule and warranty terms.',
    file: `${brochuresBase}xev9s-warranty-service-guide.pdf`,
    models: ['XEV 9S'],
    sizeMb: 3.9,
  },
]

const OWNERS_MANUALS: ResourceDoc[] = [
  {
    title: 'BE 6 Vehicle Manual',
    description: 'Full vehicle manual covering every control, feature and maintenance procedure.',
    file: `${brochuresBase}be6-vehicle-manual.pdf`,
    models: ['BE 6'],
    sizeMb: 17.7,
  },
  {
    title: 'BE 6 FE Vehicle Manual',
    description: 'Full vehicle manual for the BE 6 FE variant.',
    file: `${brochuresBase}be6-fe-vehicle-manual.pdf`,
    models: ['BE 6'],
    sizeMb: 12.2,
  },
  {
    title: 'XEV 9e Vehicle Manual',
    description: 'Full vehicle manual covering every control, feature and maintenance procedure.',
    file: `${brochuresBase}xev9e-vehicle-manual.pdf`,
    models: ['XEV 9e'],
    sizeMb: 18.7,
  },
  {
    title: 'XEV 9S Vehicle Manual',
    description: 'Full vehicle manual covering every control, feature and maintenance procedure.',
    file: `${brochuresBase}xev9s-vehicle-manual.pdf`,
    models: ['XEV 9S'],
    sizeMb: 19.5,
  },
]

function DocCard({ doc }: { doc: ResourceDoc }) {
  return (
    <a
      href={doc.file}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col justify-between rounded-2xl border border-ink-200 bg-white p-5 shadow-sm transition-colors hover:border-brand-500 dark:border-ink-800 dark:bg-ink-900"
    >
      <div>
        <div className="flex flex-wrap gap-1.5">
          {doc.models.map((model) => (
            <span
              key={model}
              className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-600 dark:text-brand-400"
            >
              {model}
            </span>
          ))}
        </div>
        <h3 className="mt-3 font-semibold text-ink-900 dark:text-ink-50">{doc.title}</h3>
        <p className="mt-1 text-sm text-ink-500">{doc.description}</p>
      </div>
      <p className="mt-4 text-sm font-medium text-brand-500">Download PDF &middot; {doc.sizeMb} MB &rarr;</p>
    </a>
  )
}

export function Resources() {
  usePageMeta({
    title: 'Brochures & Resources',
    description:
      'Official brochures and documentation for the Mahindra BE 6, XEV 9e and XEV 9S, mirrored in one place.',
    path: '/resources',
  })

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-semibold text-ink-900 dark:text-ink-50">Resources</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Official brochures and documentation for the Mahindra BE 6, XEV 9e and XEV 9S, collected in one place. Mirrored
        here for convenience — not affiliated with Mahindra &amp; Mahindra Ltd.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">Owner's manuals</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">
          Mahindra only publishes these as a view-only page, with no official download option. These PDF copies come
          from{' '}
          <a
            href="https://github.com/chiragkrishna/Mahindra-eSUVs-Manual-Downloader"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-500 hover:underline"
          >
            chiragkrishna/Mahindra-eSUVs-Manual-Downloader
          </a>{' '}
          — thanks to that project for making them available. Not affiliated with Mahindra.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OWNERS_MANUALS.map((doc) => (
            <DocCard key={doc.file} doc={doc} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">Warranty &amp; service guides</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">
          Official service schedules and warranty terms. Mahindra restricts full dealer-level workshop/repair manuals
          (wiring diagrams, teardown procedures) to its dealer network — we haven't found a publicly downloadable
          copy of those for any of the {CAR_MODELS.join(', ')}.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_GUIDES.map((doc) => (
            <DocCard key={doc.file} doc={doc} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">Brochures</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BROCHURES.map((doc) => (
            <DocCard key={doc.file} doc={doc} />
          ))}
        </div>
      </section>
    </div>
  )
}
