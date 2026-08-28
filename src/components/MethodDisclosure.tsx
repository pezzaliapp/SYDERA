import { it } from '../content/it.ts'
import type { NumerologyOptions } from '../core/numerology/types.ts'

/**
 * "Metodo numerologico utilizzato".
 *
 * Makes every convention the engine applied explicit and readable, including
 * the points where numerological schools disagree. The wording states which
 * convention SYDERA uses; it never claims that convention is the correct one.
 */
export function MethodDisclosure({ options }: { readonly options: NumerologyOptions }) {
  const text = it.analysis.methodDisclosure

  const entries: ReadonlyArray<{ term: string; description: string; note?: string }> = [
    {
      term: text.lifePathLabel,
      description: text.lifePath[options.lifePathMethod],
      note: text.lifePathNote,
    },
    { term: text.nameSumLabel, description: text.nameSum[options.nameSumMethod] },
    { term: text.yLabel, description: text.y[options.vowelPolicy] },
    { term: text.wLabel, description: text.w },
    {
      term: text.masterLabel,
      description: options.keepMasterNumbers ? text.masterOn : text.masterOff,
      note: text.masterCyclesNote,
    },
    { term: text.nameToUseLabel, description: text.nameToUse },
    { term: text.normalisationLabel, description: text.normalisation },
    { term: text.personalYearLabel, description: text.personalYear },
  ]

  return (
    <details className="method">
      <summary>{text.title}</summary>
      <div className="stack stack--tight method__body">
        <p className="small muted">{text.intro}</p>
        <dl className="method__list">
          {entries.map((entry) => (
            <div key={entry.term}>
              <dt>{entry.term}</dt>
              <dd>
                {entry.description}
                {entry.note ? <span className="method__note"> {entry.note}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
        <p className="small muted">{text.docsNote}</p>
      </div>
    </details>
  )
}
