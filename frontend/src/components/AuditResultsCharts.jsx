import { useTheme } from '@mui/material/styles'
import {
  Card,
  CardContent,
  Fade,
  Grid,
  Stack,
  Tooltip as MuiTooltip,
  Typography,
} from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const severityColors = {
  Critique: '#c53030',
  Majeure: '#dd6b20',
  Mineure: '#4fb3ad',
}

function AuditResultsCharts({
  anomalyChartData,
  severityChartData,
  totalSeverityCount,
}) {
  const theme = useTheme()
  const tooltipStyle = {
    backgroundColor: '#102a43',
    border: 'none',
    borderRadius: 16,
    color: '#fff',
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 7 }}>
        <Fade in timeout={500}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="h3">
                  Patients concernés par type d&apos;anomalie
                </Typography>
                <Typography color="text.secondary">
                  Données du dernier audit retourné par l&apos;API.
                </Typography>
              </Stack>

              <ResponsiveContainer height={360} width="100%">
                <BarChart
                  data={anomalyChartData}
                  layout="vertical"
                  margin={{ top: 8, right: 36, bottom: 8, left: 28 }}
                >
                  <CartesianGrid
                    stroke={theme.palette.divider}
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    allowDecimals={false}
                    axisLine={false}
                    dataKey="detectedCount"
                    label={{
                      fill: theme.palette.text.secondary,
                      position: 'insideBottom',
                      value: 'Patients concernés',
                    }}
                    tickLine={false}
                    type="number"
                  />
                  <YAxis
                    axisLine={false}
                    dataKey="ruleName"
                    interval={0}
                    style={{ fontSize: 12 }}
                    tickLine={false}
                    type="category"
                    width={140}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: 'rgba(13, 110, 110, 0.06)' }}
                    formatter={(value) => [`${value}`, 'Patients']}
                  />
                  <Legend />
                  <Bar
                    animationDuration={900}
                    dataKey="detectedCount"
                    fill={theme.palette.primary.main}
                    name="Patients concernés"
                    radius={[0, 12, 12, 0]}
                  >
                    <LabelList
                      dataKey="detectedCount"
                      fill={theme.palette.text.secondary}
                      position="right"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Fade>
      </Grid>

      <Grid size={{ xs: 12, lg: 5 }}>
        <Fade in timeout={650}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="h3">Répartition par sévérité</Typography>
                <Typography color="text.secondary">
                  Regroupement automatique à partir du champ `severity`.
                </Typography>
              </Stack>

              <ResponsiveContainer height={360} width="100%">
                <PieChart>
                  <Pie
                    animationDuration={900}
                    cx="50%"
                    cy="50%"
                    data={severityChartData}
                    dataKey="value"
                    innerRadius={70}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {severityChartData.map((entry) => (
                      <Cell fill={severityColors[entry.name]} key={entry.name} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [`${value}`, name]}
                  />
                  <Legend verticalAlign="bottom" />
                  <text
                    fill={theme.palette.text.primary}
                    textAnchor="middle"
                    x="50%"
                    y="46%"
                  >
                    <tspan fontSize="1.9rem" fontWeight="700" x="50%">
                      {totalSeverityCount}
                    </tspan>
                    <tspan
                      dy="1.6em"
                      fill={theme.palette.text.secondary}
                      fontSize="0.9rem"
                      x="50%"
                    >
                      anomalies
                    </tspan>
                  </text>
                </PieChart>
              </ResponsiveContainer>
              <MuiTooltip title="Le donut se recalcule automatiquement après chaque audit.">
                <Typography color="text.secondary" variant="body2">
                  Critique, Majeure et Mineure sont agrégées sans recalcul métier.
                </Typography>
              </MuiTooltip>
            </CardContent>
          </Card>
        </Fade>
      </Grid>
    </Grid>
  )
}

export default AuditResultsCharts
