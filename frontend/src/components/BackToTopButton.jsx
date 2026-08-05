import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded'
import { Fab, Fade, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'

function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 320)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }

  return (
    <Fade in={isVisible}>
      <Tooltip title="Retour en haut">
        <Fab
          color="primary"
          onClick={scrollToTop}
          size="medium"
          sx={{
            bottom: 24,
            position: 'fixed',
            right: 24,
            zIndex: 1200,
          }}
        >
          <KeyboardArrowUpRoundedIcon />
        </Fab>
      </Tooltip>
    </Fade>
  )
}

export default BackToTopButton
