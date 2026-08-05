import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  getAuditHistory,
  getAuditResults,
  getDashboard,
  runAudit,
} from '../services/api'

const RESOURCE_KEYS = {
  auditHistory: 'auditHistory',
  auditResults: 'auditResults',
  dashboard: 'dashboard',
}

export const SEVERITY_ORDER = ['Critique', 'Majeure', 'Mineure']

const resourceFetchers = {
  [RESOURCE_KEYS.dashboard]: getDashboard,
  [RESOURCE_KEYS.auditHistory]: getAuditHistory,
  [RESOURCE_KEYS.auditResults]: getAuditResults,
}

const resourceStore = new Map()

function getErrorMessage(error) {
  if (error?.response?.data?.detail) {
    return String(error.response.data.detail)
  }

  if (error?.message) {
    return String(error.message)
  }

  return 'Une erreur est survenue lors du chargement des données.'
}

export function normalizeSeverity(severity) {
  const normalizedValue = severity?.trim()

  if (!normalizedValue) {
    return 'Mineure'
  }

  return normalizedValue
}

function createResourceState(key) {
  return {
    data: null,
    error: null,
    isLoading: false,
    key,
    listeners: new Set(),
    promise: null,
  }
}

function ensureResource(key) {
  if (!resourceStore.has(key)) {
    resourceStore.set(key, createResourceState(key))
  }

  return resourceStore.get(key)
}

function getSnapshot(key) {
  const resource = ensureResource(key)

  return {
    data: resource.data,
    error: resource.error,
    isLoading: resource.isLoading && resource.data === null,
    isRefreshing: resource.isLoading && resource.data !== null,
  }
}

function notifyListeners(key) {
  const resource = ensureResource(key)
  const snapshot = getSnapshot(key)

  resource.listeners.forEach((listener) => {
    listener(snapshot)
  })
}

async function fetchResource(key, { force = false } = {}) {
  const resource = ensureResource(key)

  if (!force && resource.data !== null) {
    return resource.data
  }

  if (resource.promise) {
    return resource.promise
  }

  resource.isLoading = true
  resource.error = null
  notifyListeners(key)

  const request = resourceFetchers[key]()
    .then((payload) => {
      resource.data = payload
      resource.error = null
      return payload
    })
    .catch((requestError) => {
      resource.error = getErrorMessage(requestError)
      throw requestError
    })
    .finally(() => {
      resource.isLoading = false
      resource.promise = null
      notifyListeners(key)
    })

  resource.promise = request
  return request
}

export async function refreshAuditResources(keys = Object.values(RESOURCE_KEYS)) {
  await Promise.all(keys.map((key) => fetchResource(key, { force: true })))
}

function useAuditResource(key) {
  const [snapshot, setSnapshot] = useState(() => getSnapshot(key))

  useEffect(() => {
    const resource = ensureResource(key)
    resource.listeners.add(setSnapshot)
    setSnapshot(getSnapshot(key))

    fetchResource(key).catch(() => {})

    return () => {
      resource.listeners.delete(setSnapshot)
    }
  }, [key])

  const refresh = useCallback(async () => {
    await fetchResource(key, { force: true })
  }, [key])

  return {
    ...snapshot,
    refresh,
  }
}

export function useDashboardData() {
  return useAuditResource(RESOURCE_KEYS.dashboard)
}

export function useAuditHistoryData() {
  return useAuditResource(RESOURCE_KEYS.auditHistory)
}

export function useAuditResultsData() {
  return useAuditResource(RESOURCE_KEYS.auditResults)
}

export function useLatestAuditResultsData() {
  const auditResultsResource = useAuditResultsData()

  const latestAuditId = useMemo(() => {
    if (!auditResultsResource.data?.length) {
      return null
    }

    return Math.max(...auditResultsResource.data.map((result) => result.auditId))
  }, [auditResultsResource.data])

  const latestAuditResults = useMemo(() => {
    if (latestAuditId === null) {
      return []
    }

    return auditResultsResource.data.filter(
      (result) => result.auditId === latestAuditId,
    )
  }, [auditResultsResource.data, latestAuditId])

  return {
    ...auditResultsResource,
    data: latestAuditResults,
    latestAuditId,
  }
}

export function useRunAuditAction() {
  const [runState, setRunState] = useState('idle')

  const execute = useCallback(async () => {
    setRunState('loading')

    try {
      const payload = await runAudit()
      await refreshAuditResources()
      setRunState('success')
      return payload
    } catch (requestError) {
      setRunState('error')
      throw requestError
    }
  }, [])

  return {
    runAudit: execute,
    runState,
  }
}
