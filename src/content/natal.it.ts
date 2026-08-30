/**
 * The natal chart, said in ordinary Italian.
 *
 * The Astrologia tab held only calculated values and dictionary definitions —
 * "Sole: identità. Vergine: precisione. Casa 6: lavoro quotidiano." — three
 * entries a reader had to join for themselves, which is why the honest
 * reaction to the page was "e quindi?".
 *
 * What is written here is compositional rather than a table of prewritten
 * paragraphs: a body says which function is involved, a sign says in what
 * manner, a house says where it shows. Twenty-one short pieces cover every
 * placement a chart can produce, and read better than a thousand variants
 * would. Nothing here calculates anything.
 */
import type { AspectId, BodyId, ZodiacSign } from '../core/astrology/types.ts'

export type NatalPoint = BodyId | 'ascendant' | 'midheaven'

/**
 * The manner a sign lends to whatever it touches, as a noun phrase, so each
 * frame below can take it without bending the grammar.
 */
export const signManner: Readonly<Record<ZodiacSign, string>> = Object.freeze({
  ariete: 'parti per primo e decidi mentre gli altri stanno ancora valutando',
  toro: 'vai con calma e ti fidi di quello che ha già dimostrato di funzionare',
  gemelli: 'colleghi cose diverse e le metti subito in parole',
  cancro: 'ti leghi a quello che senti tuo e ti ricordi bene come sono andate le cose',
  leone: 'ci metti qualcosa di riconoscibile, e passare inosservato ti pesa',
  vergine: 'noti in fretta quello che non torna e vuoi renderlo utilizzabile',
  bilancia: 'guardi come sta l’altro prima di prendere posizione',
  scorpione: 'vai a fondo, anche quando fermarti prima sarebbe più comodo',
  sagittario: 'cerchi un senso più largo di quello immediato e mal sopporti lo spazio stretto',
  capricorno: 'costruisci piano e accetti che le cose costino tempo',
  acquario: 'fai a modo tuo, anche quando è la strada meno battuta',
  pesci: 'aspetti di sentire come stanno le cose prima di decidere con la testa',
})

export interface PointFrame {
  readonly frame: (manner: string) => string
}

export const pointFrame: Readonly<Record<NatalPoint, PointFrame>> = Object.freeze({
  ascendant: { frame: (m) => `Chi ti incontra si accorge subito che ${m}.` },
  sun: { frame: (m) => `Ti senti nel tuo quando ${m}.` },
  moon: { frame: (m) => `Quando qualcosa ti tocca da vicino, ${m}.` },
  mercury: { frame: (m) => `Nel modo di ragionare e di comunicare, ${m}.` },
  venus: { frame: (m) => `In quello che ti attrae e nei legami che scegli, ${m}.` },
  mars: { frame: (m) => `Quando c’è da agire, ${m}.` },
  jupiter: { frame: (m) => `Ti apri e prendi fiducia quando ${m}.` },
  saturn: { frame: (m) => `Con te stesso sei più esigente che con gli altri: ${m}.` },
  midheaven: { frame: (m) => `Nel lavoro e in quello di cui ti prendi la responsabilità, ${m}.` },
  uranus: { frame: (m) => `Quando rompi con il consueto, ${m}.` },
  neptune: { frame: (m) => `In quello che immagini e desideri senza dirlo, ${m}.` },
  pluto: { frame: (m) => `Quando qualcosa cambia in profondità, ${m}.` },
})

/**
 * Said instead of repeating a manner already used.
 *
 * Two points in the same sign carry the same quality, and printing the same
 * clause twice on one page reads like a fault rather than like a chart that
 * concentrates. The second occurrence names the function and points back.
 */
export const sameSignNote: Readonly<Partial<Record<NatalPoint, string>>> = Object.freeze({
  midheaven:
    'Il ruolo che cerchi fuori e quello in cui ti riconosci puntano nella stessa direzione: quello che sei e quello per cui vieni riconosciuto si somigliano.',
})

export const echoFrame: Readonly<Record<NatalPoint, string>> = Object.freeze({
  ascendant: 'È anche la prima cosa che gli altri notano di te',
  sun: 'Lo stesso vale per quello in cui ti riconosci',
  moon: 'Lo stesso vale per come reagisci quando qualcosa ti tocca da vicino',
  mercury: 'Lo stesso vale per il modo di ragionare e di comunicare',
  venus: 'Lo stesso vale in quello che ti attrae e nei legami che scegli',
  mars: 'Lo stesso vale quando c’è da agire',
  jupiter: 'Lo stesso vale per quello che ti fa prendere fiducia',
  saturn: 'Anche con te stesso sei esigente nello stesso modo',
  midheaven: 'Lo stesso modo di fare lo porti nel lavoro e nelle responsabilità',
  uranus: 'Lo stesso vale quando rompi con il consueto',
  neptune: 'Lo stesso vale per quello che immagini senza dirlo',
  pluto: 'Lo stesso vale quando qualcosa cambia in profondità',
})

/** Where a placement shows itself, appended to the statement above. */
export const houseArea: Readonly<Record<number, string>> = Object.freeze({
  1: 'nel modo in cui ti presenti e cominci le cose',
  2: 'in quello che possiedi e a cui dai valore concreto',
  3: 'negli scambi di ogni giorno e nelle cose vicine',
  4: 'nella casa, nelle radici e in ciò che senti tuo',
  5: 'in quello che crei, nel gioco e in ciò che ti espone',
  6: 'nel lavoro di ogni giorno, nei metodi e nella cura di te',
  7: 'nei rapporti stretti e negli accordi con gli altri',
  8: 'in quello che condividi davvero e in ciò che cambia in profondità',
  9: 'in quello che studi, nei viaggi e in ciò che allarga lo sguardo',
  10: 'nel ruolo pubblico e in quello per cui vieni riconosciuto',
  11: 'nei gruppi, nelle amicizie e in ciò che progetti per il futuro',
  12: 'in una zona più riservata, che gli altri vedono poco',
})

/** Said once, when a personal planet is retrograde. */
export const retrogradeNote: Readonly<Partial<Record<BodyId, string>>> = Object.freeze({
  mercury: 'Rivedi le cose più di una volta prima di dirle: ti convinci per conto tuo, non perché qualcuno ti ha convinto.',
  venus: 'Quello che ti attrae lo riconosci lentamente, quasi mai al primo colpo, e cambi idea meno spesso di quanto sembri.',
  mars: 'Prima di muoverti passi da una decisione tutta interna: da fuori sembra che tu stia fermo quando invece hai già scelto.',
  jupiter: 'La fiducia te la costruisci da solo: gli incoraggiamenti che arrivano da fuori ti smuovono poco.',
  saturn: 'Puoi essere più severo con te stesso di quanto gli altri immaginino: molte delle regole che senti di dover rispettare te le sei date tu.',
})

/**
 * What a relationship between two points does, in ordinary language.
 *
 * Only the pairs the tradition reads as personally meaningful are written, and
 * only two families each: a flowing one and a tense one. Anything not written
 * here is not narrated — every calculated aspect stays in the table, but the
 * page never invents a sentence to have something to say.
 */
export type AspectFamily = 'armonico' | 'teso' | 'congiunzione'

export const aspectFamilyOf: Readonly<Record<AspectId, AspectFamily>> = Object.freeze({
  congiunzione: 'congiunzione',
  sestile: 'armonico',
  trigono: 'armonico',
  quadrato: 'teso',
  opposizione: 'teso',
})

export const aspectDynamics: Readonly<Record<string, Readonly<Partial<Record<AspectFamily, string>>>>> = Object.freeze({
  'moon|sun': {
    congiunzione: 'Quello che vuoi e quello di cui hai bisogno tendono a coincidere: ti muovi compatto, ma con poco margine quando le due cose dovessero divergere.',
    armonico: 'Quello che vuoi e quello di cui hai bisogno vanno d’accordo: le decisioni importanti raramente ti lasciano rimpianti.',
    teso: 'Quello che vorresti fare e quello che ti fa stare bene non chiedono sempre la stessa cosa: parte dell’energia se ne va nel tenerle insieme.',
  },
  'ascendant|sun': {
    congiunzione: 'Ti presenti più o meno per come sei: c’è poca distanza fra l’impressione che dai e quello in cui ti riconosci.',
    armonico: 'Il modo in cui ti presenti e quello che sei si sostengono: gli altri ti leggono abbastanza bene al primo incontro.',
    teso: 'L’impressione che dai e quello che sei dentro non coincidono del tutto: chi ti conosce poco può farsi un’idea che poi va corretta.',
  },
  'ascendant|moon': {
    congiunzione: 'Quello che senti si vede subito: fai poca fatica a nasconderlo, anche quando preferiresti.',
    armonico: 'Quello che senti passa facilmente nel modo in cui ti presenti: risulti leggibile senza doverti spiegare.',
    teso: 'Quello che senti e quello che mostri prendono strade diverse: puoi sembrare più distaccato di quanto tu sia.',
  },
  'saturn|sun': {
    congiunzione: 'Ti riconosci in quello che ti sei meritato: quello che arriva senza una prova ti convince poco, e con te stesso sei severo più che con chiunque altro.',
    armonico: 'La tua ambizione trova una struttura che la regge: i risultati arrivano più tardi della media e restano più a lungo.',
    teso: 'Ogni passo avanti ti costa una verifica: la fiducia in te te la costruisci, non ti è data in partenza.',
  },
  'sun|uranus': {
    congiunzione: 'Ti riconosci nella differenza: adeguarti allo standard ti costa più che distinguertene.',
    armonico: 'Sai andare per la tua strada senza doverlo dichiarare: l’originalità ti riesce naturale.',
    teso: 'Il bisogno di essere te stesso e quello di stare nelle regole si scontrano: le situazioni troppo definite ti diventano strette in fretta.',
  },
  'moon|saturn': {
    congiunzione: 'I bisogni affettivi passano da un filtro di controllo: chiedi tardi, e spesso meno di quello che ti servirebbe.',
    armonico: 'Le tue abitudini reggono anche nei periodi difficili: è una calma che si vede poco e vale molto.',
    teso: 'Chiedere quello di cui hai bisogno non ti viene facile: preferisci cavartela, anche quando non sarebbe necessario.',
  },
  'moon|neptune': {
    congiunzione: 'Assorbi l’umore di chi ti sta intorno quasi senza accorgertene: distinguere quello che senti tu da quello che hai raccolto richiede attenzione.',
    armonico: 'La tua sensibilità e la tua immaginazione lavorano insieme: capisci le persone da segnali che nessuno ti ha dato.',
    teso: 'L’umore risente molto di quello che arriva da fuori: quando l’ambiente è confuso, lo diventi anche tu.',
  },
  'mercury|uranus': {
    congiunzione: 'Il pensiero procede per collegamenti rapidi: a volte arrivi alla conclusione prima di avere pronti i passaggi per spiegarla.',
    armonico: 'Trovi in fretta soluzioni che ad altri non vengono: la testa lavora bene fuori dai binari.',
    teso: 'Le idee ti arrivano di scatto e non sempre in ordine: chiarissime a te, non subito trasferibili agli altri.',
  },
  'mercury|saturn': {
    congiunzione: 'Pensi lentamente e in modo solido: dici poco e quello che dici l’hai verificato.',
    armonico: 'Il tuo ragionamento è ordinato: quello che concludi tende a reggere anche a distanza di tempo.',
    teso: 'Ti fidi poco di quello che pensi finché non l’hai controllato: la prudenza ti protegge e a volte ti rallenta.',
  },
  'mercury|jupiter': {
    congiunzione: 'Pensiero e voglia di allargare vanno insieme: vedi il quadro generale in fretta, il dettaglio ti interessa meno.',
    armonico: 'Spieghi bene e vedi lontano: sai dare un senso più largo a quello che racconti.',
    teso: 'Tendi a dire più di quanto serva: il concetto è giusto, la misura è il punto delicato.',
  },
  'mars|venus': {
    congiunzione: 'Desiderio e iniziativa coincidono: vai verso quello che ti attrae senza troppi passaggi intermedi.',
    armonico: 'Quello che vuoi e quello che ti piace si sostengono: nei rapporti sei diretto senza essere ruvido.',
    teso: 'Quello che desideri e come lo cerchi non sempre vanno d’accordo: puoi ottenere e poi accorgerti che non era quello.',
  },
  'saturn|venus': {
    congiunzione: 'Nei legami sei selettivo e leale: ci metti tempo a concedere fiducia e poi la mantieni.',
    armonico: 'I tuoi affetti hanno continuità: poche persone, tenute nel tempo.',
    teso: 'Nei legami temi più di quanto mostri: la distanza che tieni è spesso una precauzione, non una preferenza.',
  },
  'mars|saturn': {
    congiunzione: 'Agisci con freno e metodo: parti tardi e arrivi in fondo.',
    armonico: 'La tua energia è disciplinata: reggi sforzi lunghi meglio degli scatti.',
    teso: 'Fra la spinta ad agire e il senso del limite c’è attrito: l’energia parte, si blocca, e riparte più decisa.',
  },
  'mars|uranus': {
    congiunzione: 'L’iniziativa arriva di colpo: quando decidi, decidi in un attimo, e non sempre avvisi.',
    armonico: 'Reagisci in fretta e bene all’imprevisto: l’urgenza ti trova pronto.',
    teso: 'L’impazienza è il tuo punto delicato: quando qualcosa ti trattiene, la spinta esce tutta insieme.',
  },
  'neptune|venus': {
    congiunzione: 'Quello che ti attrae ha qualcosa di idealizzato: vedi in una persona anche ciò che potrebbe essere.',
    armonico: 'Nei legami metti immaginazione e dolcezza: sai far sentire visto qualcuno.',
    teso: 'Rischi di innamorarti di un’immagine prima che della persona: il risveglio, quando arriva, è brusco.',
  },
  'pluto|sun': {
    congiunzione: 'Non ti accontenti di aggiustare: quando una cosa non va più bene tendi a rifarla da capo, e questo vale anche per come vedi te stesso.',
    armonico: 'Hai una capacità di ricominciare che si nota solo quando serve davvero.',
    teso: 'Tenere in mano le cose conta molto per te: quando qualcosa ti sfugge, la reazione è più forte di quanto la situazione richieda.',
  },
})
