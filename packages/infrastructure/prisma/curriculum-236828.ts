export interface CurriculumTopicSeed {
  order: number;
  name: string;
  description: string;
  objective: string;
  sourcePatterns: RegExp[];
  critical?: boolean;
}

export interface CurriculumBlockSeed {
  order: number;
  name: string;
  description: string;
  topics: CurriculumTopicSeed[];
}

export const curriculum236828: CurriculumBlockSeed[] = [
  {
    order: 1,
    name: "Fundamentación Legal",
    description: "Bases constitucionales y administrativas necesarias para interpretar la actuación pública.",
    topics: [
      { order: 1, name: "Constitución Política (Títulos 1 y 2)", description: "Principios fundamentales, derechos, garantías y deberes constitucionales que orientan la función pública.", objective: "Relacionar los principios y derechos constitucionales con la actuación de la DIAN", sourcePatterns: [/Constituci[oó]n Politica/i], critical: true },
      { order: 2, name: "CPACA - Ley 1437 de 2011", description: "Reglas de la actuación administrativa, recursos, debido proceso y relación entre ciudadanía y administración.", objective: "Aplicar las reglas generales del procedimiento administrativo y sus garantías", sourcePatterns: [/1437-de-2011/i], critical: true },
      { order: 3, name: "Ley de Transparencia", description: "Derecho de acceso a la información pública, procedimientos para ejercerlo y excepciones a la publicidad.", objective: "Reconocer el alcance y las excepciones del acceso a la información pública", sourcePatterns: [/1712-de-2014/i] },
      { order: 4, name: "Derechos de Petición - Ley 1755 de 2015", description: "Modalidades, términos y deberes de respuesta aplicables a solicitudes y PQRS.", objective: "Resolver solicitudes ciudadanas respetando modalidades y términos legales", sourcePatterns: [/1755-de-2015/i] },
    ],
  },
  {
    order: 2,
    name: "Lo Misional",
    description: "Fundamentos tributarios, aduaneros y cambiarios que sostienen la misión institucional.",
    topics: [
      { order: 5, name: "Sistema Tributario Colombiano + Teoría de la Imposición", description: "Estructura de impuestos, contribuciones y tasas, junto con los principios económicos y jurídicos de la imposición.", objective: "Explicar la estructura del sistema tributario y los principios de la imposición", sourcePatterns: [/sistema tributario/i, /teor[ií]a de la imposici[oó]n/i], critical: true },
      { order: 6, name: "Procedimiento Tributario (Estatuto Tributario)", description: "Reglas mediante las cuales la DIAN administra, determina y recauda las obligaciones tributarias.", objective: "Ubicar las etapas y reglas esenciales del procedimiento tributario", sourcePatterns: [/Decreto-Ley-624/i, /contenido del Normograma/i], critical: true },
      { order: 7, name: "Generalidades del Sistema Aduanero y Cambiario", description: "Ingreso, salida y tránsito de mercancías, controles aduaneros y canalización de operaciones cambiarias.", objective: "Distinguir los componentes y autoridades de los sistemas aduanero y cambiario", sourcePatterns: [/1165 de 2019/i, /Resoluci[oó]n Externa 1/i, /R[eé]gimen Cambiario/i, /Obligaci[oó]n Sustancial/i], critical: true },
      { order: 8, name: "Evasión, Elusión y Contrabando", description: "Diferencias entre incumplimiento tributario ilegal, aprovechamiento abusivo de estructuras y comercio clandestino.", objective: "Diferenciar evasión, elusión y contrabando y reconocer sus consecuencias", sourcePatterns: [/Decreto-Ley-624/i, /Ley 599/i, /decreto_0920|contenido del Normograma/i, /1762_2015/i] },
    ],
  },
  {
    order: 3,
    name: "Gestión de Recaudo",
    description: "Procesos para recibir declaraciones, recaudar, administrar saldos y devolver recursos.",
    topics: [
      { order: 9, name: "Generalidades de Recibo de Declaraciones y Recaudo", description: "Recepción de declaraciones y recaudo de tributos administrados por la DIAN.", objective: "Reconocer las reglas generales de recepción de declaraciones y recaudo", sourcePatterns: [/Decreto-Ley-624/i, /Devoluciones/i] },
      { order: 10, name: "Entidades Autorizadas para Recaudar", description: "Obligaciones y controles aplicables a establecimientos autorizados para recibir declaraciones y recaudar impuestos.", objective: "Identificar responsabilidades y controles de las entidades recaudadoras", sourcePatterns: [/ORDEN ADMINISTRATIVA/i] },
      { order: 11, name: "Dinámica de la Cuenta Corriente", description: "Movimientos, débitos, créditos y saldos que reflejan la situación de las obligaciones del contribuyente.", objective: "Interpretar movimientos y saldos de la cuenta corriente de obligaciones", sourcePatterns: [/CT-COT-0086|PROPUESTA TALLER/i, /PR-COT-0372/i] },
      { order: 12, name: "Devoluciones y Compensaciones", description: "Procedimiento para devolver o compensar saldos a favor del contribuyente.", objective: "Explicar requisitos y etapas de devoluciones y compensaciones", sourcePatterns: [/Devoluciones/i, /2277-de-2012/i], critical: true },
    ],
  },
  {
    order: 4,
    name: "Cobro y Ejecución",
    description: "Recuperación persuasiva y coactiva de cartera, medidas cautelares e insolvencia.",
    topics: [
      { order: 13, name: "Cobro Coactivo y Persuasivo", description: "Etapas voluntaria y forzosa para recuperar obligaciones a favor del Estado.", objective: "Distinguir cobro persuasivo y coactivo y ordenar sus actuaciones principales", sourcePatterns: [/Decreto-Ley-624/i, /PR-COT-0372/i], critical: true },
      { order: 14, name: "Medidas Cautelares", description: "Embargo y secuestro de activos para garantizar el pago de las obligaciones.", objective: "Aplicar la oportunidad y alcance de las medidas cautelares", sourcePatterns: [/ORDEN ADMINISTRATIVA/i], critical: true },
      { order: 15, name: "Procesos Concursales", description: "Procedimientos para atender ordenadamente las obligaciones de un deudor en insolvencia.", objective: "Reconocer la finalidad, actores y etapas de los procesos concursales", sourcePatterns: [/Cartilla Insolvencia/i, /GUIA ORIENTACION/i] },
      { order: 16, name: "Régimen de Insolvencia", description: "Reglas especiales para reorganización o liquidación del patrimonio de un deudor insolvente.", objective: "Diferenciar reorganización, liquidación y efectos del régimen de insolvencia", sourcePatterns: [/Cartilla Insolvencia/i, /GUIA ORIENTACION/i] },
      { order: 17, name: "Depuración de Cartera y Normalización de Saldos", description: "Ajuste de cuentas por cobrar para reflejar obligaciones exigibles, errores, prescripción e incobrabilidad.", objective: "Aplicar criterios básicos de depuración y normalización de saldos", sourcePatterns: [/PR-COT-0372/i, /CT-COT-0086|PROPUESTA TALLER/i], critical: true },
      { order: 18, name: "Control Extensivo de Obligaciones", description: "Detección y corrección masiva de errores e incumplimientos menos complejos.", objective: "Diseñar y verificar una acción de control extensivo trazable", sourcePatterns: [/PR-COT-0382/i, /000081|car[aá]cter t[eé]cnico/i, /83-039-0089/i], critical: true },
    ],
  },
  {
    order: 5,
    name: "Transversales y Ética",
    description: "Integridad, planeación, gestión documental y servicio a la ciudadanía.",
    topics: [
      { order: 19, name: "Código de Integridad DIAN + Ética", description: "Valores de honestidad, diligencia, justicia, respeto y compromiso, incluyendo lo que hago y lo que no hago.", objective: "Aplicar los valores y conductas del Código de Integridad en situaciones laborales", sourcePatterns: [/C[oó]digo [ÉE]tica DIAN/i], critical: true },
      { order: 20, name: "MIPG - Modelo Integrado de Planeación y Gestión", description: "Dimensiones y políticas del modelo relacionadas con las funciones del empleo.", objective: "Relacionar las dimensiones y políticas pertinentes del MIPG con la gestión institucional", sourcePatterns: [/Manual Operativo MIPG/i] },
      { order: 21, name: "Gestión Documental (Acuerdo 001/2024)", description: "Tipos de archivo, TRD, transferencias y organización de documentos públicos.", objective: "Organizar el ciclo documental conforme a los instrumentos archivísticos", sourcePatterns: [/AcuerdoAGN/i, /ley-594-de-2000/i] },
      { order: 22, name: "Políticas estatales de Servicio al Ciudadano", description: "Lineamientos estatales para prestar servicios claros, accesibles, respetuosos y eficaces.", objective: "Aplicar lineamientos de política pública de servicio al ciudadano", sourcePatterns: [/Lineamientos pol[ií]tica/i, /Manual del servicio/i, /Protocolo de Servicio/i] },
      { order: 23, name: "Orientación al Usuario y al Ciudadano", description: "Atención centrada en necesidades y expectativas, con respeto, empatía y diligencia.", objective: "Resolver interacciones ciudadanas con enfoque de servicio y accesibilidad", sourcePatterns: [/ABC Servicio/i, /Manual del servicio/i, /Protocolo de Servicio/i, /^informe$/i] },
    ],
  },
  {
    order: 6,
    name: "Herramientas y Cierre",
    description: "Herramientas digitales y comportamientos requeridos para consolidar la preparación.",
    topics: [
      { order: 24, name: "Herramientas Informáticas", description: "Uso eficiente de aplicaciones para procesar texto, gestionar datos, presentar información y comunicarse.", objective: "Seleccionar y utilizar herramientas informáticas según la tarea administrativa", sourcePatterns: [] },
      { order: 25, name: "Diccionario de Competencias Comportamentales", description: "Competencias comunes y específicas: comportamiento ético, comunicación efectiva, adaptabilidad y trabajo en equipo.", objective: "Reconocer las conductas observables esperadas para el nivel técnico", sourcePatterns: [/Diccionario de Competencias/i], critical: true },
    ],
  },
];

export const routeMarkdown = `| Bloque | # | Tema |
|---|---:|---|
${curriculum236828.flatMap((block) => block.topics.map((topic) => `| ${block.order}. ${block.name} | ${topic.order} | ${topic.name} |`)).join("\n")}`;
