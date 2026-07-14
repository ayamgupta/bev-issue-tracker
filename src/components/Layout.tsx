import { NavLink, Outlet } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-brand-500' : 'text-ink-500 hover:text-ink-900 dark:hover:text-ink-100'
  }`

export function Layout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 border-b border-ink-200/70 bg-ink-50/80 backdrop-blur dark:border-ink-800/70 dark:bg-ink-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="flex items-center gap-2 text-base font-semibold text-ink-900 dark:text-ink-50">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
              BE
            </span>
            BEV Issue Tracker
          </NavLink>
          <nav className="flex items-center gap-6">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Analytics
            </NavLink>
            <NavLink to="/resources" className={navLinkClass}>
              Resources
            </NavLink>
            <NavLink
              to="/report"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Report an Issue
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink-200/70 dark:border-ink-800/70">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-ink-500">
          <p>
            Community-run, independent tracker for Mahindra BE 6, XEV 9e &amp; XEV 9S owners. Not affiliated with
            Mahindra &amp; Mahindra Ltd.
          </p>
          <p className="mt-2">
            No personally identifying information is ever shown publicly. Registration numbers, names and phone
            numbers (when provided) are stored in a separate, locked-down table and used only to (1) detect
            duplicate/fake entries and (2) let you update your report later — just fill in the form again with the
            same registration number and it replaces your previous answers. We never sell or share this data.
          </p>
        </div>
      </footer>
    </div>
  )
}
