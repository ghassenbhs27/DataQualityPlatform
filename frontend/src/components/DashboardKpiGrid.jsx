import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import TodayRoundedIcon from '@mui/icons-material/TodayRounded'
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { alpha } from '@mui/material/styles'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Grow,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { memo, useMemo } from 'react'

const metricConfig = {
  anomalies: {
    color: '#dd6b20',
    icon: <WarningAmberRoundedIcon />,
  },
  controls: {
    color: '#0d6e6e',
    icon: <ShieldRoundedIcon />,
  },
  lastAudit: {
    color: '#2563eb',
    icon: <TodayRoundedIcon />,
  },
  patients: {
    color: '#0f766e',
    icon: <PeopleAltRoundedIcon />,
  },
  score: {
    color: '#f18f01',
    icon: <InsightsRoundedIcon />,
  },
}

function getTrendChip(scoreTrend) {
  if (!scoreTrend) {
    return null
  }

  const previousDateLabel = scoreTrend.previousDate
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(
        new Date(scoreTrend.previousDate),
      )
    : null

  if (scoreTrend.direction === 'up') {
    return {
      color: '#2f855a',
      icon: <ArrowUpwardRoundedIcon fontSize="small" />,
      label: `+${scoreTrend.delta}% vs ${previousDateLabel}`,
    }
  }

  if (scoreTrend.direction === 'down') {
    return {
      color: '#c53030',
      icon: <ArrowDownwardRoundedIcon fontSize="small" />,
      label: `-${scoreTrend.delta}% vs ${previousDateLabel}`,
    }
  }

  return {
    color: '#52606d',
    icon: <TrendingFlatRoundedIcon fontSize="small" />,
    label: `Stable vs ${previousDateLabel}`,
  }
}

function DashboardKpiGrid({ dashboard, scoreTrend }) {
  const scoreTrendChip = useMemo(() => getTrendChip(scoreTrend), [scoreTrend])
  const metrics = useMemo(
    () => [
      {
        key: 'score',
        label: 'Score Global',
        value: `${dashboard.globalScore}%`,
      },
      {
        key: 'patients',
        label: 'Patients analysés',
        value: dashboard.patients,
      },
      {
        key: 'anomalies',
        label: "Nombre d'anomalies",
        value: dashboard.anomalies,
      },
      {
        key: 'controls',
        label: 'Nombre de contrôles',
        value: dashboard.controls,
      },
      {
        key: 'lastAudit',
        label: 'Dernier audit',
        value: new Intl.DateTimeFormat('fr-FR').format(
          new Date(dashboard.lastAudit),
        ),
      },
    ],
    [dashboard],
  )

  return (
    <Grid container spacing={3}>
      {metrics.map((metric, index) => {
        const config = metricConfig[metric.key]

        return (
          <Grid key={metric.key} size={{ xs: 12, sm: 6, xl: 2.4 }}>
            <Grow in timeout={260 + index * 120}>
              <Card
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    borderColor: alpha(config.color, 0.24),
                    boxShadow: `0 24px 50px ${alpha(config.color, 0.18)}`,
                    transform: 'translateY(-6px)',
                  },
                }}
              >
                <Box
                  sx={{
                    background: `linear-gradient(180deg, ${alpha(config.color, 0.16)} 0%, transparent 85%)`,
                    height: 6,
                    insetInline: 0,
                    position: 'absolute',
                    top: 0,
                  }}
                />
                <CardContent sx={{ pt: 3 }}>
                  <Tooltip title={metric.label}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Stack spacing={1.1}>
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: '0.92rem', fontWeight: 600 }}
                        >
                          {metric.label}
                        </Typography>
                        <Typography sx={{ fontSize: '2rem', fontWeight: 800 }}>
                          {metric.value}
                        </Typography>
                        {metric.key === 'score' && scoreTrendChip ? (
                          <Chip
                            icon={scoreTrendChip.icon}
                            label={scoreTrendChip.label}
                            size="small"
                            sx={{
                              alignSelf: 'flex-start',
                              backgroundColor: alpha(scoreTrendChip.color, 0.12),
                              color: scoreTrendChip.color,
                              fontWeight: 700,
                            }}
                          />
                        ) : (
                          <Typography color="text.secondary" variant="body2">
                            {metric.key === 'lastAudit'
                              ? 'Dernière exécution disponible'
                              : "Mise à jour depuis l'API"}
                          </Typography>
                        )}
                      </Stack>

                      <Box
                        sx={{
                          alignItems: 'center',
                          backgroundColor: alpha(config.color, 0.12),
                          borderRadius: 4,
                          color: config.color,
                          display: 'inline-flex',
                          height: 52,
                          justifyContent: 'center',
                          width: 52,
                        }}
                      >
                        {config.icon}
                      </Box>
                    </Stack>
                  </Tooltip>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default memo(DashboardKpiGrid)
