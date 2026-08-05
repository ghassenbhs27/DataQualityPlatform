import { Card, CardContent, Grid, Skeleton, Stack } from '@mui/material'

function PageTableSkeleton({ showCards = false, showChart = false }) {
  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Skeleton height={22} variant="text" width="16%" />
            <Skeleton height={48} variant="text" width="34%" />
            <Skeleton height={24} variant="text" width="62%" />
          </Stack>
        </CardContent>
      </Card>

      {showCards ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, md: 6, xl: 4 }}>
              <Card>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Skeleton height={28} variant="text" width="50%" />
                    <Skeleton height={28} variant="rounded" width={96} />
                    <Skeleton height={22} variant="text" width="38%" />
                    <Skeleton height={54} variant="text" width="100%" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Skeleton height={42} variant="rounded" width={260} />
              <Skeleton height={42} variant="rounded" width={180} />
            </Stack>
            <Skeleton height={460} variant="rounded" />
          </CardContent>
        </Card>
      )}

      {showChart ? (
        <Card>
          <CardContent>
            <Skeleton height={28} variant="text" width="34%" />
            <Skeleton height={20} variant="text" width="48%" />
            <Skeleton height={320} sx={{ mt: 2 }} variant="rounded" />
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  )
}

export default PageTableSkeleton
