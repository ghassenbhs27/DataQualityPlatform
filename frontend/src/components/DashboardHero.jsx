import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Fade,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'

function DashboardHero({
  isRefreshing,
  lastAudit,
  onRefresh,
  onRunAudit,
  runState,
}) {
  const formattedDate = lastAudit
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(
        new Date(lastAudit),
      )
    : 'Aucun audit'

  const isRunning = runState === 'loading'

  return (
    <Fade in timeout={450}>
      <Paper
        sx={{
          overflow: 'hidden',
          p: { xs: 3, md: 4 },
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(13, 110, 110, 0.12) 0%, rgba(241, 143, 1, 0.08) 60%, rgba(255, 255, 255, 0.2) 100%)',
            pointerEvents: 'none',
          }}
        />

        <Stack spacing={2.5} sx={{ position: 'relative' }}>
          <Stack
            alignItems={{ xs: 'flex-start', md: 'center' }}
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography color="text.secondary" variant="overline">
                Pilotage temps réel
              </Typography>
              <Typography variant="h2">Dashboard Qualité des Données</Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
                Les indicateurs et graphiques ci-dessous sont alimentés directement
                par FastAPI et les données MySQL du dernier audit disponible.
              </Typography>
            </Box>

            <Stack alignItems={{ xs: 'stretch', md: 'flex-end' }} spacing={1.25}>
              <Chip
                icon={<AutorenewRoundedIcon />}
                label={`Dernier audit : ${formattedDate}`}
                sx={{ fontWeight: 700 }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                <Tooltip title="Recharge les indicateurs sans lancer de nouvel audit.">
                  <span>
                    <Button
                      disabled={isRunning || isRefreshing}
                      onClick={onRefresh}
                      startIcon={
                        isRefreshing ? (
                          <CircularProgress color="inherit" size={18} />
                        ) : (
                          <AutorenewRoundedIcon />
                        )
                      }
                      variant="outlined"
                    >
                      {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title="Déclenche un nouvel audit et recharge tout le dashboard.">
                  <span>
                    <Button
                      disabled={isRunning || isRefreshing}
                      onClick={onRunAudit}
                      startIcon={
                        isRunning ? (
                          <CircularProgress color="inherit" size={18} />
                        ) : (
                          <PlayArrowRoundedIcon />
                        )
                      }
                      variant="contained"
                    >
                      {isRunning ? 'Audit en cours...' : 'Lancer un audit'}
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Fade>
  )
}

export default DashboardHero
