export type CuratedQuestionSeed = {
  stem: string;
  options: Array<{ key: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  errorType: string;
};

export type CuratedTopicSeed = {
  order: number;
  sourceDocuments: RegExp[];
  sourceText: RegExp[];
  preferredNumbers?: RegExp[];
  preferredTitles?: RegExp[];
  maxSources?: number;
  studyText: string;
  questions: CuratedQuestionSeed[];
  workedExample: { scenario: string; analysis: string };
  applicationCase: { scenario: string; analysis: string };
};

export const curatedTopics12To24: CuratedTopicSeed[] = [
  {
    order: 12,
    sourceDocuments: [/Decreto-Ley-624-de-1989/i],
    sourceText: [/DEVOLUCI[ÓO]N DE SALDOS A FAVOR|T[ÉE]RMINO PARA EFECTUAR LA DEVOLUCI[ÓO]N|RECHAZO.*DEVOLUCIONES|DEVOLUCI[ÓO]N CON PRESENTACI[ÓO]N DE GARANT[IÍ]A/i],
    preferredNumbers: [/^ARTÍCULO 850$/i, /^ARTÍCULO 855$/i, /^ARTÍCULO 857$/i, /^ARTÍCULO 860$/i],
    maxSources: 4,
    studyText: "Las devoluciones y compensaciones se estudian hoy desde el Estatuto Tributario compilado y su reglamentación vigente, no desde el Decreto 2277 de 2012 como si continuara siendo la fuente principal. Deben verificarse el origen y oportunidad del saldo a favor, los soportes, el término de la Administración, las causales de rechazo o inadmisión y, cuando se use, la garantía del artículo 860. La revisión distingue requisitos formales, verificación sustancial y decisión de fondo.",
    questions: [
      {
        stem: "Al revisar una solicitud de devolución o compensación, ¿qué debe comprobarse primero?",
        options: [
          { key: "A", text: "El origen, oportunidad y soporte del saldo a favor solicitado" },
          { key: "B", text: "Solo la afirmación verbal del solicitante" },
          { key: "C", text: "Que toda solicitud incluya obligatoriamente una garantía" },
          { key: "D", text: "Que el solicitante suspenda su actividad económica" },
        ],
        correctAnswer: "A",
        explanation: "Los artículos 850 y siguientes exigen establecer la procedencia del saldo y aplicar el trámite, términos y controles correspondientes.",
        errorType: "MISSED_REQUIREMENT",
      },
      {
        stem: "Si el solicitante opta por una garantía para respaldar la devolución, ¿qué debe verificarse?",
        options: [
          { key: "A", text: "Que cumpla los requisitos del artículo 860 del Estatuto Tributario" },
          { key: "B", text: "Que sea una promesa personal sin soporte" },
          { key: "C", text: "Que la expida cualquier tercero sin autorización" },
          { key: "D", text: "Que reemplace todos los documentos de la solicitud" },
        ],
        correctAnswer: "A",
        explanation: "El artículo 860 del Estatuto Tributario regula la devolución con presentación de garantía; esta opción no reemplaza los demás controles aplicables.",
        errorType: "SOURCE_AWARENESS",
      },
    ],
    workedExample: {
      scenario: "Una empresa solicita la devolución de un saldo a favor y aporta la relación de impuestos descontables. Al revisar el expediente se observa que su RUT está suspendido desde antes de la radicación y que pidió aplicar la opción de garantía.",
      analysis: "La revisión no debe limitarse al valor solicitado. Primero se verifica que el soporte explique el saldo y que el RUT cumpla la condición exigida durante el trámite. Como se eligió la opción de garantía, también deben acreditarse las condiciones del artículo 860 del Estatuto Tributario. La actuación debe dejar constancia de los requisitos faltantes y permitir la decisión procedente según el estado de la solicitud.",
    },
    applicationCase: {
      scenario: "Una persona presenta una solicitud de compensación con un saldo a favor, pero la dirección informada no coincide con su RUT actualizado y no anexa el documento que sustenta parte del impuesto descontable. ¿Cómo debe continuar la revisión?",
      analysis: "Debe verificarse la solicitud contra los requisitos documentales y la información tributaria vigente. La inconsistencia de dirección y la falta del soporte impiden tratar el expediente como completo; deben gestionarse las actuaciones de información o inadmisión que correspondan al procedimiento, dejando trazabilidad de lo solicitado y sin decidir el saldo únicamente con base en la afirmación del interesado.",
    },
  },
  {
    order: 13,
    sourceDocuments: [/^Estatuto Tributario$/i],
    sourceText: [/Procedimiento administrativo coactivo|art[ií]culo 823/i, /Mandamiento de pago|art[ií]culo 826/i, /verificar|obligaci[oó]n|cobro/i],
    preferredNumbers: [/^Artículo 823$/i, /^Artículo 826$/i, /^Artículo 828$/i],
    maxSources: 3,
    studyText: "El cobro persuasivo busca facilitar el pago voluntario y reunir información antes de acudir a la ejecución. El cobro coactivo aplica el procedimiento administrativo para exigir deudas fiscales con título y obligación exigible. En la secuencia deben distinguirse la verificación de la obligación, el mandamiento de pago, la notificación y las medidas que procedan, sin confundir una gestión de contacto con un acto de ejecución.",
    questions: [
      {
        stem: "¿Qué caracteriza al procedimiento administrativo coactivo previsto para las deudas fiscales?",
        options: [
          { key: "A", text: "Permite exigir administrativamente obligaciones fiscales exigibles" },
          { key: "B", text: "Reemplaza siempre la declaración privada del contribuyente" },
          { key: "C", text: "Solo sirve para orientar al ciudadano sin exigir pago" },
          { key: "D", text: "Se activa aunque no exista obligación determinada" },
        ],
        correctAnswer: "A",
        explanation: "El artículo 823 del Estatuto Tributario ubica el cobro coactivo como el procedimiento administrativo para cobrar deudas fiscales de competencia de la DIAN.",
        errorType: "CONCEPT_CONFUSION",
      },
      {
        stem: "Antes de ordenar una medida dentro del cobro, ¿qué debe verificarse en el expediente?",
        options: [
          { key: "A", text: "La existencia, exigibilidad y estado de la obligación" },
          { key: "B", text: "Únicamente que el deudor haya recibido una llamada" },
          { key: "C", text: "Que exista una denuncia penal" },
          { key: "D", text: "Que el contribuyente acepte verbalmente la deuda" },
        ],
        correctAnswer: "A",
        explanation: "Los procedimientos de cobro exigen revisar la obligación, la cuenta corriente y el expediente antes de continuar con actuaciones de ejecución.",
        errorType: "PROCEDURE_ORDER_ERROR",
      },
    ],
    workedExample: {
      scenario: "Una obligación tributaria está vencida, consta en el estado de cuenta y no aparece pagada. La entidad primero contacta al contribuyente para facilitar el pago y, ante la falta de solución, verifica el título y prepara el mandamiento.",
      analysis: "El contacto inicial corresponde a una gestión persuasiva. Si la obligación continúa exigible, la actuación pasa a la etapa coactiva: se verifica el expediente, se produce el mandamiento de pago conforme al artículo 826 y se realiza la notificación correspondiente. La secuencia evita tratar una comunicación persuasiva como si fuera una medida ejecutiva.",
    },
    applicationCase: {
      scenario: "Un funcionario propone embargar inmediatamente una cuenta bancaria porque el contribuyente no respondió una invitación de pago, pero el expediente todavía no contiene la certificación de la obligación ni la verificación del estado de cuenta. ¿Qué debe hacer?",
      analysis: "No debe saltarse la verificación previa. La falta de respuesta a una gestión persuasiva no reemplaza la comprobación de la obligación exigible ni los actos propios del cobro coactivo. Debe completar el expediente, verificar el título y la deuda, y solo después continuar con el mandamiento y las medidas que legalmente procedan.",
    },
  },
  {
    order: 14,
    sourceDocuments: [/ORDEN ADMINISTRATIVA/i, /Estatuto Tributario/i],
    sourceText: [/objetivo|embarg|secuestro|verificar|837|839|838/i],
    preferredNumbers: [/^Artículo 837$/i],
    preferredTitles: [/^OBJETIVO$/i, /Verificar el expediente/i],
    maxSources: 2,
    studyText: "Las medidas cautelares en el cobro buscan asegurar el pago, pero requieren verificar la obligación, el expediente y la situación jurídica del bien. El Estatuto Tributario permite decretar embargo y secuestro preventivo en los términos de sus artículos 837 y siguientes; el procedimiento interno exige identificar el bien, revisar su embargabilidad, registrar la actuación y respetar los límites aplicables.",
    questions: [
      {
        stem: "¿Cuál es el propósito principal de las medidas cautelares en el cobro?",
        options: [
          { key: "A", text: "Asegurar el pago de la obligación identificando y afectando bienes del deudor" },
          { key: "B", text: "Imponer una sanción independiente sin relación con la deuda" },
          { key: "C", text: "Sustituir la verificación del expediente" },
          { key: "D", text: "Transferir automáticamente el dominio del bien al Estado" },
        ],
        correctAnswer: "A",
        explanation: "El procedimiento describe el embargo de activos del deudor o de responsables vinculados para lograr el pago de las obligaciones.",
        errorType: "CONCEPT_CONFUSION",
      },
      {
        stem: "Antes de decretar el embargo de un inmueble, ¿qué actuación es necesaria?",
        options: [
          { key: "A", text: "Verificar la obligación, la titularidad y la embargabilidad del bien" },
          { key: "B", text: "Embargarlo sin consultar su estado jurídico" },
          { key: "C", text: "Esperar a que el deudor autorice la medida" },
          { key: "D", text: "Remitirlo primero a un proceso penal" },
        ],
        correctAnswer: "A",
        explanation: "La orden administrativa exige revisar el expediente y el certificado de libertad y tradición para determinar si el bien puede embargarse.",
        errorType: "MISSED_CONTROL",
      },
    ],
    workedExample: {
      scenario: "En un expediente con obligación exigible se identifica un inmueble del deudor. El funcionario consulta el certificado de libertad y tradición, encuentra una limitación que debe analizarse y calcula el valor actualizado de la deuda.",
      analysis: "La medida no se decreta de forma automática por encontrar un inmueble. Se debe verificar la deuda, la propiedad, la embargabilidad y la cuantía; si existe una causal de inembargabilidad o una limitación relevante, se documenta y se continúa por la ruta procedente. Si el bien es embargable, la resolución debe corresponder al valor y a la obligación identificada.",
    },
    applicationCase: {
      scenario: "Durante la investigación se encuentra un bien del deudor, pero el expediente muestra que la obligación fue pagada antes de la decisión de embargo. ¿Debe continuarse con la medida?",
      analysis: "Debe actualizarse y verificar el estado de la obligación antes de decretar o ejecutar la medida. Si la deuda se extinguió, no hay fundamento para embargarla; el resultado debe quedar registrado en el expediente y en el aplicativo. La medida cautelar asegura una obligación vigente, no una deuda ya cancelada.",
    },
  },
  {
    order: 15,
    sourceDocuments: [/Ley 1116 de 2006/i, /Ley 2445 de 2025/i],
    sourceText: [/protecci[oó]n del cr[eé]dito|reorganizaci[oó]n|liquidaci[oó]n|normalizaci[oó]n de sus relaciones crediticias/i],
    preferredNumbers: [/^Artículo 1$/i, /^Artículo 3/i],
    maxSources: 3,
    studyText: "Los procesos concursales atienden colectivamente las obligaciones del deudor y evitan que la solución dependa de cobros aislados. La Ley 1116 de 2006 regula la reorganización y liquidación judicial empresarial; la Ley 2445 de 2025 actualizó la insolvencia de la persona natural e incorporó bajo condiciones a la pequeña comerciante. Según el sujeto y el supuesto pueden operar negociación, convalidación de acuerdos, reorganización o liquidación.",
    questions: [
      {
        stem: "¿Qué finalidad cumple un proceso concursal?",
        options: [
          { key: "A", text: "Organizar colectivamente las obligaciones y buscar una solución ordenada" },
          { key: "B", text: "Permitir que un solo acreedor cobre primero sin reglas" },
          { key: "C", text: "Eliminar la obligación sin revisar acreencias" },
          { key: "D", text: "Reemplazar siempre la liquidación por una sanción" },
        ],
        correctAnswer: "A",
        explanation: "La cartilla presenta la insolvencia como un mecanismo de negociación, organización de acreencias y, cuando corresponde, liquidación ordenada.",
        errorType: "CONCEPT_CONFUSION",
      },
      {
        stem: "Para una persona natural no comerciante, ¿dónde puede iniciar la negociación de deudas cuando cumple los supuestos?",
        options: [
          { key: "A", text: "Ante un centro de conciliación o una notaría de su domicilio" },
          { key: "B", text: "Únicamente ante la entidad recaudadora" },
          { key: "C", text: "Ante cualquier banco sin trámite" },
          { key: "D", text: "Solo mediante una comunicación informal a los acreedores" },
        ],
        correctAnswer: "A",
        explanation: "La fuente explica que la solicitud de negociación inicia ante el centro de conciliación o la notaría del domicilio del deudor, una vez revisados los supuestos.",
        errorType: "PROCEDURE_ORDER_ERROR",
      },
    ],
    workedExample: {
      scenario: "Una persona natural no comerciante perdió su empleo, tiene varias obligaciones vencidas y reúne la información de sus acreedores, ingresos y bienes para solicitar la negociación de deudas.",
      analysis: "La situación debe analizarse como una posible insolvencia y no como una simple mora individual. Se verifican los supuestos, se presenta la solicitud ante el centro de conciliación o la notaría competente y se organiza la relación de acreencias. El objetivo inicial es alcanzar un acuerdo; si la negociación fracasa, puede continuar la etapa de liquidación patrimonial conforme al régimen aplicable.",
    },
    applicationCase: {
      scenario: "Durante la negociación, un acreedor pretende ejecutar individualmente al deudor ignorando el trámite concursal ya admitido. ¿Cómo debe abordarse la actuación?",
      analysis: "Debe verificarse el estado del trámite y aplicar sus efectos procesales. La lógica concursal busca que las obligaciones se atiendan ordenadamente y evita que un acreedor altere la igualdad de la negociación mediante una actuación aislada. La entidad debe remitir y registrar la información en el expediente concursal correspondiente.",
    },
  },
  {
    order: 16,
    sourceDocuments: [/Ley 1116 de 2006/i, /Ley 2445 de 2025/i],
    sourceText: [/reorganizaci[oó]n|liquidaci[oó]n judicial|persona natural|pequeña comerciante/i],
    preferredNumbers: [/^Artículo 1$/i, /^Artículo 1$/i, /^Artículo 3/i],
    maxSources: 3,
    studyText: "El régimen aplicable depende del sujeto y de la finalidad. La Ley 1116 protege el crédito y busca conservar empresas viables mediante reorganización, o liquidarlas de forma pronta y ordenada cuando corresponde. Para la persona natural, la Ley 2445 de 2025 reformó el Título IV del Código General del Proceso: ya no debe estudiarse únicamente con el texto original de 2012 y ahora incluye, bajo sus condiciones, a la pequeña comerciante.",
    questions: [
      {
        stem: "¿Qué diferencia básica existe entre reorganización y liquidación patrimonial?",
        options: [
          { key: "A", text: "La reorganización busca conservar una empresa viable; la liquidación realiza y adjudica el patrimonio" },
          { key: "B", text: "Ambas consisten únicamente en cobrar una multa" },
          { key: "C", text: "La liquidación siempre conserva la operación empresarial" },
          { key: "D", text: "La reorganización elimina la relación de acreencias" },
        ],
        correctAnswer: "A",
        explanation: "La cartilla distingue la finalidad de conservar una actividad viable mediante reorganización y la liquidación ordenada del patrimonio cuando corresponde.",
        errorType: "CONCEPT_CONFUSION",
      },
      {
        stem: "¿Qué debe tenerse en cuenta al estudiar la insolvencia de la persona natural desde 2025?",
        options: [
          { key: "A", text: "La reforma de la Ley 2445 de 2025 al régimen del Código General del Proceso" },
          { key: "B", text: "Únicamente el régimen de contratación estatal" },
          { key: "C", text: "Solo las reglas internas de una entidad financiera" },
          { key: "D", text: "Un procedimiento sin fundamento legal" },
        ],
        correctAnswer: "A",
        explanation: "La Ley 2445 de 2025 modificó el régimen de insolvencia de la persona natural y amplió su alcance a determinadas pequeñas comerciantes.",
        errorType: "SOURCE_AWARENESS",
      },
    ],
    workedExample: {
      scenario: "Una sociedad con actividad viable demuestra dificultades temporales de liquidez y propone un acuerdo con sus acreedores, mientras una persona natural no comerciante llega a la liquidación después de fracasar su negociación.",
      analysis: "No se aplica un único camino a ambos casos. La sociedad debe analizar el régimen empresarial y la posibilidad de reorganización; la persona natural sigue el procedimiento previsto para su condición y puede llegar a la liquidación patrimonial. La identificación del sujeto, la finalidad y la etapa evita mezclar instituciones diferentes.",
    },
    applicationCase: {
      scenario: "Una oficina recibe una solicitud de una persona natural no comerciante y la remite automáticamente al trámite de reorganización empresarial de la Ley 1116 de 2006. ¿Qué debe corregirse?",
      analysis: "Debe revisarse la calidad del deudor antes de asignar el procedimiento. Para una persona natural no comerciante, la fuente remite al régimen del Código General del Proceso y a la negociación o liquidación patrimonial correspondiente; la Ley 1116 no se aplica automáticamente por el solo hecho de existir deudas.",
    },
  },
  {
    order: 17,
    sourceDocuments: [/PR-COT-0372/i],
    sourceText: [/objetivo|saldo|normaliz|depur|exigible|obligaci[oó]n/i],
    preferredTitles: [/^OBJETIVO/i],
    maxSources: 1,
    studyText: "La depuración de cartera busca establecer el saldo real de las obligaciones y separar lo exigible de lo que debe ajustarse, corregirse o extinguirse. El procedimiento PR-COT-0372 parte de la información financiera y de la cuenta corriente, verifica la obligación y soporta los ajustes o actos administrativos. La normalización debe ser trazable: cada cambio debe conservar su causa, soporte, fecha y efecto sobre el saldo.",
    questions: [
      {
        stem: "¿Cuál es el propósito central de la normalización de saldos?",
        options: [
          { key: "A", text: "Establecer el saldo real y depurar obligaciones con soporte verificable" },
          { key: "B", text: "Aumentar todos los saldos para mejorar el recaudo" },
          { key: "C", text: "Borrar obligaciones sin revisar el expediente" },
          { key: "D", text: "Sustituir la cuenta corriente por una hoja informal" },
        ],
        correctAnswer: "A",
        explanation: "El PR-COT-0372 define como objetivo establecer el saldo real, identificar obligaciones exigibles y generar los ajustes o actos que normalicen la información.",
        errorType: "CONCEPT_CONFUSION",
      },
      {
        stem: "¿Qué debe acompañar un ajuste de cartera para que sea trazable?",
        options: [
          { key: "A", text: "La causa, el soporte, la fecha y el efecto sobre la obligación" },
          { key: "B", text: "Solo una nota sin identificación del expediente" },
          { key: "C", text: "Una modificación manual sin registro" },
          { key: "D", text: "La opinión verbal de un tercero" },
        ],
        correctAnswer: "A",
        explanation: "La normalización exige evidencia de la gestión y un registro que permita reconstruir por qué cambió el saldo y qué obligación fue afectada.",
        errorType: "MISSED_CONTROL",
      },
    ],
    workedExample: {
      scenario: "El sistema muestra una obligación vencida, pero el expediente contiene un pago aplicado a otro período y una actuación que modificó el valor liquidado.",
      analysis: "La cartera no debe cobrarse con el primer saldo visible. Se confrontan el sistema financiero, la cuenta corriente y el expediente; se identifica el pago, se revisa la actuación que modificó la obligación y se determina el saldo exigible. El ajuste se registra con soporte y la obligación queda normalizada para que las acciones posteriores utilicen información consistente.",
    },
    applicationCase: {
      scenario: "Un funcionario detecta que una obligación aparece como vencida aunque existe un acto que la modificó, pero propone eliminarla directamente del aplicativo para evitar que se siga cobrando. ¿Qué debe hacer?",
      analysis: "Debe iniciar la depuración y documentar la causa del ajuste, no borrar el registro sin trazabilidad. Se verifica el acto, su firmeza y el saldo resultante; luego se aplica la normalización o el ajuste que corresponda, conservando el historial de la obligación y el soporte de la decisión.",
    },
  },
  {
    order: 18,
    sourceDocuments: [/PR-COT-0382/i],
    sourceText: [/objetivo|alcance|control extens|informaci[oó]n|resultado|comunic/i],
    preferredTitles: [/^OBJETIVO$/i, /^ALCANCE$/i],
    maxSources: 2,
    studyText: "El control extensivo diseña acciones masivas o de amplia cobertura para verificar el cumplimiento voluntario y oportuno de obligaciones formales y sustanciales. El procedimiento inicia con la recepción y validación de información, define criterios y comunicaciones, ejecuta la acción y termina con un informe de resultados. La cobertura masiva no elimina la necesidad de datos confiables, criterios claros, protección de información y trazabilidad.",
    questions: [
      {
        stem: "¿Qué caracteriza una acción de control extensivo?",
        options: [
          { key: "A", text: "Tiene amplia cobertura y busca determinar el cumplimiento de obligaciones" },
          { key: "B", text: "Se dirige siempre a un solo contribuyente sin criterios previos" },
          { key: "C", text: "Consiste únicamente en enviar mensajes sin evaluar resultados" },
          { key: "D", text: "Permite omitir la validación de las bases de datos" },
        ],
        correctAnswer: "A",
        explanation: "El PR-COT-0382 describe acciones de gestión inmediata y amplia cobertura para determinar el cumplimiento voluntario y oportuno.",
        errorType: "CONCEPT_CONFUSION",
      },
      {
        stem: "¿Cuál es una condición necesaria antes de comunicar una acción masiva?",
        options: [
          { key: "A", text: "Definir criterios, validar la información y establecer el propósito de la acción" },
          { key: "B", text: "Enviar la comunicación antes de identificar a los destinatarios" },
          { key: "C", text: "Usar cualquier base sin revisar su calidad" },
          { key: "D", text: "Excluir el informe de resultados para proteger la campaña" },
        ],
        correctAnswer: "A",
        explanation: "La fuente pedagógica del procedimiento resalta que una campaña no comienza con el envío: requiere criterios, validación de datos y lineamientos de atención.",
        errorType: "PROCEDURE_ORDER_ERROR",
      },
    ],
    workedExample: {
      scenario: "La DIAN identifica un grupo de contribuyentes con una posible inconsistencia común. El equipo define la variable, valida la base, prepara una comunicación y establece cómo registrar las respuestas.",
      analysis: "La acción es extensiva porque parte de un criterio común y tiene cobertura amplia. Antes de comunicar se valida la información y se define el lineamiento de atención; después se ejecuta la campaña, se registran las respuestas y se prepara el informe de resultados. El diseño documentado permite evaluar el impacto y corregir errores de selección.",
    },
    applicationCase: {
      scenario: "Una dependencia propone enviar una comunicación masiva porque encontró una diferencia en una base de datos, pero no ha validado la variable ni ha definido el canal de respuesta. ¿Debe enviarla de inmediato?",
      analysis: "No. Debe validar la información, precisar el criterio de selección, definir el contenido y establecer el canal y plazo de atención. Una acción de amplia cobertura puede afectar a muchas personas; por eso el procedimiento exige preparación, control de calidad y trazabilidad antes del envío.",
    },
  },
  {
    order: 19,
    sourceDocuments: [/C[oó]digo de Integridad DIAN/i],
    sourceText: [/integridad|valor|honestidad|respeto|compromiso|diligencia/i],
    maxSources: 2,
    studyText: "El Código de Integridad orienta las decisiones cotidianas mediante valores y conductas observables. Honestidad exige verdad, transparencia y protección del interés general; respeto exige trato digno, igualdad y apertura al diálogo. En una situación laboral se debe reconocer el riesgo, cuidar los recursos públicos y reportar conflictos o irregularidades por los canales institucionales.",
    questions: [
      {
        stem: "¿Qué conducta refleja mejor la integridad en una actuación laboral?",
        options: [
          { key: "A", text: "Reconocer un conflicto, actuar con transparencia y usar el canal institucional" },
          { key: "B", text: "Ocultar el conflicto para proteger la imagen del equipo" },
          { key: "C", text: "Aceptar un beneficio si no se informa a terceros" },
          { key: "D", text: "Aplicar una regla distinta para favorecer a un conocido" },
        ],
        correctAnswer: "A",
        explanation: "La integridad se demuestra en una conducta verificable: reconocer el riesgo, apartarse de la ventaja indebida y reportar por los canales establecidos.",
        errorType: "ETHICAL_JUDGMENT",
      },
      {
        stem: "Ante una presión para alterar un registro institucional, ¿cuál es la respuesta más adecuada?",
        options: [
          { key: "A", text: "Conservar la información, documentar la presión y reportarla por el canal correspondiente" },
          { key: "B", text: "Modificar el registro y borrar la evidencia" },
          { key: "C", text: "Delegar la decisión sin dejar constancia" },
          { key: "D", text: "Compartir el caso en redes sociales antes de reportarlo" },
        ],
        correctAnswer: "A",
        explanation: "La conducta íntegra protege la trazabilidad, los recursos públicos y los canales institucionales de denuncia o consulta.",
        errorType: "ETHICAL_JUDGMENT",
      },
    ],
    workedExample: {
      scenario: "Una persona conocida del servidor solicita que su trámite sea atendido antes que otros y ofrece un obsequio como agradecimiento.",
      analysis: "La respuesta íntegra es rechazar el beneficio, aplicar el orden objetivo del trámite y reportar el posible conflicto o intento de ventaja por el canal institucional. El respeto a la ciudadanía incluye no conceder privilegios; la honestidad exige que la decisión pueda explicarse y auditarse.",
    },
    applicationCase: {
      scenario: "Una compañera pide cambiar la fecha de una actuación para que parezca oportuna y afirma que nadie resultará afectado. ¿Qué debe hacer el servidor?",
      analysis: "Debe conservar el registro real, negarse a alterar la información y documentar la solicitud. Si existe una irregularidad o presión indebida, debe reportarla por el canal institucional. La ausencia de un perjuicio visible no convierte en correcta la alteración de un documento público.",
    },
  },
  {
    order: 20,
    sourceDocuments: [/Manual Operativo MIPG/i],
    sourceText: [/dimensi|pol[ií]tica|integridad|talento|planeaci|control/i],
    preferredTitles: [/^Pol[ií]tica de Integridad$/i, /^Alcance de la Dimensi[oó]n$/i],
    maxSources: 2,
    studyText: "MIPG articula dimensiones y políticas para orientar la gestión pública hacia resultados, integridad, servicio y generación de valor público. Para resolver una situación administrativa se debe relacionar el problema con la dimensión o política pertinente, planear la acción, definir responsables e indicadores y usar la información para el seguimiento y la mejora. El modelo no es una lista aislada de formatos: conecta planeación, ejecución, control y evaluación.",
    questions: [
      {
        stem: "¿Cómo debe utilizarse MIPG frente a un problema de gestión?",
        options: [
          { key: "A", text: "Relacionando el problema con la dimensión o política pertinente y haciendo seguimiento a resultados" },
          { key: "B", text: "Creando un formato sin responsable ni indicador" },
          { key: "C", text: "Aplicando todas las políticas sin priorización" },
          { key: "D", text: "Separando la planeación de la ejecución y la evaluación" },
        ],
        correctAnswer: "A",
        explanation: "El Manual Operativo presenta MIPG como un modelo articulado para planear, ejecutar, hacer seguimiento y mejorar la gestión.",
        errorType: "CONCEPT_CONFUSION",
      },
      {
        stem: "¿Qué elemento permite verificar si una acción de gestión produjo el resultado esperado?",
        options: [
          { key: "A", text: "Un responsable, un indicador y una evidencia de seguimiento" },
          { key: "B", text: "Solo una intención general" },
          { key: "C", text: "Una actividad sin fecha ni producto" },
          { key: "D", text: "La eliminación de los controles para agilizar" },
        ],
        correctAnswer: "A",
        explanation: "La articulación del modelo requiere definir cómo se ejecuta y cómo se evidencia el avance y el resultado.",
        errorType: "MISSED_CONTROL",
      },
    ],
    workedExample: {
      scenario: "Una dependencia detecta retrasos en la respuesta a solicitudes ciudadanas. Define una acción, asigna responsable, establece un indicador de oportunidad y revisa el resultado en el comité de seguimiento.",
      analysis: "La situación se aborda de forma articulada: se identifica la política relacionada con servicio y gestión, se incorpora la acción a la planeación, se asigna responsable y se mide el tiempo de respuesta. El seguimiento permite ajustar el proceso y demostrar si la mejora produjo valor para la ciudadanía.",
    },
    applicationCase: {
      scenario: "Una oficina presenta un plan con muchas actividades, pero ninguna tiene responsable, indicador ni evidencia de cumplimiento. ¿Qué debe corregirse?",
      analysis: "Debe pasar de un listado de actividades a una gestión verificable. Cada acción debe asociarse con el objetivo, responsable, producto o evidencia, indicador y mecanismo de seguimiento. Sin esos elementos no es posible evaluar resultados ni aplicar la mejora continua que articula MIPG.",
    },
  },
  {
    order: 21,
    sourceDocuments: [/2024-02_29_AcuerdoAGN/i, /ley-594-de-2000/i],
    sourceText: [/tabla de ret|transfer|organiz|principio|inventario|archivo/i],
    preferredNumbers: [/^Artículo 4\.3\.1\.1$/i, /^Artículo 4\.4\.1$/i, /^ARTÍCULO 24$/i, /^ARTÍCULO 26$/i],
    maxSources: 4,
    studyText: "La gestión documental organiza los documentos desde su producción o recepción hasta su disposición final. La Ley 594 de 2000 exige conformar y administrar archivos públicos, aplicar los principios de procedencia y orden original, elaborar tablas de retención documental e inventariar los documentos. El Acuerdo 001 de 2024 desarrolla instrumentos y reglas archivísticas que deben aplicarse al expediente, la transferencia y la conservación.",
    questions: [
      {
        stem: "¿Qué instrumento determina los tiempos de retención y la disposición de las series documentales?",
        options: [
          { key: "A", text: "La tabla de retención documental" },
          { key: "B", text: "Una lista informal del funcionario" },
          { key: "C", text: "El correo de un usuario externo" },
          { key: "D", text: "Una copia sin identificación del expediente" },
        ],
        correctAnswer: "A",
        explanation: "El artículo 24 de la Ley 594 de 2000 establece la obligatoriedad de elaborar y adoptar la tabla de retención documental.",
        errorType: "SOURCE_AWARENESS",
      },
      {
        stem: "¿Qué principio debe orientar la organización de los documentos de un expediente?",
        options: [
          { key: "A", text: "Procedencia y orden original" },
          { key: "B", text: "Ordenarlos por conveniencia personal" },
          { key: "C", text: "Separarlos sin conservar contexto" },
          { key: "D", text: "Eliminar los documentos repetidos sin autorización" },
        ],
        correctAnswer: "A",
        explanation: "La Ley 594 relaciona la organización y control de los archivos públicos con los principios de procedencia y orden original.",
        errorType: "MISSED_RULE",
      },
    ],
    workedExample: {
      scenario: "Una oficina termina un trámite y conserva correos, actos, soportes y respuestas en una carpeta personal sin aplicar la serie documental ni la tabla de retención.",
      analysis: "Debe organizarse el expediente respetando la procedencia y el orden original, incorporando los documentos que hacen parte de la actuación y aplicando la tabla de retención. La transferencia o disposición final solo procede conforme al instrumento archivístico y debe quedar registrada.",
    },
    applicationCase: {
      scenario: "Un funcionario quiere eliminar documentos de un expediente porque ya escaneó algunos, aunque la tabla de retención aún exige conservar la serie. ¿Qué debe hacer?",
      analysis: "No debe eliminarlos por decisión individual. La digitalización no cambia por sí sola los tiempos de retención ni la disposición final. Debe conservar y organizar los documentos según la Ley 594, el Acuerdo 001 de 2024 y la tabla aplicable, dejando constancia de cualquier transferencia o eliminación autorizada.",
    },
  },
  {
    order: 22,
    sourceDocuments: [/CT-CAC-0054/i],
    sourceText: [/pol[ií]tica|ciudadan|transpar|tr[aá]mite|servicio|acceso/i],
    preferredTitles: [/Contacto inicial, sinton[ií]a, desarrollo y finalizaci[oó]n/i, /Atenci[oó]n eficaz, coherente y accesible/i],
    maxSources: 2,
    studyText: "La política estatal de servicio al ciudadano organiza la relación Estado-ciudadanía alrededor de información clara, acceso efectivo, trámites comprensibles, participación y atención respetuosa. Para aplicarla se identifica la necesidad, se ofrece el canal adecuado, se informa el plazo y el resultado esperado, y se mide la experiencia y la oportunidad del servicio. La solución debe ser accesible, coherente y trazable.",
    questions: [
      {
        stem: "¿Qué debe priorizar una entidad al diseñar un servicio para la ciudadanía?",
        options: [
          { key: "A", text: "Claridad, accesibilidad, oportunidad y respuesta trazable" },
          { key: "B", text: "La complejidad del trámite aunque no sea necesaria" },
          { key: "C", text: "Un único canal sin considerar las necesidades del usuario" },
          { key: "D", text: "Responder sin informar plazos ni requisitos" },
        ],
        correctAnswer: "A",
        explanation: "Los lineamientos relacionan el servicio con acceso, información, trámites y respuestas que permitan al ciudadano comprender y ejercer sus derechos.",
        errorType: "SERVICE_JUDGMENT",
      },
      {
        stem: "Cuando una persona no puede completar un trámite por el canal digital, ¿qué respuesta es coherente con la política de servicio?",
        options: [
          { key: "A", text: "Orientarla a un canal accesible y explicar requisitos y tiempos" },
          { key: "B", text: "Cerrar la interacción sin registrar la dificultad" },
          { key: "C", text: "Exigir que use el canal digital sin alternativa" },
          { key: "D", text: "Remitirla de oficina en oficina sin información" },
        ],
        correctAnswer: "A",
        explanation: "El enfoque de servicio exige remover barreras, informar claramente y orientar al ciudadano hacia la ruta que pueda utilizar.",
        errorType: "ACCESSIBILITY_GAP",
      },
    ],
    workedExample: {
      scenario: "Una ciudadana consulta por un trámite, no entiende un requisito y manifiesta que no tiene acceso estable a internet.",
      analysis: "La atención debe traducir el requisito a lenguaje claro, confirmar qué necesita la ciudadana, ofrecer el canal disponible y explicar los plazos. Si existe una alternativa presencial o asistida, debe orientarse hacia ella y registrarse la atención para que la respuesta sea trazable.",
    },
    applicationCase: {
      scenario: "Una dependencia publica un formulario digital sin instrucciones, sin alternativa para personas con barreras de acceso y sin informar el tiempo de respuesta. ¿Qué debe mejorar?",
      analysis: "Debe revisar el servicio desde la experiencia ciudadana: explicar el propósito y los requisitos, facilitar el acceso por canales adecuados, informar el plazo y establecer cómo se hará seguimiento. La herramienta no cumple por el solo hecho de estar publicada; debe permitir una interacción comprensible y efectiva.",
    },
  },
  {
    order: 23,
    sourceDocuments: [/CT-CAC-0054/i],
    sourceText: [/empat|escucha|acces|orient|necesidad|atenci|trato|ciudadan/i],
    preferredTitles: [/Contacto inicial, sinton[ií]a, desarrollo y finalizaci[oó]n/i, /Atenci[oó]n eficaz, coherente y accesible/i],
    maxSources: 2,
    studyText: "La orientación al usuario parte de escuchar y comprender la necesidad antes de responder. La atención debe ser respetuosa, empática, clara y diligente; también debe considerar accesibilidad, lenguaje comprensible, protección de datos y remisión correcta cuando la solicitud corresponda a otra dependencia. Resolver no siempre significa conceder lo pedido: significa explicar la ruta, los requisitos y la autoridad competente.",
    questions: [
      {
        stem: "¿Cuál es el primer paso para orientar correctamente a un ciudadano?",
        options: [
          { key: "A", text: "Escuchar, precisar la necesidad y confirmar la información relevante" },
          { key: "B", text: "Remitirlo inmediatamente sin escuchar" },
          { key: "C", text: "Responder con tecnicismos para terminar rápido" },
          { key: "D", text: "Prometer un resultado que la oficina no controla" },
        ],
        correctAnswer: "A",
        explanation: "El servicio centrado en el usuario comienza por comprender la necesidad y entregar una orientación pertinente, no por una remisión automática.",
        errorType: "SERVICE_JUDGMENT",
      },
      {
        stem: "Si la solicitud corresponde a otra dependencia, ¿qué debe hacer quien atiende?",
        options: [
          { key: "A", text: "Explicar la ruta y remitir u orientar con información suficiente" },
          { key: "B", text: "Decir únicamente que no es su problema" },
          { key: "C", text: "Entregar datos personales a cualquier tercero" },
          { key: "D", text: "Cerrar la atención sin dejar registro" },
        ],
        correctAnswer: "A",
        explanation: "La orientación diligente evita que el ciudadano quede sin respuesta y conserva la protección de la información y la trazabilidad de la atención.",
        errorType: "REMISSION_ERROR",
      },
    ],
    workedExample: {
      scenario: "Un ciudadano llega molesto porque recibió una comunicación que no comprende y pide que le expliquen qué debe hacer. La oficina no es la competente para decidir su solicitud.",
      analysis: "El servidor escucha sin confrontar, identifica la necesidad, explica el contenido en lenguaje claro y orienta a la dependencia competente. Debe informar el canal y los requisitos, sin prometer una decisión que no puede tomar, y registrar la orientación cuando el protocolo lo exija.",
    },
    applicationCase: {
      scenario: "Una persona con una discapacidad auditiva solicita atención y el servidor decide responderle solo verbalmente porque hay fila. ¿Qué debe hacer?",
      analysis: "Debe aplicar un ajuste razonable y utilizar el medio de comunicación accesible disponible, manteniendo el respeto, la privacidad y la claridad. La presión de la fila no justifica ignorar la necesidad de accesibilidad ni impedir que la persona comprenda la orientación.",
    },
  },
  {
    order: 24,
    sourceDocuments: [/Decreto 088 de 2022/i],
    sourceText: [/controles de seguridad|confidencialidad|integridad|disponibilidad|privacidad/i],
    preferredNumbers: [/^Lineamiento digital$/i],
    maxSources: 1,
    studyText: "Las herramientas informáticas deben seleccionarse según la tarea, el tipo de información y los controles requeridos. Para procesar texto se necesita conservar versiones y formato; para gestionar datos se requiere estructura, validación y control de cambios; para presentar información se debe priorizar claridad; y para comunicarse se deben proteger los datos y usar los canales institucionales. La herramienta es un medio: la responsabilidad sobre la información permanece en quien la utiliza.",
    questions: [
      {
        stem: "¿Qué criterio debe guiar la selección de una herramienta informática?",
        options: [
          { key: "A", text: "La tarea, el tipo de información, la colaboración y los controles necesarios" },
          { key: "B", text: "La aplicación más popular sin revisar la información" },
          { key: "C", text: "La herramienta que permita compartir datos sin restricciones" },
          { key: "D", text: "El formato que elimine el historial de cambios" },
        ],
        correctAnswer: "A",
        explanation: "La herramienta debe responder a la tarea y preservar la calidad, seguridad, trazabilidad y presentación de la información.",
        errorType: "TOOL_SELECTION",
      },
      {
        stem: "Al trabajar con una base de datos institucional, ¿qué práctica es adecuada?",
        options: [
          { key: "A", text: "Validar los datos, controlar cambios y proteger el acceso" },
          { key: "B", text: "Copiar la base a un correo personal" },
          { key: "C", text: "Modificarla sin conservar versión anterior" },
          { key: "D", text: "Compartirla completa para facilitar cualquier consulta" },
        ],
        correctAnswer: "A",
        explanation: "La gestión de datos exige controles de calidad, versiones y acceso, especialmente cuando se trata de información institucional o personal.",
        errorType: "DATA_HANDLING",
      },
    ],
    workedExample: {
      scenario: "Una analista debe consolidar información de obligaciones, calcular totales, preparar una presentación y enviar un informe a su equipo.",
      analysis: "Usa una herramienta estructurada para validar y calcular los datos, conserva la fuente y el control de cambios, prepara una presentación que destaque hallazgos y comparte el informe por el canal institucional. La elección se justifica por la tarea y por la necesidad de proteger y reproducir la información.",
    },
    applicationCase: {
      scenario: "Un funcionario propone descargar una base con datos personales en una aplicación gratuita para organizarla rápidamente y luego compartir el enlace con todo el equipo. ¿Qué debe decidir?",
      analysis: "Debe detener la práctica y escoger una herramienta institucional autorizada, con controles de acceso y trazabilidad. Antes de procesar datos se debe revisar la clasificación de la información, la autorización del servicio y la forma segura de compartir el resultado; la rapidez no justifica exponer información institucional.",
    },
  },
];
