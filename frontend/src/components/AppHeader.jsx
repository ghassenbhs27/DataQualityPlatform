import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Toolbar,
  Typography,
} from '@mui/material'

function AppHeader({ onMenuClick, title }) {
  return (
    <AppBar position="sticky" color="transparent">
      <Toolbar
        sx={{
          gap: 2,
          minHeight: { xs: 72, md: 84 },
          px: { xs: 2, md: 3 },
        }}
      >
        <Tooltip title="Ouvrir la navigation">
          <IconButton
            aria-label="Ouvrir le menu"
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { md: 'none' } }}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Tooltip>

        <Box sx={{ flexGrow: 1 }}>
          <Typography color="text.secondary" variant="overline">
            Data Quality Platform
          </Typography>
          <Typography
            color="text.primary"
            sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800 }}
          >
            {title}
          </Typography>
        </Box>

        <TextField
          placeholder="Recherche"
          size="small"
          sx={{
            display: { xs: 'none', lg: 'flex' },
            minWidth: 260,
            '& .MuiOutlinedInput-root': {
              borderRadius: 999,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Stack alignItems="center" direction="row" spacing={1}>
          <Tooltip title="Centre de notifications">
            <IconButton color="inherit">
              <NotificationsNoneRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Session Data Quality">
            <Avatar
              alt="Admin"
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                fontWeight: 700,
              }}
            >
              DQ
            </Avatar>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}

export default AppHeader
