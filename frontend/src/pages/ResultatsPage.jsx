import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  Alert,
  Card,
  CardContent,
  Chip,
  Fade,
  Grow,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid'
import { memo, useDeferredValue, useMemo, useState } from 'react'

import PageTableSkeleton from '../components/PageTableSkeleton'
import SeverityChip from '../components/SeverityChip'
import { normalizeSeverity, useAuditResultsData } from '../hooks/useAuditData'

const resultRowClassNames = {
  Critique: 'severity-critical',
  Majeure: 'severity-major',
  Mineure: 'severity-minor',
}

const ResultsGridToolbar = memo(function ResultsGridToolbar() {
  return (
    <GridToolbarContainer
      sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'space-between',
        pb: 1,
      }}
    >
      <Stack direction="row" spacing={1}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
      </Stack>
      <GridToolbarExport csvOptions={{ fileName: 'audit-results' }} />
    </GridToolbarContainer>
  )
})

function ResultatsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const [rowSelectionModel, setRowSelectionModel] = useState({
    type: 'include',
    ids: new Set(),
  })
  const { data, error, isLoading } = useAuditResultsData()

  const severityOptions = useMemo(() => {
    const rows = data ?? []
    const counts = rows.reduce(
      (accumulator, row) => {
        const severity = normalizeSeverity(row.severity)

        return {
          ...accumulator,
          [severity]: (accumulator[severity] ?? 0) + 1,
        }
      },
      { Critique: 0, Majeure: 0, Mineure: 0 },
    )

    return [
      { label: 'Toutes', value: 'all' },
      { label: `Critique (${counts.Critique})`, value: 'Critique' },
      { label: `Majeure (${counts.Majeure})`, value: 'Majeure' },
      { label: `Mineure (${counts.Mineure})`, value: 'Mineure' },
    ]
  }, [data])

  const filteredRows = useMemo(() => {
    const normalizedQuery = deferredSearchTerm.trim().toLowerCase()

    return (data ?? []).filter((row) => {
      const matchesSeverity =
        severityFilter === 'all' ||
        normalizeSeverity(row.severity) === severityFilter

      if (!matchesSeverity) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      const searchableValues = [
        row.ruleName,
        row.severity,
        row.detectedCount,
        row.percentage,
        row.recommendation,
      ]

      return searchableValues.some((value) =>
        String(value ?? '').toLowerCase().includes(normalizedQuery),
      )
    })
  }, [data, deferredSearchTerm, severityFilter])

  const columns = useMemo(
    () => [
      {
        field: 'ruleName',
        flex: 1.1,
        headerName: 'Rule',
        minWidth: 180,
      },
      {
        field: 'severity',
        flex: 0.8,
        headerName: 'Severity',
        minWidth: 140,
        renderCell: ({ value }) => <SeverityChip severity={value} />,
        sortComparator: (left, right) =>
          normalizeSeverity(left).localeCompare(normalizeSeverity(right)),
      },
      {
        field: 'detectedCount',
        flex: 0.85,
        headerName: 'Patients concernés',
        minWidth: 170,
      },
      {
        field: 'percentage',
        flex: 0.75,
        headerName: 'Pourcentage',
        minWidth: 130,
        valueFormatter: (value) => `${value}%`,
      },
      {
        field: 'recommendation',
        flex: 2,
        headerName: 'Recommendation',
        minWidth: 320,
      },
    ],
    [],
  )

  if (isLoading) {
    return <PageTableSkeleton />
  }

  return (
    <Fade in timeout={320}>
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography color="text.secondary" variant="overline">
                Analyse détaillée
              </Typography>
              <Stack
                alignItems={{ xs: 'flex-start', md: 'center' }}
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Typography variant="h2">Résultats des contrôles</Typography>
                <Chip
                  color="primary"
                  label={`${rowSelectionModel.ids.size} ligne(s) sélectionnée(s)`}
                  variant="outlined"
                />
              </Stack>
              <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                Explore toutes les lignes de `audit_results` avec tri, pagination,
                recherche globale et filtrage par sévérité.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Grow in timeout={480}>
          <Card>
            <CardContent>
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <TextField
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Rechercher une règle ou une recommandation"
                    sx={{ maxWidth: 420, width: '100%' }}
                    value={searchTerm}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Tooltip title="Filtres rapides par niveau de gravité.">
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={1}
                      justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                    >
                      {severityOptions.map((option) => (
                        <Chip
                          clickable
                          color={severityFilter === option.value ? 'primary' : 'default'}
                          key={option.value}
                          label={option.label}
                          onClick={() => setSeverityFilter(option.value)}
                          variant={
                            severityFilter === option.value ? 'filled' : 'outlined'
                          }
                        />
                      ))}
                    </Stack>
                  </Tooltip>
                </Stack>

                <DataGrid
                  checkboxSelection
                  columns={columns}
                  disableRowSelectionOnClick
                  getRowId={(row) =>
                    row.id ?? `${row.auditId}-${row.ruleName}-${row.severity}`
                  }
                  getRowClassName={(params) =>
                    resultRowClassNames[normalizeSeverity(params.row.severity)] ??
                    resultRowClassNames.Mineure
                  }
                  initialState={{
                    pagination: {
                      paginationModel: {
                        page: 0,
                        pageSize: 10,
                      },
                    },
                    sorting: {
                      sortModel: [{ field: 'ruleName', sort: 'asc' }],
                    },
                  }}
                  onRowSelectionModelChange={setRowSelectionModel}
                  pageSizeOptions={[10, 20, 50]}
                  rowSelectionModel={rowSelectionModel}
                  rows={filteredRows}
                  slots={{ toolbar: ResultsGridToolbar }}
                  sx={{
                    border: 'none',
                    overflow: 'hidden',
                    '& .MuiDataGrid-cell': {
                      alignItems: 'center',
                      borderBottomColor: 'rgba(15, 23, 42, 0.06)',
                    },
                    minHeight: 560,
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: 'rgba(13, 110, 110, 0.06)',
                      borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
                    },
                    '& .severity-critical': {
                      backgroundColor: 'rgba(197, 48, 48, 0.035)',
                    },
                    '& .severity-major': {
                      backgroundColor: 'rgba(221, 107, 32, 0.04)',
                    },
                    '& .severity-minor': {
                      backgroundColor: 'rgba(79, 179, 173, 0.04)',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: 'rgba(13, 110, 110, 0.07)',
                    },
                    '& .MuiDataGrid-toolbarContainer': {
                      pb: 2,
                    },
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grow>
      </Stack>
    </Fade>
  )
}

export default ResultatsPage
