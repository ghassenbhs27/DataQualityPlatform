import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import LensRoundedIcon from '@mui/icons-material/LensRounded'
import RuleFolderRoundedIcon from '@mui/icons-material/RuleFolderRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { alpha } from '@mui/material/styles'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Fade,
  Grid,
  Grow,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'

import PageTableSkeleton from '../components/PageTableSkeleton'
import SeverityChip from '../components/SeverityChip'
import {
  normalizeSeverity,
  useLatestAuditResultsData,
} from '../hooks/useAuditData'

const severityAccents = {
  Critique: {
    background:
      'linear-gradient(180deg, rgba(197, 48, 48, 0.14) 0%, rgba(255, 253, 249, 0.98) 62%)',
    borderColor: 'rgba(197, 48, 48, 0.24)',
    color: '#c53030',
    glow: 'rgba(197, 48, 48, 0.16)',
    icon: <WarningAmberRoundedIcon />,
  },
  Majeure: {
    background:
      'linear-gradient(180deg, rgba(221, 107, 32, 0.15) 0%, rgba(255, 253, 249, 0.98) 62%)',
    borderColor: 'rgba(221, 107, 32, 0.24)',
    color: '#dd6b20',
    glow: 'rgba(221, 107, 32, 0.16)',
    icon: <ErrorOutlineRoundedIcon />,
  },
  Mineure: {
    background:
      'linear-gradient(180deg, rgba(79, 179, 173, 0.15) 0%, rgba(255, 253, 249, 0.98) 62%)',
    borderColor: 'rgba(79, 179, 173, 0.24)',
    color: '#0f766e',
    glow: 'rgba(79, 179, 173, 0.16)',
    icon: <LensRoundedIcon />,
  },
}

const priorityBySeverity = {
  Critique: 'Élevée',
  Majeure: 'Moyenne',
  Mineure: 'Faible',
}

function RecommendationsPage() {
  const { data, error, isLoading } = useLatestAuditResultsData()

  const groupedRecommendations = useMemo(() => {
    const recommendationMap = new Map()

    ;(data ?? []).forEach((row) => {
      if (!recommendationMap.has(row.ruleName)) {
        recommendationMap.set(row.ruleName, {
          detectedCount: Number(row.detectedCount ?? 0),
          priority: priorityBySeverity[normalizeSeverity(row.severity)] ?? 'Faible',
          recommendation: row.recommendation,
          ruleName: row.ruleName,
          severity: normalizeSeverity(row.severity),
        })
        return
      }

      const currentValue = recommendationMap.get(row.ruleName)
      currentValue.detectedCount += Number(row.detectedCount ?? 0)
    })

    return Array.from(recommendationMap.values()).sort(
      (left, right) => right.detectedCount - left.detectedCount,
    )
  }, [data])

  const totalPatientsImpacted = useMemo(
    () =>
      groupedRecommendations.reduce(
        (total, item) => total + Number(item.detectedCount ?? 0),
        0,
      ),
    [groupedRecommendations],
  )

  if (isLoading) {
    return <PageTableSkeleton showCards />
  }

  return (
    <Fade in timeout={320}>
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography color="text.secondary" variant="overline">
                Actions prioritaires
              </Typography>
              <Stack
                alignItems={{ xs: 'flex-start', md: 'center' }}
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Typography variant="h2">Recommandations du dernier audit</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <Chip
                    color="primary"
                    icon={<RuleFolderRoundedIcon />}
                    label={`${groupedRecommendations.length} recommandations`}
                    variant="outlined"
                  />
                  <Chip
                    color="secondary"
                    label={`${totalPatientsImpacted} patients concernés`}
                    variant="outlined"
                  />
                </Stack>
              </Stack>
              <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                Les cartes ci-dessous regroupent les recommandations par règle en
                s&apos;appuyant sur les résultats du dernier audit disponible.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Grid container spacing={2.5}>
          {groupedRecommendations.map((item, index) => {
            const accent = severityAccents[item.severity] ?? severityAccents.Mineure

            return (
              <Grid key={item.ruleName} size={{ xs: 12, md: 6, xl: 4 }}>
                <Grow in timeout={320 + index * 90}>
                  <Card
                    sx={{
                      background: accent.background,
                      border: `1px solid ${accent.borderColor}`,
                      height: '100%',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: `0 22px 44px ${accent.glow}`,
                        transform: 'translateY(-6px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        background: `linear-gradient(90deg, ${accent.color} 0%, ${alpha(accent.color, 0.4)} 100%)`,
                        height: 5,
                        insetInline: 0,
                        position: 'absolute',
                        top: 0,
                      }}
                    />

                    <CardContent
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        p: 2.5,
                      }}
                    >
                      <Stack
                        alignItems="flex-start"
                        direction="row"
                        justifyContent="space-between"
                        spacing={1.5}
                      >
                        <Stack direction="row" spacing={1.25}>
                          <Tooltip title={`Gravité ${item.severity}`}>
                            <Box
                              sx={{
                                alignItems: 'center',
                                backgroundColor: alpha(accent.color, 0.12),
                                border: `1px solid ${alpha(accent.color, 0.18)}`,
                                borderRadius: 4,
                                color: accent.color,
                                display: 'flex',
                                flexShrink: 0,
                                height: 44,
                                justifyContent: 'center',
                                lineHeight: 0,
                                width: 44,
                                '& svg': {
                                  display: 'block',
                                  fontSize: '1.35rem',
                                  margin: 'auto',
                                },
                              }}
                            >
                              {accent.icon}
                            </Box>
                          </Tooltip>

                          <Stack spacing={0.7}>
                            <Typography
                              sx={{ fontSize: '1.12rem', lineHeight: 1.25 }}
                              variant="h3"
                            >
                              {item.ruleName}
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={0.8}>
                              <SeverityChip severity={item.severity} />
                              <Chip
                                label={`Priorité ${item.priority}`}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(accent.color, 0.1),
                                  color: accent.color,
                                  fontWeight: 700,
                                }}
                              />
                            </Stack>
                          </Stack>
                        </Stack>

                        <Box
                          sx={{
                            alignItems: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: `1px solid ${alpha(accent.color, 0.14)}`,
                            borderRadius: '50%',
                            display: 'flex',
                            flexDirection: 'column',
                            flexShrink: 0,
                            height: 82,
                            justifyContent: 'center',
                            textAlign: 'center',
                            width: 82,
                          }}
                        >
                          <Typography
                            sx={{
                              color: accent.color,
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              lineHeight: 1,
                            }}
                          >
                            {item.detectedCount}
                          </Typography>
                          <Typography
                            color="text.secondary"
                            sx={{ fontSize: '0.66rem', lineHeight: 1.15, mt: 0.35 }}
                            variant="caption"
                          >
                            patients
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        flexWrap="wrap"
                        gap={0.8}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          borderRadius: 4,
                          px: 1,
                          py: 0.85,
                        }}
                      >
                        <Chip
                          label={`Rang #${index + 1}`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${item.detectedCount} patient(s) à traiter`}
                          size="small"
                          sx={{
                            backgroundColor: alpha(accent.color, 0.08),
                            color: accent.color,
                            fontWeight: 700,
                          }}
                        />
                      </Stack>

                      <Divider />

                      <Stack spacing={0.9}>
                        <Typography
                          color="text.secondary"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                          }}
                        >
                          ACTION RECOMMANDÉE
                        </Typography>
                        <Box
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            border: `1px solid ${alpha(accent.color, 0.1)}`,
                            borderRadius: 4,
                            p: 1.35,
                          }}
                        >
                          <Typography
                            color="text.secondary"
                            sx={{ fontSize: '0.94rem', lineHeight: 1.55 }}
                          >
                            {item.recommendation}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            )
          })}
        </Grid>
      </Stack>
    </Fade>
  )
}

export default RecommendationsPage
