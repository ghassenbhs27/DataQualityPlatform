import { alpha, useTheme } from '@mui/material/styles'
import { Card, CardContent, Stack, Typography } from '@mui/material'
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from 'recharts'

function ScoreGaugeCard({ color, description, subtitle, title, value }) {
  const theme = useTheme()
  const normalizedValue = Math.max(0, Math.min(100, Number(value ?? 0)))

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%' }}>
        <Stack spacing={1.25} sx={{ height: '100%' }}>
          <Typography color="text.secondary" variant="overline">
            {subtitle}
          </Typography>
          <Typography variant="h3">{title}</Typography>
          <Typography color="text.secondary" variant="body2">
            {description}
          </Typography>

          <ResponsiveContainer height={220} width="100%">
            <RadialBarChart
              barSize={14}
              cx="50%"
              cy="55%"
              data={[{ fill: color, value: normalizedValue }]}
              endAngle={-30}
              innerRadius="72%"
              outerRadius="100%"
              startAngle={210}
            >
              <PolarAngleAxis
                angleAxisId={0}
                domain={[0, 100]}
                tick={false}
                type="number"
              />
              <RadialBar
                animationDuration={1000}
                background={{ fill: alpha(theme.palette.text.primary, 0.08) }}
                cornerRadius={18}
                dataKey="value"
              />
              <text
                fill={theme.palette.text.primary}
                textAnchor="middle"
                x="50%"
                y="48%"
              >
                <tspan fontSize="2.25rem" fontWeight="800" x="50%">
                  {normalizedValue.toFixed(1)}
                </tspan>
                <tspan
                  dy="1.5em"
                  fill={theme.palette.text.secondary}
                  fontSize="0.92rem"
                  x="50%"
                >
                  sur 100
                </tspan>
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ScoreGaugeCard
