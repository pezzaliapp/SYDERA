/**
 * Italian user interface strings.
 *
 * All user-facing wording lives here so that a second language can be added
 * later without touching calculation or interpretation logic.
 */
import type { LegalDocument } from './types.ts'

export const it = {
  app: {
    name: 'SYDERA',
    tagline: 'Due sistemi simbolici. Un profilo personale.',
    summary:
      'SYDERA mette a confronto astrologia occidentale e numerologia pitagorica con calcoli trasparenti. I dati restano sul dispositivo.',
  },
  nav: {
    label: 'Navigazione principale',
    home: 'Panoramica',
    profiles: 'Profili',
    privacy: 'Privacy',
    disclaimer: 'Avvertenze',
    about: 'Informazioni',
    settings: 'Impostazioni',
    skipToContent: 'Vai al contenuto principale',
  },
  theme: {
    label: 'Tema',
    system: 'Sistema',
    light: 'Chiaro',
    dark: 'Scuro',
  },
  home: {
    title: 'Panoramica',
    emptyTitle: 'Nessun profilo presente',
    emptyBody:
      'SYDERA parte vuota: nessun profilo di esempio, nessun dato precaricato. Crea un profilo per iniziare l’analisi numerologica.',
    createProfile: 'Crea un profilo',
    statusTitle: 'Stato delle funzioni',
    statusNumerology: 'Numerologia pitagorica',
    statusNumerologyValue: 'Disponibile',
    statusAstrology: 'Astrologia occidentale',
    statusAstrologyValue: 'In valutazione tecnica',
    statusAstrologyNote:
      'Il motore astrologico sarà attivato solo dopo la verifica di accuratezza, licenza e costo zero delle librerie candidate.',
    statusConvergence: 'Convergenze fra i due sistemi',
    statusConvergenceValue: 'Non ancora disponibile',
    storageTitle: 'Dove sono i tuoi dati',
    storageBody:
      'I profili sono salvati in IndexedDB, nel browser di questo dispositivo. Non esiste alcun account e nessun profilo viene inviato a un server SYDERA.',
    profilesTitle: 'Profili salvati',
  },
  profiles: {
    title: 'Profili',
    subtitle: 'I profili restano su questo dispositivo e possono essere eliminati in qualsiasi momento.',
    create: 'Nuovo profilo',
    empty: 'Non hai ancora creato profili.',
    open: 'Apri analisi',
    delete: 'Elimina',
    deleteConfirmTitle: 'Eliminare questo profilo?',
    deleteConfirmBody: 'L’operazione rimuove definitivamente il profilo da questo dispositivo e non può essere annullata.',
    cancel: 'Annulla',
    confirmDelete: 'Elimina definitivamente',
    createdAt: 'Creato il',
    unknownTime: 'Ora di nascita non indicata',
  },
  profileForm: {
    title: 'Nuovo profilo',
    subtitle: 'SYDERA chiede solo i dati necessari ai calcoli richiesti.',
    labelField: 'Etichetta del profilo',
    labelHelp: 'Serve solo a riconoscere il profilo nell’elenco su questo dispositivo.',
    nameField: 'Nome completo di nascita',
    nameHelp:
      'Necessario esclusivamente per la numerologia pitagorica. Non è richiesto per i calcoli astrologici.',
    dateField: 'Data di nascita',
    dateHelp: 'Data civile riportata sul documento di nascita.',
    timeKnownField: 'Conosco l’ora di nascita',
    timeField: 'Ora di nascita (ora locale)',
    timeHelp:
      'L’ora non incide sui calcoli numerologici. Sarà usata dal motore astrologico, quando disponibile, per Ascendente e case.',
    placeField: 'Luogo di nascita',
    placeHelp:
      'Facoltativo in questa fase: senza motore astrologico attivo il luogo non viene utilizzato per alcun calcolo.',
    save: 'Salva profilo',
    cancel: 'Annulla',
    requiredName: 'Inserisci il nome completo di nascita.',
    requiredLabel: 'Inserisci un’etichetta per il profilo.',
    requiredDate: 'Inserisci una data di nascita valida.',
    invalidDate: 'La data indicata non esiste nel calendario.',
    outOfRangeDate: 'La data deve essere compresa fra l’anno 1000 e l’anno 2400.',
    invalidTime: 'Inserisci un’ora valida.',
    privacyReminder:
      'Questi dati vengono salvati soltanto nel browser di questo dispositivo. Puoi eliminarli quando vuoi da Impostazioni.',
  },
  analysis: {
    title: 'Analisi numerologica',
    calculatedLayer: 'Dati calcolati',
    interpretationLayer: 'Lettura simbolica',
    layerNote:
      'I numeri sono il risultato di un calcolo deterministico verificabile. Le letture che li accompagnano appartengono alla tradizione simbolica e non sono un dato scientifico.',
    coreNumbers: 'Numeri fondamentali',
    cycles: 'Cicli personali',
    pinnacles: 'Pinnacoli',
    challenges: 'Sfide',
    method: 'Metodo di calcolo',
    showTrace: 'Mostra il calcolo',
    hideTrace: 'Nascondi il calcolo',
    referenceDate: 'Data di riferimento per i cicli',
    masterNumber: 'Numero maestro',
    notCalculable: 'Calcolo non eseguibile con le informazioni disponibili',
    normalisedName: 'Adattamenti applicati al nome prima del calcolo',
    astrologyPending: 'Sezione astrologica',
    astrologyPendingBody:
      'Il motore astrologico non è ancora attivo. SYDERA non mostra posizioni planetarie stimate o approssimate: finché il calcolo non è affidabile, questa sezione resta vuota.',
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
        'per-word':
          'Ogni parola del nome viene ridotta separatamente e i risultati vengono poi sommati e ridotti.',
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
      masterOn:
        'I totali 11, 22 e 33 vengono conservati come numeri maestri invece di essere ridotti a una sola cifra.',
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
    letterTable: 'Corrispondenza lettere e valori',
    vowel: 'Vocale',
    consonant: 'Consonante',
    ageRange: 'Età',
    fromAge: 'da',
    toAge: 'a',
    onwards: 'in poi',
  },
  settings: {
    title: 'Impostazioni',
    appearance: 'Aspetto',
    data: 'Dati locali',
    dataBody:
      'SYDERA conserva i profili in IndexedDB e alcune preferenze non personali in localStorage. Nessun dato viene inviato all’esterno.',
    profilesStored: 'Profili salvati su questo dispositivo',
    deleteAll: 'ELIMINA TUTTI I MIEI DATI',
    deleteAllTitle: 'Eliminare tutti i dati locali di SYDERA?',
    deleteAllBody:
      'Vengono rimossi tutti i profili salvati e tutte le preferenze dell’applicazione su questo dispositivo. L’operazione è definitiva e non può essere annullata. I file che hai esportato manualmente non vengono toccati.',
    deleteAllConfirm: 'Sì, elimina tutto',
    deleteAllWorking: 'Eliminazione in corso…',
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
  },
  dataDeleted: {
    title: 'Dati eliminati',
    lead:
      'Tutti i dati personali gestiti da SYDERA su questo dispositivo sono stati eliminati in modo definitivo.',
    removedTitle: 'Che cosa è stato eliminato',
    removed: [
      'Tutti i profili salvati, con nome, data, ora e luogo di nascita.',
      'Tutti i risultati numerologici derivati da quei profili.',
      'Tutte le preferenze dell’applicazione, compresa l’accettazione delle avvertenze.',
    ],
    keptTitle: 'Che cosa non è stato toccato',
    kept: [
      'I file che hai esportato volontariamente: non fanno parte dell’archivio dell’applicazione.',
      'La copia offline del programma, che non contiene alcuna informazione personale.',
    ],
    note: 'Selezionando “Continua” SYDERA riparte dalla presentazione iniziale, come al primo avvio.',
    continue: 'Continua',
  },
  onboarding: {
    step: 'Passaggio',
    of: 'di',
    next: 'Continua',
    back: 'Indietro',
    identityTitle: 'SYDERA',
    identityBody:
      'Uno strumento di esplorazione simbolica personale che affianca astrologia occidentale e numerologia pitagorica, distinguendo sempre il calcolo dall’interpretazione.',
    whatTitle: 'Che cosa fa SYDERA',
    whatBullets: [
      'Calcola in modo deterministico i numeri della numerologia pitagorica.',
      'Mostra il procedimento di ogni calcolo, passaggio per passaggio.',
      'Distingue in modo esplicito i dati calcolati dalle letture simboliche.',
      'Funziona offline, senza account e senza server.',
    ],
    privacyTitle: 'Privacy in breve',
    privacyBullets: [
      'I dati inseriti restano nel browser di questo dispositivo.',
      'Nessun account, nessuna registrazione, nessun profilo remoto.',
      'Nessuna pubblicità, nessuna analitica, nessun tracciamento.',
      'Puoi eliminare tutti i dati locali in qualsiasi momento.',
    ],
    privacyLink: 'Leggi l’informativa completa',
    disclaimerTitle: 'Avvertenze da accettare',
    disclaimerLink: 'Leggi le avvertenze complete',
    acknowledge:
      'Ho letto e compreso le avvertenze: astrologia e numerologia non sono metodi predittivi scientificamente validati e SYDERA non fornisce consulenza medica, psicologica, legale o finanziaria.',
    start: 'Inizia',
    acknowledgeRequired: 'Per proseguire è necessario accettare le avvertenze.',
  },
  common: {
    close: 'Chiudi',
    back: 'Indietro',
    notAvailable: 'Non disponibile',
    yes: 'Sì',
    no: 'No',
    loading: 'Caricamento…',
    error: 'Si è verificato un errore',
    storageUnavailable:
      'Questo browser non consente l’accesso all’archivio locale: SYDERA non può salvare profili in questa modalità.',
    updateAvailable: 'È disponibile una nuova versione di SYDERA.',
    updateAction: 'Aggiorna',
  },
} as const

export const privacyDocument: LegalDocument = {
  title: 'Informativa privacy',
  updated: 'Aggiornata: agosto 2026',
  intro:
    'Questa informativa descrive il comportamento tecnico reale dell’applicazione. Se in futuro l’architettura dovesse cambiare, l’informativa sarà aggiornata prima della pubblicazione della nuova versione.',
  sections: [
    {
      title: 'Trattamento locale',
      paragraphs: [
        'SYDERA è un’applicazione locale. I dati che inserisci vengono elaborati dal browser sul tuo dispositivo e non vengono trasmessi intenzionalmente ad alcun server SYDERA.',
      ],
      bullets: [
        'Nessun account e nessuna registrazione.',
        'Nessun profilo personale su server remoti.',
        'Nessuna pubblicità, analitica, telemetria o profilazione.',
        'Nessuno script di tracciamento di terze parti.',
      ],
    },
    {
      title: 'Dati raccolti',
      paragraphs: [
        'SYDERA chiede solo le informazioni necessarie al calcolo richiesto: un’etichetta per riconoscere il profilo, il nome completo di nascita (necessario esclusivamente per la numerologia) e la data di nascita. Ora e luogo di nascita sono facoltativi e servono al futuro motore astrologico.',
        'Non vengono richiesti indirizzo e-mail, numero di telefono, documenti di identità, account social o password.',
      ],
    },
    {
      title: 'Dove sono conservati i dati',
      paragraphs: [
        'I profili sono salvati in IndexedDB, l’archivio strutturato del browser. Alcune preferenze non personali dell’applicazione (tema, avvenuta accettazione delle avvertenze) sono salvate in localStorage.',
        'La cache offline del service worker contiene solo i file dell’applicazione: nessuna informazione personale viene memorizzata in quella cache.',
      ],
    },
    {
      title: 'Cancellazione',
      paragraphs: [
        'Puoi eliminare un singolo profilo dall’elenco dei profili oppure rimuovere tutti i dati locali dalla sezione Impostazioni, con il comando “Elimina tutti i miei dati”.',
        'La cancellazione rimuove il database dei profili e le preferenze dell’applicazione. I file che hai esportato volontariamente non fanno parte dell’archivio dell’applicazione e non vengono modificati.',
        'L’eliminazione viene confermata soltanto quando è stata effettivamente completata. Se SYDERA è aperta in un’altra scheda o finestra, il browser rinvia l’operazione: in quel caso non viene eliminato nulla e l’applicazione ti chiede di chiudere le altre schede e riprovare.',
      ],
    },
    {
      title: 'Connessioni di rete',
      paragraphs: [
        'L’applicazione viene scaricata dal sito che la ospita e poi funziona offline. Non contiene font remoti, script esterni o chiamate ad API di terze parti.',
        'SYDERA non vende informazioni personali e non le utilizza per finalità pubblicitarie.',
      ],
    },
    {
      title: 'Responsabilità dell’utente',
      paragraphs: [
        'Poiché i dati restano sul dispositivo, la loro protezione dipende anche dalle misure di sicurezza del dispositivo e del browser. Chi ha accesso al browser potrebbe accedere ai profili salvati.',
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
        'Le posizioni astronomiche e i risultati numerici possono derivare da calcoli matematici, ma la loro interpretazione appartiene a tradizioni simboliche e non costituisce prova scientifica riguardo a personalità, compatibilità o eventi futuri.',
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
        'Quando un calcolo non può essere eseguito in modo affidabile con le informazioni disponibili, l’applicazione lo dichiara esplicitamente invece di produrre un risultato inventato.',
      ],
    },
  ],
}

export const aboutDocument: LegalDocument = {
  title: 'Informazioni su SYDERA',
  updated: 'Versione 0.1.0 — fase 1',
  intro:
    'SYDERA è un’applicazione web progressiva locale dedicata all’analisi simbolica personale: astrologia occidentale e numerologia pitagorica, con calcoli trasparenti e ispezionabili.',
  sections: [
    {
      title: 'Progetto',
      paragraphs: ['Ideazione, progettazione e sviluppo: Alessandro Pezzali.'],
    },
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
      title: 'Stato di sviluppo',
      paragraphs: [
        'Questa versione implementa il motore di numerologia pitagorica, l’architettura locale dei dati e la struttura dell’applicazione. Il motore astrologico verrà introdotto solo dopo la verifica documentata di accuratezza, licenza e assenza di costi.',
      ],
    },
    {
      title: 'Tecnologia',
      paragraphs: [
        'React, TypeScript e Vite; IndexedDB per i profili, localStorage per le sole preferenze, service worker per il funzionamento offline. Nessuna dipendenza a pagamento, nessun servizio di intelligenza artificiale esterno.',
      ],
    },
  ],
}
