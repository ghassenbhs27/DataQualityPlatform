import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  Fade,
  Grid,
  Slide,
  Snackbar,
  Stack,
} from '@mui/material'
import MuiAlert from '@mui/material/Alert'

import AuditResultsCharts from '../components/AuditResultsCharts'
import DashboardSummaryCard from '../components/DashboardSummaryCard'
import DashboardHero from '../components/DashboardHero'
import DashboardKpiGrid from '../components/DashboardKpiGrid'
import DashboardSkeleton from '../components/DashboardSkeleton'
import ScoreGaugeCard from '../components/ScoreGaugeCard'
import { useDashboard } from '../hooks/useDashboard'

function DashboardPage() {
  const {
    anomalyChartData,
    complianceRate,
    dashboard,
    error,
    isLoading,
    isRefreshing,
    refreshAll,
    runAudit,
    runState,
    scoreTrend,
    severityChartData,
    summary,
    totalSeverityCount,
  } = useDashboard()
  const [snackbarState, setSnackbarState] = useState({
    message: '',
    open: false,
    severity: 'info',
  })

  const handleCloseSnackbar = useCallback(() => {
    setSnackbarState((currentState) => ({
      ...currentState,
      open: false,
    }))
  }, [])

  const handleRunAudit = useCallback(async () => {
    setSnackbarState({
      message: 'Audit lancé.',
      open: true,
      severity: 'info',
    })

    try {
      const payload = await runAudit()
      setSnackbarState({
        message: payload.message,
        open: true,
        severity: 'success',
      })
    } catch {
      setSnackbarState({
        message: "Erreur lors du lancement de l'audit.",
        open: true,
        severity: 'error',
      })
    }
  }, [runAudit])
  const globalError = useMemo(() => error, [error])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <>
      <Fade in timeout={350}>
        <Stack spacing={3}>
          {globalError ? <Alert severity="error">{globalError}</Alert> : null}

          <DashboardHero
            isRefreshing={isRefreshing}
            lastAudit={dashboard?.lastAudit}
            onRefresh={refreshAll}
            onRunAudit={handleRunAudit}
            runState={runState}
          />

          {dashboard ? (
            <DashboardKpiGrid dashboard={dashboard} scoreTrend={scoreTrend} />
          ) : null}

          {dashboard ? (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, xl: 5 }}>
                <DashboardSummaryCard summary={summary} />
              </Grid>
              <Grid size={{ xs: 12, md: 6, xl: 3.5 }}>
                <ScoreGaugeCard
                  color="#0d6e6e"
                  description="Mesure directement issue du score global exposé par l'API."
                  subtitle="Indice principal"
                  title="Score global"
                  value={dashboard.globalScore}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, xl: 3.5 }}>
                <ScoreGaugeCard
                  color="#2f855a"
                  description="Part des contrôles sans patient concerné sur le dernier audit."
                  subtitle="Taux de conformité"
                  title="Conformité des contrôles"
                  value={complianceRate}
                />
              </Grid>
            </Grid>
          ) : null}

          <AuditResultsCharts
            anomalyChartData={anomalyChartData}
            severityChartData={severityChartData}
            totalSeverityCount={totalSeverityCount}
          />
        </Stack>
      </Fade>

      <Snackbar
        TransitionComponent={Slide}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        autoHideDuration={3500}
        onClose={handleCloseSnackbar}
        open={snackbarState.open}
      >
        <MuiAlert
          elevation={6}
          onClose={handleCloseSnackbar}
          severity={snackbarState.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarState.message}
        </MuiAlert>
      </Snackbar>
    </>
  )
}

export default DashboardPage
