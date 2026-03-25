import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import JALODashboard from './Dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <JALODashboard />
  </StrictMode>
)
