import { Card, CardContent, Grid, Skeleton, Stack } from '@mui/material'

function DashboardSkeleton() {
  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Skeleton height={28} variant="text" width="18%" />
            <Skeleton height={54} variant="text" width="44%" />
            <Skeleton height={24} variant="text" width="72%" />
            <Skeleton height={40} variant="rounded" width={180} />
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, xl: 2.4 }}>
            <Card>
              <CardContent>
                <Skeleton height={22} variant="text" width="70%" />
                <Skeleton height={46} variant="text" width="50%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card>
            <CardContent>
              <Skeleton height={28} variant="text" width="42%" />
              <Skeleton height={20} variant="text" width="58%" />
              <Skeleton height={320} sx={{ mt: 2 }} variant="rounded" />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card>
            <CardContent>
              <Skeleton height={28} variant="text" width="46%" />
              <Skeleton height={20} variant="text" width="65%" />
              <Skeleton height={320} sx={{ mt: 2 }} variant="circular" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default DashboardSkeleton
