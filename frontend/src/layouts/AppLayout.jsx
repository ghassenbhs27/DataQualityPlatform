import { useEffect, useMemo, useState } from 'react'
import { Box, CssBaseline, Drawer, Fade, Toolbar } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'

import AppHeader from '../components/AppHeader'
import BackToTopButton from '../components/BackToTopButton'
import SidebarNav from '../components/SidebarNav'

const drawerWidth = 280

const pageTitles = {
  '/': 'Dashboard',
  '/historique': 'Historique',
  '/resultats': 'Résultats',
  '/recommandations': 'Recommandations',
  '/comparaison': 'Comparaison des audits',
}

function AppLayout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const pageTitle = useMemo(
    () => pageTitles[location.pathname] ?? 'Data Quality Platform',
    [location.pathname],
  )

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  const handleDrawerToggle = () => {
    setMobileOpen((open) => !open)
  }

  const handleNavigation = () => {
    setMobileOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          ModalProps={{ keepMounted: true }}
          onClose={handleDrawerToggle}
          open={mobileOpen}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          variant="temporary"
        >
          <SidebarNav onNavigate={handleNavigation} />
        </Drawer>

        <Drawer
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          variant="permanent"
        >
          <SidebarNav />
        </Drawer>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <AppHeader onMenuClick={handleDrawerToggle} title={pageTitle} />
        <Toolbar
          sx={{ display: { xs: 'flex', md: 'none' }, minHeight: '0 !important' }}
        />
        <Box
          component="main"
          sx={{
            flex: 1,
            px: { xs: 2, md: 4 },
            py: { xs: 3, md: 4 },
          }}
        >
          <Fade in key={location.pathname} timeout={260}>
            <Box>
              <Outlet />
            </Box>
          </Fade>
        </Box>
      </Box>

      <BackToTopButton />
    </Box>
  )
}

export default AppLayout
