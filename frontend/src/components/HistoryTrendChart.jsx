import { useTheme } from '@mui/material/styles'
import { Card, CardContent, Fade, Stack, Typography } from '@mui/material'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function formatAuditDate(value) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value))
}

function HistoryTrendChart({ averageScore, data }) {
  const theme = useTheme()

  return (
    <Fade in timeout={550}>
      <Card>
        <CardContent>
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h3">Évolution du score global</Typography>
            <Typography color="text.secondary">
              Courbes construites à partir de l&apos;historique d&apos;audit.
            </Typography>
          </Stack>

          <ResponsiveContainer height={340} width="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
            >
              <CartesianGrid
                stroke={theme.palette.divider}
                strokeDasharray="4 4"
              />
              <XAxis
                axisLine={false}
                dataKey="auditDate"
                tickFormatter={formatAuditDate}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                domain={[0, 100]}
                label={{
                  angle: -90,
                  fill: theme.palette.text.secondary,
                  position: 'insideLeft',
                  value: 'Score global',
                }}
                tickFormatter={(value) => `${value}`}
                tickLine={false}
                yAxisId="score"
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                label={{
                  angle: 90,
                  fill: theme.palette.text.secondary,
                  position: 'insideRight',
                  value: 'Erreurs',
                }}
                orientation="right"
                tickLine={false}
                yAxisId="errors"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#102a43',
                  border: 'none',
                  borderRadius: 16,
                  color: '#fff',
                }}
                formatter={(value, name) =>
                  name === 'Score global'
                    ? [`${value}%`, name]
                    : [value, name]
                }
                labelFormatter={(value) =>
                  new Intl.DateTimeFormat('fr-FR', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(value))
                }
              />
              <Legend />
              <ReferenceLine
                label={{
                  fill: theme.palette.text.secondary,
                  position: 'insideTopRight',
                  value: `Moyenne ${averageScore}%`,
                }}
                stroke={theme.palette.secondary.main}
                strokeDasharray="6 4"
                y={averageScore}
                yAxisId="score"
              />
              <Line
                activeDot={{ r: 6 }}
                animationDuration={900}
                dataKey="globalScore"
                dot={{ fill: '#0d6e6e', r: 4, strokeWidth: 0 }}
                name="Score global"
                stroke="#0d6e6e"
                strokeWidth={3}
                type="monotone"
                yAxisId="score"
              />
              <Line
                activeDot={{ r: 6 }}
                animationDuration={1100}
                dataKey="totalErrors"
                dot={{ fill: '#f18f01', r: 4, strokeWidth: 0 }}
                name="Total erreurs"
                stroke="#f18f01"
                strokeWidth={3}
                type="monotone"
                yAxisId="errors"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Fade>
  )
}

export default HistoryTrendChart
