/**
 * Symbolic reading layer for the Pythagorean numbers.
 *
 * This file contains *interpretation*, not calculation. The wording stays
 * explicitly inside the symbolic tradition: it describes what the tradition
 * associates with a number, never what a person is or what will happen.
 */
export interface NumberTheme {
  readonly keywords: readonly string[]
  readonly reading: string
}

export const numberThemes: Readonly<Record<number, NumberTheme>> = Object.freeze({
  0: {
    keywords: ['assenza di tensione dichiarata'],
    reading:
      'Nella tradizione lo zero, nelle sfide, indica un ambito in cui non viene segnalata una tensione specifica: la lettura resta aperta.',
  },
  1: {
    keywords: ['iniziativa', 'autonomia', 'direzione'],
    reading:
      'Nei sistemi simbolici tradizionali l’uno è associato all’avvio, all’autonomia di giudizio e alla capacità di dare una direzione.',
  },
  2: {
    keywords: ['relazione', 'ascolto', 'mediazione'],
    reading:
      'Il due viene tradizionalmente collegato alla relazione, alla sensibilità nei rapporti e alla ricerca di equilibrio fra posizioni diverse.',
  },
  3: {
    keywords: ['espressione', 'comunicazione', 'creatività'],
    reading:
      'Al tre la tradizione associa l’espressione, la comunicazione e il piacere della forma creativa.',
  },
  4: {
    keywords: ['metodo', 'struttura', 'concretezza'],
    reading:
      'Il quattro è simbolicamente legato al metodo, alla costruzione paziente e all’attenzione per la struttura delle cose.',
  },
  5: {
    keywords: ['movimento', 'varietà', 'adattamento'],
    reading:
      'Il cinque viene tradizionalmente riferito al movimento, al cambiamento e alla capacità di adattarsi a contesti diversi.',
  },
  6: {
    keywords: ['cura', 'responsabilità', 'armonia'],
    reading:
      'Al sei la tradizione collega la cura degli altri, il senso di responsabilità e la ricerca di armonia negli ambienti condivisi.',
  },
  7: {
    keywords: ['analisi', 'introspezione', 'ricerca'],
    reading:
      'Il sette è simbolicamente associato all’analisi, alla riflessione e al bisogno di comprendere prima di aderire.',
  },
  8: {
    keywords: ['organizzazione', 'misura', 'concretezza operativa'],
    reading:
      'All’otto la tradizione riferisce l’organizzazione, la gestione delle risorse e l’attenzione ai risultati concreti.',
  },
  9: {
    keywords: ['sintesi', 'apertura', 'visione ampia'],
    reading:
      'Il nove viene collegato alla sintesi, allo sguardo ampio e all’attenzione per ciò che oltrepassa l’interesse immediato.',
  },
  11: {
    keywords: ['intuizione', 'sensibilità', 'tensione ideale'],
    reading:
      'L’undici è considerato un numero maestro: la tradizione vi legge una sensibilità accentuata e una tensione fra ispirazione e misura.',
  },
  22: {
    keywords: ['progettazione', 'scala', 'realizzazione'],
    reading:
      'Il ventidue è considerato un numero maestro: la tradizione vi legge la capacità di tradurre una visione ampia in una costruzione concreta.',
  },
  33: {
    keywords: ['dedizione', 'trasmissione', 'responsabilità estesa'],
    reading:
      'Il trentatré è considerato un numero maestro: la tradizione vi legge una dedizione rivolta agli altri e un forte tema di trasmissione.',
  },
})

export function themeFor(value: number): NumberTheme | undefined {
  return numberThemes[value]
}
