/**
 * What SYDERA says about a person, in Italian.
 *
 * This file holds complete, editorially written sentences — not fragments to
 * be assembled. Each one is attached to a tendency or to a pair of tendencies
 * that the calculated evidence has to support before it can be used, so the
 * text stays specific without ever being generated at runtime.
 *
 * Two rules govern every sentence here:
 *
 *   1. It says something about the reader, never about SYDERA. No mention of
 *      planets, numbers, systems, indicators or evidence.
 *   2. It could not be said of almost everybody. A sentence that fits anyone
 *      does not belong in a personal reading.
 */
import type { TendencyId } from '../core/interpretation/person.ts'

export interface TendencyVoice {
  /** Opens the portrait: the dominant way of approaching things. */
  readonly lead: string
  /** What the person is actually after, under the way they behave. */
  readonly drive: string
  /** Follows the lead: the second strongest motivation. */
  readonly second: string
  /** The nuance that keeps the portrait from being generic. */
  readonly hidden: string
  /** How the person thinks, decides, works. */
  readonly thinking: string
  /** Emotional needs, closeness and distance, how bonds form. */
  readonly relating: string
}

export const voice: Readonly<Record<TendencyId, TendencyVoice>> = Object.freeze({
  autonomia: {
    lead: 'Decidi con la tua testa e fai fatica ad andare dietro a una strada che non hai scelto tu.',
    drive: 'Quello che ti muove davvero è non dover rendere conto: preferisci la responsabilità di una scelta tua all’aiuto che arriva con delle condizioni.',
    second: 'Ti serve poter fare le cose a modo tuo, senza dover chiedere permesso a ogni passaggio.',
    hidden: 'Quello che si vede meno è che il giudizio di due o tre persone precise ti pesa parecchio, anche se non lo dai a vedere.',
    thinking:
      'Ti fidi soprattutto di quello che hai verificato di persona, e un consiglio ti convince solo se ti torna. Quando c’è da muoversi parti per conto tuo, invece di aspettare che si mettano tutti d’accordo.',
    relating:
      'Nei rapporti ti serve uno spazio tuo, e lo difendi anche con le persone a cui tieni. Non è distanza: ti senti vicino a qualcuno solo quando non ti senti obbligato.',
  },
  struttura: {
    lead: 'Hai bisogno di sapere come stanno le cose prima di muoverti, e stai meglio quando c’è un ordine chiaro.',
    drive: 'Quello che cerchi è sapere di potertela cavare: se una cosa è preparata bene, non ti prende di sorpresa.',
    second: 'L’approssimazione ti dà fastidio, e tendi a mettere le cose in fila prima di cominciare.',
    hidden: 'Si nota poco quanta energia spendi per tenere tutto in piedi, anche quando nessuno te lo ha chiesto.',
    thinking:
      'Prima di decidere vuoi capire come funziona una cosa, e le scelte prese di fretta ti lasciano a disagio. Rendi molto quando puoi seguire un metodo tuo senza che qualcuno ti stia addosso.',
    relating:
      'Nei rapporti conti sulla continuità più che sulle dichiarazioni: ti fidi di chi c’è anche quando non serve niente. Le promesse ti dicono poco, gli appuntamenti mantenuti parecchio.',
  },
  concretezza: {
    lead: 'Vai al sodo: ti interessa quello che funziona davvero, non l’idea di come dovrebbe funzionare.',
    drive: 'Quello che ti muove è vedere un effetto: se una cosa cambia qualcosa ti interessa, se resta un discorso molto meno.',
    second: 'Giudichi dai risultati, e le parole senza seguito ti stancano in fretta.',
    hidden: 'Si nota poco che quando una cosa non si può risolvere subito tendi ad accantonarla, e non è sempre perché non ti interessa.',
    thinking:
      'Ragioni per cose fatte: una soluzione ti convince quando la vedi reggere. Davanti a un problema parti da quello che si può sistemare subito, e il resto lo affronti dopo.',
    relating:
      'Nei rapporti dimostri più che dire: ti muovi, risolvi, ci sei. È una cosa di cui le persone si accorgono col tempo, non subito.',
  },
  analisi: {
    lead: 'Noti facilmente quello che non torna, e ti riesce difficile lasciar perdere finché non hai capito perché.',
    drive: 'Quello che cerchi è che le cose abbiano un senso: non ti basta che funzionino, vuoi sapere perché.',
    second: 'Ti serve capire come funziona una cosa prima di considerarla chiusa.',
    hidden: 'Sotto l’aria lucida ci sono cose che ti toccano molto più di quanto tu lasci intendere.',
    thinking:
      'Vedi i dettagli che agli altri sfuggono e ti accorgi presto quando un ragionamento fa acqua. Il rovescio è che a volte continui a limare qualcosa che era già a posto.',
    relating:
      'Nei rapporti osservi a lungo prima di esporti, e ti apri con una persona alla volta. Quando poi ti fidi lo fai sul serio, ed è per questo che tradire la tua fiducia costa caro.',
  },
  espressione: {
    lead: 'Hai bisogno di dire la tua e di metterci qualcosa di tuo in quello che fai.',
    drive: 'Quello che ti muove è lasciare un segno riconoscibile: ti dà fastidio fare una cosa che avrebbe potuto fare chiunque.',
    second: 'Le parole ti vengono facili, e spesso sei tu a dare il tono a una conversazione.',
    hidden: 'Si vede poco che dietro il tuo modo sciolto di parlare c’è più attenzione a come vieni giudicato di quanto sembri.',
    thinking:
      'Le cose ti si chiariscono mentre le racconti: se puoi parlare di un problema con qualcuno, lo capisci meglio. Le idee ti arrivano in fretta, e il difficile è sceglierne una.',
    relating:
      'Nei rapporti hai bisogno di scambio: il silenzio prolungato ti pesa più di una discussione aperta. Preferisci chiarire subito, anche a costo di alzare un po’ la voce.',
  },
  relazione: {
    lead: 'Le persone a cui tieni pesano nelle tue scelte, anche in quelle che sembrano soltanto tue.',
    drive: 'Quello che conta per te è che qualcuno ci sia davvero: le cose fatte da solo ti soddisfano meno, anche quando riescono.',
    second: 'Tenere conto degli altri ti viene naturale, spesso prima di tenere conto di te.',
    hidden: 'Meno visibile è quanto ti costa dire di no a qualcuno che conta per te.',
    thinking:
      'Prima di decidere ti chiedi che effetto avrà sulle persone intorno, e questo a volte rallenta scelte che sarebbero semplici. Lavori meglio quando hai qualcuno con cui confrontarti davvero.',
    relating:
      'Nei legami importanti ti esponi sul serio, ed è per questo che ci metti tempo a scegliere di chi fidarti. Quando qualcuno entra, però, resta a lungo.',
  },
  sensibilita: {
    lead: 'Senti le cose prima di spiegartele: l’atmosfera di un posto o l’umore di una persona ti arrivano subito.',
    drive: 'Quello che cerchi è che una situazione sia vera: le cose di facciata le riconosci subito e ti pesano.',
    second: 'Ti accorgi presto di come sta chi hai davanti, spesso prima che lo dica.',
    hidden: 'Si vede poco che ti serve del tempo da solo per rimettere a posto quello che hai assorbito.',
    thinking:
      'Molte delle tue decisioni le prendi a naso, e di solito il naso ci prende; il problema arriva quando devi spiegare perché. In un ambiente teso rendi molto meno, anche se il lavoro è identico.',
    relating:
      'Hai bisogno di sentirti al sicuro prima di aprirti, e con le persone giuste diventi molto presente. Quando invece qualcosa non ti convince lo senti subito, molto prima di riuscire a dire che cosa.',
  },
  cambiamento: {
    lead: 'Ti annoi in fretta e cerchi movimento: quello che resta uguale troppo a lungo smette di interessarti.',
    drive: 'Quello che ti muove è la possibilità di un’altra strada: sapere di poter cambiare ti serve anche quando poi resti.',
    second: 'Cambiare strada non ti spaventa, soprattutto quando quella di prima non porta da nessuna parte.',
    hidden: 'Meno evidente è che dietro il tuo bisogno di muoverti c’è soprattutto quello di non restare incastrato.',
    thinking:
      'Vedi presto le alternative e ti viene naturale proporre un altro modo di fare le cose. La parte difficile è chiudere quello che hai cominciato prima che arrivi l’idea successiva.',
    relating:
      'Nei rapporti hai bisogno che le cose restino vive: la routine ti pesa più della lontananza. Un rapporto che ti lascia crescere lo tieni; uno che ti chiede di stare fermo prima o poi lo lasci andare.',
  },
})

/**
 * The balance point: the strongest interaction between the two leading
 * tendencies, written once for each pair.
 *
 * Keyed by the two identifiers in alphabetical order. Every pair is written,
 * so the section is never filled with something vaguer than the evidence.
 * Each entry has to leave the reader with one idea they could repeat.
 */
export const balance: Readonly<Record<string, string>> = Object.freeze({
  'analisi|autonomia':
    'Vuoi capire le cose da solo, e non ti basta che una risposta arrivi da qualcuno di autorevole: deve reggere quando la controlli tu. Questo ti rende difficile da convincere, ma anche difficile da fregare. Il punto non è fidarti di meno, è accorgerti di quando stai rifacendo da capo un lavoro già fatto bene da altri.',
  'analisi|cambiamento':
    'Ti accorgi in fretta di quello che non funziona e altrettanto in fretta vorresti cambiarlo. Le due cose insieme ti fanno vedere prima degli altri dove sta il problema, ma ti spingono anche a rifare quando basterebbe correggere. Il punto è distinguere ciò che va ripensato da ciò che va solo finito.',
  'analisi|concretezza':
    'Vuoi capire come funziona una cosa, ma solo fino al punto in cui serve a farla funzionare davvero. È una combinazione efficace: eviti sia le soluzioni improvvisate sia le discussioni che non portano da nessuna parte. Il rischio è fermarti a ciò che si può misurare e scartare troppo presto quello che non si lascia misurare.',
  'analisi|espressione':
    'Capisci le cose a fondo e sai anche spiegarle, che è una combinazione più rara di quanto sembri. Il rischio è opposto ai due estremi: parlare prima di aver capito, oppure aspettare di aver capito tutto e non dire niente. Quando trovi la misura, sei la persona a cui gli altri chiedono di chiarire una faccenda ingarbugliata.',
  'analisi|relazione':
    'Guardi le persone con attenzione e ti accorgi di parecchie cose, ma quello che noti riguarda gente a cui tieni, e questo rende la lucidità più scomoda. Il punto non è smettere di vedere: è decidere quando dire quello che hai visto e quando tenerlo per te.',
  'analisi|sensibilita':
    'Da una parte vuoi spiegarti le cose, dall’altra le senti prima di riuscire a spiegartele. Le due cose non vanno d’accordo: la testa chiede una ragione, la pancia ha già deciso. Nella pratica funzioni meglio quando ti concedi di partire da quello che senti e usi la testa dopo, per verificarlo — non prima, per autorizzarlo.',
  'analisi|struttura':
    'Vuoi capire come funziona una cosa e vuoi anche che stia in ordine, e le due cose si sostengono: arrivi a soluzioni solide, che poi reggono. Il rovescio è che alzi l’asticella su te stesso più di quanto faresti con chiunque altro, e consideri finito solo quello che è finito bene.',
  'autonomia|cambiamento':
    'Decidi da solo e ti muovi spesso, e questo ti tiene lontano dalle situazioni in cui ci si adegua senza accorgersene. Il prezzo è la continuità: quello che costruisci ha bisogno di tempo, e il tempo è proprio la cosa che ti stanca. Il punto è capire a che cosa vale la pena restare.',
  'autonomia|concretezza':
    'Vuoi decidere tu e vuoi vedere risultati, il che ti rende una persona che le cose le porta a casa. Il rischio è chiedere aiuto tardi, quando la faccenda è già più complicata di quanto sarebbe stata.',
  'autonomia|espressione':
    'Dici quello che pensi e non ti va di smussarlo troppo, e questo ti rende chiaro ma non sempre comodo. Il punto non è addolcire il contenuto: è accorgerti che il tono decide se quello che dici arriva o rimbalza.',
  'autonomia|relazione':
    'Hai bisogno di decidere da solo, e allo stesso tempo le persone a cui tieni pesano molto in quello che scegli. Non sembra una questione di scegliere fra libertà e vicinanza: piuttosto di tenere le due cose insieme senza sentirti né trattenuto né lontano. Quando ci riesci sei presente davvero; quando non ci riesci ti allontani per non doverne parlare.',
  'autonomia|sensibilita':
    'Ti muovi per conto tuo, ma assorbi molto più di quanto lasci vedere, e le due cose si scontrano: l’indipendenza dice di andare avanti, la sensibilità chiede di fermarsi. Stare da solo ti serve davvero, ma serve come recupero, non come risposta a tutto.',
  'autonomia|struttura':
    'Vuoi fare a modo tuo, e il tuo modo è ordinato: non è insofferenza alle regole, è insofferenza alle regole degli altri. Funzioni bene quando ti lasciano il metodo e ti danno l’obiettivo. Funzioni male quando succede il contrario, e in quel caso si vede subito.',
  'cambiamento|concretezza':
    'Ti interessa cambiare, ma solo se il cambiamento produce qualcosa di reale: le novità che restano discorsi ti stancano quanto la routine. È un buon filtro, e ti risparmia parecchie perdite di tempo. Il rischio è scartare un’idea prima che abbia avuto modo di diventare qualcosa.',
  'cambiamento|espressione':
    'Le idee ti arrivano in fretta e ti viene naturale raccontarle, così ti trovi spesso a essere quello che apre una strada nuova. Il difficile viene dopo: restare abbastanza a lungo su una sola cosa perché diventi qualcosa.',
  'cambiamento|relazione':
    'Hai bisogno di movimento, ma le persone a cui tieni sono la cosa che ti fa restare. Il punto non è scegliere fra le due: è portare le persone dentro i tuoi cambiamenti invece di cambiare e poi spiegarlo a cose fatte.',
  'cambiamento|sensibilita':
    'Ti muovi spesso e senti molto, e ogni cambiamento ti costa più di quanto ammetti: parte di te lo cerca, parte di te ne paga il conto. Ti conviene cambiare meno cose per volta, non perché tu non sappia farlo, ma perché così te le godi invece di subirle.',
  'cambiamento|struttura':
    'Vuoi cambiare le cose, ma vuoi anche sapere dove metti i piedi. Non è una contraddizione: è il motivo per cui i tuoi cambiamenti funzionano più spesso di quelli fatti d’impulso. Il rischio è preparare così bene una novità da farla arrivare quando non serve più.',
  'concretezza|espressione':
    'Sai raccontare le cose e sai anche farle, e questo ti rende credibile in modo diverso da chi sa solo una delle due. Il punto è non promettere alla velocità con cui parli, perché poi sei tu quello che deve mantenere.',
  'concretezza|relazione':
    'Il tuo modo di voler bene passa dalle cose fatte più che dalle parole: risolvi, ti occupi, ci sei. Funziona con chi ti conosce; con chi non ti conosce ancora rischia di non arrivare. A volte una frase detta vale quanto tre problemi risolti.',
  'concretezza|sensibilita':
    'Da fuori sembri pratico, e lo sei; dentro registri molto più di quanto mostri. La combinazione ti rende affidabile nei momenti difficili, perché capisci che cosa serve e lo fai. Il conto arriva dopo, e conviene che tu lo sappia in anticipo.',
  'concretezza|struttura':
    'Ordine e risultati vanno insieme in te: quello che costruisci sta in piedi, e di solito sta in piedi anche fra qualche anno. È la tua forza più riconoscibile. Il rovescio è che ti muovi tardi quando qualcosa va cambiato, perché ti è costato fatica.',
  'espressione|relazione':
    'Le parole e le persone vanno insieme: comunichi bene perché ti interessa davvero chi hai davanti. È il motivo per cui gli altri ti si aprono. Il punto è accorgerti di quando stai adattando quello che dici per non dispiacere a nessuno.',
  'espressione|sensibilita':
    'Senti molto e hai bisogno di dirlo, e quando le due cose vanno insieme arrivi alle persone in modo diretto. Il rischio è dire troppo presto, a chi non era il destinatario giusto, e poi pentirtene.',
  'espressione|struttura':
    'Hai cose da dire e vuoi anche dirle bene, e questo rende quello che comunichi chiaro e ordinato. Il rovescio è che rimandi finché non è a posto, e a volte il momento buono per dirlo era prima.',
  'relazione|sensibilita':
    'Senti molto e le persone contano molto: è la combinazione che ti rende presente per gli altri, spesso più di quanto loro siano per te. Il punto è capire dove finisci tu e dove comincia quello che stai portando per conto di qualcun altro.',
  'relazione|struttura':
    'Ti prendi cura delle persone in modo organizzato: ti ricordi, ti occupi, mantieni. È una forma di affetto che si vede poco ma pesa. Il rischio è trasformare i rapporti in cose da gestire, e stancarti senza dirlo.',
  'sensibilita|struttura':
    'Senti molto e per questo hai bisogno di ordine: il metodo non è freddezza, è il modo in cui tieni sotto controllo quello che ti arriva addosso. Funziona finché l’ordine resta uno strumento. Quando diventa l’obiettivo, ti irrigidisci proprio nei momenti in cui avresti bisogno del contrario.',
})

/**
 * The current period, in everyday words.
 *
 * Descriptive, never predictive: what the period tends to emphasise, not what
 * is going to happen. Keyed by the calculated personal year.
 */
export const moment: Readonly<Record<number, string>> = Object.freeze({
  1: 'È un periodo in cui conviene cominciare le cose invece di aspettare il momento giusto. Quello che parte adesso tende a portarti lontano dal punto in cui eri.',
  2: 'È una fase più lenta, in cui le cose maturano attraverso gli altri più che per spinta tua. Andare piano adesso non è tempo perso.',
  3: 'È un periodo in cui hai più voglia di dire, mostrare e stare in mezzo alle persone. Il rischio è disperderti fra troppe cose insieme.',
  4: 'È un periodo di lavoro poco appariscente, in cui si mettono le basi di qualcosa che si vedrà più avanti. La fatica di adesso è quella che regge nel tempo.',
  5: 'È una fase di movimento: poche cose restano ferme, e conviene lasciare spazio all’imprevisto invece di programmare tutto.',
  6: 'È un periodo in cui pesano di più i legami, la casa e le responsabilità verso qualcuno. Le decisioni importanti passano dalle persone.',
  7: 'È una fase più raccolta, in cui hai bisogno di capire prima di muoverti. Stare un po’ in disparte adesso è utile, e non è isolamento.',
  8: 'È un periodo in cui quello che hai costruito prima comincia a rendere, e in cui conviene occuparsi del lato concreto delle cose. Quello che chiedi adesso ha più probabilità di essere ascoltato.',
  9: 'È una fase di chiusura: qualcosa arriva alla fine, e lasciarlo andare fa spazio a quello che viene dopo. Non è il momento migliore per partire da zero.',
  11: 'È un periodo in cui percepisci più del solito e in cui le cose ti arrivano prima di poterle spiegare. Fidarti di quello che senti e verificarlo con calma funziona meglio che forzare.',
  22: 'È un periodo in cui puoi mettere in piedi qualcosa di grosso, a patto di procedere per gradi. Qui l’ambizione regge solo se poggia su un lavoro ordinato.',
  33: 'È un periodo in cui quello che fai riguarda gli altri più del solito. Il peso si sente, ma è il tipo di peso che dà senso alle cose.',
})

/**
 * How the leading tendency behaves once the second one acts on it.
 *
 * This is where the portrait starts, and it is deliberately keyed to a pair
 * rather than to one tendency. Writing the opening from the strongest trait
 * alone meant two people who shared it opened with the same two sentences,
 * whatever else was true of them: the reading described a category, not a
 * person. A trait says little on its own — sensitivity checked against
 * evidence and sensitivity kept to oneself are not the same way of being.
 *
 * Ordered: `combination.sensibilita.analisi` is sensitivity as analysis shapes
 * it, which is not the same statement as analysis shaped by sensitivity.
 */
export const combination: Readonly<Record<TendencyId, Readonly<Partial<Record<TendencyId, string>>>>> = Object.freeze({
  autonomia: {
    struttura:
      'Decidi con la tua testa, e il tuo modo di farlo è ordinato: non è insofferenza alle regole, è insofferenza alle regole scritte da altri.',
    concretezza:
      'Decidi da solo e giudichi dai risultati: quello che funziona lo tieni, quello che ti viene raccomandato senza prove no.',
    analisi:
      'Decidi con la tua testa perché prima vuoi capire: una risposta ti convince quando la controlli tu, non quando arriva da qualcuno di autorevole.',
    espressione:
      'Decidi per conto tuo e lo dici: raramente scopri di aver pensato una cosa e detta un’altra.',
    relazione:
      'Decidi da solo, ma su chi ricadranno le conseguenze ci pensi prima: l’indipendenza non ti rende distratto rispetto alle persone.',
    sensibilita:
      'Decidi da solo e senti molto: gran parte di quello che ti fa scegliere non lo dici, e a volte non sapresti spiegarlo neanche a te stesso.',
    cambiamento:
      'Decidi da solo e cambi strada spesso: nessuno ti convince a restare dove non ha più senso, e il prezzo lo paghi in continuità.',
  },
  struttura: {
    autonomia:
      'Ti serve un ordine chiaro, ma dev’essere il tuo: segui volentieri un metodo, molto meno un metodo imposto.',
    concretezza:
      'Metti le cose in ordine per farle funzionare: l’organizzazione non ti interessa in sé, ti interessa perché quello che prepari bene poi regge.',
    analisi:
      'Vuoi che le cose stiano in ordine e vuoi sapere perché ci stanno: non ti basta che un metodo funzioni, vuoi sapere dove si rompe.',
    espressione:
      'Prepari bene e poi lo dici bene: quello che presenti è chiaro perché prima l’hai messo in fila tu.',
    relazione:
      'Ti organizzi soprattutto attorno alle persone: ricordare, occuparsi, mantenere è il modo in cui tieni ai rapporti.',
    sensibilita:
      'Ti serve ordine perché senti molto: il metodo non è freddezza, è come tieni sotto controllo quello che ti arriva addosso.',
    cambiamento:
      'Vuoi cambiare le cose sapendo dove metti i piedi: i tuoi cambiamenti riescono più spesso di quelli fatti d’impulso, e arrivano più tardi.',
  },
  concretezza: {
    autonomia:
      'Vai al sodo e ci vai da solo: chiedi aiuto tardi, quando la faccenda è già più complicata di quanto sarebbe stata.',
    struttura:
      'Vai al sodo con metodo: quello che costruisci sta in piedi, e di solito sta in piedi anche fra qualche anno.',
    analisi:
      'Vuoi risultati, ma non prima di aver capito il meccanismo: eviti sia le soluzioni improvvisate sia le discussioni che non portano da nessuna parte.',
    espressione:
      'Fai le cose e le sai raccontare: è una combinazione che ti rende credibile, a patto di non promettere alla velocità con cui parli.',
    relazione:
      'Il tuo modo di tenere alle persone passa dalle cose fatte: risolvi, ti occupi, ci sei, e chi non ti conosce ancora rischia di non accorgersene.',
    sensibilita:
      'Da fuori sembri pratico e lo sei, ma registri molto più di quanto mostri: il conto di quello che assorbi lo paghi dopo.',
    cambiamento:
      'Ti interessa cambiare, ma solo se il cambiamento produce qualcosa di reale: le novità che restano discorsi ti stancano quanto la routine.',
  },
  analisi: {
    autonomia:
      'Noti quello che non torna e vuoi verificarlo da solo: sei difficile da convincere, e altrettanto difficile da fregare.',
    struttura:
      'Noti quello che non torna e non lo lasci lì: metti a posto, e quello che sistemi tende a restare sistemato.',
    concretezza:
      'Noti quello che non torna, ma solo fino al punto in cui serve: capire ti interessa se poi cambia qualcosa.',
    espressione:
      'Capisci le cose a fondo e le sai spiegare, che è più raro di quanto sembri: il rischio è aspettare di aver capito tutto e non dire niente.',
    relazione:
      'Guardi le persone con attenzione e ti accorgi di parecchio: quello che noti riguarda gente a cui tieni, e questo rende la lucidità scomoda.',
    sensibilita:
      'Vuoi spiegarti le cose, ma le senti prima di riuscirci: la testa cerca una ragione quando la pancia ha già deciso.',
    cambiamento:
      'Vedi in fretta dove una cosa non regge e altrettanto in fretta vorresti rifarla: il lavoro vero è distinguere ciò che va ripensato da ciò che va solo finito.',
  },
  espressione: {
    autonomia:
      'Dici quello che pensi senza smussarlo troppo: sei chiaro, non sempre comodo, e il tono decide se arrivi o rimbalzi.',
    struttura:
      'Hai cose da dire e vuoi dirle bene: rimandi finché non è a posto, e a volte il momento buono per dirle era prima.',
    concretezza:
      'Racconti bene e concludi: la credibilità ti viene dal fatto che quello che dici poi lo fai.',
    analisi:
      'Parli molto ma non a vuoto: quello che dici l’hai già smontato una volta per conto tuo.',
    relazione:
      'Comunichi bene perché ti interessa davvero chi hai davanti: il punto è accorgerti di quando stai adattando quello che dici per non dispiacere.',
    sensibilita:
      'Senti molto e hai bisogno di dirlo: quando le due cose vanno insieme arrivi alle persone, quando vanno di fretta dici troppo presto.',
    cambiamento:
      'Le idee ti arrivano in fretta e le racconti subito: apri strade nuove, e il difficile è restare abbastanza a lungo su una.',
  },
  relazione: {
    autonomia:
      'Le persone contano molto in quello che scegli, ma la scelta resta tua: chiedi di rado il permesso e tieni conto lo stesso.',
    struttura:
      'Tieni alle persone in modo organizzato: ti ricordi, ti occupi, mantieni. Si vede poco e pesa parecchio.',
    concretezza:
      'Vuoi bene facendo: le cose che risolvi per qualcuno dicono più di quelle che gli diresti.',
    analisi:
      'Ti interessano le persone e le osservi a lungo: capisci presto come funziona qualcuno, e non sempre è comodo saperlo.',
    espressione:
      'Ti apri parlando: i rapporti che funzionano per te sono quelli in cui si può dire tutto, e dirlo subito.',
    sensibilita:
      'Senti come stanno le persone quasi prima di loro, e questo ti lega: il rischio è portare pesi che non erano tuoi.',
    cambiamento:
      'Hai bisogno di movimento, e le persone a cui tieni sono la cosa che ti fa restare.',
  },
  sensibilita: {
    autonomia:
      'Senti le cose prima di spiegartele, e quello che senti te lo tieni: decidi in base a qualcosa che racconti raramente.',
    struttura:
      'Senti molto, e per questo ti servono ordine e abitudini: sono il modo in cui tieni sotto controllo quello che ti arriva addosso.',
    concretezza:
      'Percepisci in fretta ma non ti fermi lì: quello che senti lo verifichi su come vanno le cose davvero.',
    analisi:
      'Percepisci in fretta e poi controlli: raramente ti fermi alla prima impressione, anche quando era quella giusta.',
    espressione:
      'Senti molto e hai bisogno di metterlo in parole: capisci quello che provi mentre lo stai raccontando a qualcuno.',
    relazione:
      'Ti accorgi di come sta chi hai davanti quasi subito, e ti lega: gran parte di quello che fai per gli altri parte da lì.',
    cambiamento:
      'Senti molto e ti muovi spesso: ogni cambiamento ti costa più di quanto ammetti, e una parte di te lo cerca lo stesso.',
  },
  cambiamento: {
    autonomia:
      'Ti annoi in fretta e cambi strada da solo: nessuno riesce a trattenerti dove non ha più senso stare.',
    struttura:
      'Cerchi movimento ma non improvvisi: il cambiamento lo prepari, ed è per questo che ti riesce più spesso che agli altri.',
    concretezza:
      'Cerchi novità che producano qualcosa: le idee che restano discorsi le scarti in fretta, a volte prima del tempo.',
    analisi:
      'Cambi perché vedi prima degli altri dove una cosa non regge: il rovescio è rifare quando bastava correggere.',
    espressione:
      'Ti muovi e lo racconti: spesso sei tu a proporre un altro modo di fare le cose, e spesso è qualcun altro a finirlo.',
    relazione:
      'Ti muovi spesso, ma non da solo: nei tuoi cambiamenti provi a portare dentro le persone a cui tieni.',
    sensibilita:
      'Cerchi movimento e senti molto: cambi ambiente più spesso della media, e ogni volta ci metti più tempo del previsto a ricomporti.',
  },
})

/**
 * How someone thinks and works, written from the two strongest practical
 * tendencies rather than from each one separately.
 *
 * The same reasoning as `combination`, one level down: a section built by
 * listing traits one sentence at a time gave two different people the same
 * paragraphs whenever their strongest traits happened to coincide.
 */
export const thinkingPair: Readonly<Record<TendencyId, Readonly<Partial<Record<TendencyId, string>>>>> = Object.freeze({
  analisi: {
    struttura: 'Capisci le cose smontandole e poi rimetti tutto in ordine: quello che hai verificato lo lasci in una forma che regge anche fra un anno.',
    concretezza: 'Indaghi finché la cosa non funziona, e lì ti fermi: la spiegazione perfetta non ti interessa se quella buona basta.',
    espressione: 'Ragioni parlando: smonti un problema meglio se hai qualcuno davanti a cui spiegarlo.',
    cambiamento: 'Ti accorgi presto di dove un ragionamento si rompe e proponi subito un altro modo, a volte prima che il primo avesse finito di provarci.',
    autonomia: 'Verifichi tutto per conto tuo: accetti una conclusione quando l’hai rifatta, non quando te l’hanno spiegata bene.',
  },
  struttura: {
    analisi: 'Organizzi e nel farlo capisci: il tuo metodo nasce da come le cose funzionano davvero, non da come si fa di solito.',
    concretezza: 'Prepari perché poi le cose vadano: l’ordine, per te, è quello che riduce il numero di sorprese.',
    espressione: 'Metti in fila e poi spieghi: quando presenti qualcosa si capisce, perché la fatica l’hai fatta prima.',
    cambiamento: 'Cambi le cose con un piano: prepari a lungo, poi ti muovi in fretta, e agli altri sembra improvviso.',
    autonomia: 'Lavori bene quando ti danno l’obiettivo e ti lasciano il metodo: quando succede il contrario si vede subito.',
  },
  concretezza: {
    analisi: 'Fai, ma prima capisci quanto basta: parti da quello che si può sistemare e vai a fondo solo dove serve.',
    struttura: 'Procedi per passi e ognuno regge il successivo: raramente ti trovi a rifare qualcosa perché la base non teneva.',
    espressione: 'Risolvi e lo racconti: quello che hai sistemato lo sai anche spiegare a chi non c’era.',
    cambiamento: 'Provi presto e scarti presto: se una cosa non produce niente in tempi ragionevoli cambi, senza rimpianti.',
    autonomia: 'Ti muovi da solo e concludi: prima di chiedere una mano tenti sempre un giro in più.',
  },
  espressione: {
    analisi: 'Spieghi bene perché prima hai capito bene: quando semplifichi non stai togliendo, stai scegliendo.',
    struttura: 'Dici le cose in ordine: chi ti ascolta segue il ragionamento senza doverlo ricostruire.',
    concretezza: 'Racconti quello che hai fatto, non quello che si potrebbe fare: le tue parole hanno di solito qualcosa dietro.',
    cambiamento: 'Le idee ti arrivano mentre parli: ne apri tre e ne chiudi una, e funziona solo se qualcuno tiene il conto.',
    autonomia: 'Dici la tua anche quando nessuno l’ha chiesta: è il motivo per cui ti si ascolta, e ogni tanto quello per cui si discute.',
  },
  cambiamento: {
    analisi: 'Cambi perché hai visto dove non regge: i tuoi cambi di rotta hanno una ragione, anche quando agli altri sembrano improvvisi.',
    struttura: 'Ti muovi spesso ma non a caso: prima di lasciare una strada hai già guardato la successiva.',
    concretezza: 'Cambi quando il rendimento cala: la noia da sola non ti basta, ti serve vedere che non porta più niente.',
    espressione: 'Proponi molto: sei quello che apre la discussione, e spesso quello che non la chiude.',
    autonomia: 'Cambi da solo e senza chiedere: quando hai deciso che una cosa è finita, è finita.',
  },
  autonomia: {
    analisi: 'Decidi da solo dopo aver controllato: il tuo criterio è tuo perché l’hai costruito, non perché rifiuti quello degli altri.',
    struttura: 'Fai a modo tuo, e il tuo modo è preciso: gli altri lo scoprono quando provano a cambiartelo.',
    concretezza: 'Decidi e fai: la discussione ti interessa poco se non porta a qualcosa entro breve.',
    espressione: 'Decidi da solo e lo comunichi chiaramente: raramente qualcuno resta a chiedersi che cosa hai in mente.',
    cambiamento: 'Ti muovi quando vuoi tu: le situazioni che ti trattengono le lasci prima di quanto gli altri si aspettino.',
  },
  relazione: {},
  sensibilita: {},
})

/** The same, for the way someone is with people. */
export const relatingPair: Readonly<Record<TendencyId, Readonly<Partial<Record<TendencyId, string>>>>> = Object.freeze({
  sensibilita: {
    relazione: 'Ti accorgi presto di come sta chi hai davanti e ti muovi di conseguenza: molte delle cose che fai per gli altri partono da qualcosa che nessuno ti ha detto.',
    autonomia: 'Senti molto e lo tieni per te: ti avvicini alle persone senza raccontare quasi nulla di quello che ti ha fatto avvicinare.',
    espressione: 'Quello che senti hai bisogno di dirlo, e lo dici presto: nei rapporti sei più esposto di quanto vorresti essere.',
  },
  relazione: {
    sensibilita: 'I legami contano molto e li senti addosso: quando qualcosa non va con una persona a cui tieni lo sai prima che ne parliate.',
    autonomia: 'Ci tieni alle persone e vuoi comunque decidere tu: stai vicino a chi non ti chiede di rinunciare a questo.',
    espressione: 'I rapporti che ti riescono sono quelli in cui si parla: quando una cosa si può dire, per te è già mezza risolta.',
  },
  autonomia: {
    sensibilita: 'Nei rapporti ti serve spazio e ti accorgi subito quando qualcuno prova a stringerlo: ti allontani prima ancora di spiegare perché.',
    relazione: 'Difendi il tuo spazio e allo stesso tempo non vuoi perdere nessuno: la distanza che prendi è quasi sempre più corta di come sembra.',
    espressione: 'Nei rapporti dici come stai e che cosa ti serve: chi ti sta accanto non deve indovinare, ma deve accettare che decidi tu.',
  },
  espressione: {
    sensibilita: 'Nei rapporti parli molto e senti molto: il silenzio di qualcuno ti arriva più forte delle sue parole.',
    relazione: 'Parli per restare in contatto: poche persone con cui si parla a lungo valgono, per te, più di molte conoscenze.',
    autonomia: 'Dici quello che pensi anche quando complica le cose: preferisci un rapporto scomodo e chiaro a uno comodo e taciuto.',
  },
  struttura: {},
  concretezza: {},
  analisi: {},
  cambiamento: {},
})
