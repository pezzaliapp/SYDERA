import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { HomeView } from '../HomeView.tsx'
import { NotFoundView } from '../NotFoundView.tsx'
import { DocumentView } from '../DocumentView.tsx'
import { OnboardingView } from '../OnboardingView.tsx'
import { ProfileFormView, parseDateInput, parseTimeInput } from '../ProfileFormView.tsx'
import { SettingsView } from '../SettingsView.tsx'
import { ProfilesView } from '../ProfilesView.tsx'
import { NumberCard } from '../../components/NumberCard.tsx'
import { MethodDisclosure } from '../../components/MethodDisclosure.tsx'
import { DataDeletedView } from '../DataDeletedView.tsx'
import { DEFAULT_NUMEROLOGY_OPTIONS } from '../../core/numerology/types.ts'
import { aboutDocument, disclaimerDocument, privacyDocument } from '../../content/it.ts'
import { DEFAULT_PREFERENCES } from '../../core/prefs/preferences.ts'
import { lifePathNumber } from '../../core/numerology/dateNumbers.ts'
import type { StoredProfile } from '../../core/storage/types.ts'

/** Synthetic technical record, never a real person. */
const PROFILE: StoredProfile = {
  id: 'test-profile',
  schemaVersion: 1,
  label: 'Profilo di prova',
  fullBirthName: 'TEST TESTSSON',
  birthDate: { year: 1984, month: 1, day: 19 },
  birthTimeKnown: false,
  birthTime: null,
  birthPlace: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const noop = (): void => undefined

describe('view rendering', () => {
  it('renders the empty overview without any demo profile', () => {
    const html = renderToStaticMarkup(<HomeView profiles={{ status: 'ready', profiles: [] }} />)
    expect(html).toContain('Nessun profilo presente')
    expect(html).not.toMatch(/demo|esempio precaricato/i)
  })

  it('lists stored profiles', () => {
    const html = renderToStaticMarkup(<ProfilesView profiles={{ status: 'ready', profiles: [PROFILE] }} onChanged={noop} />)
    expect(html).toContain('Profilo di prova')
    expect(html).toContain('19/01/1984')
  })

  it('renders the legal documents', () => {
    for (const doc of [privacyDocument, disclaimerDocument, aboutDocument]) {
      const html = renderToStaticMarkup(<DocumentView document={doc} />)
      expect(html).toContain(doc.title)
      expect(html.length).toBeGreaterThan(500)
    }
  })

  it('keeps privacy and disclaimer as separate documents', () => {
    expect(privacyDocument.title).not.toBe(disclaimerDocument.title)
    expect(renderToStaticMarkup(<DocumentView document={privacyDocument} />)).toContain('IndexedDB')
    expect(renderToStaticMarkup(<DocumentView document={disclaimerDocument} />)).toContain(
      'nei limiti consentiti dalla legge applicabile'.replace('nei', 'Nei'),
    )
  })

  it('renders the onboarding without a pre-ticked acknowledgement', () => {
    const html = renderToStaticMarkup(<OnboardingView onComplete={noop} />)
    expect(html).toContain('SYDERA')
    expect(html).not.toContain('checked=""')
  })

  it('renders the profile form with only the necessary fields', () => {
    const html = renderToStaticMarkup(<ProfileFormView onCreated={noop} />)
    expect(html).toContain('Nome completo di nascita')
    expect(html).toContain('Data di nascita')
    expect(html).not.toMatch(/e-?mail|telefono|password/i)
  })

  it('renders settings with the deletion command', () => {
    const html = renderToStaticMarkup(
      <SettingsView
        preferences={DEFAULT_PREFERENCES}
        onPreferencesChange={noop}
        profiles={{ status: 'ready', profiles: [PROFILE] }}
        onDataDeleted={noop}
      />,
    )
    expect(html).toContain('ELIMINA TUTTI I MIEI DATI')
  })

  it('renders a number card separating calculation from reading', () => {
    const html = renderToStaticMarkup(
      <NumberCard name="Sentiero di vita" source="Data di nascita" result={lifePathNumber(PROFILE.birthDate)} />,
    )
    expect(html).toContain('Sentiero di vita')
    expect(html).toContain('>6<')
  })

  it('renders the post-deletion confirmation with an explicit continue action', () => {
    const html = renderToStaticMarkup(<DataDeletedView onContinue={noop} />)
    expect(html).toContain('Dati eliminati')
    expect(html).toContain('Continua')
    expect(html).toContain('Che cosa è stato eliminato')
    expect(html).toContain('Che cosa non è stato toccato')
  })

  it('renders the not found view', () => {
    expect(renderToStaticMarkup(<NotFoundView path="/ignoto" />)).toContain('404')
  })
})

describe('numerological method disclosure', () => {
  const html = renderToStaticMarkup(<MethodDisclosure options={DEFAULT_NUMEROLOGY_OPTIONS} />)

  it('replaces the raw technical tokens with readable Italian', () => {
    expect(html).toContain('Metodo numerologico utilizzato')
    expect(html).not.toMatch(/component|per-word|contextual|digit-sum|y-as-/)
  })

  it('discloses every convention the audit asked for', () => {
    for (const label of [
      'Sentiero di vita',
      'Somma del nome',
      'Regola della lettera Y',
      'Trattamento della W',
      'Numeri maestri',
      'Quale nome inserire',
      'Anno personale',
    ]) {
      expect(html, `missing disclosure: ${label}`).toContain(label)
    }
  })

  it('states the 1 January Personal Year convention and the birthday alternative', () => {
    expect(html).toContain('1° gennaio')
    expect(html).toContain('compleanno')
  })

  it('says schools differ without claiming one is correct', () => {
    expect(html).toContain('Scuole numerologiche diverse adottano convenzioni diverse')
    expect(html).toContain('nessuna di queste è scientificamente o oggettivamente più corretta')
    expect(html).not.toMatch(/metodo corretto|convenzione corretta|scientificamente provat/i)
  })

  it('reflects the options actually used', () => {
    const alternative = renderToStaticMarkup(
      <MethodDisclosure
        options={{ ...DEFAULT_NUMEROLOGY_OPTIONS, lifePathMethod: 'digit-sum', keepMasterNumbers: false }}
      />,
    )
    expect(alternative).toContain('Tutte le cifre della data di nascita vengono sommate in un unico passaggio')
    expect(alternative).toContain('I numeri maestri non vengono conservati')
    expect(html).toContain('Mese, giorno e anno vengono ridotti separatamente')
  })
})

describe('form input parsing', () => {
  it('parses date inputs', () => {
    expect(parseDateInput('1984-01-19')).toEqual({ year: 1984, month: 1, day: 19 })
    expect(parseDateInput('')).toBeNull()
    expect(parseDateInput('19/01/1984')).toBeNull()
  })

  it('parses time inputs and rejects impossible values', () => {
    expect(parseTimeInput('07:05')).toEqual({ hour: 7, minute: 5 })
    expect(parseTimeInput('24:00')).toBeNull()
    expect(parseTimeInput('12:61')).toBeNull()
    expect(parseTimeInput('7:5')).toBeNull()
  })
})
