import { createBrowserRouter } from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'
import AuditComparisonPage from '../pages/AuditComparisonPage'
import DashboardPage from '../pages/DashboardPage'
import HistoriquePage from '../pages/HistoriquePage'
import RecommendationsPage from '../pages/RecommendationsPage'
import ResultatsPage from '../pages/ResultatsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'historique',
        element: <HistoriquePage />,
      },
      {
        path: 'resultats',
        element: <ResultatsPage />,
      },
      {
        path: 'recommandations',
        element: <RecommendationsPage />,
      },
      {
        path: 'comparaison',
        element: <AuditComparisonPage />,
      },
    ],
  },
])
