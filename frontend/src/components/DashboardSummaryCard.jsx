import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import { alpha } from '@mui/material/styles'
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material'

const toneConfig = {
  danger: {
    backgroundColor: 'rgba(197, 48, 48, 0.12)',
    color: '#c53030',
    icon: <ReportProblemRoundedIcon fontSize="small" />,
  },
  neutral: {
    backgroundColor: 'rgba(82, 96, 109, 0.12)',
    color: '#52606d',
    icon: <AutoAwesomeRoundedIcon fontSize="small" />,
  },
  positive: {
    backgroundColor: 'rgba(47, 133, 90, 0.14)',
    color: '#2f855a',
    icon: <VerifiedRoundedIcon fontSize="small" />,
  },
  trend: {
    backgroundColor: 'rgba(13, 110, 110, 0.12)',
    color: '#0d6e6e',
    icon: <TrendingUpRoundedIcon fontSize="small" />,
  },
}

function DashboardSummaryCard({ summary }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Stack spacing={0.75}>
            <Typography color="text.secondary" variant="overline">
              Résumé automatique
            </Typography>
            <Typography variant="h3">{summary.title}</Typography>
            <Typography color="text.secondary">{summary.message}</Typography>
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {summary.highlights.map((highlight) => {
              const tone = toneConfig[highlight.tone] ?? toneConfig.neutral

              return (
                <Chip
                  icon={tone.icon}
                  key={highlight.label}
                  label={`${highlight.label} : ${highlight.value}`}
                  sx={{
                    backgroundColor: tone.backgroundColor,
                    color: tone.color,
                    fontWeight: 700,
                  }}
                />
              )
            })}
          </Stack>

          <Stack
            spacing={1}
            sx={{
              backgroundColor: alpha('#0d6e6e', 0.05),
              borderRadius: 4,
              mt: 'auto',
              p: 2,
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>
              Point d&apos;attention prioritaire
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {summary.priorityMessage}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default DashboardSummaryCard
