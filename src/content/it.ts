/**
 * Italian user interface strings.
 *
 * All user-facing wording lives here so a second language can be added later
 * without touching calculation or interpretation logic.
 */
import type { LegalDocument } from './types.ts'

export const it = {
  app: {
    name: 'SYDERA',
    subtitle: 'Astrologia · Numerologia',
    tagline: 'Due sistemi simbolici. Un profilo personale.',
    localNotice: 'I tuoi dati restano sul tuo dispositivo.',
  },
  nav: {
    label: 'Sezioni della tua SYDERA',
    secondaryLabel: 'Documenti e impostazioni',
    skipToContent: 'Vai al contenuto principale',
    privacy: 'Privacy',
    disclaimer: 'Avvertenze',
    about: 'Informazioni',
    settings: 'Impostazioni',
    myS: 'La mia SYDERA',
    data: 'I miei dati',
  },
  sections: {
    sintesi: 'Sintesi',
    astrologia: 'Astrologia',
    numerologia: 'Numerologia',
    convergenze: 'Convergenze',
    cicli: 'Cicli',
  },
  theme: { label: 'Tema', system: 'Sistema', light: 'Chiaro', dark: 'Scuro' },

  intro: {
    what: 'SYDERA affianca astrologia occidentale e numerologia pitagorica, distinguendo sempre il calcolo dall’interpretazione simbolica.',
    privacy:
      'I dati che inserisci restano nel browser di questo dispositivo: nessun account, nessun server, nessun tracciamento.',
    acknowledge:
      'Ho letto le avvertenze: astrologia e numerologia non sono metodi predittivi scientificamente validati e SYDERA non fornisce consulenza medica, psicologica, legale o finanziaria.',
    acknowledgeRequired: 'Per calcolare la tua SYDERA è necessario accettare le avvertenze.',
    readDisclaimer: 'Leggi le avvertenze complete',
    readPrivacy: 'Leggi l’informativa privacy',
  },

  entry: {
    title: 'SYDERA',
    editTitle: 'I miei dati',
    submit: 'CALCOLA SYDERA',
    submitEdit: 'RICALCOLA SYDERA',
    cancel: 'Annulla',
    dateLabel: 'Data di nascita',
    dateHelp: 'Data civile come risulta all’atto di nascita.',
    dayLabel: 'Giorno',
    monthLabel: 'Mese',
    yearLabel: 'Anno',
    yearRangeHelp: (from: number, to: number) => `Anni ammessi: dal ${from} al ${to}.`,
    timeLabel: 'Ora di nascita',
    timeHelp: 'Ora locale indicata sul documento. Determina Ascendente, Medio Cielo e case.',
    hourLabel: 'Ora',
    minuteLabel: 'Minuti',
    timeUnknown: 'Non conosco l’ora di nascita',
    timeUnknownHelp:
      'SYDERA non inventerà un orario. Senza ora esatta non calcola Ascendente, Medio Cielo, case e aspetti, e mostra le posizioni come intervallo sulla giornata.',
    precisionLabel: 'Precisione dell’ora',
    precisionHelp: 'Serve a dichiarare quanto è incerto l’Ascendente, non a modificare il calcolo.',
    precisionOptions: {
      exact: 'Al minuto',
      five: 'Circa cinque minuti',
      fifteen: 'Circa un quarto d’ora',
      hour: 'Circa un’ora',
    },
    placeLabel: 'Luogo di nascita',
    placeHelp: 'La ricerca avviene sul tuo dispositivo: nessun luogo viene inviato all’esterno.',
    placeSearching: 'Ricerca…',
    placeLoading: 'Caricamento dell’archivio dei luoghi (una sola volta)…',
    placeLoadError:
      'Archivio dei luoghi non disponibile. Puoi inserire manualmente coordinate e fuso orario.',
    placeNoResults: 'Nessun luogo trovato. Prova un altro nome oppure inserisci le coordinate manualmente.',
    placeSelected: 'Luogo selezionato',
    placeConfirmed: 'Luogo di nascita confermato',
    placeChooseHint: 'Tocca il luogo giusto per confermarlo.',
    placeChoose: 'Scegli',
    placeResultsTitle: 'Risultati della ricerca',
    placeChange: 'Cambia luogo',
    placeManual: 'Inserisci coordinate manualmente',
    placeManualLabel: 'Nome del luogo',
    latitudeLabel: 'Latitudine (gradi, positiva a nord)',
    longitudeLabel: 'Longitudine (gradi, positiva a est)',
    zoneLabel: 'Fuso orario (identificativo IANA)',
    zoneHelp: 'Ad esempio Europe/Rome. Il fuso storico corretto viene ricavato da questo identificativo.',
    manualConfirm: 'Usa queste coordinate',
    nameLabel: 'Nome completo di nascita',
    nameHelp: 'Necessario per la numerologia. Non serve ai calcoli astrologici e puoi lasciarlo vuoto.',
    errors: {
      dateRequired: 'Inserisci la data di nascita.',
      dateIncomplete: 'Completa giorno, mese e anno (l’anno con quattro cifre).',
      dayRange: 'Il giorno deve essere compreso fra 1 e 31.',
      monthRange: 'Il mese deve essere compreso fra 1 e 12.',
      yearRange: (from: number, to: number) => `L’anno deve essere compreso fra ${from} e ${to}.`,
      dateImpossible: 'Questa data non esiste nel calendario: controlla giorno e mese.',
      dateInvalid: 'La data indicata non esiste nel calendario.',
      dateRange: 'La data deve essere compresa fra l’anno 1000 e l’anno 2400.',
      timeRequired: 'Inserisci l’ora di nascita oppure indica che non la conosci.',
      timeIncomplete: 'Completa ora e minuti.',
      hourRange: 'L’ora deve essere compresa fra 0 e 23.',
      minuteRange: 'I minuti devono essere compresi fra 0 e 59.',
      timeInvalid: 'Inserisci un’ora valida.',
      placeRequired: 'Indica il luogo di nascita: senza luogo non è possibile convertire l’ora in UTC.',
      latitude: 'La latitudine deve essere compresa fra -90 e 90.',
      longitude: 'La longitudine deve essere compresa fra -180 e 180.',
      zone: 'Identificativo di fuso orario non riconosciuto.',
    },
  },

  returning: {
    title: 'La mia SYDERA',
    calculatedOn: 'Calcolata il',
    open: 'APRI LA MIA SYDERA',
    edit: 'Modifica i dati',
  },

  result: {
    layerNote:
      'I dati calcolati sono verificabili e riproducibili. Le letture che li accompagnano appartengono a tradizioni simboliche e non sono un dato scientifico.',
    calculated: 'Dati calcolati',
    symbolic: 'Lettura simbolica',
    showCalculation: 'Mostra il calcolo',
    hideCalculation: 'Nascondi il calcolo',
    referenceDate: 'Data di riferimento',
  },

  about: {
    releaseTitle: 'Versione in uso',
    version: 'Versione',
    build: 'Build',
    buildDate: 'Data della build',
  },

  report: {
    title: 'La tua SYDERA',
    /** One sober line under the title. The full notice lives in Avvertenze. */
    shortFraming: 'Lettura simbolica basata su astrologia e numerologia; non è una valutazione scientifica o psicologica.',
    readDisclaimer: 'Avvertenze complete',
    evidenceTitle: 'Perché questa lettura?',
    evidenceLead: 'Qui sotto, sezione per sezione, i valori calcolati da cui nasce ogni parte del testo.',
    whyClose: 'Nascondi',
    sections: {
      ritratto: 'Il tuo ritratto',
      pensiero: 'Come pensi e agisci',
      emozioni: 'Emozioni e relazioni',
      equilibrio: 'Il tuo punto di equilibrio',
      momento: 'Questo momento',
    },
  },
  sintesi: {
    title: 'Sintesi',
    lead: 'I punti principali della tua SYDERA, con il rimando alle sezioni che li spiegano.',
    astroTitle: 'Dall’astrologia',
    numeroTitle: 'Dalla numerologia',
    convergenceTitle: 'Fra i due sistemi',
    missingAstrology: 'Astrologia non calcolabile con i dati attuali.',
    missingNumerology: 'Numerologia non calcolabile: manca il nome completo di nascita.',
    missingConvergence: 'Le convergenze richiedono entrambi i sistemi.',
    completeData: 'Completa i dati',
  },

  astrology: {
    /** The readable part of the natal chart, before any table. */
    readingLead: 'Il tuo tema natale, spiegato prima di mostrarne i calcoli.',
    readingWhy: 'Perché questa lettura?',
    readingBlocks: {
      presentazione: 'Come ti presenti',
      identita: 'Identità e direzione',
      emozioni: 'Emozioni',
      mente: 'Mente e comunicazione',
      relazioni: 'Relazioni e desiderio',
      azione: 'Azione',
      crescita: 'Crescita e limiti',
      dinamiche: 'Le dinamiche più forti del tema',
    },
    dataDisclosure: 'Mostra i dati astrologici',
    verifyDisclosure: 'Verifica del calcolo',

    title: 'Astrologia',
    lead: 'Che cosa dice il tema natale, e i dati su cui poggia.',
    readingTitle: 'La lettura astrologica',
    dataTitle: 'I dati calcolati',
    dataLead: 'Posizioni calcolate per l’istante di nascita convertito in UTC.',
    showData: 'Mostra posizioni, case e aspetti',
    positions: 'Posizioni',
    angles: 'Ascendente e Medio Cielo',
    houses: 'Case',
    aspects: 'Aspetti',
    ascendant: 'Ascendente',
    midheaven: 'Medio Cielo',
    house: 'Casa',
    retrograde: 'retrogrado',
    orb: 'orbita',
    applying: 'in avvicinamento',
    separating: 'in allontanamento',
    houseSystem: 'Sistema di case',
    houseSystemNames: { 'whole-sign': 'Segni interi', equal: 'Case uguali', placidus: 'Placidus' },
    partialTitle: 'Analisi parziale: ora di nascita non indicata',
    partialBody:
      'Senza un’ora esatta SYDERA non calcola Ascendente, Medio Cielo, case e aspetti, e non inventa un orario di comodo. Le posizioni qui sotto sono l’intervallo percorso dal corpo nell’arco della giornata.',
    partialRange: 'intervallo nella giornata',
    partialSignUncertain: 'cambia segno durante la giornata',
    refusedTitle: 'Sistema di case non calcolabile',
    refusedBody:
      'Placidus non è definito a questa latitudine: la costruzione richiede che ogni grado sorga e tramonti, condizione che oltre il circolo polare non è soddisfatta. SYDERA non sostituisce automaticamente un altro sistema.',
    refusedChoose: 'Scegli un sistema alternativo nelle impostazioni del metodo.',
    utcUsed: 'Istante UTC usato',
    offsetUsed: 'Scarto applicato',
    zoneUsed: 'Fuso orario',
    siderealTime: 'Tempo siderale locale',
    obliquity: 'Obliquità dell’eclittica',
    uncertaintyTitle: 'Precisione dichiarata',
    uncertaintyBody: (degrees: string, minutes: string) =>
      `Con un’ora nota a ±${minutes} minuti, l’Ascendente è determinato entro circa ±${degrees}°. La precisione del calcolo non è la precisione del dato inserito.`,
    caveats: {
      'pre-1970':
        'Nascita precedente al 1970: per questo fuso orario la fonte dichiara i dati storici come non garantiti. Lo scarto applicato è indicato qui sopra e puoi correggerlo manualmente se conosci l’ora legale in vigore quel giorno.',
      'local-mean-time': 'A questa data il luogo non adottava ancora un fuso standard: è stata usata l’ora media locale.',
      'unusual-offset': 'Lo scarto applicato non è un numero intero di mezze ore: verificalo se possibile.',
      'manual-override': 'Scarto impostato manualmente da te, non ricavato dalle regole del fuso.',
    },
  },

  numerology: {
    title: 'Numerologia',
    lead: 'Che cosa dicono i numeri, e come sono stati ottenuti.',
    readingTitle: 'La lettura numerologica',
    dataTitle: 'I numeri calcolati',
    dataLead: 'Numeri calcolati con le convenzioni dichiarate nel metodo.',
    showData: 'Mostra pinnacoli, sfide e lettere',
    missingName: 'Nome completo di nascita non inserito',
    missingNameBody:
      'La numerologia si calcola dalle lettere del nome di nascita. SYDERA non inventa un nome: aggiungilo dai tuoi dati per vedere questa sezione.',
    addName: 'Aggiungi il nome',
    coreNumbers: 'Numeri fondamentali',
    cycles: 'Cicli personali',
    pinnacles: 'Pinnacoli',
    challenges: 'Sfide',
    letterTable: 'Corrispondenza lettere e valori',
    vowel: 'Vocale',
    consonant: 'Consonante',
    masterNumber: 'Numero maestro',
    ageRange: 'Età',
    fromAge: 'da',
    onwards: 'in poi',
    method: 'Metodo di calcolo',
    normalisedName: 'Adattamenti applicati al nome prima del calcolo',
    notCalculable: 'Calcolo non eseguibile con le informazioni disponibili',
    numbers: {
      lifePath: 'Sentiero di vita',
      expression: 'Espressione (Destino)',
      soulUrge: 'Anima',
      personality: 'Personalità',
      birthday: 'Numero natale',
      maturity: 'Maturità',
      personalYear: 'Anno personale',
      personalMonth: 'Mese personale',
      personalDay: 'Giorno personale',
    },
    sources: {
      lifePath: 'Data di nascita',
      expression: 'Tutte le lettere del nome',
      soulUrge: 'Vocali del nome',
      personality: 'Consonanti del nome',
      birthday: 'Giorno del mese',
      maturity: 'Sentiero di vita + Espressione',
      personalYear: 'Mese e giorno di nascita + anno di riferimento',
      personalMonth: 'Anno personale + mese di riferimento',
      personalDay: 'Mese personale + giorno di riferimento',
    },
    methodDisclosure: {
      title: 'Metodo numerologico utilizzato',
      intro:
        'Scuole numerologiche diverse adottano convenzioni diverse e, partendo dagli stessi dati, possono arrivare a numeri diversi. SYDERA dichiara apertamente le convenzioni che applica: nessuna di queste è scientificamente o oggettivamente più corretta di un’altra.',
      lifePathLabel: 'Sentiero di vita',
      lifePath: {
        component:
          'Mese, giorno e anno vengono ridotti separatamente, conservando gli eventuali numeri maestri; i tre risultati vengono poi sommati e ridotti.',
        'digit-sum':
          'Tutte le cifre della data di nascita vengono sommate in un unico passaggio e il totale viene poi ridotto.',
      },
      lifePathNote:
        'Le due convenzioni coincidono spesso, ma non sempre: per alcune date producono numeri diversi. La convenzione applicata è indicata qui sopra.',
      nameSumLabel: 'Somma del nome',
      nameSum: {
        total: 'Tutte le lettere del nome completo vengono sommate e il totale viene ridotto una sola volta.',
        'per-word': 'Ogni parola del nome viene ridotta separatamente e i risultati vengono poi sommati e ridotti.',
      },
      yLabel: 'Regola della lettera Y',
      y: {
        contextual:
          'La Y è considerata vocale quando nessuna lettera immediatamente vicina, nella stessa parola, è A, E, I, O o U; altrimenti è consonante.',
        'y-as-vowel': 'La Y è sempre considerata vocale.',
        'y-as-consonant': 'La Y è sempre considerata consonante.',
      },
      wLabel: 'Trattamento della W',
      w: 'La W è sempre trattata come consonante. Alcune scuole la considerano vocale in combinazioni come “OW”: SYDERA non applica questa variante, perché la regola non è formulata in modo uniforme e non sarebbe riproducibile.',
      masterLabel: 'Numeri maestri',
      masterOn: 'I totali 11, 22 e 33 vengono conservati come numeri maestri invece di essere ridotti a una sola cifra.',
      masterOff: 'I numeri maestri non vengono conservati: ogni risultato è ridotto da 1 a 9.',
      masterCyclesNote:
        'Anno, mese e giorno personale sono per tradizione espressi sulla scala 1–9: in questi cicli i numeri maestri non vengono mai conservati.',
      nameToUseLabel: 'Quale nome inserire',
      nameToUse:
        'Va usato il nome completo come risulta all’atto di nascita, non il nome usato abitualmente o modificato in seguito. Un nome diverso produce numeri diversi: è una scelta di convenzione, non un errore di calcolo.',
      normalisationLabel: 'Adattamento del nome',
      normalisation:
        'Accenti e legature vengono ricondotti alle lettere A–Z della mappatura pitagorica e gli apostrofi vengono ignorati. Ogni adattamento applicato viene indicato nell’analisi.',
      personalYearLabel: 'Anno personale',
      personalYear:
        'SYDERA fa cambiare l’anno personale il 1° gennaio. Altre tradizioni numerologiche fanno invece coincidere il cambio con il compleanno: con quella convenzione, nel periodo fra il 1° gennaio e il compleanno il numero risulterebbe diverso.',
      docsNote:
        'Il metodo completo, con esempi e casi limite, è descritto nel documento tecnico del progetto (docs/NUMEROLOGY_METHOD.md).',
    },
  },

  convergence: {
    title: 'Convergenze',
    lead: 'Confronto fra i temi simbolici che i due sistemi mettono in evidenza.',
    caution:
      'Una convergenza indica soltanto che i due vocaboli simbolici insistono sullo stesso tema. Non è una prova, né una misura di una caratteristica personale.',
    incomplete: 'Confronto non disponibile',
    incompleteBody:
      'Le convergenze richiedono sia i dati astrologici sia quelli numerologici. Completa i dati mancanti per vedere questa sezione.',
    levels: {
      'convergenza-forte': 'Convergenza forte',
      'convergenza-moderata': 'Convergenza moderata',
      neutro: 'Neutro',
      contrasto: 'Contrasto significativo',
    },
    levelExplanations: {
      'convergenza-forte': 'Entrambi i sistemi insistono su questo tema.',
      'convergenza-moderata': 'Entrambi i sistemi toccano il tema, con intensità minore.',
      neutro: 'Nessuno dei due sistemi mette in evidenza il tema.',
      contrasto: 'Un sistema evidenzia il tema, l’altro no: le due letture divergono qui.',
    },
    themes: {
      analisi: 'Analisi',
      comunicazione: 'Comunicazione',
      indipendenza: 'Indipendenza',
      creativita: 'Creatività',
      stabilita: 'Stabilità',
      emotivita: 'Orientamento emotivo',
      relazione: 'Relazioni',
      organizzazione: 'Organizzazione',
      innovazione: 'Innovazione',
      introspezione: 'Introspezione',
      concretezza: 'Orientamento pratico',
    },
    fromAstrology: 'Fattori astrologici',
    fromNumerology: 'Fattori numerologici',
    astrologySays: 'L’astrologia porta',
    numerologySays: 'La numerologia porta',
    nothingFrom: 'nulla di rilevante su questo tema',
    combined: {
      'convergenza-forte':
        'I due sistemi insistono sullo stesso punto. Quando due linguaggi diversi arrivano allo stesso tema, quel tema è probabilmente centrale nella lettura complessiva — non perché sia dimostrato, ma perché regge da più parti.',
      'convergenza-moderata':
        'Entrambi i sistemi toccano il tema senza farne il centro: è presente nel quadro, ma non lo domina.',
      neutro:
        'Nessuno dei due sistemi mette in evidenza questo tema: nella lettura complessiva resta sullo sfondo.',
      contrasto:
        'Qui le due letture prendono direzioni diverse: un sistema mette il tema in primo piano, l’altro non lo rileva. Il punto non è stabilire chi ha ragione, ma notare che questa spinta poggia su un appoggio solo.',
    },
    methodTitle: 'Come viene calcolato il confronto',
    methodBody:
      'A ogni segno e a ogni numero è associato un insieme di temi documentato e sempre uguale. I punteggi vengono normalizzati e confrontati con soglie fisse. Il procedimento è descritto in docs/CONVERGENCE_TAXONOMY.md.',
  },

  cycles: {
    title: 'Cicli',
    lead: 'Periodi in corso, calcolati alla data di riferimento.',
    caution:
      'I cicli descrivono temi simbolici associati a un periodo. Non indicano eventi certi e non vanno usati per decidere questioni importanti.',
    transitsTitle: 'Transiti in corso',
    transitsEmpty: 'Nessun transito entro l’orbita stretta usata da SYDERA a questa data.',
    transitsUnavailable:
      'I transiti richiedono un tema natale completo, quindi ora e luogo di nascita.',
    personalTitle: 'Cicli numerologici',
    personalUnavailable: 'I cicli numerologici richiedono il nome completo di nascita.',
    transiting: 'In transito',
    onNatal: 'sul punto natale',
    orb: 'orbita',
  },

  settings: {
    title: 'Impostazioni',
    appearance: 'Aspetto',
    method: 'Metodo di calcolo',
    methodBody:
      'Impostazioni avanzate. L’esperienza normale non richiede di scegliere: SYDERA usa i Segni interi, il sistema definito a ogni latitudine.',
    houseSystem: 'Sistema di case',
    houseSystemHelp:
      'Tradizioni astrologiche diverse usano sistemi di case diversi e ottengono posizioni diverse dagli stessi dati. SYDERA non sostiene che un sistema sia scientificamente o oggettivamente superiore a un altro.',
    data: 'Dati locali',
    dataBody:
      'I tuoi dati di nascita restano in IndexedDB su questo dispositivo, insieme a poche preferenze non personali in localStorage. Nulla viene inviato a un server di SYDERA. Il modulo di un nuovo calcolo parte sempre vuoto: SYDERA non ripropone i dati inseriti in precedenza.',
    stored: 'Analisi salvata su questo dispositivo',
    storedYes: 'Sì',
    storedNo: 'No',
    deleteAll: 'CANCELLA TUTTI I MIEI DATI',
    deleteAllTitle: 'Cancellare tutti i dati personali salvati da SYDERA su questo dispositivo?',
    deleteAllBody:
      'Vengono cancellati i dati di nascita, il nome, il luogo, i risultati calcolati e le preferenze salvati su questo dispositivo. L’operazione non può essere annullata. I file che hai esportato restano tuoi e non vengono toccati; l’applicazione resta installata e utilizzabile.',
    deleteAllConfirm: 'CANCELLA DATI',
    deleteAllWorking: 'Cancellazione in corso…',
    deleteAllRetry: 'Riprova',
    deleteAllBlockedTitle: 'Eliminazione non completata',
    deleteAllBlockedBody:
      'Nessun dato è stato eliminato. SYDERA risulta ancora aperta in un’altra scheda o finestra di questo browser, che sta usando l’archivio locale. Chiudi le altre schede o finestre di SYDERA e riprova.',
    deleteAllErrorTitle: 'Eliminazione non riuscita',
    deleteAllErrorBody:
      'Il browser ha segnalato un errore durante l’eliminazione. Nessuna eliminazione è stata confermata: puoi riprovare.',
    documents: 'Documenti',
    reviewDisclaimer: 'Rileggi le avvertenze',
    reviewPrivacy: 'Rileggi l’informativa privacy',
    notices: 'Note sulle componenti di terze parti',
  },

  dataDeleted: {
    title: 'Dati eliminati',
    lead: 'Tutti i dati personali gestiti da SYDERA su questo dispositivo sono stati eliminati in modo definitivo.',
    removedTitle: 'Che cosa è stato eliminato',
    removed: [
      'La tua analisi, con nome, data, ora e luogo di nascita.',
      'Tutti i risultati astrologici e numerologici derivati da quei dati.',
      'Tutte le preferenze dell’applicazione, compresa l’accettazione delle avvertenze.',
    ],
    keptTitle: 'Che cosa non è stato toccato',
    kept: [
      'I file che hai esportato volontariamente: non fanno parte dell’archivio dell’applicazione.',
      'La copia offline del programma e l’archivio dei luoghi, che non contengono alcuna informazione personale.',
    ],
    note: 'Selezionando “Continua” SYDERA riparte dalla schermata iniziale.',
    continue: 'Continua',
  },

  common: {
    close: 'Chiudi',
    back: 'Indietro',
    notAvailable: 'Non disponibile',
    loading: 'Caricamento…',
    error: 'Si è verificato un errore',
    storageUnavailable:
      'Questo browser non consente l’accesso all’archivio locale: SYDERA non può salvare la tua analisi in questa modalità.',
    updateAvailable: 'È disponibile una nuova versione di SYDERA.',
    updateAction: 'Aggiorna',
  },
} as const

export const privacyDocument: LegalDocument = {
  title: 'Informativa privacy',
  updated: 'Aggiornata: agosto 2026',
  intro:
    'Questa informativa descrive il comportamento tecnico reale dell’applicazione. Se l’architettura dovesse cambiare, l’informativa sarà aggiornata prima della pubblicazione della nuova versione.',
  sections: [
    {
      title: 'Trattamento locale',
      paragraphs: [
        'SYDERA è un’applicazione locale. I dati che inserisci vengono elaborati dal browser sul tuo dispositivo e non vengono trasmessi ad alcun server SYDERA.',
      ],
      bullets: [
        'Nessun account e nessuna registrazione.',
        'Nessun dato personale su server remoti.',
        'Nessuna pubblicità, analitica, telemetria o profilazione.',
        'Nessuno script di tracciamento di terze parti.',
      ],
    },
    {
      title: 'Dati raccolti',
      paragraphs: [
        'SYDERA chiede solo le informazioni necessarie ai calcoli: data di nascita, ora di nascita, luogo di nascita e, soltanto per la numerologia, il nome completo di nascita. Il nome è facoltativo e non serve ai calcoli astrologici.',
        'Non vengono richiesti indirizzo e-mail, numero di telefono, documenti di identità, account social o password.',
      ],
    },
    {
      title: 'Astrologia, fuso orario e luogo',
      paragraphs: [
        'Le posizioni planetarie sono calcolate localmente da una libreria inclusa nell’applicazione: non esiste alcun servizio esterno di effemeridi e nessuna data o ora di nascita lascia il dispositivo.',
        'Il fuso orario storico viene ricavato dal database IANA già presente nel browser attraverso le funzioni standard del linguaggio: nessun dato viene inviato per ottenerlo.',
        'L’archivio dei luoghi di nascita è un file statico distribuito insieme all’applicazione e scaricato dallo stesso indirizzo da cui hai aperto SYDERA, una sola volta. La ricerca del luogo avviene interamente sul dispositivo: il nome che digiti non viene inviato da nessuna parte, e non viene usato alcun servizio di geocodifica.',
      ],
    },
    {
      title: 'Dove sono conservati i dati',
      paragraphs: [
        'La tua analisi è salvata in IndexedDB, l’archivio strutturato del browser, su questo dispositivo. Alcune preferenze non personali (tema, avvenuta accettazione delle avvertenze, sistema di case scelto) sono salvate in localStorage.',
        'Servono a una cosa sola: farti ritrovare la tua lettura quando riapri SYDERA, senza reinserire i dati.',
        'La cache offline contiene solo i file del programma e l’archivio dei luoghi: nessuna informazione personale viene memorizzata in quella cache.',
      ],
    },
    {
      title: 'Il modulo parte sempre vuoto',
      paragraphs: [
        'Quando apri un nuovo calcolo, i campi personali sono vuoti. SYDERA non ripropone la data, l’ora, il luogo o il nome che avevi inserito in precedenza: se vuoi rifare un calcolo, li inserisci di nuovo.',
        'I campi sono inoltre configurati per non chiedere al browser di ricordare o completare automaticamente questi valori. Il completamento automatico e la cronologia dei moduli sono però gestiti dal browser, non da SYDERA: se il tuo browser propone comunque un valore digitato in passato, quel suggerimento arriva da lui e si disattiva nelle sue impostazioni.',
      ],
    },
    {
      title: 'Cancellazione',
      paragraphs: [
        'Puoi cancellare tutto quello che SYDERA ha salvato su questo dispositivo dalla sezione Impostazioni, con il comando “Cancella tutti i miei dati”. Serve una sola conferma.',
        'Vengono rimossi i dati di nascita, il nome, il luogo, i risultati calcolati e le preferenze, comprese eventuali voci lasciate da versioni precedenti dell’applicazione. Il programma e l’archivio dei luoghi restano al loro posto: SYDERA rimane installata e utilizzabile, come se non ci avessi mai inserito dati.',
        'I file che hai esportato volontariamente non fanno parte dell’archivio dell’applicazione e restano tuoi: non vengono modificati né cancellati.',
        'L’eliminazione viene confermata soltanto quando è stata effettivamente completata. Se SYDERA è aperta in un’altra scheda o finestra, il browser rinvia l’operazione: in quel caso non viene eliminato nulla e l’applicazione ti chiede di chiudere le altre schede e riprovare.',
      ],
    },
    {
      title: 'Connessioni di rete',
      paragraphs: [
        'L’applicazione viene scaricata dal sito che la ospita e poi funziona offline. Non contiene font remoti, script esterni o chiamate ad API di terze parti. L’unica richiesta che effettua è il download dell’archivio dei luoghi dallo stesso indirizzo dell’applicazione.',
        'SYDERA dichiara inoltre una Content Security Policy che consente esclusivamente risorse provenienti dal proprio indirizzo. Se il servizio di hosting o una rete di distribuzione inserisse uno script di analitica nella pagina servita, il browser lo rifiuterebbe prima di eseguirlo: la promessa di non usare analitica e script di terze parti resta valida indipendentemente da come il sito viene ospitato.',
        'SYDERA non vende informazioni personali e non le utilizza per finalità pubblicitarie.',
      ],
    },
    {
      title: 'Responsabilità dell’utente',
      paragraphs: [
        'Poiché i dati restano sul dispositivo, la loro protezione dipende anche dalle misure di sicurezza del dispositivo e del browser. Chi ha accesso al browser potrebbe accedere all’analisi salvata.',
      ],
    },
  ],
}

export const disclaimerDocument: LegalDocument = {
  title: 'Avvertenze',
  updated: 'Aggiornate: agosto 2026',
  intro:
    'SYDERA è uno strumento di esplorazione personale basato sui sistemi simbolici tradizionali dell’astrologia occidentale e della numerologia pitagorica.',
  sections: [
    {
      title: 'Natura simbolica',
      paragraphs: [
        'Astrologia e numerologia non sono metodi predittivi scientificamente validati. I risultati sono forniti a scopo informativo, culturale, di intrattenimento e di riflessione personale.',
        'Le posizioni astronomiche e i risultati numerici derivano da calcoli matematici verificabili, ma la loro interpretazione appartiene a tradizioni simboliche e non costituisce prova scientifica riguardo a personalità, compatibilità o eventi futuri.',
      ],
    },
    {
      title: 'Nessuna consulenza professionale',
      paragraphs: [
        'SYDERA non fornisce consulenza medica, psicologica, psichiatrica, finanziaria, di investimento, legale, lavorativa o di altro tipo professionale.',
        'L’applicazione non formula diagnosi mediche o psicologiche e non deve essere utilizzata per stabilire se una persona presenti una condizione di salute fisica o mentale.',
      ],
    },
    {
      title: 'Decisioni personali',
      paragraphs: [
        'Non basare decisioni importanti di carattere personale, sanitario, finanziario, legale o professionale unicamente sui risultati di SYDERA. Ogni decisione resta responsabilità dell’utente.',
        'Nei limiti consentiti dalla legge applicabile, lo sviluppatore non è responsabile per decisioni, azioni, perdite o conseguenze derivanti dall’affidamento alle interpretazioni simboliche fornite dall’applicazione.',
      ],
    },
    {
      title: 'Limiti dichiarati',
      paragraphs: [
        'SYDERA non descrive eventi futuri come certi e non produce interpretazioni destinate a spaventare o condizionare chi legge.',
        'Quando un calcolo non può essere eseguito in modo affidabile con le informazioni disponibili, l’applicazione lo dichiara esplicitamente invece di produrre un risultato inventato: senza ora di nascita non calcola Ascendente, Medio Cielo e case, e senza nome non calcola la numerologia.',
        'La precisione del calcolo non è la precisione del dato inserito: un’ora di nascita arrotondata rende l’Ascendente incerto di diversi gradi, e SYDERA lo dichiara.',
      ],
    },
  ],
}

export const aboutDocument: LegalDocument = {
  title: 'Informazioni su SYDERA',
  updated: 'Informazioni sull’applicazione',
  intro:
    'SYDERA è un’applicazione web progressiva locale dedicata all’analisi simbolica personale: astrologia occidentale e numerologia pitagorica, con calcoli trasparenti e ispezionabili.',
  sections: [
    { title: 'Progetto', paragraphs: ['Ideazione, progettazione e sviluppo: Alessandro Pezzali.'] },
    {
      title: 'Principi',
      paragraphs: [
        'Correttezza del calcolo prima dell’effetto visivo, privacy prima della comodità, funzionamento locale prima dei servizi remoti.',
      ],
      bullets: [
        'Calcoli deterministici e riproducibili.',
        'Separazione esplicita fra dato calcolato e lettura simbolica.',
        'Funzionamento offline dopo l’installazione.',
        'Nessun costo di esercizio e nessun servizio esterno a pagamento.',
      ],
    },
    {
      title: 'Come sono validati i calcoli',
      paragraphs: [
        'Le posizioni planetarie sono confrontate con i valori indipendenti del sistema Horizons del Jet Propulsion Laboratory; l’obliquità con il polinomio IAU 2006; Ascendente, Medio Cielo e cuspidi con le loro definizioni geometriche. Le tolleranze sono fissate prima dell’implementazione e gli scostamenti osservati sono riportati nella suite di test.',
      ],
    },
    {
      title: 'Componenti di terze parti',
      paragraphs: [
        'Le posizioni planetarie usano Astronomy Engine (licenza MIT). L’archivio dei luoghi deriva da GeoNames, © GeoNames, distribuito con licenza Creative Commons Attribution 4.0. I fusi orari storici provengono dal database IANA incluso nel browser. L’elenco completo è nel file THIRD_PARTY_NOTICES.md del progetto.',
      ],
    },
    {
      title: 'Tecnologia',
      paragraphs: [
        'React, TypeScript e Vite; IndexedDB per l’analisi, localStorage per le sole preferenze, service worker per il funzionamento offline. Nessuna dipendenza a pagamento, nessun servizio di intelligenza artificiale esterno.',
      ],
    },
  ],
}
