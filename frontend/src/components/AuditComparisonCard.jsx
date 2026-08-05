import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded'
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import {
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'

const trendConfig = {
  down: {
    color: '#c53030',
    icon: <TrendingDownRoundedIcon fontSize="small" />,
    label: 'En baisse',
  },
  flat: {
    color: '#52606d',
    icon: <TrendingFlatRoundedIcon fontSize="small" />,
    label: 'Stable',
  },
  up: {
    color: '#2f855a',
    icon: <TrendingUpRoundedIcon fontSize="small" />,
    label: 'En hausse',
  },
}

function formatAuditLabel(audit) {
  return `${new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(audit.auditDate))} · score ${audit.globalScore}%`
}

function getRuleDeltas(baseResults, compareResults) {
  const baseMap = new Map(
    baseResults.map((row) => [row.ruleName, Number(row.detectedCount ?? 0)]),
  )
  const compareMap = new Map(
    compareResults.map((row) => [row.ruleName, Number(row.detectedCount ?? 0)]),
  )

  return Array.from(new Set([...baseMap.keys(), ...compareMap.keys()]))
    .map((ruleName) => {
      const currentCount = compareMap.get(ruleName) ?? 0
      const previousCount = baseMap.get(ruleName) ?? 0

      return {
        delta: currentCount - previousCount,
        previousCount,
        ruleName,
        value: currentCount,
      }
    })
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))
    .slice(0, 4)
}

function AuditComparisonCard({ audits, results }) {
  const sortedAudits = useMemo(
    () =>
      [...audits].sort(
        (left, right) =>
          new Date(right.auditDate).getTime() - new Date(left.auditDate).getTime(),
      ),
    [audits],
  )

  const [baseAuditId, setBaseAuditId] = useState(
    sortedAudits[1]?.id ?? sortedAudits[0]?.id ?? '',
  )
  const [compareAuditId, setCompareAuditId] = useState(
    sortedAudits[0]?.id ?? '',
  )

  const comparison = useMemo(() => {
    const baseAudit = sortedAudits.find((audit) => audit.id === baseAuditId)
    const compareAudit = sortedAudits.find((audit) => audit.id === compareAuditId)

    if (!baseAudit || !compareAudit) {
      return null
    }

    const scoreDelta = Number(
      (
        Number(compareAudit.globalScore ?? 0) -
        Number(baseAudit.globalScore ?? 0)
      ).toFixed(2),
    )
    const errorDelta =
      Number(compareAudit.totalErrors ?? 0) - Number(baseAudit.totalErrors ?? 0)
    const patientDelta =
      Number(compareAudit.totalPatients ?? 0) - Number(baseAudit.totalPatients ?? 0)
    const trend = scoreDelta > 0 ? 'up' : scoreDelta < 0 ? 'down' : 'flat'

    return {
      baseAudit,
      compareAudit,
      deltas: getRuleDeltas(
        results.filter((row) => row.auditId === baseAudit.id),
        results.filter((row) => row.auditId === compareAudit.id),
      ),
      errorDelta,
      patientDelta,
      scoreDelta,
      trend,
    }
  }, [baseAuditId, compareAuditId, results, sortedAudits])

  if (!comparison) {
    return null
  }

  const trend = trendConfig[comparison.trend]

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack spacing={0.75}>
            <Typography color="text.secondary" variant="overline">
              Comparaison de deux audits
            </Typography>
            <Typography variant="h3">Visualiser les écarts clés</Typography>
            <Typography color="text.secondary">
              Compare rapidement deux exécutions sans quitter la page.
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="base-audit-label">Audit de référence</InputLabel>
                <Select
                  label="Audit de référence"
                  labelId="base-audit-label"
                  onChange={(event) => setBaseAuditId(event.target.value)}
                  value={baseAuditId}
                >
                  {sortedAudits.map((audit) => (
                    <MenuItem key={audit.id} value={audit.id}>
                      {formatAuditLabel(audit)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="compare-audit-label">Audit comparé</InputLabel>
                <Select
                  label="Audit comparé"
                  labelId="compare-audit-label"
                  onChange={(event) => setCompareAuditId(event.target.value)}
                  value={compareAuditId}
                >
                  {sortedAudits.map((audit) => (
                    <MenuItem key={audit.id} value={audit.id}>
                      {formatAuditLabel(audit)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Stack
            alignItems={{ xs: 'flex-start', md: 'center' }}
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Chip
              icon={<CompareArrowsRoundedIcon fontSize="small" />}
              label={`${formatAuditLabel(comparison.baseAudit)} → ${formatAuditLabel(comparison.compareAudit)}`}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              icon={trend.icon}
              label={`${trend.label} du score : ${comparison.scoreDelta > 0 ? '+' : ''}${comparison.scoreDelta}%`}
              sx={{
                backgroundColor: `${trend.color}22`,
                color: trend.color,
                fontWeight: 700,
              }}
            />
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={0.5}>
                <Typography color="text.secondary" variant="body2">
                  Écart de score
                </Typography>
                <Typography
                  sx={{ color: trend.color, fontSize: '1.75rem', fontWeight: 800 }}
                >
                  {comparison.scoreDelta > 0 ? '+' : ''}
                  {comparison.scoreDelta}%
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={0.5}>
                <Typography color="text.secondary" variant="body2">
                  Écart d&apos;erreurs
                </Typography>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 800 }}>
                  {comparison.errorDelta > 0 ? '+' : ''}
                  {comparison.errorDelta}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={0.5}>
                <Typography color="text.secondary" variant="body2">
                  Écart de patients
                </Typography>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 800 }}>
                  {comparison.patientDelta > 0 ? '+' : ''}
                  {comparison.patientDelta}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Stack spacing={1.2}>
            <Typography sx={{ fontWeight: 700 }}>
              Règles les plus impactées
            </Typography>
            {comparison.deltas.map((delta) => (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                key={delta.ruleName}
                spacing={1}
                sx={{
                  backgroundColor: 'rgba(13, 110, 110, 0.04)',
                  borderRadius: 3,
                  px: 2,
                  py: 1.25,
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>{delta.ruleName}</Typography>
                <Typography color="text.secondary">
                  {delta.value} patient(s) concernés, écart{' '}
                  <Typography
                    component="span"
                    sx={{
                      color:
                        delta.delta > 0
                          ? '#c53030'
                          : delta.delta < 0
                            ? '#2f855a'
                            : 'text.primary',
                      fontWeight: 700,
                    }}
                  >
                    {delta.delta > 0 ? '+' : ''}
                    {delta.delta}
                  </Typography>
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default AuditComparisonCard
