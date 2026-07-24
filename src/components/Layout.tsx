import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-brand-500' : 'text-ink-500 hover:text-ink-900 dark:hover:text-ink-100'
  }`

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
    isActive
      ? 'bg-brand-500/10 text-brand-500'
      : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
  }`

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 border-b border-ink-200/70 bg-ink-50/80 backdrop-blur dark:border-ink-800/70 dark:bg-ink-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2 text-base font-semibold text-ink-900 dark:text-ink-50">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
              BE
            </span>
            <span className="hidden sm:inline">BEV Issue Tracker</span>
            <span className="sm:hidden">BEV Tracker</span>
          </NavLink>
          <nav className="hidden items-center gap-6 lg:flex">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Analytics
            </NavLink>
            <NavLink to="/resources" className={navLinkClass}>
              Resources
            </NavLink>
            <NavLink to="/care-guide" className={navLinkClass}>
              Care Guide
            </NavLink>
            <NavLink to="/known-issues" className={navLinkClass}>
              Known Issues
            </NavLink>
            <NavLink
              to="/report"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Report an Issue
            </NavLink>
          </nav>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800 lg:hidden"
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-ink-200/70 bg-ink-50 px-4 py-3 dark:border-ink-800/70 dark:bg-ink-950 lg:hidden">
            <div className="mx-auto max-w-6xl space-y-1">
              <NavLink to="/" end className={mobileNavLinkClass}>
                Home
              </NavLink>
              <NavLink to="/dashboard" className={mobileNavLinkClass}>
                Analytics
              </NavLink>
              <NavLink to="/resources" className={mobileNavLinkClass}>
                Resources
              </NavLink>
              <NavLink to="/care-guide" className={mobileNavLinkClass}>
                Care Guide
              </NavLink>
              <NavLink to="/known-issues" className={mobileNavLinkClass}>
                Known Issues
              </NavLink>
              <NavLink
                to="/report"
                className="mt-2 block rounded-lg bg-brand-500 px-3 py-2.5 text-center text-base font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Report an Issue
              </NavLink>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink-200/70 dark:border-ink-800/70">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-500 sm:px-6">
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
