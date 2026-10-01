import type { CuratedTopicSeed } from "./curated-topic-content.js";

/**
 * Curated packages that were missing from the imported material. Every answer
 * is later re-keyed deterministically so the bank does not reveal a pattern.
 */
export const foundationTopics: CuratedTopicSeed[] = [
  {
    order: 1,
    sourceDocuments: [/Constituci[oó]n Politica Colombiana/i],
    sourceText: [/Estado social de derecho|fines esenciales|debido proceso|funci[oó]n administrativa/i],
    preferredNumbers: [/^Artículo 1$/i, /^Artículo 2$/i, /^Artículo 29$/i, /^Artículo 209$/i],
    maxSources: 4,
    studyText: "La Constitución define a Colombia como Estado social de derecho, fija como fines esenciales servir a la comunidad y garantizar los principios y derechos, y somete toda actuación administrativa al debido proceso. La función administrativa está al servicio del interés general y debe desarrollarse con igualdad, moralidad, eficacia, economía, celeridad, imparcialidad y publicidad. En la DIAN estos mandatos orientan tanto una decisión tributaria como la atención al ciudadano.",
    questions: [
      {
        stem: "¿Qué principio constitucional debe respetarse también en una actuación administrativa de la DIAN?",
        options: [{ key: "A", text: "El debido proceso" }, { key: "B", text: "La decisión secreta sin motivación" }, { key: "C", text: "La aplicación retroactiva de una sanción" }, { key: "D", text: "La renuncia del ciudadano a ser oído" }],
        correctAnswer: "A",
        explanation: "El artículo 29 dispone que el debido proceso se aplica a toda clase de actuaciones judiciales y administrativas.",
        errorType: "CONSTITUTIONAL_GUARANTEE",
      },
      {
        stem: "¿Cuál actuación corresponde a los principios constitucionales de la función administrativa?",
        options: [{ key: "A", text: "Decidir con imparcialidad, eficacia y publicidad al servicio del interés general" }, { key: "B", text: "Favorecer a una persona por su relación con el servidor" }, { key: "C", text: "Ocultar la motivación para evitar controversias" }, { key: "D", text: "Retrasar el trámite sin justificación" }],
        correctAnswer: "A",
        explanation: "El artículo 209 vincula la función administrativa al interés general y enumera los principios que orientan su desarrollo.",
        errorType: "PUBLIC_FUNCTION_PRINCIPLE",
      },
    ],
    workedExample: {
      scenario: "Una dependencia va a decidir una actuación que afecta a un contribuyente. El expediente contiene información contradictoria y la persona no ha tenido oportunidad de conocer el elemento nuevo.",
      analysis: "Antes de decidir debe garantizarse el debido proceso: incorporar la información de manera regular, permitir su conocimiento y contradicción y motivar la conclusión. La eficacia administrativa no autoriza a sacrificar las garantías del artículo 29; debe armonizarse con imparcialidad, publicidad y servicio al interés general.",
    },
    applicationCase: {
      scenario: "Un servidor propone dar prioridad a la solicitud de un conocido porque el trámite es sencillo. ¿Cómo debe actuar la oficina?",
      analysis: "Debe aplicar criterios objetivos y el orden o prioridad legalmente establecido. La igualdad, la imparcialidad y la moralidad de la función administrativa impiden conceder ventajas personales. La decisión y su trazabilidad deben poder explicarse frente a cualquier ciudadano.",
    },
  },
  {
    order: 2,
    sourceDocuments: [/Ley-1437-de-2011/i],
    sourceText: [/Principios|Derechos de las personas|Recursos contra los actos administrativos/i],
    preferredNumbers: [/^ARTÍCULO 3$/i, /^ARTÍCULO 5$/i, /^ARTÍCULO 74$/i],
    maxSources: 3,
    studyText: "El CPACA regula la relación entre las personas y las autoridades. Sus actuaciones deben interpretarse con arreglo a principios como debido proceso, igualdad, imparcialidad, buena fe, transparencia, publicidad, coordinación, eficacia, economía y celeridad. Las personas pueden conocer el estado de sus trámites, obtener respuesta y controvertir decisiones; por regla general, contra los actos definitivos proceden los recursos previstos por la ley.",
    questions: [
      {
        stem: "¿Cómo debe interpretar una autoridad las reglas del procedimiento administrativo?",
        options: [{ key: "A", text: "Conforme a los principios del CPACA, incluido el debido proceso y la imparcialidad" }, { key: "B", text: "Según la conveniencia personal del funcionario" }, { key: "C", text: "Prescindiendo de la buena fe" }, { key: "D", text: "Sin considerar la eficacia ni la celeridad" }],
        correctAnswer: "A",
        explanation: "El artículo 3 del CPACA ordena interpretar y aplicar el procedimiento a la luz de sus principios rectores.",
        errorType: "ADMINISTRATIVE_PRINCIPLE",
      },
      {
        stem: "Por regla general, ¿qué mecanismo permite controvertir un acto administrativo definitivo?",
        options: [{ key: "A", text: "Los recursos administrativos que resulten procedentes" }, { key: "B", text: "Una conversación informal sin registro" }, { key: "C", text: "La eliminación del expediente" }, { key: "D", text: "Una petición anónima que sustituya todo recurso" }],
        correctAnswer: "A",
        explanation: "El artículo 74 establece los recursos que, por regla general, proceden contra los actos administrativos definitivos.",
        errorType: "REMEDY_CONFUSION",
      },
    ],
    workedExample: {
      scenario: "Una ciudadana solicita conocer el estado de una actuación y los documentos que la autoridad ha usado para decidir.",
      analysis: "La autoridad debe facilitar el acceso que legalmente proceda, informar el estado del trámite y garantizar que la persona pueda intervenir y controvertir. La actuación se documenta y se impulsa con celeridad, sin desconocer reservas legales específicas.",
    },
    applicationCase: {
      scenario: "Una oficina expide un acto definitivo, pero omite informar si proceden recursos y ante quién deben presentarse.",
      analysis: "Debe corregir la orientación y asegurar una notificación que permita ejercer la defensa. La eficacia del acto no se separa del debido proceso: la persona necesita conocer los mecanismos, autoridad y términos aplicables para controvertir la decisión.",
    },
  },
  {
    order: 3,
    sourceDocuments: [/Ley-1712-de-2014/i],
    sourceText: [/derecho fundamental de acceso|m[aá]xima publicidad|informaci[oó]n exceptuada/i],
    preferredNumbers: [/^ARTÍCULO 3$/i, /^ARTÍCULO 4$/i, /^ARTÍCULO 18$/i, /^ARTÍCULO 19$/i],
    maxSources: 4,
    studyText: "La Ley 1712 desarrolla el derecho de acceso a la información pública bajo el principio de máxima publicidad. La información en poder de un sujeto obligado se presume pública, salvo reserva o excepción constitucional o legal. Una negativa no puede ser genérica: debe identificar el fundamento, demostrar el daño protegido y limitarse en alcance y duración a lo necesario.",
    questions: [
      {
        stem: "¿Cuál es la regla general para la información en poder de una entidad pública?",
        options: [{ key: "A", text: "Se presume pública y accesible, salvo excepción constitucional o legal" }, { key: "B", text: "Siempre es reservada" }, { key: "C", text: "Solo se entrega a servidores públicos" }, { key: "D", text: "Depende de la preferencia de cada oficina" }],
        correctAnswer: "A",
        explanation: "La Ley 1712 parte de máxima publicidad y reconoce el acceso a la información pública como derecho fundamental.",
        errorType: "TRANSPARENCY_PRINCIPLE",
      },
      {
        stem: "¿Qué debe hacer una entidad cuando invoca una excepción al acceso?",
        options: [{ key: "A", text: "Motivar la negativa con la norma aplicable y el daño que se protege" }, { key: "B", text: "Responder que toda información interna es secreta" }, { key: "C", text: "Omitir la respuesta" }, { key: "D", text: "Destruir el documento solicitado" }],
        correctAnswer: "A",
        explanation: "Las excepciones protegen derechos o intereses públicos definidos por la ley y deben aplicarse de manera motivada y restrictiva.",
        errorType: "MISSED_EXCEPTION",
      },
    ],
    workedExample: {
      scenario: "Una persona pide un informe que contiene información pública y algunos datos personales protegidos.",
      analysis: "La entidad no debe negar automáticamente todo el documento. Debe identificar la parte protegida, aplicar la excepción con motivación y entregar una versión pública cuando la separación sea posible, preservando el principio de máxima publicidad.",
    },
    applicationCase: {
      scenario: "Una dependencia rechaza una solicitud afirmando únicamente que el archivo es 'de uso interno'.",
      analysis: "La fórmula es insuficiente. Debe verificar si existe una excepción constitucional o legal, explicar el riesgo o daño protegido y limitar la reserva. Si no existe fundamento válido, procede el acceso; si solo una parte está protegida, debe evaluarse una entrega parcial.",
    },
  },
  {
    order: 4,
    sourceDocuments: [/Ley-1755-de-2015/i],
    sourceText: [/modalidades del derecho de petici[oó]n|T[eé]rminos para resolver|Contenido de las peticiones|sin competencia/i],
    preferredNumbers: [/^ARTÍCULO 13$/i, /^ARTÍCULO 14$/i, /^ARTÍCULO 16$/i, /^ARTÍCULO 21$/i],
    maxSources: 4,
    studyText: "El derecho de petición permite presentar solicitudes respetuosas por motivos de interés general o particular, pedir información, documentos, consultas y actuaciones. Como regla general las peticiones se resuelven en quince días; las de documentos e información, en diez, y las consultas, en treinta. Si la autoridad no es competente debe informar y remitir oportunamente, no abandonar la solicitud.",
    questions: [
      {
        stem: "¿Cuál es el término general para resolver una petición, salvo norma especial?",
        options: [{ key: "A", text: "Quince días" }, { key: "B", text: "Tres días" }, { key: "C", text: "Sesenta días" }, { key: "D", text: "No existe término" }],
        correctAnswer: "A",
        explanation: "El artículo 14 fija quince días como regla general, con términos especiales para información, documentos y consultas.",
        errorType: "DEADLINE_ERROR",
      },
      {
        stem: "¿Qué debe hacer una autoridad que recibe una petición para la cual no es competente?",
        options: [{ key: "A", text: "Informar al interesado y remitirla a la autoridad competente dentro del término legal" }, { key: "B", text: "Archivarla sin aviso" }, { key: "C", text: "Esperar a que venza el término" }, { key: "D", text: "Responder un asunto distinto" }],
        correctAnswer: "A",
        explanation: "El artículo 21 regula la actuación del funcionario sin competencia y evita dejar al peticionario sin ruta de respuesta.",
        errorType: "REMISSION_ERROR",
      },
    ],
    workedExample: {
      scenario: "Una persona solicita copias de documentos públicos y formula además una consulta jurídica general en el mismo escrito.",
      analysis: "La entidad debe identificar las modalidades y aplicar el término correspondiente a cada componente: diez días para documentos e información y treinta para la consulta, sin perjuicio de responder antes. Debe informar con claridad y conservar trazabilidad de la recepción y respuesta.",
    },
    applicationCase: {
      scenario: "Una petición llega incompleta, pero la información faltante puede ser precisada por el interesado y no impide entender su objeto.",
      analysis: "La autoridad debe orientar y aplicar el trámite legal para completar la solicitud, sin rechazarla por formalismos innecesarios. La respuesta debe ser de fondo, clara, precisa y congruente con lo pedido, dentro del término aplicable.",
    },
  },
  {
    order: 5,
    sourceDocuments: [/Constituci[oó]n Politica Colombiana/i, /Cultura de la Contribuci[oó]n en la Escuela/i],
    sourceText: [/sistema tributario|equidad|eficiencia|progresividad|raz[oó]n de ser de los impuestos/i],
    preferredNumbers: [/^Artículo 338$/i, /^Artículo 363$/i, /^Fundamento pedagógico$/i],
    maxSources: 3,
    studyText: "El sistema tributario financia bienes, servicios y fines públicos mediante tributos creados conforme a la Constitución y la ley. Un impuesto no supone una contraprestación individual directa; una tasa se vincula al uso o prestación de un servicio y una contribución responde a un beneficio o finalidad específica. La imposición debe respetar legalidad, equidad, eficiencia y progresividad, y no puede aplicarse retroactivamente.",
    questions: [
      {
        stem: "¿Cuáles principios constitucionales fundamentan el sistema tributario colombiano?",
        options: [{ key: "A", text: "Equidad, eficiencia y progresividad" }, { key: "B", text: "Secreto, arbitrariedad y retroactividad" }, { key: "C", text: "Beneficio individual y gratuidad" }, { key: "D", text: "Preferencia e informalidad" }],
        correctAnswer: "A",
        explanation: "El artículo 363 establece equidad, eficiencia y progresividad como principios del sistema tributario.",
        errorType: "TAX_PRINCIPLE",
      },
      {
        stem: "¿Qué elemento distingue, en términos generales, una tasa de un impuesto?",
        options: [{ key: "A", text: "La tasa se relaciona con la prestación o uso de un servicio; el impuesto no exige contraprestación individual directa" }, { key: "B", text: "La tasa siempre es voluntaria" }, { key: "C", text: "El impuesto solo puede ser territorial" }, { key: "D", text: "No existe diferencia jurídica" }],
        correctAnswer: "A",
        explanation: "La clasificación de los ingresos públicos atiende a la relación entre el pago, el servicio o beneficio y la potestad impositiva.",
        errorType: "CONCEPT_CONFUSION",
      },
    ],
    workedExample: {
      scenario: "Una reforma crea un tributo y define sujeto activo, sujeto pasivo, hecho generador, base gravable y tarifa.",
      analysis: "La lectura debe comenzar por verificar la autoridad que lo creó y cada elemento esencial exigido por la legalidad tributaria. Luego se analiza su incidencia y si el diseño respeta equidad, eficiencia y progresividad, sin confundir esos criterios con la mera cantidad recaudada.",
    },
    applicationCase: {
      scenario: "Una entidad pretende cobrar una suma denominada 'aporte' sin que una norma defina el hecho que la origina ni la forma de calcularla.",
      analysis: "El nombre no resuelve su naturaleza. Debe examinarse si es impuesto, tasa o contribución y verificar competencia y elementos esenciales. Sin fundamento normativo suficiente, la administración no puede crear por instrucción interna una obligación tributaria.",
    },
  },
  {
    order: 6,
    sourceDocuments: [/Decreto-Ley-624-de-1989/i],
    sourceText: [/DIRECCI[ÓO]N PARA NOTIFICACIONES|FORMAS DE NOTIFICACI[ÓO]N|ESP[IÍ]RITU DE JUSTICIA/i],
    preferredNumbers: [/^ARTÍCULO 563$/i, /^ARTÍCULO 565$/i, /^ARTÍCULO 683$/i],
    maxSources: 3,
    studyText: "El procedimiento tributario reúne las reglas mediante las cuales la DIAN administra obligaciones, comunica actuaciones, determina tributos, impone sanciones y permite su discusión. Una actuación válida exige competencia, expediente, notificación conforme a la norma, oportunidad de respuesta, valoración de pruebas y motivación. El espíritu de justicia impide exigir al contribuyente más de aquello con lo que la ley ha querido que contribuya.",
    questions: [
      {
        stem: "¿Para qué sirve la notificación dentro del procedimiento tributario?",
        options: [{ key: "A", text: "Para dar a conocer la actuación y permitir el ejercicio oportuno de defensa" }, { key: "B", text: "Para reemplazar la motivación del acto" }, { key: "C", text: "Para ocultar el expediente" }, { key: "D", text: "Para eliminar los términos legales" }],
        correctAnswer: "A",
        explanation: "Las reglas de dirección y formas de notificación permiten comunicar válidamente las actuaciones de la Administración tributaria.",
        errorType: "NOTIFICATION_ERROR",
      },
      {
        stem: "¿Qué exige el espíritu de justicia del artículo 683 a los funcionarios tributarios?",
        options: [{ key: "A", text: "No exigir al contribuyente más de lo que la ley ha querido que aporte" }, { key: "B", text: "Cobrar siempre el valor más alto posible" }, { key: "C", text: "Prescindir de las pruebas favorables" }, { key: "D", text: "Aplicar sanciones sin procedimiento" }],
        correctAnswer: "A",
        explanation: "El artículo 683 orienta el ejercicio de atribuciones tributarias a una aplicación justa de la ley.",
        errorType: "TAX_JUSTICE",
      },
    ],
    workedExample: {
      scenario: "La DIAN detecta una inconsistencia y prepara un acto que modifica una declaración. El expediente registra una dirección distinta de la informada oficialmente para notificaciones.",
      analysis: "Antes de continuar debe verificarse la dirección aplicable y utilizarse la forma de notificación prevista por el Estatuto. La determinación debe exponer hechos, pruebas y fundamento, y abrir la oportunidad de respuesta. Una conclusión materialmente correcta no subsana una comunicación defectuosa.",
    },
    applicationCase: {
      scenario: "Un funcionario descarta un soporte del contribuyente sin analizarlo porque considera evidente la inconsistencia inicial.",
      analysis: "Debe incorporar y valorar el soporte, motivar por qué lo acepta o descarta y conservar la trazabilidad. El procedimiento no confirma automáticamente la hipótesis inicial; busca determinar la obligación conforme a la ley, al debido proceso y al espíritu de justicia.",
    },
  },
  {
    order: 7,
    sourceDocuments: [/Fundamentos aduaneros/i, /Operaciones cambiarias/i],
    sourceText: [/obligaci[oó]n aduanera|obligatoriamente.*mercado cambiario/i],
    preferredNumbers: [/^Artículo 4$/i, /^Artículo 5$/i, /^Artículo 41$/i],
    maxSources: 3,
    studyText: "El régimen aduanero regula el ingreso, permanencia, traslado y salida de mercancías bajo control de la autoridad aduanera. El régimen cambiario determina cómo se canalizan y reportan operaciones internacionales. Importaciones y exportaciones de bienes, endeudamiento externo, inversiones, avales y derivados están entre las operaciones de cambio que deben canalizarse por el mercado cambiario mediante intermediarios autorizados o cuentas de compensación.",
    questions: [
      {
        stem: "¿Qué aspecto pertenece principalmente al régimen aduanero?",
        options: [{ key: "A", text: "El control del ingreso, permanencia y salida de mercancías" }, { key: "B", text: "La elección de la tasa de interés bancaria" }, { key: "C", text: "La expedición de licencias de conducción" }, { key: "D", text: "La organización de archivos históricos" }],
        correctAnswer: "A",
        explanation: "El Decreto 1165 organiza obligaciones, operaciones y controles relacionados con mercancías bajo potestad aduanera.",
        errorType: "CUSTOMS_CONCEPT",
      },
      {
        stem: "¿Cuál operación debe canalizarse obligatoriamente por el mercado cambiario?",
        options: [{ key: "A", text: "La importación o exportación de bienes" }, { key: "B", text: "Una compra local pagada en pesos entre residentes" }, { key: "C", text: "El pago de un servicio público nacional" }, { key: "D", text: "Una transferencia interna sin componente cambiario" }],
        correctAnswer: "A",
        explanation: "El artículo 41 de la Resolución Externa 1 de 2018 incluye importaciones y exportaciones entre las operaciones obligatoriamente canalizables.",
        errorType: "FX_CHANNEL_ERROR",
      },
    ],
    workedExample: {
      scenario: "Una empresa importa mercancía y debe pagar al proveedor del exterior. Conserva los documentos de la operación y consulta el mecanismo de pago.",
      analysis: "Debe distinguir dos controles relacionados: cumplir la declaración y obligaciones aduaneras de la mercancía y canalizar las divisas por un intermediario del mercado cambiario o una cuenta de compensación registrada. Los soportes deben permitir relacionar el pago con la operación real.",
    },
    applicationCase: {
      scenario: "Un importador propone pagar al proveedor extranjero por medio de una transferencia informal de un tercero para evitar reportes.",
      analysis: "Debe rechazarse esa ruta. La importación es una operación obligatoriamente canalizable; se utiliza un mecanismo autorizado, se reportan los datos exigidos y se conserva la correspondencia entre mercancía, obligación y pago. La facilidad operativa no elimina el control cambiario.",
    },
  },
  {
    order: 8,
    sourceDocuments: [/Estatuto Tributario — Abuso/i, /C[oó]digo Penal — Contrabando/i],
    sourceText: [/ABUSO EN MATERIA TRIBUTARIA|contrabando|evasi[oó]n/i],
    preferredNumbers: [/^Artículo 869$/i, /^Artículo 319$/i],
    maxSources: 2,
    studyText: "La evasión supone ocultar, omitir o falsear hechos para incumplir una obligación tributaria; la elusión puede describir la reducción de carga mediante formas jurídicas, pero se vuelve reprochable cuando configura abuso tributario y carece de propósito económico o comercial real. El contrabando afecta el ingreso o salida de mercancías eludiendo el control aduanero y puede generar consecuencias administrativas y penales. Cada conducta exige identificar hechos, norma y procedimiento aplicable.",
    questions: [
      {
        stem: "¿Qué rasgo caracteriza el abuso en materia tributaria?",
        options: [{ key: "A", text: "El uso artificioso de actos o negocios para obtener un provecho tributario indebido" }, { key: "B", text: "La aplicación literal y transparente de un beneficio que cumple sus requisitos" }, { key: "C", text: "El pago oportuno de la obligación" }, { key: "D", text: "La corrección voluntaria de un error" }],
        correctAnswer: "A",
        explanation: "El artículo 869 permite recaracterizar operaciones abusivas cuando se usan formas artificiosas para obtener un provecho tributario improcedente.",
        errorType: "ABUSE_CONFUSION",
      },
      {
        stem: "¿Qué diferencia al contrabando de una simple inconsistencia formal tributaria?",
        options: [{ key: "A", text: "Se relaciona con mercancías que ingresan o salen eludiendo el control aduanero en los supuestos legales" }, { key: "B", text: "Siempre consiste en pagar un impuesto tarde" }, { key: "C", text: "No involucra mercancías ni fronteras" }, { key: "D", text: "Es una modalidad de petición ciudadana" }],
        correctAnswer: "A",
        explanation: "La legislación anticontrabando y penal tipifica conductas ligadas a mercancías y al control aduanero, con elementos y umbrales que deben verificarse.",
        errorType: "CONTRABAND_CONFUSION",
      },
    ],
    workedExample: {
      scenario: "Una sociedad celebra varias operaciones sin sustancia económica cuya única consecuencia relevante es trasladar artificialmente una renta para reducir el impuesto.",
      analysis: "La revisión debe reconstruir hechos, participantes y propósito económico y contrastarlos con el artículo 869. No toda planeación es abuso, pero una estructura artificiosa que produce un provecho tributario indebido puede ser recaracterizada mediante el procedimiento especial y con garantía de defensa.",
    },
    applicationCase: {
      scenario: "En una bodega se encuentran mercancías extranjeras sin los soportes exigidos y se propone calificarlas inmediatamente como contrabando penal.",
      analysis: "Debe verificarse origen, ingreso, valor, documentos y demás elementos legales antes de calificar la conducta. La falta documental puede activar controles y medidas aduaneras, pero la responsabilidad penal exige comprobar todos los elementos del tipo y respetar la competencia y el debido proceso.",
    },
  },
  {
    order: 9,
    sourceDocuments: [/Decreto-Ley-624-de-1989/i],
    sourceText: [/LUGAR DE PAGO|FECHA EN QUE SE ENTIENDE PAGADO|IMPUTACI[ÓO]N DEL PAGO/i],
    preferredNumbers: [/^ARTÍCULO 800$/i, /^ARTÍCULO 803$/i, /^ARTÍCULO 804$/i],
    maxSources: 3,
    studyText: "El recibo de declaraciones y el recaudo deben efectuarse por los canales y entidades autorizados, con identificación del contribuyente, concepto, período, valor y fecha. El Estatuto Tributario permite recaudar a través de bancos y entidades financieras autorizadas, define cuándo se entiende realizado el pago y ordena cómo imputarlo. La trazabilidad evita que un valor recibido se aplique a una obligación distinta.",
    questions: [
      {
        stem: "¿Por qué es importante identificar período e impuesto al registrar un pago?",
        options: [{ key: "A", text: "Porque permite imputarlo a la obligación correcta y conservar trazabilidad" }, { key: "B", text: "Porque autoriza a cambiar libremente al contribuyente" }, { key: "C", text: "Porque elimina los intereses automáticamente" }, { key: "D", text: "Porque reemplaza el comprobante" }],
        correctAnswer: "A",
        explanation: "La imputación legal parte del período e impuesto identificados y distribuye el pago conforme a los componentes de la obligación.",
        errorType: "PAYMENT_ALLOCATION",
      },
      {
        stem: "¿Qué fecha se toma como pago cuando el valor ingresa a un banco autorizado?",
        options: [{ key: "A", text: "La fecha en que el valor imputable ingresa al banco autorizado" }, { key: "B", text: "La fecha de impresión del formulario" }, { key: "C", text: "La fecha de una llamada posterior" }, { key: "D", text: "La fecha que el funcionario prefiera" }],
        correctAnswer: "A",
        explanation: "El artículo 803 vincula la fecha de pago al ingreso de los valores imputables a oficinas de impuestos o bancos autorizados.",
        errorType: "PAYMENT_DATE",
      },
    ],
    workedExample: {
      scenario: "Un contribuyente presenta una declaración y paga por un canal autorizado, identificando correctamente período y concepto. El banco reporta la operación el mismo día.",
      analysis: "El registro debe conservar el comprobante y reconocer como fecha de pago la del ingreso al canal autorizado. Luego se aplica el valor a la obligación identificada con la distribución legal, de modo que la cuenta corriente pueda reconstruir el movimiento.",
    },
    applicationCase: {
      scenario: "Un pago aparece en el sistema sin período y fue aplicado manualmente a la obligación más antigua sin revisar el comprobante.",
      analysis: "Debe investigarse el soporte y la información transmitida por la entidad recaudadora antes de confirmar la imputación. Si hubo error, se corrige con trazabilidad; no se debe escoger una obligación por conveniencia sin verificar la identificación y las reglas del artículo 804.",
    },
  },
  {
    order: 10,
    sourceDocuments: [/Decreto-Ley-624-de-1989/i],
    sourceText: [/AUTORIZACI[ÓO]N PARA RECAUDAR|Entidades Autorizadas|recibir.*declaraciones|consignar.*valores/i],
    preferredNumbers: [/^ARTÍCULO 801$/i],
    maxSources: 1,
    studyText: "Las entidades autorizadas para recaudar reciben declaraciones y pagos bajo autorización y condiciones regladas; no actúan como simples comercios. Deben recibir los documentos y valores en los términos autorizados, transmitir información, consignar el recaudo en los plazos y lugares definidos y responder por la calidad y oportunidad del proceso. La DIAN controla el cumplimiento y puede aplicar las consecuencias previstas.",
    questions: [
      {
        stem: "¿Quién señala las entidades que pueden recaudar impuestos en desarrollo del artículo 801?",
        options: [{ key: "A", text: "El Ministerio de Hacienda y Crédito Público, conforme a los requisitos aplicables" }, { key: "B", text: "Cada contribuyente" }, { key: "C", text: "Cualquier establecimiento comercial" }, { key: "D", text: "La entidad que reciba el primer pago" }],
        correctAnswer: "A",
        explanation: "El artículo 801 atribuye al Ministerio la determinación de bancos y entidades especializadas autorizadas para recaudar.",
        errorType: "AUTHORITY_CONFUSION",
      },
      {
        stem: "¿Cuál es una obligación esencial de una entidad autorizada para recaudar?",
        options: [{ key: "A", text: "Consignar los valores recaudados en los plazos y lugares señalados" }, { key: "B", text: "Retener indefinidamente los recursos" }, { key: "C", text: "Modificar la declaración del contribuyente" }, { key: "D", text: "Seleccionar solo clientes propios cuando la norma exige recepción general" }],
        correctAnswer: "A",
        explanation: "El artículo 801 incluye obligaciones de recepción y consignación de los valores recaudados conforme a las condiciones oficiales.",
        errorType: "RECAUDER_DUTY",
      },
    ],
    workedExample: {
      scenario: "Un banco autorizado recibe una declaración y su pago, genera comprobante, transmite la información y consigna el recaudo dentro del plazo establecido.",
      analysis: "La entidad cumple una función reglada: recibe por el canal autorizado, conserva correspondencia entre documento y valor, transmite datos íntegros y entrega oportunamente los recursos. Cada paso debe ser verificable para resolver diferencias de recaudo.",
    },
    applicationCase: {
      scenario: "Una oficina bancaria se niega a recibir una declaración porque el contribuyente no es cliente, aunque no existe una excepción aplicable.",
      analysis: "Debe revisarse la obligación de recepción prevista para las entidades autorizadas. Si la oficina está comprendida en la autorización y no existe excepción, la condición de no cliente no justifica el rechazo; el incidente debe registrarse y gestionarse por los controles del esquema de recaudo.",
    },
  },
  {
    order: 25,
    sourceDocuments: [/Resoluci[oó]n DIAN 065 de 2024/i],
    sourceText: [/Adaptabilidad|Comportamiento [eé]tico|Comunicaci[oó]n efectiva|Trabajo en equipo|Orientaci[oó]n al usuario/i],
    preferredTitles: [/^Adaptabilidad$/i, /^Comportamiento [eé]tico\.?$/i, /^Comunicaci[oó]n efectiva$/i, /^Trabajo en equipo$/i],
    maxSources: 4,
    studyText: "La Resolución 065 de 2024 organiza competencias comportamentales de la DIAN mediante definición, niveles y conductas observables. Para el nivel técnico importan especialmente comportamiento ético, adaptabilidad, comunicación efectiva, orientación al usuario, solución de problemas y trabajo en equipo. Una competencia no se acredita repitiendo su nombre: se demuestra mediante una conducta coherente y verificable en el trabajo.",
    questions: [
      {
        stem: "¿Qué conducta demuestra adaptabilidad?",
        options: [{ key: "A", text: "Revisar la evidencia y ajustar oportunamente la forma de actuar al nuevo contexto" }, { key: "B", text: "Mantener el mismo procedimiento aunque haya cambiado la norma" }, { key: "C", text: "Rechazar toda observación del equipo" }, { key: "D", text: "Ocultar el cambio para evitar aprender" }],
        correctAnswer: "A",
        explanation: "La adaptabilidad implica comprender perspectivas y responder oportunamente a situaciones, contextos, medios y personas.",
        errorType: "BEHAVIORAL_COMPETENCY",
      },
      {
        stem: "¿Qué evidencia mejor el trabajo en equipo?",
        options: [{ key: "A", text: "Compartir información útil, coordinar responsabilidades y contribuir al resultado común" }, { key: "B", text: "Retener información para obtener reconocimiento individual" }, { key: "C", text: "Trasladar todos los errores a otra persona" }, { key: "D", text: "Evitar acuerdos sobre objetivos" }],
        correctAnswer: "A",
        explanation: "La competencia se observa en la cooperación, la coordinación y la contribución efectiva a objetivos compartidos.",
        errorType: "BEHAVIORAL_COMPETENCY",
      },
    ],
    workedExample: {
      scenario: "Un cambio normativo obliga al equipo a modificar un procedimiento con poco tiempo. Una analista revisa la nueva fuente, explica el impacto, escucha observaciones y ayuda a distribuir tareas.",
      analysis: "La conducta integra adaptabilidad, comunicación efectiva y trabajo en equipo: ajusta su actuación con base en evidencia, comunica de forma comprensible y contribuye al resultado colectivo. También muestra comportamiento ético al no ocultar riesgos ni presentar como segura una interpretación que aún debe validarse.",
    },
    applicationCase: {
      scenario: "Un servidor detecta un error propio que afecta un informe del equipo y puede corregirse antes de enviarlo. ¿Qué competencias debe demostrar?",
      analysis: "Debe informar el error con honestidad, proponer la corrección, coordinarla con el equipo y ajustar el trabajo dentro del plazo. Ocultarlo sería contrario al comportamiento ético; corregirlo de forma aislada sin avisar podría afectar trazabilidad y coordinación.",
    },
  },
];
