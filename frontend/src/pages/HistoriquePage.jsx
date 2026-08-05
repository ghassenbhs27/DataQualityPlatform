import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  Alert,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  Grid,
  Grow,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useCallback, useDeferredValue, useMemo, useState } from 'react'

import AuditComparisonCard from '../components/AuditComparisonCard'
import HistoryTrendChart from '../components/HistoryTrendChart'
import PageTableSkeleton from '../components/PageTableSkeleton'
import StatHighlightCard from '../components/StatHighlightCard'
import { useAuditHistoryData, useAuditResultsData } from '../hooks/useAuditData'

function HistoriquePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAudit, setSelectedAudit] = useState(null)
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const historyResource = useAuditHistoryData()
  const resultsResource = useAuditResultsData()

  const data = historyResource.data
  const error = historyResource.error ?? resultsResource.error
  const isLoading = historyResource.isLoading || resultsResource.isLoading

  const filteredRows = useMemo(() => {
    const normalizedQuery = deferredSearchTerm.trim().toLowerCase()

    if (!normalizedQuery) {
      return data ?? []
    }

    return (data ?? []).filter((row) => {
      const searchableValues = [
        row.id,
        row.auditDate,
        row.totalPatients,
        row.totalControls,
        row.totalErrors,
        row.globalScore,
        row.notes,
      ]

      return searchableValues.some((value) =>
        String(value ?? '').toLowerCase().includes(normalizedQuery),
      )
    })
  }, [data, deferredSearchTerm])

  const chartData = useMemo(
    () =>
      [...filteredRows]
        .sort(
          (left, right) =>
            new Date(left.auditDate).getTime() - new Date(right.auditDate).getTime(),
        )
        .map((row) => ({
          auditDate: row.auditDate,
          globalScore: row.globalScore,
          totalErrors: row.totalErrors,
        })),
    [filteredRows],
  )

  const historyStats = useMemo(() => {
    const rows = data ?? []

    if (!rows.length) {
      return {
        auditCount: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
      }
    }

    const scores = rows.map((row) => Number(row.globalScore ?? 0))

    return {
      auditCount: rows.length,
      averageScore: Number(
        (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2),
      ),
      bestScore: Number(Math.max(...scores).toFixed(2)),
      worstScore: Number(Math.min(...scores).toFixed(2)),
    }
  }, [data])

  const columns = useMemo(
    () => [
      {
        field: 'auditDate',
        flex: 1.4,
        headerName: 'Date audit',
        minWidth: 190,
        valueFormatter: (value) =>
          new Intl.DateTimeFormat('fr-FR', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(value)),
      },
      {
        field: 'globalScore',
        flex: 0.8,
        headerName: 'Score global',
        minWidth: 130,
        valueFormatter: (value) => `${value}%`,
      },
      {
        field: 'totalPatients',
        flex: 0.85,
        headerName: 'Patients',
        minWidth: 120,
      },
      {
        field: 'totalControls',
        flex: 0.85,
        headerName: 'Controles',
        minWidth: 120,
      },
      {
        field: 'totalErrors',
        flex: 0.85,
        headerName: 'Erreurs',
        minWidth: 120,
      },
      {
        field: 'notes',
        flex: 2,
        headerName: 'Notes',
        minWidth: 260,
      },
    ],
    [],
  )
  const handleRowClick = useCallback((params) => {
    setSelectedAudit(params.row)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setSelectedAudit(null)
  }, [])

  if (isLoading) {
    return <PageTableSkeleton showChart />
  }

  return (
    <>
      <Fade in timeout={300}>
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography color="text.secondary" variant="overline">
                  Suivi des exécutions
                </Typography>
                <Stack
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography variant="h2">Historique des audits</Typography>
                  <Chip
                    color="primary"
                    label={`${filteredRows.length} audits affichés`}
                    variant="outlined"
                  />
                </Stack>
                <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                  Consulte la liste complète des audits avec recherche, tri,
                  pagination et évolution du score global dans le temps.
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
              <StatHighlightCard
                accentColor="#0d6e6e"
                caption="Volume"
                title="Nombre d'audits"
                value={historyStats.auditCount}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
              <StatHighlightCard
                accentColor="#2563eb"
                caption="Performance moyenne"
                title="Score moyen"
                value={`${historyStats.averageScore}%`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
              <StatHighlightCard
                accentColor="#2f855a"
                caption="Meilleure exécution"
                title="Meilleur score"
                value={`${historyStats.bestScore}%`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
              <StatHighlightCard
                accentColor="#c53030"
                caption="Vigilance"
                title="Pire score"
                value={`${historyStats.worstScore}%`}
              />
            </Grid>
          </Grid>

          <Grow in timeout={450}>
            <Card>
              <CardContent>
                <Stack spacing={2.5}>
                  <TextField
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Rechercher dans l'historique"
                    sx={{ maxWidth: 360 }}
                    value={searchTerm}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <DataGrid
                    columns={columns}
                    disableRowSelectionOnClick
                    initialState={{
                      pagination: {
                        paginationModel: {
                          page: 0,
                          pageSize: 5,
                        },
                      },
                      sorting: {
                        sortModel: [{ field: 'auditDate', sort: 'desc' }],
                      },
                    }}
                    onRowClick={handleRowClick}
                    pageSizeOptions={[5, 10, 20]}
                    rows={filteredRows}
                    sx={{
                      border: 'none',
                      minHeight: 480,
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: 'rgba(13, 110, 110, 0.04)',
                      },
                      '& .MuiDataGrid-row': {
                        cursor: 'pointer',
                        transition: 'background-color 180ms ease',
                      },
                      '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'rgba(13, 110, 110, 0.05)',
                      },
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grow>

          {filteredRows.length >= 2 ? (
            <AuditComparisonCard
              audits={filteredRows}
              results={resultsResource.data ?? []}
            />
          ) : null}

          <HistoryTrendChart
            averageScore={historyStats.averageScore}
            data={chartData}
          />
        </Stack>
      </Fade>

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={handleCloseDialog}
        open={Boolean(selectedAudit)}
      >
        <DialogTitle>Détail de l&apos;audit</DialogTitle>
        <DialogContent>
          {selectedAudit ? (
            <Stack divider={<Divider flexItem />} spacing={2.25}>
              <Stack spacing={0.6}>
                <Typography color="text.secondary" variant="body2">
                  Date
                </Typography>
                <Typography variant="h3">
                  {new Intl.DateTimeFormat('fr-FR', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  }).format(new Date(selectedAudit.auditDate))}
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <Stack spacing={0.6}>
                  <Typography color="text.secondary" variant="body2">
                    Score
                  </Typography>
                  <Typography variant="h3">
                    {selectedAudit.globalScore}%
                  </Typography>
                </Stack>
                <Stack spacing={0.6}>
                  <Typography color="text.secondary" variant="body2">
                    Nombre d&apos;erreurs
                  </Typography>
                  <Typography variant="h3">
                    {selectedAudit.totalErrors}
                  </Typography>
                </Stack>
              </Stack>
              <Stack spacing={0.6}>
                <Typography color="text.secondary" variant="body2">
                  Notes
                </Typography>
                <Typography color="text.secondary">
                  {selectedAudit.notes || 'Aucune note disponible.'}
                </Typography>
              </Stack>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default HistoriquePage
