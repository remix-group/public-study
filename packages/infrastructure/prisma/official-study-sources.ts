import type { PrismaClient } from "@prisma/client";

type ExistingSource = {
  title: RegExp;
  authority: string;
  documentType: string;
  officialUrl: string;
  effectiveFrom: string;
};

/**
 * Metadata checked against the issuing authority on 2026-09-30. Imported
 * transcriptions remain untouched; this registry only identifies provenance
 * and enables explicit approval of the small set of units used for study.
 */
export const existingOfficialSources: ExistingSource[] = [
  { title: /Constituci[oó]n Politica Colombiana/i, authority: "Asamblea Nacional Constituyente", documentType: "constitution", officialUrl: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4125", effectiveFrom: "1991-07-04" },
  { title: /Ley-1437-de-2011/i, authority: "Congreso de Colombia", documentType: "law", officialUrl: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=41249", effectiveFrom: "2011-01-18" },
  { title: /Ley-1712-de-2014/i, authority: "Congreso de Colombia", documentType: "law", officialUrl: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=56882", effectiveFrom: "2014-03-06" },
  { title: /Ley-1755-de-2015/i, authority: "Congreso de Colombia", documentType: "law", officialUrl: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=65334", effectiveFrom: "2015-06-30" },
  { title: /Decreto-Ley-624-de-1989/i, authority: "Presidencia de la República / DIAN", documentType: "tax_statute", officialUrl: "https://normograma.dian.gov.co/dian/compilacion/docs/paneles/estatuto_tributario_indice.html", effectiveFrom: "1989-03-30" },
  { title: /^Estatuto Tributario$/i, authority: "DIAN", documentType: "tax_statute", officialUrl: "https://normograma.dian.gov.co/dian/compilacion/docs/paneles/estatuto_tributario_indice.html", effectiveFrom: "1989-03-30" },
  { title: /Decreto 1165 de 2019/i, authority: "Presidencia de la República / DIAN", documentType: "decree", officialUrl: "https://normograma.dian.gov.co/dian/compilacion/docs/decreto_1165_2019.htm", effectiveFrom: "2019-07-02" },
  { title: /Resoluci[oó]n Externa 1 de 2018/i, authority: "Banco de la República", documentType: "resolution", officialUrl: "https://www.banrep.gov.co/sites/default/files/reglamentacion/compendio-res-ext-1-de-2018.pdf", effectiveFrom: "2018-05-25" },
  { title: /Ley 599 de 2000/i, authority: "Congreso de Colombia", documentType: "law", officialUrl: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=6388", effectiveFrom: "2000-07-24" },
  { title: /LEY_1762_2015/i, authority: "Congreso de Colombia", documentType: "law", officialUrl: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=65338", effectiveFrom: "2015-07-06" },
  { title: /Entidades_Autorizadas_Recaudar|Casa€Editorial/i, authority: "DIAN", documentType: "resolution", officialUrl: "https://normograma.dian.gov.co/dian/compilacion/docs/resolucion_dian_0478_2000.htm", effectiveFrom: "2000-01-26" },
  { title: /^PR-COT-0372$/i, authority: "DIAN", documentType: "procedure", officialUrl: "https://www.dian.gov.co/atencionciudadano/LMDP/Cumplimiento-Obligaciones-Tributarias/Administracion-de-Cartera/Procedimientos/PR-COT-0372.pdf", effectiveFrom: "2024-01-01" },
  { title: /^PR-COT-0382$/i, authority: "DIAN", documentType: "procedure", officialUrl: "https://www.dian.gov.co/atencionciudadano/LMDP/Cumplimiento-Obligaciones-Tributarias/Administracion-de-Cartera/Procedimientos/PR-COT-0382.PDF", effectiveFrom: "2024-01-01" },
  { title: /^ORDEN ADMINISTRATIVA/i, authority: "DIAN", documentType: "procedure", officialUrl: "https://www.dian.gov.co/atencionciudadano/Paginas/Listado-maestro-de-documentos-publicos.aspx", effectiveFrom: "2024-01-01" },
  { title: /Manual Operativo MIPG/i, authority: "Departamento Administrativo de la Función Pública", documentType: "official_manual", officialUrl: "https://www.funcionpublica.gov.co/web/mipg/documentos", effectiveFrom: "2024-12-18" },
  { title: /2024-02_29_AcuerdoAGN/i, authority: "Archivo General de la Nación", documentType: "agreement", officialUrl: "https://normativa.archivogeneral.gov.co/acuerdo-no-001-del-2024/", effectiveFrom: "2024-02-29" },
  { title: /ley-594-de-2000/i, authority: "Congreso de Colombia", documentType: "law", officialUrl: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4275", effectiveFrom: "2000-07-14" },
  { title: /Lineamientos pol[ií]tica de servicio al ciudadano/i, authority: "Departamento Nacional de Planeación", documentType: "official_policy", officialUrl: "https://www.dnp.gov.co/LaEntidad_/subdireccion-general-prospectiva-desarrollo-nacional/direccion-gobierno-ddhh-paz/Paginas/Programa-Nacional-de-Servicio-al-Ciudadano.aspx", effectiveFrom: "2021-03-23" },
  { title: /Manual del servicio al ciudadano 2024/i, authority: "Departamento Administrativo de la Función Pública", documentType: "official_manual", officialUrl: "https://www.funcionpublica.gov.co/web/eva/servicio-al-ciudadano", effectiveFrom: "2024-01-01" },
  { title: /Protocolo de Servicio al Ciudadano/i, authority: "DIAN", documentType: "protocol", officialUrl: "https://www.dian.gov.co/atencionciudadano/LMDP/Cercania-al-Ciudadano/Asistencia-al-Usuario/Cartillas/CT-CAC-0054.pdf", effectiveFrom: "2025-01-01" },
  { title: /ABC Servicio al Ciudadano/i, authority: "DIAN", documentType: "official_guide", officialUrl: "https://www.dian.gov.co/atencionciudadano/Paginas/Listado-maestro-de-documentos-publicos.aspx", effectiveFrom: "2024-01-01" },
  { title: /Diccionario de Competencias Comportamentales/i, authority: "DIAN", documentType: "resolution", officialUrl: "https://normograma.dian.gov.co/dian/compilacion/docs/resolucion_dian_0065_2024.htm", effectiveFrom: "2024-04-30" },
];

type SupplementalSource = {
  id: string;
  title: string;
  authority: string;
  documentType: string;
  officialUrl: string;
  effectiveFrom: string;
  provisions: Array<{ number: string; title: string; content: string }>;
};

const supplementalOfficialSources: SupplementalSource[] = [
  {
    id: "official-dian-cultura-contribucion",
    title: "Cultura de la Contribución en la Escuela — DIAN",
    authority: "DIAN",
    documentType: "official_guide",
    officialUrl: "https://www.dian.gov.co/atencionciudadano/CulturaContribucion/Cultura-de-la-Contribucion/Paginas/Cultura-de-la-Contribucion-en-la-Escuela.aspx",
    effectiveFrom: "2024-12-24",
    provisions: [{
      number: "Fundamento pedagógico",
      title: "Sentido social de la contribución y del sistema tributario",
      content: "La Cultura de la Contribución promueve la apropiación de creencias, saberes, valores y comportamientos que permiten comprender la razón de ser de los impuestos y favorecen el cumplimiento de las obligaciones tributarias, aduaneras y cambiarias. Los impuestos recaudados y administrados por la DIAN hacen parte del Presupuesto General de la Nación, instrumento central de la política fiscal.",
    }],
  },
  {
    id: "official-ley-1116-2006",
    title: "Ley 1116 de 2006 — Régimen de Insolvencia Empresarial",
    authority: "Congreso de Colombia",
    documentType: "law",
    officialUrl: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=22657",
    effectiveFrom: "2006-12-27",
    provisions: [{
      number: "Artículo 1",
      title: "Finalidad del régimen de insolvencia",
      content: "El régimen judicial de insolvencia tiene por objeto la protección del crédito y la recuperación y conservación de la empresa como unidad de explotación económica y fuente generadora de empleo, a través de los procesos de reorganización y de liquidación judicial, bajo el criterio de agregación de valor. La reorganización procura preservar empresas viables y normalizar sus relaciones; la liquidación judicial persigue una liquidación pronta y ordenada y el aprovechamiento del patrimonio del deudor.",
    }],
  },
  {
    id: "official-ley-2445-2025",
    title: "Ley 2445 de 2025 — Insolvencia de la persona natural",
    authority: "Congreso de Colombia",
    documentType: "law",
    officialUrl: "https://www.supersociedades.gov.co/documents/107391/9025530/LEY%2B2445%2BDE%2B11%2BDE%2BFEBRERO%2BDE%2B2025.pdf/e09606c1-0093-4fba-eb2b-d15c1ccc3c6a?t=1751641283819&version=1.0",
    effectiveFrom: "2025-02-11",
    provisions: [
      { number: "Artículo 1", title: "Objeto de la reforma", content: "La ley modifica el régimen de insolvencia de la persona natural para incorporar a determinadas personas naturales comerciantes, corregir reglas que generaban decisiones contradictorias, flexibilizar el procedimiento y agilizar la liquidación patrimonial." },
      { number: "Artículo 3 — artículo 531 del CGP", title: "Finalidad del régimen de insolvencia de la persona natural", content: "El régimen busca reintegrar a la actividad productiva a la persona natural que ha sufrido un quebranto económico, mediante la normalización de sus relaciones crediticias a través de un acuerdo con sus acreedores, la convalidación de acuerdos privados o la liquidación de su patrimonio, bajo la buena fe y la expectativa legítima de cumplimiento hasta donde sea posible." },
    ],
  },
  {
    id: "official-codigo-integridad-dian",
    title: "Código de Integridad DIAN — CG-TAH-0002",
    authority: "DIAN",
    documentType: "institutional_code",
    officialUrl: "https://www.dian.gov.co/atencionciudadano/LMDP/Talento-Humano/Desarrollo-del-Talento-Humano/Codigo/CG-TAH-0002.pdf",
    effectiveFrom: "2023-01-01",
    provisions: [
      { number: "Valor: Honestidad", title: "Actuar con verdad y transparencia", content: "Actúo siempre con fundamento en la verdad, cumpliendo mis deberes con transparencia y rectitud y favoreciendo el interés general. Esto incluye reconocer errores, facilitar información pública completa y denunciar faltas o violaciones de derechos conocidas en el ejercicio del cargo." },
      { number: "Valor: Respeto", title: "Trato digno sin discriminación", content: "Reconozco, valoro y trato de manera digna a todas las personas, sin importar su labor, procedencia, títulos o cualquier otra condición. Atiendo con amabilidad, igualdad y equidad, y mantengo apertura al diálogo y a la comprensión de perspectivas distintas." },
    ],
  },
  {
    id: "official-decreto-088-2022-digital",
    title: "Decreto 088 de 2022 — Servicios digitales y seguridad de la información",
    authority: "Presidencia de la República / MinTIC",
    documentType: "decree",
    officialUrl: "https://normograma.dian.gov.co/dian/compilacion/docs/decreto_0088_2022.htm",
    effectiveFrom: "2022-01-24",
    provisions: [{
      number: "Lineamiento digital",
      title: "Seguridad y aprovechamiento de herramientas digitales",
      content: "Los sujetos obligados deben implementar controles de seguridad de la información en los sistemas y la infraestructura que soportan sus trámites, con el fin de preservar la confidencialidad, integridad, disponibilidad y privacidad de los datos, documentos y expedientes.",
    }],
  },
  {
    id: "official-decreto-1165-study",
    title: "Decreto 1165 de 2019 — Fundamentos aduaneros",
    authority: "Presidencia de la República / DIAN",
    documentType: "decree",
    officialUrl: "https://normograma.dian.gov.co/dian/compilacion/docs/decreto_1165_2019.htm",
    effectiveFrom: "2019-07-02",
    provisions: [
      { number: "Artículo 4", title: "Obligación aduanera", content: "La obligación aduanera es el vínculo jurídico entre la administración aduanera y cualquier persona directa o indirectamente relacionada con un régimen, modalidad u operación aduanera. Las mercancías quedan sometidas a la potestad aduanera y los obligados, al pago de tributos aduaneros, intereses, tasas, recargos y sanciones a que haya lugar." },
      { number: "Artículo 5", title: "Alcance de la obligación aduanera", content: "La obligación aduanera comprende las obligaciones de cada régimen, modalidad u operación, los trámites que deben adelantar los obligados, el pago de tributos, intereses, tasas, recargos y sanciones, y las obligaciones derivadas de actuaciones de la administración aduanera." },
    ],
  },
  {
    id: "official-banrep-resolution-1-study",
    title: "Resolución Externa 1 de 2018 — Operaciones cambiarias",
    authority: "Banco de la República",
    documentType: "resolution",
    officialUrl: "https://www.banrep.gov.co/sites/default/files/reglamentacion/compendio-res-ext-1-de-2018.pdf",
    effectiveFrom: "2018-05-25",
    provisions: [{
      number: "Artículo 41",
      title: "Operaciones obligatoriamente canalizables",
      content: "Deben canalizarse obligatoriamente a través del mercado cambiario las importaciones y exportaciones de bienes, el endeudamiento externo y sus costos financieros, las inversiones internacionales y sus rendimientos, los avales y garantías en moneda extranjera y las operaciones de derivados, con las excepciones que establezca la reglamentación general.",
    }],
  },
  {
    id: "official-dian-service-protocol-study",
    title: "CT-CAC-0054 — Protocolos de Servicio en la Atención",
    authority: "DIAN",
    documentType: "protocol",
    officialUrl: "https://www.dian.gov.co/atencionciudadano/LMDP/Cercania-al-Ciudadano/Asistencia-al-Usuario/Cartillas/CT-CAC-0054.pdf",
    effectiveFrom: "2025-01-01",
    provisions: [
      { number: "Etapas de atención", title: "Contacto inicial, sintonía, desarrollo y finalización", content: "Los protocolos organizan la atención en contacto inicial, sintonía, desarrollo y finalización. La secuencia busca establecer confianza, identificar con claridad la necesidad, gestionar el trámite o procedimiento y cerrar la interacción resolviendo dudas y verificando la satisfacción del ciudadano." },
      { number: "Enfoque de servicio", title: "Atención eficaz, coherente y accesible", content: "La atención debe aplicar protocolos específicos según el canal, reconocer las necesidades de los diferentes grupos poblacionales y facilitar la relación de las personas con el Estado para el acceso a derechos y el cumplimiento de deberes." },
    ],
  },
  {
    id: "official-resolution-65-study",
    title: "Resolución DIAN 065 de 2024 — Competencias comportamentales",
    authority: "DIAN",
    documentType: "resolution",
    officialUrl: "https://normograma.dian.gov.co/dian/compilacion/docs/resolucion_dian_0065_2024.htm",
    effectiveFrom: "2024-04-30",
    provisions: [
      { number: "Competencia básica", title: "Adaptabilidad", content: "Capacidad para comprender diferentes perspectivas y responder oportunamente a diversas situaciones, contextos, medios y personas, modificando el actuar de acuerdo con nuevos argumentos y evidencias." },
      { number: "Competencia básica", title: "Comportamiento ético", content: "Capacidad para actuar de acuerdo con prácticas laborales correctas, demostrando congruencia entre el discurso y la actuación y enmarcando el trabajo en el Código de Integridad de la DIAN." },
      { number: "Competencia específica", title: "Comunicación efectiva", content: "Capacidad para intercambiar información de forma clara, precisa, concisa, comprensible y objetiva, ajustándola al interlocutor y utilizando las tecnologías de información y comunicación disponibles." },
      { number: "Competencia específica", title: "Trabajo en equipo", content: "Capacidad para trabajar con otros de forma coordinada, armónica y sinérgica, potenciando los aportes de cada integrante para lograr los objetivos establecidos." },
    ],
  },
  {
    id: "official-et-abuse-study",
    title: "Estatuto Tributario — Abuso en materia tributaria",
    authority: "DIAN",
    documentType: "tax_statute",
    officialUrl: "https://normograma.dian.gov.co/dian/compilacion/docs/paneles/estatuto_tributario_indice.html",
    effectiveFrom: "1989-03-30",
    provisions: [{
      number: "Artículo 869",
      title: "Abuso en materia tributaria",
      content: "La Administración Tributaria puede recaracterizar o reconfigurar una operación o serie de operaciones que constituya abuso y desconocer sus efectos. Existe abuso cuando se implementan actos o negocios artificiosos, sin razón o propósito económico o comercial aparente, con el fin de obtener un provecho tributario.",
    }],
  },
  {
    id: "official-penal-contraband-study",
    title: "Código Penal — Contrabando",
    authority: "Congreso de Colombia",
    documentType: "law",
    officialUrl: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=6388",
    effectiveFrom: "2000-07-24",
    provisions: [{
      number: "Artículo 319",
      title: "Contrabando",
      content: "El contrabando comprende, en los supuestos y cuantías definidos por la ley penal, introducir o extraer mercancías en cuantía superior a la establecida hacia o desde el territorio colombiano por lugares no habilitados, u ocultarlas, disimularlas o sustraerlas de la intervención y control aduanero.",
    }],
  },
];

export async function seedVerifiedOfficialSources(prisma: PrismaClient) {
  const imported = await prisma.legalDocument.findMany({ select: { id: true, title: true } });
  for (const document of imported) {
    const source = existingOfficialSources.find((candidate) => candidate.title.test(document.title));
    if (!source) continue;
    const effectiveFrom = new Date(`${source.effectiveFrom}T00:00:00Z`);
    await prisma.legalDocument.update({
      where: { id: document.id },
      data: {
        authority: source.authority,
        documentType: source.documentType,
        officialUrl: source.officialUrl,
        source: source.officialUrl,
        effectiveFrom,
        status: "vigente",
        pipelineStatus: "REVIEW_REQUIRED",
      },
    });
    await prisma.legalVersion.updateMany({
      where: { documentId: document.id },
      data: { effectiveFrom, status: "vigente" },
    });
  }

  for (const source of supplementalOfficialSources) {
    const effectiveFrom = new Date(`${source.effectiveFrom}T00:00:00Z`);
    const document = await prisma.legalDocument.upsert({
      where: { id: source.id },
      update: { title: source.title, source: source.officialUrl, authority: source.authority, documentType: source.documentType, officialUrl: source.officialUrl, pipelineStatus: "PUBLISHED", effectiveFrom, status: "vigente" },
      create: { id: source.id, title: source.title, source: source.officialUrl, authority: source.authority, documentType: source.documentType, officialUrl: source.officialUrl, pipelineStatus: "PUBLISHED", effectiveFrom, status: "vigente" },
    });
    const version = await prisma.legalVersion.upsert({
      where: { documentId_label: { documentId: source.id, label: "Fuente oficial verificada 2026-09-30" } },
      update: { effectiveFrom, status: "vigente", isCurrent: true },
      create: { documentId: source.id, label: "Fuente oficial verificada 2026-09-30", effectiveFrom, status: "vigente", isCurrent: true },
    });
    for (const [index, provision] of source.provisions.entries()) {
      const id = `${source.id}-provision-${index + 1}`;
      const saved = await prisma.legalProvision.upsert({
        where: { id },
        update: { documentId: document.id, versionId: version.id, number: provision.number, title: provision.title, content: provision.content, citation: `${source.title}, ${provision.number}`, validationStatus: "approved", editorialStatus: "published", effectiveFrom, status: "vigente", extractionIssues: [] },
        create: { id, documentId: document.id, versionId: version.id, unitType: "official_excerpt", anchor: `${source.id}-${index + 1}`, order: index + 1, number: provision.number, title: provision.title, content: provision.content, citation: `${source.title}, ${provision.number}`, validationStatus: "approved", editorialStatus: "published", effectiveFrom, status: "vigente", extractionIssues: [] },
      });
      await prisma.evidence.upsert({
        where: { id: `evidence-${id}` },
        update: { provisionId: saved.id, content: saved.content, citation: saved.citation },
        create: { id: `evidence-${id}`, provisionId: saved.id, content: saved.content, citation: saved.citation },
      });
    }
  }
}

export async function approveProvisionForStudy(prisma: PrismaClient, provisionId: string) {
  const provision = await prisma.legalProvision.findUniqueOrThrow({ where: { id: provisionId }, include: { document: true } });
  if (!provision.document.officialUrl || !provision.document.effectiveFrom) {
    throw new Error(`Cannot approve ${provision.citation}: official provenance is incomplete`);
  }
  const normalizedTitle = provision.title.replace(/\s+/g, " ").trim();
  const firstSentence = normalizedTitle.split(/\.(?:\s|$)/, 1)[0]?.trim() ?? normalizedTitle;
  const normalizedDocument = provision.document.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const articleNumber = provision.number.match(/\d+(?:\.\d+)*/)?.[0] ?? provision.number.trim();
  const canonicalTitles: Record<string, string> = normalizedDocument.includes("constitucion politica") ? {
    "1": "Fundamentos del Estado social de derecho",
    "2": "Fines esenciales del Estado",
    "29": "Debido proceso",
    "209": "Principios de la función administrativa",
    "338": "Legalidad de los tributos",
    "363": "Principios del sistema tributario",
  } : normalizedDocument.includes("orden administrativa") ? {
    "1": "Verificación inicial del expediente de cobro",
  } : normalizedDocument.includes("pr-cot-0372") ? {
    "1": "Objetivo y alcance de la normalización de saldos",
  } : normalizedDocument.includes("pr-cot-0382") ? {
    "1": "Objetivo del control extensivo",
    "2": "Alcance del control extensivo",
  } : {};
  const conciseTitle = canonicalTitles[articleNumber] ?? (firstSentence.length >= 4 && firstSentence.length <= 120
    ? firstSentence
    : `${normalizedTitle.slice(0, 100).trim()}${normalizedTitle.length > 100 ? "…" : ""}`);
  await prisma.$transaction([
    prisma.legalDocument.update({ where: { id: provision.documentId }, data: { pipelineStatus: "PUBLISHED", status: "vigente" } }),
    prisma.legalProvision.update({ where: { id: provisionId }, data: { title: conciseTitle, validationStatus: "approved", editorialStatus: "published", effectiveFrom: provision.effectiveFrom ?? provision.document.effectiveFrom, status: "vigente", extractionIssues: [] } }),
  ]);
}
