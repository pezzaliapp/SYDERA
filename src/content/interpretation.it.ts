/**
 * Interpretation content.
 *
 * Every fragment here belongs to one specific calculated factor. A sentence
 * about the Moon in Scorpio must not read like a sentence about the Moon in
 * Libra: if a fragment could be swapped for another without anyone noticing,
 * it is a horoscope, not a reading, and it does not belong here.
 *
 * The symbolic and non-scientific nature of all this is stated once, at the
 * top of the report. It is not repeated in every paragraph, because a
 * qualifier attached to every sentence stops being read.
 *
 * No calculation happens in this file.
 */
import type { AspectId, BodyId, ZodiacSign } from '../core/astrology/types.ts'

type BySign = Readonly<Record<ZodiacSign, string>>

/** The Sun: what the sense of self is organised around. Feeds the portrait. */
export const sunInSign: BySign = Object.freeze({
  ariete: 'il senso di sé si accende nell’iniziativa: conta arrivare per primi su qualcosa e misurarsi direttamente',
  toro: 'l’identità si costruisce su ciò che dura: continuità, competenza acquisita, un terreno stabile su cui contare',
  gemelli: 'l’identità si nutre di scambio: capire, collegare, raccontare, tenere aperte più strade insieme',
  cancro: 'il senso di sé passa dai legami e dalla memoria: contano l’appartenenza e ciò che si è già vissuto',
  leone: 'l’identità chiede riconoscimento: fare le cose in modo personale e vederle riconosciute come proprie',
  vergine: 'l’identità si definisce nel lavoro ben fatto: analizzare, correggere, rendere utilizzabile ciò che è approssimativo',
  bilancia: 'il senso di sé si definisce nel rapporto con gli altri: nel confronto, nella misura, nella ricerca di un accordo',
  scorpione: 'l’identità si gioca in profondità: interessa ciò che sta sotto la superficie, non la versione presentabile',
  sagittario: 'l’identità cerca respiro: significato, orizzonti larghi, la possibilità di andare oltre il perimetro dato',
  capricorno: 'l’identità si costruisce nel tempo e per gradi: obiettivi lunghi, responsabilità assunte, risultati che restano',
  acquario: 'il senso di sé passa dall’indipendenza di giudizio: pensare per conto proprio, anche controcorrente',
  pesci: 'l’identità è ricettiva più che definita: si delinea meno per confini e più per ciò che riesce a sentire',
})

/** The Moon: how feeling is processed and what gives security. */
export const moonInSign: BySign = Object.freeze({
  ariete: 'le emozioni arrivano rapide e dirette, si esauriscono in fretta e mal sopportano di essere trattenute',
  toro: 'la sicurezza emotiva passa dalla calma e dalla concretezza: ambienti stabili, abitudini riconoscibili, poche scosse',
  gemelli: 'le emozioni si elaborano parlandone: nominare ciò che si sente serve a capirlo',
  cancro: 'la vita emotiva è la stanza principale: i legami stretti e la memoria affettiva pesano più di tutto',
  leone: 'il bisogno emotivo è di calore e di riconoscimento: sentirsi visti da chi conta',
  vergine: 'le emozioni passano dal vaglio dell’analisi, e a volte vengono messe in ordine prima di essere sentite fino in fondo',
  bilancia: 'l’equilibrio emotivo dipende dal clima relazionale: la tensione fra le persone si sente addosso',
  scorpione: 'le emozioni sono intense e poco negoziabili, vissute per intero e raramente esposte',
  sagittario: 'il benessere emotivo ha bisogno di spazio e di prospettiva: le chiusure pesano molto',
  capricorno: 'le emozioni vengono contenute e gestite: prima si tiene la posizione, poi eventualmente si sente',
  acquario: 'le emozioni vengono guardate con una certa distanza, spesso capite prima che vissute',
  pesci: 'la sensibilità è ampia e permeabile: si assorbe anche ciò che non viene detto',
})

/** The Ascendant: the first approach, and how it lands on others. */
export const ascendantInSign: BySign = Object.freeze({
  ariete: 'il primo approccio è diretto e rapido: si entra nelle situazioni senza troppi preliminari',
  toro: 'l’impressione iniziale è di calma e solidità: nessuna fretta, ritmo proprio, presenza concreta',
  gemelli: 'ci si presenta con curiosità e parola facile: si aprono conversazioni prima di decidere dove portano',
  cancro: 'l’approccio iniziale è prudente e attento al clima: prima si valuta se il terreno è sicuro',
  leone: 'la presenza si nota: si arriva con calore e con una certa visibilità naturale',
  vergine: 'l’approccio è misurato e osservativo: si guarda come funziona una cosa prima di entrarci',
  bilancia: 'ci si presenta cercando accordo: modi cortesi, attenzione all’altro, poca disponibilità allo scontro frontale',
  scorpione: 'l’approccio è controllato e selettivo: si osserva molto e all’inizio si concede poco',
  sagittario: 'ci si presenta in modo aperto e informale, con una franchezza che semplifica i primi contatti',
  capricorno: 'l’approccio è serio e composto: si mostra affidabilità prima di mostrare confidenza',
  acquario: 'ci si presenta in modo personale e un po’ fuori registro rispetto alle attese',
  pesci: 'l’approccio è morbido e adattabile: ci si sintonizza sull’ambiente invece di imporre un tono',
})

/** Mercury: how thinking and speaking actually work. */
export const mercuryInSign: BySign = Object.freeze({
  ariete: 'il pensiero è veloce e decisionista: si arriva presto a una posizione, a volte prima di avere tutti gli elementi',
  toro: 'il ragionamento è lento e solido: poche revisioni, ma quello che entra resta',
  gemelli: 'la mente lavora per collegamenti rapidi e ha bisogno di varietà: molti fili aperti insieme',
  cancro: 'il pensiero è legato alla memoria e all’impressione: si ricorda il tono di una conversazione più delle parole',
  leone: 'l’espressione è calda e personale: si comunica mettendoci la faccia, non in modo neutro',
  vergine: 'la mente è analitica e attenta al dettaglio: nota ciò che non torna e vuole precisione nei termini',
  bilancia: 'il ragionamento pesa entrambi i lati della questione, e la decisione può restare sospesa a lungo',
  scorpione: 'il pensiero è indagatore: cerca il movente sotto l’argomento e diffida delle spiegazioni comode',
  sagittario: 'la mente ragiona per quadri d’insieme e principi generali, meno per dettagli',
  capricorno: 'il pensiero è strutturato e pratico: interessa ciò che è utilizzabile e verificabile',
  acquario: 'il ragionamento è indipendente e sistemico: prende volentieri le distanze dall’opinione corrente',
  pesci: 'il pensiero procede per immagini e intuizioni, con esiti giusti che non sempre si sanno giustificare',
})

/** Venus: what is looked for in a bond, and what is valued. */
export const venusInSign: BySign = Object.freeze({
  ariete: 'nei legami conta lo slancio: attrae ciò che è diretto, e l’inizio interessa più della gestione',
  toro: 'nei legami contano continuità e concretezza: presenza costante, gesti tangibili, poca teoria',
  gemelli: 'il legame passa dalla conversazione: interessa chi sa parlare e cambiare argomento',
  cancro: 'nei rapporti conta il sentirsi a casa: cura reciproca, protezione, un legame che tenga nel tempo',
  leone: 'nei legami serve calore dichiarato e generosità: l’affetto tiepido non basta',
  vergine: 'l’affetto si esprime nei fatti utili più che nelle parole: attrae la competenza, infastidisce l’approssimazione',
  bilancia: 'il rapporto è cercato come spazio di equilibrio: reciprocità, misura, evitare la rottura',
  scorpione: 'il legame è esclusivo e profondo: o si va fino in fondo o non interessa',
  sagittario: 'nei rapporti serve libertà di movimento: attrae chi porta idee ed esperienze nuove',
  capricorno: 'il legame si misura sulla serietà: impegni mantenuti, costruzione condivisa, poca esibizione',
  acquario: 'nel rapporto contano l’amicizia e lo spazio personale, e mal si sopportano le regole date per scontate',
  pesci: 'il legame è empatico e dedito: si tende a dare molto, a volte più di quanto venga chiesto',
})

/** Mars: how energy is actually spent. */
export const marsInSign: BySign = Object.freeze({
  ariete: 'l’azione parte subito e frontalmente: l’attesa costa più dell’errore',
  toro: 'si agisce con lentezza e continuità: partenza tarda, ma tenuta lunga',
  gemelli: 'l’energia si distribuisce su più fronti: molte partenze, e la difficoltà sta nel chiudere',
  cancro: 'si agisce in modo indiretto e protettivo: si difende ciò a cui si tiene più di quanto si attacchi',
  leone: 'l’azione vuole essere riconosciuta: si dà molto quando il proprio contributo è visibile',
  vergine: 'si agisce con metodo e per gradi: prima la preparazione, poi l’esecuzione precisa',
  bilancia: 'l’azione passa dal consenso: prima si cerca l’accordo, e questo può rallentare le decisioni',
  scorpione: 'l’energia è concentrata e tenace: poche cose per volta, ma portate fino in fondo',
  sagittario: 'si agisce con slancio e visione larga, con più entusiasmo nell’avvio che nella rifinitura',
  capricorno: 'l’azione è disciplinata e orientata al risultato: si accetta la fatica se porta da qualche parte',
  acquario: 'si agisce per convinzione personale, anche quando il metodo scelto non è quello previsto',
  pesci: 'l’energia è intermittente e sensibile al contesto: rende molto quando il senso di ciò che si fa è chiaro',
})

/** The area of life a placement activates. Appended to the sentence above. */
export const houseArea: Readonly<Record<number, string>> = Object.freeze({
  1: 'e la cosa si vede nel modo stesso di presentarsi',
  2: 'soprattutto in ciò che riguarda risorse e sicurezza materiale',
  3: 'soprattutto negli scambi quotidiani e nell’apprendimento',
  4: 'soprattutto nella sfera della casa, delle radici e della vita privata',
  5: 'soprattutto in ciò che riguarda espressione personale e creatività',
  6: 'soprattutto nel lavoro quotidiano, nei metodi e nella cura di sé',
  7: 'soprattutto nei rapporti stretti e negli accordi con gli altri',
  8: 'soprattutto in ciò che è profondo, condiviso e non negoziabile',
  9: 'soprattutto nell’ambito della ricerca, degli studi e degli orizzonti larghi',
  10: 'soprattutto nel ruolo pubblico e nella direzione professionale',
  11: 'soprattutto nei gruppi, nelle amicizie e nei progetti condivisi',
  12: 'soprattutto in una zona interiore e poco esposta',
})

/** What each point does, used to phrase an aspect between two of them. */
export const bodyFunction: Readonly<Record<BodyId | 'ascendant' | 'midheaven', string>> = Object.freeze({
  sun: 'il senso di sé',
  moon: 'la vita emotiva',
  mercury: 'il modo di pensare',
  venus: 'il modo di legarsi',
  mars: 'la spinta ad agire',
  jupiter: 'il bisogno di espansione',
  saturn: 'il senso del limite',
  uranus: 'la spinta all’indipendenza',
  neptune: 'la parte immaginativa',
  pluto: 'la spinta a trasformare',
  ascendant: 'il modo di presentarsi',
  midheaven: 'la direzione pubblica',
})

/** How an aspect between two functions reads. */
export const aspectPhrase: Readonly<Record<AspectId, (a: string, b: string) => string>> = Object.freeze({
  congiunzione: (a, b) => `${a} e ${b} agiscono insieme, al punto che è difficile attivare l’uno senza l’altro`,
  sestile: (a, b) => `${a} e ${b} collaborano, ma la combinazione va attivata di proposito`,
  quadrato: (a, b) => `${a} e ${b} si intralciano a vicenda: la combinazione produce attrito e chiede un compromesso`,
  trigono: (a, b) => `${a} e ${b} scorrono insieme con facilità, al punto che la cosa si dà per scontata`,
  opposizione: (a, b) => `${a} e ${b} si fronteggiano: due esigenze legittime che chiedono di essere bilanciate`,
})

/** A retrograde personal planet, read as an inward turn rather than a fault. */
export const retrogradeNote: Readonly<Record<string, string>> = Object.freeze({
  mercury: 'il ragionamento tende a tornare sui propri passi prima di concludere',
  venus: 'il modo di legarsi passa da una revisione interna prima di esporsi',
  mars: 'la spinta ad agire viene trattenuta e riorientata invece che scaricata subito',
})

type ByNumber = Readonly<Record<number, string>>

/** Life Path: the direction the numbers describe. */
export const lifePathDirection: ByNumber = Object.freeze({
  1: 'la direzione porta verso l’autonomia: decidere da sé e aprire strade proprie',
  2: 'la direzione passa dalla relazione: mediare, tenere insieme, lavorare in due',
  3: 'la direzione è espressiva: comunicare, dare forma, rendere visibile',
  4: 'la direzione è costruttiva: metodo, struttura, cose che stanno in piedi',
  5: 'la direzione è di movimento: cambiamento, varietà, esperienza diretta',
  6: 'la direzione riguarda la cura: responsabilità verso gli altri e verso l’ambiente vicino',
  7: 'la direzione è di ricerca: capire a fondo prima di aderire',
  8: 'la direzione è organizzativa: gestire risorse e portare risultati concreti',
  9: 'la direzione è di sintesi: uno sguardo largo, oltre l’interesse immediato',
  11: 'la direzione è sensibile e ideale, con una tensione fra ispirazione e misura',
  22: 'la direzione tiene insieme visione ampia e costruzione concreta',
  33: 'la direzione è di dedizione: qualcosa che si trasmette agli altri',
})

/** Expression: how the person comes out. */
export const expressionStyle: ByNumber = Object.freeze({
  1: 'il modo di esprimersi è netto e in prima persona',
  2: 'l’espressione è attenta all’altro, più collaborativa che affermativa',
  3: 'l’espressione è un punto forte: parola, forma, capacità di rendere interessante una cosa',
  4: 'l’espressione è essenziale e concreta, poco incline all’ornamento',
  5: 'l’espressione è mobile e versatile, a suo agio nel cambiamento',
  6: 'l’espressione ha un tono di cura e di responsabilità verso chi ascolta',
  7: 'l’espressione è selettiva: si parla quando si ha qualcosa di verificato da dire',
  8: 'l’espressione è orientata all’efficacia e al risultato',
  9: 'l’espressione tende alla sintesi e a un registro ampio',
  11: 'l’espressione è intuitiva, più per immagini che per argomenti',
  22: 'l’espressione è progettuale: si parla volentieri di ciò che si può costruire',
  33: 'l’espressione ha una funzione di trasmissione verso gli altri',
})

/** Soul Urge: what is wanted underneath. */
export const soulUrgeInner: ByNumber = Object.freeze({
  1: 'sotto la superficie c’è il bisogno di contare da sé, senza dover chiedere permesso',
  2: 'il bisogno interiore è di legame e di armonia: la frattura pesa più della rinuncia',
  3: 'dentro c’è bisogno di esprimersi e di essere ascoltati',
  4: 'il bisogno interiore è di stabilità: sapere dove si è e su cosa si può contare',
  5: 'dentro c’è bisogno di libertà e di aria: le situazioni chiuse diventano presto insostenibili',
  6: 'il bisogno interiore è di prendersi cura e di sentirsi utili a qualcuno',
  7: 'il bisogno profondo è di capire: la comprensione conta più della rassicurazione',
  8: 'dentro c’è bisogno di padronanza: incidere davvero su ciò che si fa',
  9: 'il bisogno interiore è di senso: che le cose servano a qualcosa di più largo',
  11: 'il bisogno interiore è di sintonia: percepire e essere percepiti in profondità',
  22: 'il bisogno interiore è di realizzare qualcosa che resti',
  33: 'il bisogno interiore è di dare, anche a costo di caricarsi troppo',
})

/** Personality: what reaches other people first. */
export const personalityOuter: ByNumber = Object.freeze({
  1: 'all’esterno arriva un’immagine autonoma e decisa',
  2: 'all’esterno si legge disponibilità e attenzione ai rapporti',
  3: 'all’esterno arriva vivacità e facilità di contatto',
  4: 'all’esterno si legge affidabilità e concretezza',
  5: 'all’esterno arriva un’immagine mobile e poco incasellabile',
  6: 'all’esterno si legge un’attitudine responsabile e accogliente',
  7: 'all’esterno arriva riserbo: non si concede molto al primo incontro',
  8: 'all’esterno si legge competenza e capacità di gestire',
  9: 'all’esterno arriva apertura e uno sguardo poco provinciale',
  11: 'all’esterno arriva sensibilità, a volte percepita come intensità',
  22: 'all’esterno si legge solidità unita a una certa ambizione di scala',
  33: 'all’esterno si legge disponibilità verso gli altri',
})

/** The symbolic theme of the current numerological year. */
export const personalYearTheme: ByNumber = Object.freeze({
  1: 'un periodo di avvii: quello che si imposta ora tende a orientare il ciclo seguente',
  2: 'un periodo di rapporti e di pazienza: le cose maturano attraverso altri più che da soli',
  3: 'un periodo espressivo: comunicazione, contatti, ciò che va reso visibile',
  4: 'un periodo di consolidamento: struttura, ordine, lavoro poco appariscente',
  5: 'un periodo di movimento: poche cose restano ferme',
  6: 'un periodo centrato su responsabilità e legami: casa, cura, impegni verso altri',
  7: 'un periodo di raccoglimento e verifica: si guarda dentro più che fuori',
  8: 'un periodo di gestione concreta: risorse, risultati, decisioni pratiche',
  9: 'un periodo di chiusure: si conclude un ciclo e si lascia andare ciò che ha esaurito la funzione',
})

/** What a theme means, for the strengths and convergence sections. */
export const themeMeaning: Readonly<Record<string, string>> = Object.freeze({
  analisi: 'la tendenza a esaminare prima di aderire',
  comunicazione: 'il peso dello scambio verbale e del contatto',
  indipendenza: 'il bisogno di decidere per conto proprio',
  creativita: 'la spinta a dare forma personale alle cose',
  stabilita: 'la ricerca di continuità e di terreno solido',
  emotivita: 'la centralità della vita affettiva',
  relazione: 'l’importanza del legame con gli altri',
  organizzazione: 'l’attitudine a strutturare e gestire',
  innovazione: 'l’attrazione per ciò che rompe lo schema',
  introspezione: 'il movimento verso l’interno',
  concretezza: 'l’ancoraggio ai risultati tangibili',
})

/* ------------------------------------------------------------------ portrait
 *
 * The opening portrait is composed, not concatenated. Instead of writing 144
 * Sun × Ascendant paragraphs by hand, each factor contributes a noun phrase
 * and the engine joins them into a relation: "un bisogno di appartenenza che
 * si presenta con un contegno formale". The phrases below are the building
 * blocks; the joining rules live in core/interpretation/portrait.ts.
 */

/** What the identity is after. Subject of the portrait sentence. */
export const sunNeed: BySign = Object.freeze({
  ariete: 'un bisogno di partire per primi',
  toro: 'un bisogno di continuità',
  gemelli: 'un bisogno di scambio e di varietà',
  cancro: 'un bisogno di appartenenza',
  leone: 'un bisogno di riconoscimento',
  vergine: 'un bisogno di fare le cose per bene',
  bilancia: 'un bisogno di accordo',
  scorpione: 'un bisogno di andare a fondo',
  sagittario: 'un bisogno di respiro e di senso',
  capricorno: 'un bisogno di costruire qualcosa che duri',
  acquario: 'un bisogno di pensare per conto proprio',
  pesci: 'un bisogno di sentire prima di definire',
})

/** How that need shows up on first contact. */
export const ascendantManner: BySign = Object.freeze({
  ariete: 'modi diretti e senza preamboli',
  toro: 'un passo calmo e poco negoziabile',
  gemelli: 'un tratto curioso e conversevole',
  cancro: 'un’apertura prudente',
  leone: 'una presenza calda e visibile',
  vergine: 'un contegno osservativo',
  bilancia: 'modi cortesi e concilianti',
  scorpione: 'un contegno selettivo e controllato',
  sagittario: 'un tratto franco e informale',
  capricorno: 'un contegno formale',
  acquario: 'un tratto personale e un po’ fuori registro',
  pesci: 'un tratto morbido e adattabile',
})

/** What the emotional floor is made of. */
export const moonSecurity: BySign = Object.freeze({
  ariete: 'una sicurezza che si scarica in fretta',
  toro: 'una sicurezza che chiede stabilità',
  gemelli: 'una sicurezza che passa dal parlarne',
  cancro: 'una sicurezza fatta di legami stretti',
  leone: 'una sicurezza che ha bisogno di essere vista',
  vergine: 'una sicurezza che passa dal mettere in ordine',
  bilancia: 'una sicurezza legata al clima fra le persone',
  scorpione: 'una sicurezza tenuta per sé',
  sagittario: 'una sicurezza che ha bisogno di spazio',
  capricorno: 'una sicurezza che si tiene sotto controllo',
  acquario: 'una sicurezza tenuta a una certa distanza',
  pesci: 'una sicurezza permeabile a ciò che arriva da fuori',
})

/** The Life Path enters as a modifier of the whole, never as its own sentence. */
export const lifePathModifier: ByNumber = Object.freeze({
  1: 'con una direzione che punta all’autonomia',
  2: 'con una direzione che passa dalla relazione',
  3: 'con una direzione orientata all’espressione',
  4: 'con una direzione orientata alla costruzione',
  5: 'con una direzione orientata al movimento',
  6: 'con una direzione orientata alla cura',
  7: 'con una direzione orientata alla ricerca',
  8: 'con una direzione orientata alla gestione concreta',
  9: 'con una direzione orientata alla sintesi',
  11: 'con una direzione sensibile e ideale',
  22: 'con una direzione che unisce visione e costruzione',
  33: 'con una direzione orientata alla dedizione',
})

/** Elements, used to decide whether two factors agree or pull apart. */
export const signElement: Readonly<Record<ZodiacSign, 'fuoco' | 'terra' | 'aria' | 'acqua'>> = Object.freeze({
  ariete: 'fuoco', leone: 'fuoco', sagittario: 'fuoco',
  toro: 'terra', vergine: 'terra', capricorno: 'terra',
  gemelli: 'aria', bilancia: 'aria', acquario: 'aria',
  cancro: 'acqua', scorpione: 'acqua', pesci: 'acqua',
})

/** How the two halves of a portrait sentence are joined. */
export const portraitJoin = Object.freeze({
  /** The two factors point the same way. */
  agreement: (a: string, b: string) => `${a} che si presenta con ${b}, senza troppa distanza fra le due cose`,
  /** They do not, and that distance is itself the reading. */
  tension: (a: string, b: string) => `${a} che si presenta con ${b}: la distanza fra ciò che si cerca e come lo si porta in giro è parte del quadro`,
  /** The inner floor either supports the identity or asks for something else. */
  moonSupports: (need: string) => `Sotto, ${need}: la spinta trova un appoggio coerente`,
  moonDiverges: (need: string) => `Sotto, però, ${need}: il motore e la base non chiedono la stessa cosa`,
})

/* ---------------------------------------------------------------- contrasts
 *
 * A contrast has to name both sides. These give each theme a plain-language
 * drive, and each pair of opposed drives a sentence saying how they qualify
 * one another.
 */

export const themeDrive: Readonly<Record<string, string>> = Object.freeze({
  analisi: 'il bisogno di verificare prima di muoversi',
  comunicazione: 'il bisogno di scambiare e di nominare le cose',
  indipendenza: 'il bisogno di decidere da sé',
  creativita: 'la spinta a dare forma personale alle cose',
  stabilita: 'il bisogno di terreno fermo',
  emotivita: 'la centralità di ciò che si sente',
  relazione: 'il bisogno di tenere insieme il legame',
  organizzazione: 'l’esigenza di strutturare e di gestire',
  innovazione: 'la spinta a cambiare schema',
  introspezione: 'il movimento verso l’interno',
  concretezza: 'l’esigenza di risultati tangibili',
})

/** What it means, in practice, when two opposed drives are both strong. */
export const oppositionResolution: Readonly<Record<string, string>> = Object.freeze({
  'indipendenza|relazione':
    'L’autonomia viene quindi cercata senza rompere il legame: le decisioni importanti passano da questo doppio vincolo, e nessuna delle due parti viene sacrificata a lungo.',
  'innovazione|stabilita':
    'Il cambiamento viene quindi cercato a partire da una base che non si muove: si innova, ma solo con qualcosa di garantito alle spalle.',
  'analisi|creativita':
    'Verifica e slancio si alternano: si parte, poi si torna a controllare, e il ritmo di lavoro ne porta il segno.',
  'emotivita|organizzazione':
    'Ciò che si sente viene quindi gestito più che seguito: il metodo serve a tenere in ordine l’emotività, non a sostituirla.',
})

/** What a hard aspect costs in practice, once both sides have been named. */
export const hardAspectConsequence: Readonly<Record<string, string>> = Object.freeze({
  quadrato: 'quando entrambe entrano in gioco una delle due tende a cedere, e il compromesso va ricostruito ogni volta',
  opposizione: 'si tende a oscillare fra i due poli invece di tenerli insieme, e l’equilibrio è una posizione da mantenere attivamente',
})
