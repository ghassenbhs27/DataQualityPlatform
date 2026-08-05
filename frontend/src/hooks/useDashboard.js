import { useCallback, useMemo } from 'react'

import {
  normalizeSeverity,
  refreshAuditResources,
  SEVERITY_ORDER,
  useAuditHistoryData,
  useDashboardData,
  useLatestAuditResultsData,
  useRunAuditAction,
} from './useAuditData'

export function useDashboard() {
  const dashboardResource = useDashboardData()
  const auditHistoryResource = useAuditHistoryData()
  const auditResultsResource = useLatestAuditResultsData()
  const { runAudit, runState } = useRunAuditAction()

  const dashboard = dashboardResource.data
  const latestAuditResults = auditResultsResource.data
  const isLoading = dashboardResource.isLoading || auditResultsResource.isLoading
  const isRefreshing =
    dashboardResource.isRefreshing ||
    auditResultsResource.isRefreshing ||
    auditHistoryResource.isRefreshing
  const error =
    dashboardResource.error ?? auditResultsResource.error ?? auditHistoryResource.error

  const scoreTrend = useMemo(() => {
    const historyRows = auditHistoryResource.data ?? []

    if (historyRows.length < 2) {
      return null
    }

    const sortedRows = [...historyRows].sort(
      (left, right) => new Date(right.auditDate) - new Date(left.auditDate),
    )
    const latestScore = Number(sortedRows[0]?.globalScore ?? 0)
    const previousScore = Number(sortedRows[1]?.globalScore ?? 0)
    const delta = Number((latestScore - previousScore).toFixed(2))

    return {
      delta: Math.abs(delta),
      direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
      previousDate: sortedRows[1]?.auditDate ?? null,
    }
  }, [auditHistoryResource.data])

  const anomalyChartData = useMemo(
    () =>
      latestAuditResults.map((result) => ({
        ruleName: result.ruleName,
        detectedCount: result.detectedCount,
      })),
    [latestAuditResults],
  )

  const severityChartData = useMemo(() => {
    const severityBuckets = new Map(
      SEVERITY_ORDER.map((severity) => [severity, 0]),
    )

    latestAuditResults.forEach((result) => {
      const normalizedSeverity = normalizeSeverity(result.severity)
      const currentCount = severityBuckets.get(normalizedSeverity) ?? 0

      severityBuckets.set(
        normalizedSeverity,
        currentCount + Number(result.detectedCount ?? 0),
      )
    })

    return SEVERITY_ORDER.map((severity) => ({
      name: severity,
      value: severityBuckets.get(severity) ?? 0,
    }))
  }, [latestAuditResults])

  const totalSeverityCount = useMemo(
    () =>
      severityChartData.reduce(
        (total, severityItem) => total + severityItem.value,
        0,
      ),
    [severityChartData],
  )

  const complianceRate = useMemo(() => {
    if (!latestAuditResults.length) {
      return Number(dashboard?.globalScore ?? 0)
    }

    const compliantControls = latestAuditResults.filter(
      (result) => Number(result.detectedCount ?? 0) === 0,
    ).length

    return Number(
      ((compliantControls / latestAuditResults.length) * 100).toFixed(1),
    )
  }, [dashboard?.globalScore, latestAuditResults])

  const summary = useMemo(() => {
    const criticalCount =
      severityChartData.find((item) => item.name === 'Critique')?.value ?? 0
    const latestScore = Number(dashboard?.globalScore ?? 0)
    const headline =
      latestScore >= 85
        ? 'Qualité globale solide'
        : latestScore >= 70
          ? 'Qualité globalement maîtrisée'
          : 'Qualité à surveiller de près'
    const message = `Le dernier audit couvre ${dashboard?.patients ?? 0} patients, recense ${dashboard?.anomalies ?? 0} anomalies et un score global de ${latestScore.toFixed(2)}%.`
    const priorityMessage =
      criticalCount > 0
        ? `${criticalCount} patient(s) sont rattachés à des anomalies critiques. Prioriser ces règles avant le prochain audit.`
        : "Aucune anomalie critique n'a été détectée sur le dernier audit. La priorité est de conserver ce niveau de conformité."

    return {
      highlights: [
        {
          label: 'Conformité',
          tone: 'positive',
          value: `${complianceRate.toFixed(1)}%`,
        },
        {
          label: 'Critiques',
          tone: criticalCount > 0 ? 'danger' : 'neutral',
          value: criticalCount,
        },
        {
          label: 'Tendance',
          tone: 'trend',
          value: scoreTrend
            ? `${scoreTrend.direction === 'down' ? '-' : scoreTrend.direction === 'up' ? '+' : ''}${scoreTrend.delta}%`
            : 'Stable',
        },
      ],
      message,
      priorityMessage,
      title: headline,
    }
  }, [complianceRate, dashboard, scoreTrend, severityChartData])

  const refreshAll = useCallback(async () => {
    await refreshAuditResources()
  }, [])

  return {
    anomalyChartData,
    complianceRate,
    dashboard,
    error,
    isLoading,
    isRefreshing,
    latestAuditResults,
    refresh: dashboardResource.refresh,
    refreshAll,
    runAudit,
    runState,
    scoreTrend,
    severityChartData,
    summary,
    totalSeverityCount,
  }
}
