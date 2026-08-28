/**
 * Symbolic reading layer for the astrological factors.
 *
 * Interpretation, not calculation. Every line describes what the tradition
 * associates with a factor; nothing here states what a person is, and nothing
 * predicts an event. The calculation layer never imports this file.
 */
import type { AspectId, BodyId, ZodiacSign } from '../core/astrology/types.ts'

export interface SymbolReading {
  readonly label: string
  readonly keywords: readonly string[]
  readonly reading: string
}

export const bodyReadings: Readonly<Record<BodyId, SymbolReading>> = Object.freeze({
  sun: {
    label: 'Sole',
    keywords: ['identità', 'direzione', 'volontà'],
    reading: 'Nella tradizione il Sole indica il centro di identità e la direzione che una persona riconosce come propria.',
  },
  moon: {
    label: 'Luna',
    keywords: ['sensibilità', 'abitudini', 'bisogni'],
    reading: 'La Luna è associata alla vita affettiva, alle abitudini e a ciò che dà senso di sicurezza.',
  },
  mercury: {
    label: 'Mercurio',
    keywords: ['comunicazione', 'analisi', 'apprendimento'],
    reading: 'Mercurio viene riferito al modo di pensare, comunicare e mettere in relazione le informazioni.',
  },
  venus: {
    label: 'Venere',
    keywords: ['relazione', 'gusto', 'valore'],
    reading: 'A Venere la tradizione associa il senso estetico, il piacere della relazione e ciò a cui si attribuisce valore.',
  },
  mars: {
    label: 'Marte',
    keywords: ['iniziativa', 'energia', 'affermazione'],
    reading: 'Marte è collegato all’iniziativa, all’energia messa in campo e al modo di affermare le proprie intenzioni.',
  },
  jupiter: {
    label: 'Giove',
    keywords: ['espansione', 'fiducia', 'senso'],
    reading: 'Giove viene riferito all’apertura, alla ricerca di senso e alla misura con cui si allarga il proprio campo.',
  },
  saturn: {
    label: 'Saturno',
    keywords: ['struttura', 'limite', 'responsabilità'],
    reading: 'Saturno è associato alla struttura, al limite riconosciuto e alla responsabilità che si accetta di portare.',
  },
  uranus: {
    label: 'Urano',
    keywords: ['cambiamento', 'indipendenza', 'innovazione'],
    reading: 'Urano viene collegato al bisogno di autonomia e alle rotture che aprono direzioni nuove.',
  },
  neptune: {
    label: 'Nettuno',
    keywords: ['immaginazione', 'sensibilità diffusa', 'ideale'],
    reading: 'Nettuno è riferito all’immaginazione, alla sensibilità meno definita e all’attrazione per ciò che non ha confini netti.',
  },
  pluto: {
    label: 'Plutone',
    keywords: ['profondità', 'trasformazione', 'intensità'],
    reading: 'Plutone viene associato ai processi di trasformazione profonda e a ciò che si rinnova passando attraverso una crisi.',
  },
})

export const signReadings: Readonly<Record<ZodiacSign, SymbolReading>> = Object.freeze({
  ariete: { label: 'Ariete', keywords: ['iniziativa', 'slancio'], reading: 'Segno di fuoco cardinale: la tradizione vi legge avvio e slancio diretto.' },
  toro: { label: 'Toro', keywords: ['stabilità', 'concretezza'], reading: 'Segno di terra fisso: viene associato a costanza, concretezza e senso della durata.' },
  gemelli: { label: 'Gemelli', keywords: ['comunicazione', 'curiosità'], reading: 'Segno d’aria mobile: collegato allo scambio, alla curiosità e alla varietà.' },
  cancro: { label: 'Cancro', keywords: ['protezione', 'memoria'], reading: 'Segno d’acqua cardinale: riferito alla cura, alla memoria e al legame affettivo.' },
  leone: { label: 'Leone', keywords: ['espressione', 'centro'], reading: 'Segno di fuoco fisso: associato all’espressione personale e alla presenza riconoscibile.' },
  vergine: { label: 'Vergine', keywords: ['analisi', 'misura'], reading: 'Segno di terra mobile: collegato all’analisi, alla misura e al lavoro ben fatto.' },
  bilancia: { label: 'Bilancia', keywords: ['relazione', 'equilibrio'], reading: 'Segno d’aria cardinale: riferito alla relazione e alla ricerca di equilibrio.' },
  scorpione: { label: 'Scorpione', keywords: ['profondità', 'intensità'], reading: 'Segno d’acqua fisso: associato alla profondità e a ciò che non resta in superficie.' },
  sagittario: { label: 'Sagittario', keywords: ['ricerca', 'apertura'], reading: 'Segno di fuoco mobile: collegato alla ricerca di senso e all’apertura di orizzonte.' },
  capricorno: { label: 'Capricorno', keywords: ['struttura', 'obiettivo'], reading: 'Segno di terra cardinale: riferito alla costruzione paziente e all’obiettivo di lungo periodo.' },
  acquario: { label: 'Acquario', keywords: ['autonomia', 'innovazione'], reading: 'Segno d’aria fisso: associato all’autonomia di giudizio e alla prospettiva non convenzionale.' },
  pesci: { label: 'Pesci', keywords: ['sensibilità', 'sintesi'], reading: 'Segno d’acqua mobile: collegato alla sensibilità diffusa e alla capacità di sintesi non lineare.' },
})

export const houseReadings: Readonly<Record<number, SymbolReading>> = Object.freeze({
  1: { label: 'Prima casa', keywords: ['presentazione'], reading: 'Ambito tradizionalmente riferito al modo di presentarsi e di avviare le cose.' },
  2: { label: 'Seconda casa', keywords: ['risorse'], reading: 'Ambito delle risorse proprie e di ciò a cui si dà valore concreto.' },
  3: { label: 'Terza casa', keywords: ['scambio'], reading: 'Ambito della comunicazione quotidiana e degli spostamenti brevi.' },
  4: { label: 'Quarta casa', keywords: ['radici'], reading: 'Ambito delle radici, della casa e della provenienza.' },
  5: { label: 'Quinta casa', keywords: ['espressione'], reading: 'Ambito dell’espressione personale, del gioco e della creatività.' },
  6: { label: 'Sesta casa', keywords: ['lavoro quotidiano'], reading: 'Ambito del lavoro quotidiano, dei metodi e della cura di sé.' },
  7: { label: 'Settima casa', keywords: ['relazione'], reading: 'Ambito delle relazioni significative e degli accordi con altri.' },
  8: { label: 'Ottava casa', keywords: ['trasformazione'], reading: 'Ambito dei processi profondi e di ciò che si condivide in modo vincolante.' },
  9: { label: 'Nona casa', keywords: ['orizzonte'], reading: 'Ambito della ricerca, degli studi e dell’allargamento di orizzonte.' },
  10: { label: 'Decima casa', keywords: ['ruolo pubblico'], reading: 'Ambito del ruolo riconosciuto e della direzione pubblica.' },
  11: { label: 'Undicesima casa', keywords: ['progetti condivisi'], reading: 'Ambito dei gruppi, delle amicizie e dei progetti condivisi.' },
  12: { label: 'Dodicesima casa', keywords: ['interiorità'], reading: 'Ambito della vita interiore e di ciò che resta meno esposto.' },
})

export const aspectReadings: Readonly<Record<AspectId, SymbolReading>> = Object.freeze({
  congiunzione: {
    label: 'Congiunzione',
    keywords: ['fusione'],
    reading: 'I due elementi vengono letti come uniti: agiscono insieme, nel bene e nella difficoltà.',
  },
  sestile: {
    label: 'Sestile',
    keywords: ['opportunità'],
    reading: 'Relazione tradizionalmente considerata collaborativa, che richiede però di essere attivata.',
  },
  quadrato: {
    label: 'Quadrato',
    keywords: ['tensione'],
    reading: 'Relazione di tensione: la tradizione vi legge un attrito che spinge a un adattamento.',
  },
  trigono: {
    label: 'Trigono',
    keywords: ['fluidità'],
    reading: 'Relazione considerata fluida, dove i due elementi si sostengono con facilità.',
  },
  opposizione: {
    label: 'Opposizione',
    keywords: ['polarità'],
    reading: 'Relazione di polarità: due esigenze che si fronteggiano e chiedono un equilibrio.',
  },
})

export const angleReadings = Object.freeze({
  ascendant: {
    label: 'Ascendente',
    keywords: ['soglia', 'presentazione'],
    reading: 'Grado che sorgeva a est nel momento indicato: la tradizione lo riferisce al modo di affacciarsi al mondo.',
  },
  midheaven: {
    label: 'Medio Cielo',
    keywords: ['direzione', 'ruolo'],
    reading: 'Grado culminante sul meridiano locale: riferito alla direzione pubblica e al ruolo riconosciuto.',
  },
})
