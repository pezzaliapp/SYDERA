import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { EntryView } from '../EntryView.tsx'
import { ReturningView } from '../ReturningView.tsx'
import { ResultView } from '../ResultView.tsx'
import { DocumentView } from '../DocumentView.tsx'
import { DataDeletedView } from '../DataDeletedView.tsx'
import { NotFoundView } from '../NotFoundView.tsx'
import { SettingsView } from '../SettingsView.tsx'
import { NumberCard } from '../../components/NumberCard.tsx'
import { MethodDisclosure } from '../../components/MethodDisclosure.tsx'
import { aboutDocument, disclaimerDocument, privacyDocument } from '../../content/it.ts'
import { DEFAULT_PREFERENCES } from '../../core/prefs/preferences.ts'
import { DEFAULT_NUMEROLOGY_OPTIONS } from '../../core/numerology/types.ts'
import { lifePathNumber } from '../../core/numerology/dateNumbers.ts'
import { buildAnalysis } from '../../app/useAnalysis.ts'
import type { StoredSydera } from '../../core/storage/sydera.ts'

/** Synthetic technical record. No real person's birth data. */
const SYDERA: StoredSydera = {
  schemaVersion: 2,
  input: {
    fullBirthName: 'TEST TESTSSON',
    birthDate: { year: 1984, month: 1, day: 19 },
    birthTime: { hour: 7, minute: 30 },
    birthTimePrecisionMinutes: 1,
    place: { label: 'Luogo di prova', latitude: 41.9028, longitude: 12.4964, timeZoneId: 'Europe/Rome' },
    houseSystem: 'whole-sign',
    offsetOverrideMinutes: null,
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const REFERENCE = Date.parse('2026-08-28T00:00:00Z')
const analysis = buildAnalysis(SYDERA, REFERENCE)
const noop = (): void => undefined

describe('entry screen', () => {
  const html = renderToStaticMarkup(
    <EntryView existing={null} acknowledged={false} onAcknowledge={noop} onSaved={noop} currentYear={2026} />,
  )

  it('is the whole application before a calculation exists', () => {
    expect(html).toContain('SYDERA')
    expect(html).toContain('Astrologia · Numerologia')
    expect(html).toContain('CALCOLA SYDERA')
    expect(html).toContain('I tuoi dati restano sul tuo dispositivo.')
  })

  it('asks only for the four inputs the calculations need', () => {
    expect(html).toContain('Data di nascita')
    expect(html).toContain('Ora di nascita')
    expect(html).toContain('Luogo di nascita')
    expect(html).toContain('Nome completo di nascita')
    expect(html).not.toMatch(/e-?mail|telefono|password|account/i)
  })

  it('takes the birth date as three numbers, not a calendar', () => {
    expect(html).toContain('Giorno')
    expect(html).toContain('Mese')
    expect(html).toContain('Anno')
    // A native date control would open on today and force backwards navigation.
    expect(html).not.toContain('type="date"')
  })

  it('takes the birth time as two numbers, not a native picker', () => {
    expect(html).toContain('>Ora<')
    expect(html).toContain('Minuti')
    expect(html).not.toContain('type="time"')
  })

  it('asks every numeric field for a numeric keyboard', () => {
    // Attribute names are matched case-insensitively: the static renderer
    // preserves the React casing, while the DOM attribute is lower case.
    const numericInputs = html.match(/inputmode="numeric"/gi) ?? []
    // day, month, year, hour, minute
    expect(numericInputs).toHaveLength(5)
  })

  it('limits each numeric field to the digits it can hold', () => {
    const inputTag = (id: string): string => html.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`, 'i'))?.[0] ?? ''
    expect(inputTag('birth-day')).toMatch(/maxlength="2"/i)
    expect(inputTag('birth-month')).toMatch(/maxlength="2"/i)
    expect(inputTag('birth-year')).toMatch(/maxlength="4"/i)
    expect(inputTag('birth-hour')).toMatch(/maxlength="2"/i)
    expect(inputTag('birth-minute')).toMatch(/maxlength="2"/i)
  })

  it('states the accepted year range', () => {
    expect(html).toContain('Anni ammessi: dal 1896 al 2026.')
  })

  it('groups the parts of a date under one accessible legend', () => {
    expect(html).toMatch(/<fieldset[^>]*class="field group"/)
    expect(html).toMatch(/<legend[^>]*>Data di nascita<\/legend>/)
    expect(html).toMatch(/<legend[^>]*>Ora di nascita<\/legend>/)
  })

  it('keeps the time precision as a compact select, not stacked buttons', () => {
    expect(html).toContain('<select')
    expect(html).toContain('Precisione dell’ora')
    expect(html).toContain('Al minuto')
  })

  it('marks the name as needed only for numerology', () => {
    expect(html).toContain('Necessario per la numerologia')
  })

  it('offers the unknown birth time option', () => {
    expect(html).toContain('Non conosco l’ora di nascita')
  })

  it('requires the disclaimer acknowledgement, unticked, on first use', () => {
    expect(html).toContain('Ho letto le avvertenze')
    expect(html).not.toContain('checked=""')
  })

  it('shows no profile management of any kind', () => {
    expect(html).not.toMatch(/profil/i)
  })
})

describe('returning screen', () => {
  const html = renderToStaticMarkup(<ReturningView sydera={SYDERA} />)

  it('offers the personal analysis, not a list of records', () => {
    expect(html).toContain('La mia SYDERA')
    expect(html).toContain('APRI LA MIA SYDERA')
    expect(html).toContain('Modifica i dati')
    expect(html).not.toMatch(/profili salvati|crea un profilo/i)
  })
})

describe('result sections', () => {
  it('opens on the summary, not on a data table', () => {
    const html = renderToStaticMarkup(<ResultView section="sintesi" analysis={analysis} sydera={SYDERA} />)
    expect(html).toContain('Sintesi')
    expect(html).toContain('Dall’astrologia')
    expect(html).toContain('Dalla numerologia')
    expect(html).not.toContain('<table')
  })

  it('offers the five sections as the primary navigation', () => {
    const html = renderToStaticMarkup(<ResultView section="sintesi" analysis={analysis} sydera={SYDERA} />)
    for (const label of ['Sintesi', 'Astrologia', 'Numerologia', 'Convergenze', 'Cicli']) {
      expect(html).toContain(label)
    }
  })

  it('shows the astrology section with calculated positions and the UTC used', () => {
    const html = renderToStaticMarkup(<ResultView section="astrologia" analysis={analysis} sydera={SYDERA} />)
    expect(html).toContain('Ascendente')
    expect(html).toContain('Medio Cielo')
    expect(html).toContain('Dati calcolati')
    expect(html).toContain('1984-01-19T06:30:00.000Z')
  })

  it('separates the calculated layer from the symbolic reading', () => {
    const html = renderToStaticMarkup(<ResultView section="astrologia" analysis={analysis} sydera={SYDERA} />)
    expect(html).toContain('Dati calcolati')
    expect(html).toContain('Lettura simbolica')
  })

  it('shows the numerology section with its method disclosure', () => {
    const html = renderToStaticMarkup(<ResultView section="numerologia" analysis={analysis} sydera={SYDERA} />)
    expect(html).toContain('Sentiero di vita')
    expect(html).toContain('Metodo numerologico utilizzato')
  })

  it('shows convergences with the caution about what they are not', () => {
    const html = renderToStaticMarkup(<ResultView section="convergenze" analysis={analysis} sydera={SYDERA} />)
    expect(html).toContain('Convergenze')
    expect(html).toContain('Non è una prova')
  })

  it('shows cycles without predicting events', () => {
    const html = renderToStaticMarkup(<ResultView section="cicli" analysis={analysis} sydera={SYDERA} />)
    expect(html).toContain('Cicli')
    expect(html).toContain('Non indicano eventi certi')
  })

  it('invites the missing name instead of inventing numerology', () => {
    const withoutName: StoredSydera = { ...SYDERA, input: { ...SYDERA.input, fullBirthName: null } }
    const html = renderToStaticMarkup(
      <ResultView section="numerologia" analysis={buildAnalysis(withoutName, REFERENCE)} sydera={withoutName} />,
    )
    expect(html).toContain('Nome completo di nascita non inserito')
    expect(html).toContain('Aggiungi il nome')
  })

  it('declares a partial analysis when the birth time is unknown', () => {
    const withoutTime: StoredSydera = { ...SYDERA, input: { ...SYDERA.input, birthTime: null } }
    const html = renderToStaticMarkup(
      <ResultView section="astrologia" analysis={buildAnalysis(withoutTime, REFERENCE)} sydera={withoutTime} />,
    )
    expect(html).toContain('Analisi parziale')
    expect(html).not.toContain('12:00')
  })
})

describe('documents', () => {
  it('renders privacy, disclaimer and about as separate documents', () => {
    for (const doc of [privacyDocument, disclaimerDocument, aboutDocument]) {
      const html = renderToStaticMarkup(<DocumentView document={doc} />)
      expect(html).toContain(doc.title)
      expect(html.length).toBeGreaterThan(500)
    }
    expect(privacyDocument.title).not.toBe(disclaimerDocument.title)
  })

  it('describes the astrology and location architecture in the privacy notice', () => {
    const html = renderToStaticMarkup(<DocumentView document={privacyDocument} />)
    expect(html).toContain('geocodifica')
    expect(html).toContain('IndexedDB')
    expect(html).toContain('archivio dei luoghi')
  })

  it('states in the disclaimer what SYDERA refuses to calculate', () => {
    const html = renderToStaticMarkup(<DocumentView document={disclaimerDocument} />)
    expect(html).toContain('senza ora di nascita non calcola')
    expect(html).toContain('La precisione del calcolo non è la precisione del dato inserito')
  })

  it('credits the third-party components in the about page', () => {
    const html = renderToStaticMarkup(<DocumentView document={aboutDocument} />)
    expect(html).toContain('GeoNames')
    expect(html).toContain('Astronomy Engine')
    expect(html).toContain('Alessandro Pezzali')
  })
})

describe('settings and deletion', () => {
  const html = renderToStaticMarkup(
    <SettingsView
      preferences={DEFAULT_PREFERENCES}
      onPreferencesChange={noop}
      hasSydera
      houseSystem="whole-sign"
      onHouseSystemChange={noop}
      onDataDeleted={noop}
    />,
  )

  it('keeps the house system choice out of the main flow', () => {
    expect(html).toContain('Sistema di case')
    expect(html).toContain('Segni interi')
    expect(html).toContain('Placidus')
  })

  it('does not claim a house system is superior', () => {
    expect(html).toContain('non sostiene che un sistema sia scientificamente o oggettivamente superiore')
  })

  it('offers the deletion command', () => {
    expect(html).toContain('ELIMINA TUTTI I MIEI DATI')
  })

  it('confirms a completed deletion explicitly', () => {
    const deleted = renderToStaticMarkup(<DataDeletedView onContinue={noop} />)
    expect(deleted).toContain('Dati eliminati')
    expect(deleted).toContain('Continua')
  })
})

describe('components', () => {
  it('renders a number card separating calculation from reading', () => {
    const html = renderToStaticMarkup(
      <NumberCard name="Sentiero di vita" source="Data di nascita" result={lifePathNumber(SYDERA.input.birthDate)} />,
    )
    expect(html).toContain('Sentiero di vita')
    expect(html).toContain('>6<')
  })

  it('renders the numerological method in readable Italian', () => {
    const html = renderToStaticMarkup(<MethodDisclosure options={DEFAULT_NUMEROLOGY_OPTIONS} />)
    expect(html).toContain('Metodo numerologico utilizzato')
    expect(html).toContain('1° gennaio')
    expect(html).not.toMatch(/component|per-word|contextual|digit-sum/)
  })

  it('renders the not found view', () => {
    expect(renderToStaticMarkup(<NotFoundView path="/ignoto" />)).toContain('404')
  })
})
