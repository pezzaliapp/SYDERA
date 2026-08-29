/**
 * Assembles one SYDERA from the stored input.
 *
 * Every engine is deterministic and takes its reference date as an argument,
 * so this hook is the only place where "now" enters the calculation.
 */
import { useMemo } from 'react'
import { calculateChart, type Chart, type ChartIssue } from '../core/astrology/chart.ts'
import type { BodyId, ZodiacSign } from '../core/astrology/types.ts'
import { compareSystems, type ConvergenceResult } from '../core/convergence/taxonomy.ts'
import { currentTransits, type NatalPoint, type Transit } from '../core/cycles/transits.ts'
import { computeNumerologyProfile, type NumerologyProfile } from '../core/numerology/profile.ts'
import { buildReport } from '../core/interpretation/report.ts'
import type { Report } from '../core/interpretation/types.ts'
import type { NumerologyIssue } from '../core/numerology/types.ts'
import type { StoredSydera } from '../core/storage/sydera.ts'

export interface Analysis {
  readonly chart: Chart | null
  readonly chartIssue: ChartIssue | null
  readonly numerology: NumerologyProfile | null
  readonly numerologyIssues: readonly NumerologyIssue[]
  readonly numerologyWarnings: readonly NumerologyIssue[]
  readonly convergence: ConvergenceResult
  readonly transits: readonly Transit[]
  readonly referenceDate: { year: number; month: number; day: number }
  /** The reading built from everything above. */
  readonly report: Report
}

export function buildAnalysis(sydera: StoredSydera, nowMs: number): Analysis {
  const now = new Date(nowMs)
  const referenceDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
  const { input } = sydera

  const chartOutcome = calculateChart({
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthTimePrecisionMinutes: input.birthTimePrecisionMinutes,
    place: input.place
      ? { latitude: input.place.latitude, longitude: input.place.longitude, label: input.place.label }
      : null,
    zoneId: input.place?.timeZoneId ?? null,
    houseSystem: input.houseSystem,
    offsetOverrideMinutes: input.offsetOverrideMinutes,
  })
  const chart = chartOutcome.ok ? chartOutcome.chart : null
  const chartIssue = chartOutcome.ok ? null : chartOutcome.issue

  const name = input.fullBirthName?.trim() ?? ''
  const numerologyOutcome = name
    ? computeNumerologyProfile({ fullBirthName: name, birthDate: input.birthDate, referenceDate })
    : null
  const numerology = numerologyOutcome?.ok ? numerologyOutcome.value : null
  const numerologyIssues = numerologyOutcome && !numerologyOutcome.ok ? numerologyOutcome.issues : []
  const numerologyWarnings = numerologyOutcome?.ok ? numerologyOutcome.warnings : []

  // Convergences need both systems; a missing one leaves the comparison empty
  // rather than half-computed.
  const astrologyFactors =
    chart?.kind === 'complete'
      ? {
          factors: [
            ...chart.positions
              .filter((position) => ['sun', 'moon', 'mercury', 'venus', 'mars'].includes(position.body))
              .map((position) => ({ factor: position.body as BodyId, sign: position.sign })),
            {
              factor: 'ascendant' as const,
              sign: chart.positions[0]
                ? (signFromLongitude(chart.ascendantValue) as ZodiacSign)
                : ('ariete' as ZodiacSign),
            },
          ],
        }
      : null

  const numerologyFactors = numerology
    ? {
        numbers: [
          { label: 'Sentiero di vita', value: numerology.lifePath.value },
          { label: 'Espressione', value: numerology.expression.value },
          { label: 'Anima', value: numerology.soulUrge.value },
          { label: 'Personalità', value: numerology.personality.value },
        ],
      }
    : null

  const natalPoints: NatalPoint[] =
    chart?.kind === 'complete'
      ? [
          ...chart.positions.map((position) => ({ point: position.body, longitude: position.longitude })),
          { point: 'ascendant' as const, longitude: chart.ascendantValue },
          { point: 'midheaven' as const, longitude: chart.midheavenValue },
        ]
      : []

  const convergence = compareSystems(astrologyFactors, numerologyFactors)
  const transits = natalPoints.length > 0 ? currentTransits(natalPoints, nowMs) : []

  return {
    chart,
    chartIssue,
    numerology,
    numerologyIssues,
    numerologyWarnings,
    convergence,
    transits,
    referenceDate,
    report: buildReport({ chart, numerology, convergence, transits }),
  }
}

function signFromLongitude(longitude: number): string {
  const signs = [
    'ariete', 'toro', 'gemelli', 'cancro', 'leone', 'vergine',
    'bilancia', 'scorpione', 'sagittario', 'capricorno', 'acquario', 'pesci',
  ]
  const wrapped = ((longitude % 360) + 360) % 360
  return signs[Math.floor(wrapped / 30)] as string
}

export function useAnalysis(sydera: StoredSydera | null, nowMs: number): Analysis | null {
  return useMemo(() => (sydera ? buildAnalysis(sydera, nowMs) : null), [sydera, nowMs])
}
