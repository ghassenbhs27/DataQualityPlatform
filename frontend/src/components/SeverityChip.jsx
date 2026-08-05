import LensRoundedIcon from '@mui/icons-material/LensRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { Chip } from '@mui/material'
import { memo } from 'react'

import { normalizeSeverity } from '../hooks/useAuditData'

const severityStyles = {
  Critique: {
    backgroundColor: 'rgba(197, 48, 48, 0.12)',
    color: '#c53030',
    icon: <WarningAmberRoundedIcon fontSize="small" />,
  },
  Majeure: {
    backgroundColor: 'rgba(221, 107, 32, 0.14)',
    color: '#dd6b20',
    icon: <LensRoundedIcon fontSize="small" />,
  },
  Mineure: {
    backgroundColor: 'rgba(79, 179, 173, 0.16)',
    color: '#0f766e',
    icon: <LensRoundedIcon fontSize="small" />,
  },
}

function SeverityChip({ severity }) {
  const label = normalizeSeverity(severity)
  const style = severityStyles[label] ?? severityStyles.Mineure
  const { icon, ...chipSx } = style

  return (
    <Chip
      icon={icon}
      label={label}
      size="small"
      sx={{
        fontWeight: 700,
        ...chipSx,
      }}
    />
  )
}

export default memo(SeverityChip)
