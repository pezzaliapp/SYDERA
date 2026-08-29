import { useEffect, useRef } from 'react'
import { it } from '../content/it.ts'
import { RESULT_SECTIONS, paths, type ResultSection } from '../app/router.ts'
import { SintesiSection } from './sections/SintesiSection.tsx'
import { AstrologiaSection } from './sections/AstrologiaSection.tsx'
import { NumerologiaSection } from './sections/NumerologiaSection.tsx'
import { ConvergenzeSection } from './sections/ConvergenzeSection.tsx'
import { CicliSection } from './sections/CicliSection.tsx'
import type { Analysis } from '../app/useAnalysis.ts'
import type { StoredSydera } from '../core/storage/sydera.ts'

interface ResultViewProps {
  readonly section: ResultSection
  readonly analysis: Analysis
  readonly sydera: StoredSydera
}

/** One coherent SYDERA, presented in five sections. */
export function ResultView({ section, analysis, sydera }: ResultViewProps) {
  const hasName = (sydera.input.fullBirthName ?? '').trim() !== ''
  const tabs = useRef<HTMLElement>(null)

  // The five names do not fit a phone, so the bar scrolls. Two things make
  // that acceptable: the tab you are on is brought fully into view rather
  // than left half cut off, and the edge is faded only while there is more
  // to reach, so it is visible that the row continues.
  useEffect(() => {
    const bar = tabs.current
    if (!bar) return

    bar.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({
      inline: 'center',
      block: 'nearest',
    })

    const mark = (): void => {
      const more = bar.scrollWidth - bar.clientWidth
      const atStart = bar.scrollLeft <= 1
      const atEnd = bar.scrollLeft >= more - 1
      bar.dataset['edge'] = more <= 1 ? 'none' : atStart ? 'end' : atEnd ? 'start' : 'both'
    }

    mark()
    bar.addEventListener('scroll', mark, { passive: true })
    window.addEventListener('resize', mark)
    return () => {
      bar.removeEventListener('scroll', mark)
      window.removeEventListener('resize', mark)
    }
  }, [section])

  return (
    <>
      <nav className="sections" aria-label={it.nav.label} ref={tabs}>
        <ul className="sections__list">
          {RESULT_SECTIONS.map((entry) => (
            <li key={entry}>
              <a
                className="sections__link"
                href={paths.section(entry)}
                {...(entry === section ? { 'aria-current': 'page' as const } : {})}
              >
                {it.sections[entry]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {section === 'sintesi' ? <SintesiSection analysis={analysis} /> : null}
      {section === 'astrologia' ? <AstrologiaSection chart={analysis.chart} /> : null}
      {section === 'numerologia' ? (
        <NumerologiaSection
          numerology={analysis.numerology}
          issues={analysis.numerologyIssues}
          warnings={analysis.numerologyWarnings}
          hasName={hasName}
        />
      ) : null}
      {section === 'convergenze' ? <ConvergenzeSection convergence={analysis.convergence} /> : null}
      {section === 'cicli' ? (
        <CicliSection
          transits={analysis.transits}
          numerology={analysis.numerology}
          hasCompleteChart={analysis.chart?.kind === 'complete'}
          referenceDate={analysis.referenceDate}
        />
      ) : null}
    </>
  )
}
