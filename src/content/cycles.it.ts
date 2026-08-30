/**
 * The life timeline, in ordinary Italian.
 *
 * The Cicli page used to answer "what did the engine calculate". It has to
 * answer "where am I in my life, when did this start, when does it end, and
 * what is it about" — so what is written here describes periods, never numbers
 * and never events. A chart cannot know what happened to anyone.
 */
import type { AspectPoint, BodyId } from '../core/astrology/types.ts'

/** Short name of a life phase, shown above its interpretation. */
export const phaseTitle: Readonly<Record<number, string>> = Object.freeze({
  1: 'Aprire la propria strada',
  2: 'Imparare a stare con gli altri',
  3: 'Esprimersi e farsi vedere',
  4: 'Costruire basi solide',
  5: 'Muoversi e cambiare',
  6: 'Prendersi cura e responsabilità',
  7: 'Capire prima di muoversi',
  8: 'Realizzare e gestire',
  9: 'Chiudere e lasciare andare',
  11: 'Ascoltare quello che si sente',
  22: 'Mettere in piedi qualcosa di grande',
  33: 'Occuparsi degli altri',
})

/** What a long phase puts the accent on. Themes, never events. */
export const phaseReading: Readonly<Record<number, string>> = Object.freeze({
  1: 'È una fase che chiede di decidere da soli e di prendersi la responsabilità delle proprie scelte. Quello che parte da te conta più di quello che ti viene proposto. Appoggiarsi troppo agli altri, in questo periodo, tende a rallentare.',
  2: 'È una fase che mette al centro i rapporti e i tempi degli altri. I risultati arrivano più per collaborazione che per spinta personale, e forzare rende meno di quanto sembri. La pazienza qui vale più della velocità.',
  3: 'È una fase che spinge a esprimersi e a mostrare quello che si sa fare. Contano le parole, i contatti e la capacità di farsi capire. Il rischio è disperdersi fra troppe cose insieme.',
  4: 'È una fase di costruzione: consolidare quello che funziona, dare struttura ai progetti e ottenere risultati attraverso continuità e metodo. Il lavoro qui è poco appariscente e paga nel tempo. Le scorciatoie costano più di quanto facciano risparmiare.',
  5: 'È una fase di movimento: poche cose restano ferme, e conviene lasciare spazio all’imprevisto invece di programmare tutto. Il rischio è cominciare più di quanto si riesca a chiudere.',
  6: 'È una fase in cui pesano di più i legami, la casa e le responsabilità verso qualcuno. Le decisioni importanti passano dalle persone. Il rischio è occuparsi di tutti e rimandare quello che riguarda sé.',
  7: 'È una fase più raccolta, che chiede di capire prima di muoversi. Studiare, verificare e stare un po’ in disparte sono utili, e non sono isolamento. I risultati visibili arrivano più tardi di quanto si vorrebbe.',
  8: 'È una fase in cui quello che è stato costruito comincia a rendere, e in cui conviene occuparsi del lato concreto delle cose. Contano la gestione, le risorse e il riconoscimento del proprio lavoro. Quello che si chiede, qui, ha più probabilità di essere ascoltato.',
  9: 'È una fase di chiusura: qualcosa arriva alla fine, e lasciarlo andare fa spazio a quello che viene dopo. Non è il periodo migliore per partire da zero. Quello che si trascina senza più senso pesa più del solito.',
  11: 'È una fase in cui si percepisce più del solito e in cui le cose arrivano prima di poterle spiegare. Fidarsi di quello che si sente e verificarlo con calma funziona meglio che forzare. È anche un periodo più sensibile alla stanchezza.',
  22: 'È una fase in cui si può mettere in piedi qualcosa di grande, a patto di procedere per gradi. L’ambizione regge solo se poggia su un lavoro ordinato. Guardare lontano senza fare i passi intermedi è il rischio principale.',
  33: 'È una fase in cui quello che si fa riguarda anche gli altri più del solito. Il peso si sente, ma è il tipo di peso che dà senso alle cose. Il rischio è dimenticare che anche chi si prende cura ha bisogno di essere sostenuto.',
})

/** The year being lived, at its own scale: shorter and more immediate. */
export const yearReading: Readonly<Record<number, string>> = Object.freeze({
  1: 'Quest’anno conviene cominciare invece di aspettare il momento giusto. Quello che parte adesso tende a durare oltre l’anno.',
  2: 'Quest’anno mette più peso sulle relazioni, sulla collaborazione e sui tempi degli altri. È meno adatto a forzare i risultati e più favorevole a far maturare situazioni già avviate.',
  3: 'Quest’anno c’è più voglia di dire, mostrare e stare in mezzo alle persone. È un buon periodo per farsi conoscere, meno per concentrarsi su una cosa sola.',
  4: 'Quest’anno il lavoro è poco appariscente e serve a mettere basi. Quello che si sistema adesso regge, ma i risultati si vedono più avanti.',
  5: 'Quest’anno poche cose restano ferme. Conviene tenere spazio libero per l’imprevisto invece di riempire il calendario.',
  6: 'Quest’anno pesano di più la casa, i legami e le responsabilità verso qualcuno. Le decisioni importanti passano dalle persone coinvolte.',
  7: 'Quest’anno serve capire prima di muoversi. È un periodo adatto a studiare, verificare e rimandare le scelte che non sono ancora chiare.',
  8: 'Quest’anno il lato concreto conta più del solito: risorse, gestione, riconoscimento. Quello che chiedi adesso ha più probabilità di essere ascoltato.',
  9: 'Quest’anno qualcosa si chiude, e liberarsene fa spazio. Non è il momento migliore per partire da zero.',
  11: 'Quest’anno percepisci più del solito e le cose ti arrivano prima di poterle spiegare. Verificare con calma funziona meglio che decidere di slancio.',
  22: 'Quest’anno puoi mettere in piedi qualcosa di grosso, se procedi per gradi. Senza un lavoro ordinato dietro, l’ambizione da sola non basta.',
  33: 'Quest’anno quello che fai riguarda anche altri più del solito. Il peso si sente, e vale la pena scegliere per chi portarlo.',
})

/** The month, in one line. Short-term context, not a chapter. */
export const monthNote: Readonly<Record<number, string>> = Object.freeze({
  1: 'un mese per avviare, più che per consolidare',
  2: 'un mese di attese e di accordi, in cui i tempi non sono solo i tuoi',
  3: 'un mese di scambi e di parole, con il rischio di disperdersi',
  4: 'un mese di lavoro ordinato, poco visibile e utile',
  5: 'un mese mobile, in cui i programmi cambiano più volte',
  6: 'un mese in cui la casa e le persone chiedono attenzione',
  7: 'un mese per capire e verificare, meno per decidere',
  8: 'un mese concreto, adatto a occuparsi di conti e responsabilità',
  9: 'un mese di chiusure, in cui conviene finire più che iniziare',
  11: 'un mese sensibile, in cui percepisci più del solito',
  22: 'un mese impegnativo, in cui quello che costruisci pesa',
  33: 'un mese in cui gli altri contano più del solito',
})

/** The day, in one line. */
export const dayNote: Readonly<Record<number, string>> = Object.freeze({
  1: 'una giornata adatta a decidere e a partire',
  2: 'una giornata da usare per ascoltare e mettere d’accordo',
  3: 'una giornata per parlare, scrivere e farsi capire',
  4: 'una giornata da dedicare alle cose pratiche, una alla volta',
  5: 'una giornata imprevedibile, meglio non riempirla del tutto',
  6: 'una giornata in cui le persone vicine chiedono spazio',
  7: 'una giornata migliore per capire che per concludere',
  8: 'una giornata adatta a chiedere e a occuparsi del concreto',
  9: 'una giornata per chiudere quello che è rimasto aperto',
  11: 'una giornata in cui percepisci più del solito',
  22: 'una giornata impegnativa, con qualcosa di importante in gioco',
  33: 'una giornata in cui quello che fai tocca anche altri',
})

export type TransitTone = 'armonico' | 'teso' | 'congiunzione'

/**
 * What a passing planet emphasises, in ordinary language.
 *
 * Themes only: nothing here says an event will happen, and nothing touches
 * health, money, relationships or work as outcomes.
 */
export const transitTheme: Readonly<Partial<Record<BodyId, Readonly<Partial<Record<TransitTone, string>>>>>> =
  Object.freeze({
    jupiter: {
      congiunzione: 'C’è una spinta ad allargare il tuo raggio d’azione: in questo periodo tendi a vedere più possibilità del solito.',
      armonico: 'C’è più spazio per crescere e per allargare quello che fai, con meno attriti del solito.',
      teso: 'C’è la tendenza a prendere più di quanto si riesca a portare: l’entusiasmo, in questo periodo, va misurato.',
    },
    saturn: {
      congiunzione: 'C’è una richiesta di serietà e di limiti: quello che non regge viene messo alla prova, e quello che regge si consolida.',
      armonico: 'È un periodo in cui il lavoro paziente rende: quello che sistemi adesso tende a restare.',
      teso: 'C’è una richiesta di disciplina che può pesare: le cose vanno più lente di quanto vorresti, e le scorciatoie non funzionano.',
    },
    uranus: {
      congiunzione: 'C’è un bisogno di cambiare qualcosa che era dato per scontato: la routine, in questo periodo, sta stretta.',
      armonico: 'È un periodo in cui una novità può entrare senza rompere niente.',
      teso: 'C’è un’insofferenza verso quello che ti trattiene: il rischio è cambiare di scatto invece che per scelta.',
    },
    neptune: {
      congiunzione: 'I contorni delle cose sono meno netti del solito: percepisci molto e definisci con più fatica.',
      armonico: 'È un periodo in cui l’immaginazione lavora bene e la sensibilità verso gli altri è più fine.',
      teso: 'È un periodo in cui è facile vedere le cose come vorresti che fossero: conviene verificare prima di decidere.',
    },
    pluto: {
      congiunzione: 'Qualcosa si sta trasformando in profondità, e riguarda il modo in cui vedi te stesso.',
      armonico: 'È un periodo in cui riesci a lasciar andare quello che non serve più senza troppa fatica.',
      teso: 'C’è una questione di controllo: quello che ti sfugge di mano pesa più di quanto la situazione richieda.',
    },
    mars: {
      congiunzione: 'C’è più energia disponibile del solito, e anche più fretta.',
      armonico: 'È un periodo in cui l’iniziativa trova poca resistenza.',
      teso: 'C’è dell’attrito: l’impazienza è più facile del solito, e conviene sceglierne il bersaglio.',
    },
  })

/** Which part of life a passing planet is touching. */
export const transitTouches: Readonly<Record<AspectPoint, string>> = Object.freeze({
  sun: 'Riguarda soprattutto quello in cui ti riconosci.',
  moon: 'Riguarda soprattutto la vita affettiva e quello che ti fa sentire al sicuro.',
  mercury: 'Riguarda soprattutto il modo di ragionare e di comunicare.',
  venus: 'Riguarda soprattutto i legami e quello che ti attrae.',
  mars: 'Riguarda soprattutto il modo di agire e di prendere iniziativa.',
  jupiter: 'Riguarda soprattutto quello che ti fa prendere fiducia.',
  saturn: 'Riguarda soprattutto le responsabilità e i limiti che ti dai.',
  uranus: 'Riguarda soprattutto il bisogno di cambiare qualcosa.',
  neptune: 'Riguarda soprattutto quello che immagini e desideri senza dirlo.',
  pluto: 'Riguarda soprattutto quello che cambia in profondità.',
  ascendant: 'Riguarda soprattutto il modo in cui ti presenti e cominci le cose.',
  midheaven: 'Riguarda soprattutto il lavoro e il ruolo pubblico.',
})
