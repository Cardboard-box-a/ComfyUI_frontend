import type { ExecutionOutcomeMetadata, TelemetryProvider } from '../../types'

interface DatadogRumDurationVitalOptions {
  startTime: number
  duration: number
  context?: Record<string, unknown>
}

interface DatadogRumInternalContext {
  view?: { id?: string }
}

interface DatadogRumClient {
  addDurationVital(name: string, options: DatadogRumDurationVitalOptions): void
  getInternalContext(startTime?: number): DatadogRumInternalContext | undefined
}

interface WindowWithDatadogRum extends Window {
  DD_RUM?: DatadogRumClient
}

function getDatadogRum(): DatadogRumClient | undefined {
  return (window as WindowWithDatadogRum).DD_RUM
}

export class DatadogRumTelemetryProvider implements TelemetryProvider {
  trackExecutionOutcome({
    startTime,
    outcome
  }: ExecutionOutcomeMetadata): void {
    const rum = getDatadogRum()
    const originViewId = rum?.getInternalContext(startTime)?.view?.id
    rum?.addDurationVital('workflow_execution', {
      startTime: performance.timeOrigin + startTime,
      duration: performance.now() - startTime,
      context: {
        outcome,
        product: 'cloud_generation',
        ...(originViewId && { origin_view_id: originViewId })
      }
    })
  }
}
