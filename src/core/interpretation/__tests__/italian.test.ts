import { describe, expect, it } from 'vitest'
import { aspectLabel, aspectName, attach, contract, joinWithAnd, pointLabel, stableIndex, tidy, toPoint } from '../italian.ts'

/**
 * Grammar of the generated Italian. These are the mistakes composition makes
 * on its own, so each one is pinned down here.
 */
describe('prepositions before a point', () => {
  it('uses no article before a planet, which is a proper noun', () => {
    expect(toPoint('uranus')).toBe('a Urano')
    expect(toPoint('venus')).toBe('a Venere')
    expect(toPoint('sun')).toBe('a Sole')
    expect(toPoint('neptune')).toBe('a Nettuno')
  })

  it('uses the article before the calculated points, which are common nouns', () => {
    expect(toPoint('ascendant')).toBe('all’Ascendente')
    expect(toPoint('midheaven')).toBe('al Medio Cielo')
  })

  it('never produces the reported defects', () => {
    for (const point of ['sun', 'moon', 'uranus', 'venus', 'ascendant', 'midheaven'] as const) {
      const rendered = toPoint(point)
      expect(rendered, `"${rendered}" repeats a known defect`).not.toMatch(/all’Urano|a Ascendente|a Medio Cielo/)
    }
  })
})

describe('gender agreement', () => {
  it('agrees the participle with a feminine subject', () => {
    expect(aspectName('congiunzione', 'moon')).toBe('congiunta')
    expect(aspectName('congiunzione', 'venus')).toBe('congiunta')
  })

  it('agrees it with a masculine subject', () => {
    expect(aspectName('congiunzione', 'sun')).toBe('congiunto')
    expect(aspectName('congiunzione', 'mars')).toBe('congiunto')
    expect(aspectName('congiunzione', 'ascendant')).toBe('congiunto')
  })

  it('leaves the invariable aspect names alone', () => {
    expect(aspectName('quadrato', 'moon')).toBe('in quadrato')
    expect(aspectName('opposizione', 'venus')).toBe('in opposizione')
    expect(aspectName('trigono', 'sun')).toBe('in trigono')
    expect(aspectName('sestile', 'moon')).toBe('in sestile')
  })

  it('never omits the preposition, as the transit line once did', () => {
    for (const aspect of ['sestile', 'quadrato', 'trigono', 'opposizione'] as const) {
      expect(aspectName(aspect, 'neptune')).toMatch(/^in /)
    }
  })
})

describe('complete aspect labels', () => {
  it('renders the four reported defects correctly', () => {
    expect(aspectLabel('sun', 'opposizione', 'uranus')).toBe('Sole in opposizione a Urano')
    expect(aspectLabel('moon', 'congiunzione', 'uranus')).toBe('Luna congiunta a Urano')
    expect(aspectLabel('mercury', 'quadrato', 'midheaven')).toBe('Mercurio in quadrato al Medio Cielo')
    expect(aspectLabel('neptune', 'opposizione', 'mars')).toBe('Nettuno in opposizione a Marte')
  })

  it('produces grammatical output for every pair and aspect', () => {
    const points = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'ascendant', 'midheaven'] as const
    const aspects = ['congiunzione', 'sestile', 'quadrato', 'trigono', 'opposizione'] as const
    for (const a of points) {
      for (const b of points) {
        if (a === b) continue
        for (const aspect of aspects) {
          const label = aspectLabel(a, aspect, b)
          expect(label, label).not.toMatch(/\ba (Ascendente|Medio Cielo)\b/)
          expect(label, label).not.toMatch(/all’(Urano|Ariete)/)
          expect(label, label).not.toMatch(/\s{2,}|undefined/)
          expect(label, label).toMatch(/^[A-Z]/)
        }
      }
    }
  })
})

describe('lists and punctuation', () => {
  it('uses the euphonic conjunction before a vowel', () => {
    expect(joinWithAnd(['Sole', 'Espressione'])).toBe('Sole ed Espressione')
    expect(joinWithAnd(['Sole', 'Luna'])).toBe('Sole e Luna')
    expect(joinWithAnd(['Sole'])).toBe('Sole')
    expect(joinWithAnd([])).toBe('')
  })

  it('removes the artefacts composition leaves behind', () => {
    expect(tidy('Una frase ,con spazio')).toBe('Una frase,con spazio')
    expect(tidy('Doppio punto..')).toBe('Doppio punto.')
    expect(tidy('Due  spazi')).toBe('Due spazi')
    expect(tidy('Doppio: : due punti')).toBe('Doppio: due punti')
    expect(tidy('Virgole,, doppie')).toBe('Virgole, doppie')
  })
})

describe('deterministic variant selection', () => {
  it('returns the same index for the same key', () => {
    expect(stableIndex('moon|sun:quadrato', 4)).toBe(stableIndex('moon|sun:quadrato', 4))
  })

  it('stays inside the range', () => {
    for (const key of ['a', 'sun|moon', 'venus|uranus:opposizione', '']) {
      const index = stableIndex(key, 3)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(3)
    }
  })

  it('spreads different keys across the variants', () => {
    const keys = ['sun|moon', 'mars|venus', 'mercury|saturn', 'moon|neptune', 'sun|uranus', 'mars|saturn']
    expect(new Set(keys.map((key) => stableIndex(key, 3))).size).toBeGreaterThan(1)
  })
})

describe('point labels', () => {
  it('names every point', () => {
    expect(pointLabel('sun')).toBe('Sole')
    expect(pointLabel('midheaven')).toBe('Medio Cielo')
    expect(pointLabel('ascendant')).toBe('Ascendente')
  })
})

describe('prepositions contract with the article that follows', () => {
  it('joins "a" with every form of the definite article', () => {
    expect(contract('a', 'il senso del limite')).toBe('al senso del limite')
    expect(contract('a', 'la vita emotiva')).toBe('alla vita emotiva')
    expect(contract('a', 'lo slancio')).toBe('allo slancio')
    expect(contract('a', 'gli altri')).toBe('agli altri')
  })

  it('handles the elided article, which carries no space', () => {
    expect(contract('a', 'l’espressione')).toBe('all’espressione')
    expect(contract('in', 'l’azione')).toBe('nell’azione')
  })

  it('leaves a phrase without an article alone', () => {
    expect(contract('a', 'Saturno')).toBe('a Saturno')
    expect(contract('in', 'Cancro')).toBe('in Cancro')
  })

  it('never produces the uncontracted form', () => {
    for (const article of ['il', 'lo', 'la', 'i', 'gli', 'le']) {
      expect(contract('a', `${article} cosa`)).not.toMatch(/^a /)
      expect(contract('in', `${article} cosa`)).not.toMatch(/^in /)
    }
  })
})

describe('a consequence attaches without stacking colons', () => {
  it('uses a colon when the consequence has none of its own', () => {
    expect(attach('due cose si ostacolano', 'l’umore ne risente')).toBe('due cose si ostacolano: l’umore ne risente')
  })

  it('starts a new sentence when the consequence already has a colon', () => {
    const joined = attach('non c’è attrito', 'il passaggio è disponibile: va usato')
    expect(joined).toBe('non c’è attrito. Il passaggio è disponibile: va usato')
    expect(joined.match(/:/g) ?? []).toHaveLength(1)
  })

  it('returns the lead unchanged when there is nothing to attach', () => {
    expect(attach('una frase', '')).toBe('una frase')
  })
})
