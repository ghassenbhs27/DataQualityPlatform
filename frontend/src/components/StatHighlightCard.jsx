import { alpha } from '@mui/material/styles'
import { Card, CardContent, Stack, Typography } from '@mui/material'

function StatHighlightCard({ accentColor, caption, title, value }) {
  return (
    <Card
      sx={{
        background: `linear-gradient(180deg, ${alpha(accentColor, 0.14)} 0%, rgba(255, 255, 255, 0.96) 100%)`,
        height: '100%',
      }}
    >
      <CardContent>
        <Stack spacing={0.75}>
          <Typography color="text.secondary" variant="overline">
            {caption}
          </Typography>
          <Typography variant="h3">{title}</Typography>
          <Typography sx={{ color: accentColor, fontSize: '2rem', fontWeight: 800 }}>
            {value}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default StatHighlightCard
