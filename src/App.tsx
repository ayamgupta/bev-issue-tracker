import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Report } from './pages/Report'
import { Dashboard } from './pages/Dashboard'
import { Resources } from './pages/Resources'
import { KnownIssues } from './pages/KnownIssues'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="report" element={<Report />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="resources" element={<Resources />} />
          <Route path="known-issues" element={<KnownIssues />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
