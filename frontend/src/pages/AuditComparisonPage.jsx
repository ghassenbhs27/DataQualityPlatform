import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded'
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useTheme } from '@mui/material/styles'
import {
  Alert,
  Card,
  CardContent,
  Chip,
  Fade,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import PageTableSkeleton from '../components/PageTableSkeleton'
import SeverityChip from '../components/SeverityChip'
import StatHighlightCard from '../components/StatHighlightCard'
import {
  normalizeSeverity,
  useAuditHistoryData,
  useAuditResultsData,
} from '../hooks/useAuditData'

const ruleLabels = {
  DUPLICATE_VALUES: 'Doublons',
  INVALID_CIN: 'CIN invalides',
  INVALID_DATE: 'Dates invalides',
  INVALID_EMAIL: 'E-mails invalides',
  INVALID_INS: 'INS invalides',
  INVALID_PHONE: 'Téléphones invalides',
  MISSING_VALUES: 'Valeurs manquantes',
}

const severityFallbacks = {
  DUPLICATE_VALUES: 'Critique',
  INVALID_CIN: 'Critique',
  INVALID_DATE: 'Majeure',
  INVALID_EMAIL: 'Majeure',
  INVALID_INS: 'Critique',
  INVALID_PHONE: 'Majeure',
  MISSING_VALUES: 'Mineure',
}

const severityRank = {
  Critique: 0,
  Majeure: 1,
  Mineure: 2,
}

const priorityLabels = ['Élevée', 'Élevée', 'Moyenne', 'Moyenne', 'Faible']

function formatAuditLabel(audit) {
  return `${new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(audit.auditDate))} · score ${audit.globalScore}%`
}

function getStatus(delta) {
  if (delta < 0) {
    return 'amélioration'
  }

  if (delta > 0) {
    return 'dégradation'
  }

  return 'stable'
}

function getStatusColor(status) {
  if (status === 'amélioration') {
    return '#2f855a'
  }

  if (status === 'dégradation') {
    return '#c53030'
  }

  return '#52606d'
}

function getStatusIcon(status) {
  if (status === 'amélioration') {
    return <TrendingDownRoundedIcon fontSize="small" />
  }

  if (status === 'dégradation') {
    return <TrendingUpRoundedIcon fontSize="small" />
  }

  return <TrendingFlatRoundedIcon fontSize="small" />
}

function buildSeverityCounts(results) {
  return results.reduce(
    (accumulator, row) => {
      const severity = normalizeSeverity(
        row.severity || severityFallbacks[row.ruleName] || 'Mineure',
      )
      const detectedCount = Number(row.detectedCount ?? 0)

      return {
        ...accumulator,
        [severity]: accumulator[severity] + detectedCount,
      }
    },
    { Critique: 0, Majeure: 0, Mineure: 0 },
  )
}

function getDefaultAuditAId(audits) {
  if (!audits.length) {
    return ''
  }

  if (audits.length === 1) {
    return audits[0].id
  }

  const candidates = audits.slice(1)
  const baselineAudit = [...candidates].sort((left, right) => {
    const scoreGap = Number(left.globalScore ?? 0) - Number(right.globalScore ?? 0)

    if (scoreGap !== 0) {
      return scoreGap
    }

    return (
      new Date(right.auditDate).getTime() - new Date(left.auditDate).getTime()
    )
  })[0]

  return baselineAudit?.id ?? audits[1].id
}

function AuditComparisonPage() {
  const theme = useTheme()
  const historyResource = useAuditHistoryData()
  const resultsResource = useAuditResultsData()

  const audits = useMemo(
    () =>
      [...(historyResource.data ?? [])].sort(
        (left, right) =>
          new Date(right.auditDate).getTime() - new Date(left.auditDate).getTime(),
      ),
    [historyResource.data],
  )

  const [auditAId, setAuditAId] = useState(getDefaultAuditAId(audits))
  const [auditBId, setAuditBId] = useState(audits[0]?.id ?? '')

  const isLoading = historyResource.isLoading || resultsResource.isLoading
  const error = historyResource.error ?? resultsResource.error

  useEffect(() => {
    if (!audits.length) {
      return
    }

    setAuditBId((currentValue) => currentValue || audits[0]?.id || '')
    setAuditAId((currentValue) => currentValue || getDefaultAuditAId(audits))
  }, [audits])

  const selectedAuditA = useMemo(
    () => audits.find((audit) => audit.id === auditAId) ?? null,
    [auditAId, audits],
  )
  const selectedAuditB = useMemo(
    () => audits.find((audit) => audit.id === auditBId) ?? null,
    [auditBId, audits],
  )

  const auditAResults = useMemo(
    () => (resultsResource.data ?? []).filter((row) => row.auditId === auditAId),
    [auditAId, resultsResource.data],
  )
  const auditBResults = useMemo(
    () => (resultsResource.data ?? []).filter((row) => row.auditId === auditBId),
    [auditBId, resultsResource.data],
  )

  const comparisonRows = useMemo(() => {
    const mapA = new Map(auditAResults.map((row) => [row.ruleName, row]))
    const mapB = new Map(auditBResults.map((row) => [row.ruleName, row]))
    const ruleNames = Array.from(new Set([...mapA.keys(), ...mapB.keys()]))

    return ruleNames
      .map((ruleName) => {
        const rowA = mapA.get(ruleName)
        const rowB = mapB.get(ruleName)
        const auditAResult = Number(rowA?.detectedCount ?? 0)
        const auditBResult = Number(rowB?.detectedCount ?? 0)
        const delta = auditBResult - auditAResult
        const severity = normalizeSeverity(
          rowB?.severity || rowA?.severity || severityFallbacks[ruleName] || 'Mineure',
        )
        const status = getStatus(delta)

        return {
          auditAPercentage: Number(rowA?.percentage ?? 0),
          auditAResult,
          auditBPercentage: Number(rowB?.percentage ?? 0),
          auditBResult,
          delta,
          recommendation: rowB?.recommendation || rowA?.recommendation || '',
          rule: ruleName,
          ruleLabel: ruleLabels[ruleName] ?? ruleName,
          severity,
          status,
        }
      })
      .sort((left, right) => {
        const severityGap =
          severityRank[left.severity] - severityRank[right.severity]

        if (severityGap !== 0) {
          return severityGap
        }

        return right.auditBResult - left.auditBResult
      })
  }, [auditAResults, auditBResults])

  const severityA = useMemo(() => buildSeverityCounts(auditAResults), [auditAResults])
  const severityB = useMemo(() => buildSeverityCounts(auditBResults), [auditBResults])

  const metrics = useMemo(() => {
    if (!selectedAuditA || !selectedAuditB) {
      return null
    }

    return {
      anomaliesDelta:
        Number(selectedAuditB.totalErrors ?? 0) - Number(selectedAuditA.totalErrors ?? 0),
      criticalDelta: severityB.Critique - severityA.Critique,
      majorDelta: severityB.Majeure - severityA.Majeure,
      minorDelta: severityB.Mineure - severityA.Mineure,
      scoreDelta: Number(
        (
          Number(selectedAuditB.globalScore ?? 0) -
          Number(selectedAuditA.globalScore ?? 0)
        ).toFixed(2),
      ),
    }
  }, [selectedAuditA, selectedAuditB, severityA, severityB])

  const overviewChartData = useMemo(() => {
    if (!selectedAuditA || !selectedAuditB) {
      return []
    }

    return [
      {
        auditA: Number(selectedAuditA.globalScore ?? 0),
        auditB: Number(selectedAuditB.globalScore ?? 0),
        metric: 'Score global',
      },
      {
        auditA: Number(selectedAuditA.totalErrors ?? 0),
        auditB: Number(selectedAuditB.totalErrors ?? 0),
        metric: 'Anomalies',
      },
      {
        auditA: severityA.Critique,
        auditB: severityB.Critique,
        metric: 'Critiques',
      },
      {
        auditA: severityA.Majeure,
        auditB: severityB.Majeure,
        metric: 'Majeures',
      },
      {
        auditA: severityA.Mineure,
        auditB: severityB.Mineure,
        metric: 'Mineures',
      },
    ]
  }, [selectedAuditA, selectedAuditB, severityA, severityB])

  const priorityRows = useMemo(() => {
    const statusRank = {
      'amélioration': 0,
      stable: 1,
      'dégradation': 2,
    }

    return comparisonRows
      .filter((row) => row.auditBResult > 0)
      .sort((left, right) => {
        const severityGap = severityRank[left.severity] - severityRank[right.severity]
        if (severityGap !== 0) {
          return severityGap
        }

        if (right.auditBResult !== left.auditBResult) {
          return right.auditBResult - left.auditBResult
        }

        return statusRank[right.status] - statusRank[left.status]
      })
      .map((row, index) => ({
        ...row,
        action: row.recommendation,
        priority: priorityLabels[index] ?? 'Faible',
      }))
  }, [comparisonRows])

  const summaryText = useMemo(() => {
    if (!metrics || !selectedAuditA || !selectedAuditB) {
      return ''
    }

    const topImprovement = comparisonRows
      .filter((row) => row.delta < 0)
      .sort((left, right) => left.delta - right.delta)[0]
    const topAttention = priorityRows[0]

    const parts = [
      `La qualité globale ${metrics.scoreDelta >= 0 ? "s'est améliorée" : "s'est dégradée"} de ${Math.abs(metrics.scoreDelta).toFixed(2)} points.`,
      `Le nombre total d'anomalies ${metrics.anomaliesDelta <= 0 ? 'a diminué' : 'a augmenté'} de ${Math.abs(metrics.anomaliesDelta)}.`,
    ]

    if (topImprovement) {
      parts.push(
        `La plus forte amélioration concerne ${topImprovement.ruleLabel.toLowerCase()}.`,
      )
    }

    if (topAttention) {
      parts.push(
        `${topAttention.ruleLabel} reste le principal point d'attention avec ${topAttention.auditBResult} patient(s) concerné(s).`,
      )
    }

    return parts.join(' ')
  }, [comparisonRows, metrics, priorityRows, selectedAuditA, selectedAuditB])

  const columns = useMemo(
    () => [
      {
        field: 'ruleLabel',
        flex: 1.3,
        headerName: 'Règle',
        minWidth: 180,
      },
      {
        field: 'severity',
        flex: 0.8,
        headerName: 'Gravité',
        minWidth: 140,
        renderCell: ({ value }) => <SeverityChip severity={value} />,
      },
      {
        field: 'auditAResult',
        flex: 0.7,
        headerName: 'Audit A',
        minWidth: 110,
      },
      {
        field: 'auditBResult',
        flex: 0.7,
        headerName: 'Audit B',
        minWidth: 110,
      },
      {
        field: 'delta',
        flex: 0.7,
        headerName: 'Écart',
        minWidth: 110,
        renderCell: ({ value }) => (
          <Typography
            sx={{
              color: value < 0 ? '#2f855a' : value > 0 ? '#c53030' : 'text.primary',
              fontWeight: 700,
            }}
          >
            {value > 0 ? '+' : ''}
            {value}
          </Typography>
        ),
      },
      {
        field: 'status',
        flex: 0.9,
        headerName: 'Statut',
        minWidth: 150,
        renderCell: ({ value }) => (
          <Chip
            icon={getStatusIcon(value)}
            label={value}
            size="small"
            sx={{
              backgroundColor: `${getStatusColor(value)}22`,
              color: getStatusColor(value),
              fontWeight: 700,
            }}
          />
        ),
      },
    ],
    [],
  )

  if (isLoading) {
    return <PageTableSkeleton showChart />
  }

  if (audits.length < 2) {
    return <Alert severity="warning">Au moins deux audits sont nécessaires pour comparer les résultats.</Alert>
  }

  return (
    <Fade in timeout={320}>
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography color="text.secondary" variant="overline">
                Analyse comparative
              </Typography>
              <Stack
                alignItems={{ xs: 'flex-start', md: 'center' }}
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Typography variant="h2">Comparaison des audits</Typography>
                <Chip
                  icon={<CompareArrowsRoundedIcon />}
                  label={`Audit A #${auditAId} vs Audit B #${auditBId}`}
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
              <Typography color="text.secondary" sx={{ maxWidth: 820 }}>
                Compare deux audits persistés depuis `audit_history` et `audit_results`
                pour visualiser les gains, les régressions et les priorités d&apos;action.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="audit-a-label">Audit A</InputLabel>
              <Select
                label="Audit A"
                labelId="audit-a-label"
                onChange={(event) => setAuditAId(event.target.value)}
                value={auditAId}
              >
                {audits.map((audit) => (
                  <MenuItem key={audit.id} value={audit.id}>
                    {formatAuditLabel(audit)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="audit-b-label">Audit B</InputLabel>
              <Select
                label="Audit B"
                labelId="audit-b-label"
                onChange={(event) => setAuditBId(event.target.value)}
                value={auditBId}
              >
                {audits.map((audit) => (
                  <MenuItem key={audit.id} value={audit.id}>
                    {formatAuditLabel(audit)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {selectedAuditA && selectedAuditB && metrics ? (
          <>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                <StatHighlightCard
                  accentColor={metrics.scoreDelta >= 0 ? '#2f855a' : '#c53030'}
                  caption="Évolution"
                  title="Score global"
                  value={`${metrics.scoreDelta > 0 ? '+' : ''}${metrics.scoreDelta} pts`}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                <StatHighlightCard
                  accentColor={metrics.anomaliesDelta <= 0 ? '#2f855a' : '#c53030'}
                  caption="Évolution"
                  title="Total anomalies"
                  value={`${metrics.anomaliesDelta > 0 ? '+' : ''}${metrics.anomaliesDelta}`}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                <StatHighlightCard
                  accentColor={metrics.criticalDelta <= 0 ? '#2f855a' : '#c53030'}
                  caption="Sévérité critique"
                  title="Critiques"
                  value={`${metrics.criticalDelta > 0 ? '+' : ''}${metrics.criticalDelta}`}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                <StatHighlightCard
                  accentColor="#0d6e6e"
                  caption="Synthèse"
                  title="Audit B"
                  value={`${selectedAuditB.globalScore}%`}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={1} sx={{ mb: 3 }}>
                      <Typography variant="h3">Vue globale Audit A vs Audit B</Typography>
                      <Typography color="text.secondary">
                        Score, anomalies et sévérités regroupés sur un même graphique.
                      </Typography>
                    </Stack>

                    <ResponsiveContainer height={340} width="100%">
                      <BarChart data={overviewChartData} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
                        <CartesianGrid
                          stroke={theme.palette.divider}
                          strokeDasharray="4 4"
                        />
                        <XAxis axisLine={false} dataKey="metric" tickLine={false} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#102a43',
                            border: 'none',
                            borderRadius: 16,
                            color: '#fff',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="auditA" fill="#94a3b8" name={`Audit A #${auditAId}`} radius={[8, 8, 0, 0]} />
                        <Bar dataKey="auditB" fill={theme.palette.primary.main} name={`Audit B #${auditBId}`} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, lg: 5 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Typography variant="h3">Synthèse décisionnelle</Typography>
                      <Typography color="text.secondary">
                        Générée à partir de règles déterministes sur les deux audits sélectionnés.
                      </Typography>
                    </Stack>

                    <Stack
                      spacing={2}
                      sx={{
                        backgroundColor: 'rgba(13, 110, 110, 0.05)',
                        borderRadius: 4,
                        p: 2.25,
                      }}
                    >
                      <Typography sx={{ lineHeight: 1.7 }}>{summaryText}</Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        <Chip
                          icon={<WarningAmberRoundedIcon fontSize="small" />}
                          label={`Critiques A/B : ${severityA.Critique} → ${severityB.Critique}`}
                          sx={{ fontWeight: 700 }}
                        />
                        <Chip
                          label={`Majeures A/B : ${severityA.Majeure} → ${severityB.Majeure}`}
                          sx={{ fontWeight: 700 }}
                        />
                        <Chip
                          label={`Mineures A/B : ${severityA.Mineure} → ${severityB.Mineure}`}
                          sx={{ fontWeight: 700 }}
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card>
              <CardContent>
                <Stack spacing={1} sx={{ mb: 2.5 }}>
                  <Typography variant="h3">Tableau comparatif par règle</Typography>
                  <Typography color="text.secondary">
                    Une diminution est interprétée comme une amélioration, une hausse comme une dégradation.
                  </Typography>
                </Stack>

                <DataGrid
                  columns={columns}
                  disableRowSelectionOnClick
                  getRowId={(row) => row.rule}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        page: 0,
                        pageSize: 7,
                      },
                    },
                  }}
                  pageSizeOptions={[7, 14]}
                  rows={comparisonRows}
                  sx={{
                    border: 'none',
                    minHeight: 520,
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: 'rgba(13, 110, 110, 0.05)',
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={1} sx={{ mb: 3 }}>
                      <Typography variant="h3">Comparaison par règle</Typography>
                      <Typography color="text.secondary">
                        Comptes détectés pour chaque règle entre les deux audits.
                      </Typography>
                    </Stack>

                    <ResponsiveContainer height={360} width="100%">
                      <BarChart data={comparisonRows} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
                        <CartesianGrid
                          stroke={theme.palette.divider}
                          strokeDasharray="4 4"
                        />
                        <XAxis axisLine={false} dataKey="ruleLabel" tickLine={false} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#102a43',
                            border: 'none',
                            borderRadius: 16,
                            color: '#fff',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="auditAResult" fill="#94a3b8" name={`Audit A #${auditAId}`} radius={[8, 8, 0, 0]} />
                        <Bar dataKey="auditBResult" fill={theme.palette.secondary.main} name={`Audit B #${auditBId}`} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, lg: 5 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={1} sx={{ mb: 2.5 }}>
                      <Typography variant="h3">Priorités d'action</Typography>
                      <Typography color="text.secondary">
                        Classement selon la gravité, le nombre de patients concernés et la tendance.
                      </Typography>
                    </Stack>

                    <Stack spacing={1.4}>
                      {priorityRows.map((row) => (
                        <Stack
                          key={row.rule}
                          spacing={1}
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.72)',
                            borderRadius: 4,
                            p: 1.6,
                          }}
                        >
                          <Stack
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Typography sx={{ fontWeight: 700 }}>
                              {row.ruleLabel}
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                              <SeverityChip severity={row.severity} />
                              <Chip
                                label={`Priorité ${row.priority}`}
                                size="small"
                                sx={{
                                  backgroundColor:
                                    row.priority === 'Élevée'
                                      ? 'rgba(197, 48, 48, 0.12)'
                                      : row.priority === 'Moyenne'
                                        ? 'rgba(221, 107, 32, 0.12)'
                                        : 'rgba(79, 179, 173, 0.12)',
                                  color:
                                    row.priority === 'Élevée'
                                      ? '#c53030'
                                      : row.priority === 'Moyenne'
                                        ? '#dd6b20'
                                        : '#0f766e',
                                  fontWeight: 700,
                                }}
                              />
                            </Stack>
                          </Stack>

                          <Typography color="text.secondary" variant="body2">
                            Audit B : {row.auditBResult} patient(s) concernés. Statut : {row.status}.
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            Action recommandée : {row.action}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        ) : null}
      </Stack>
    </Fade>
  )
}

export default AuditComparisonPage
