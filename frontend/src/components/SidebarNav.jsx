import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded'
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded'
import { alpha } from '@mui/material/styles'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { NavLink } from 'react-router-dom'

import brandMark from '../assets/brand-mark.svg'

const navigationItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardRoundedIcon /> },
  { label: 'Historique', path: '/historique', icon: <HistoryRoundedIcon /> },
  { label: 'Résultats', path: '/resultats', icon: <AutoGraphRoundedIcon /> },
  {
    label: 'Recommandations',
    path: '/recommandations',
    icon: <LightbulbRoundedIcon />,
  },
  {
    label: 'Comparaison',
    path: '/comparaison',
    icon: <AnalyticsRoundedIcon />,
  },
]

function SidebarNav({ onNavigate }) {
  return (
    <Box sx={{ height: '100%', px: 2, py: 3 }}>
      <Stack direction="row" spacing={1.5} sx={{ px: 1, pb: 4 }}>
        <Box
          component="img"
          src={brandMark}
          alt="Data Quality Platform"
          sx={{ height: 48, width: 48 }}
        />
        <Box>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 800 }}>
            DataQuality
          </Typography>
          <Typography sx={{ color: alpha('#f5efe6', 0.68), fontSize: '0.88rem' }}>
            Audit & pilotage
          </Typography>
        </Box>
      </Stack>

      <List sx={{ display: 'grid', gap: 1 }}>
        {navigationItems.map((item) => (
          <ListItem disablePadding key={item.path}>
            <ListItemButton
              component={NavLink}
              onClick={onNavigate}
              to={item.path}
              sx={{
                borderRadius: 3,
                color: alpha('#f5efe6', 0.72),
                py: 1.35,
                '&.active': {
                  backgroundColor: alpha('#f5efe6', 0.14),
                  color: '#fffdf9',
                },
                '&:hover': {
                  backgroundColor: alpha('#f5efe6', 0.1),
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 42 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 700 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default SidebarNav
