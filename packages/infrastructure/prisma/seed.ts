import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const prisma = new PrismaClient();
const SOURCE_URL = "https://normograma.dian.gov.co/dian/compilacion/docs/paneles/estatuto_tributario_indice.html";
const scrypt = promisify(scryptCallback);

async function demoPasswordHash() {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt("EstudioDIAN2026!", salt, 64) as Buffer;
  return `scrypt$${salt}$${key.toString("hex")}`;
}

async function main() {
  const student = await prisma.student.upsert({
    where: { email: "demo@dian-study.local" },
    update: { passwordHash: await demoPasswordHash(), role: "editor" },
    create: { id: "student-demo", name: "Estudiante demo", email: "demo@dian-study.local", passwordHash: await demoPasswordHash(), role: "editor" },
  });
  const opec = await prisma.opec.upsert({
    where: { id: "opec-analista-i" }, update: { process: "Cumplimiento de obligaciones tributarias", subprocess: "Administración de cartera, Recaudo-Devoluciones" },
    create: { id: "opec-analista-i", name: "Analista I", description: "OPEC de demostración del MVP", level: "Técnico", area: "Administración de Cartera", process: "Cumplimiento de obligaciones tributarias", subprocess: "Administración de cartera, Recaudo-Devoluciones" },
  });
  const competency = await prisma.competency.upsert({
    where: { id: "competency-cobro-coactivo" }, update: {},
    create: { id: "competency-cobro-coactivo", opecId: opec.id, name: "Cobro Coactivo", description: "Procedimiento administrativo de cobro" },
  });
  const block = await prisma.block.upsert({
    where: { id: "block-competency-cobro-coactivo" },
    update: { name: "Proceso de Cobro Coactivo", description: "De la obligación exigible a las medidas preventivas", order: 1, progressionThreshold: 0.7 },
    create: { id: "block-competency-cobro-coactivo", competencyId: competency.id, name: "Proceso de Cobro Coactivo", description: "De la obligación exigible a las medidas preventivas", order: 1, progressionThreshold: 0.7 },
  });
  const topic = await prisma.topic.upsert({
    where: { id: "topic-procedimiento" }, update: { blockId: block.id, name: "Fundamentos y títulos ejecutivos", description: "Qué se cobra y qué documentos permiten iniciar el procedimiento", order: 1 },
    create: { id: "topic-procedimiento", blockId: block.id, name: "Fundamentos y títulos ejecutivos", description: "Qué se cobra y qué documentos permiten iniciar el procedimiento", order: 1 },
  });
  const notificationTopic = await prisma.topic.upsert({
    where: { id: "topic-mandamiento" }, update: { blockId: block.id, order: 2 },
    create: { id: "topic-mandamiento", blockId: block.id, name: "Mandamiento y notificación", description: "Contenido, citación y notificación del mandamiento de pago", order: 2 },
  });
  const measuresTopic = await prisma.topic.upsert({
    where: { id: "topic-medidas" }, update: { blockId: block.id, order: 3 },
    create: { id: "topic-medidas", blockId: block.id, name: "Medidas preventivas", description: "Oportunidad y alcance del embargo y secuestro", order: 3 },
  });
  const objective = await prisma.learningObjective.upsert({
    where: { id: "objective-alcance-art-823" }, update: { topicId: topic.id, critical: true },
    create: { id: "objective-alcance-art-823", topicId: topic.id, name: "Identificar el alcance del cobro coactivo", description: "Reconocer las deudas fiscales sujetas al procedimiento", order: 1, critical: true },
  });
  const document = await prisma.legalDocument.upsert({
    where: { id: "legal-estatuto-tributario" }, update: { source: SOURCE_URL, officialUrl: SOURCE_URL, pipelineStatus: "PUBLISHED" },
    create: { id: "legal-estatuto-tributario", title: "Estatuto Tributario", source: SOURCE_URL, authority: "DIAN", documentType: "statute", officialUrl: SOURCE_URL, pipelineStatus: "PUBLISHED", effectiveFrom: new Date("1989-03-30T00:00:00Z") },
  });
  const version = await prisma.legalVersion.upsert({
    where: { documentId_label: { documentId: document.id, label: "Compilación consultada 2026-08-30" } },
    update: { isCurrent: true },
    create: { documentId: document.id, label: "Compilación consultada 2026-08-30", effectiveFrom: new Date("1989-03-30T00:00:00Z"), status: "vigente", isCurrent: true },
  });
  const provision = await prisma.legalProvision.upsert({
    where: { id: "provision-et-823" }, update: { versionId: version.id, anchor: "articulo-823", validationStatus: "approved", editorialStatus: "published" },
    create: {
      id: "provision-et-823", documentId: document.id, number: "Artículo 823",
      versionId: version.id, unitType: "article", anchor: "articulo-823", order: 823, validationStatus: "approved", editorialStatus: "published",
      title: "Procedimiento administrativo coactivo",
      content: "Para el cobro coactivo de las deudas fiscales por concepto de impuestos, anticipos, retenciones, intereses y sanciones, de competencia de la DIAN, deberá seguirse el procedimiento administrativo coactivo.",
      citation: "Estatuto Tributario, artículo 823", effectiveFrom: new Date("1989-03-30T00:00:00Z"),
    },
  });
  const evidence = await prisma.evidence.upsert({
    where: { id: "evidence-et-823-scope" }, update: {},
    create: { id: "evidence-et-823-scope", provisionId: provision.id, citation: "Estatuto Tributario, artículo 823", content: provision.content },
  });
  const scopeConcept = await prisma.concept.upsert({
    where: { id: "concept-deudas-fiscales-cobro" },
    update: { objectiveId: objective.id },
    create: { id: "concept-deudas-fiscales-cobro", objectiveId: objective.id, name: "Deudas fiscales sujetas a cobro", description: "Impuestos, anticipos, retenciones, intereses y sanciones de competencia de la DIAN." },
  });
  await prisma.conceptEvidence.upsert({
    where: { conceptId_evidenceId: { conceptId: scopeConcept.id, evidenceId: evidence.id } }, update: {},
    create: { conceptId: scopeConcept.id, evidenceId: evidence.id },
  });
  const question = await prisma.question.upsert({
    where: { id: "question-et-823-1" }, update: { errorType: "CONCEPT_CONFUSION" },
    create: {
      id: "question-et-823-1", objectiveId: objective.id, type: "multiple_choice", difficulty: 0.3,
      stem: "Según el artículo 823 del Estatuto Tributario, ¿cuáles conceptos están comprendidos en el procedimiento administrativo coactivo de competencia de la DIAN?",
      options: [
        { key: "A", text: "Impuestos, anticipos, retenciones, intereses y sanciones" },
        { key: "B", text: "Únicamente impuestos e intereses" },
        { key: "C", text: "Solo sanciones ejecutoriadas" },
        { key: "D", text: "Toda obligación privada del contribuyente" },
      ],
      correctAnswer: "A",
      explanation: "El artículo 823 enumera impuestos, anticipos, retenciones, intereses y sanciones de competencia de la DIAN.",
      editorialStatus: "published", reviewedBy: student.id, reviewedAt: new Date(),
      errorType: "CONCEPT_CONFUSION",
    },
  });
  await prisma.questionEvidence.upsert({
    where: { questionId_evidenceId: { questionId: question.id, evidenceId: evidence.id } }, update: {},
    create: { questionId: question.id, evidenceId: evidence.id },
  });

  const additionalContent = [
    {
      provision: { id: "provision-et-826", number: "Artículo 826", title: "Mandamiento de pago", content: "El funcionario competente producirá el mandamiento de pago ordenando cancelar las obligaciones pendientes y sus intereses. Se citará al deudor para notificación personal dentro de diez días; si no comparece, se notificará por correo." },
      objective: { id: "objective-mandamiento-pago", name: "Comprender el mandamiento de pago", description: "Identificar su contenido y reglas básicas de notificación", order: 2 },
      concept: { id: "concept-mandamiento-notificacion", name: "Mandamiento y notificación", description: "Orden de pago, citación para notificación personal y notificación subsidiaria por correo." },
      topicId: notificationTopic.id,
      errorType: "PROCEDURE_ORDER_ERROR",
      questions: [
        { id: "question-et-826-1", difficulty: 0.35, stem: "¿Qué ordena el mandamiento de pago en el cobro coactivo?", correctAnswer: "A", options: [{ key: "A", text: "Cancelar las obligaciones pendientes y los intereses respectivos" }, { key: "B", text: "Presentar una nueva declaración tributaria" }, { key: "C", text: "Constituir obligatoriamente una garantía bancaria" }, { key: "D", text: "Iniciar una conciliación judicial" }] },
        { id: "question-et-826-2", difficulty: 0.45, stem: "¿Cuál es el término de la citación para que el deudor comparezca a notificarse personalmente del mandamiento de pago?", correctAnswer: "C", options: [{ key: "A", text: "Cinco días" }, { key: "B", text: "Ocho días" }, { key: "C", text: "Diez días" }, { key: "D", text: "Quince días" }] },
        { id: "question-et-826-3", difficulty: 0.5, stem: "Si el deudor no comparece después de la citación, ¿cómo se notifica el mandamiento ejecutivo?", correctAnswer: "B", options: [{ key: "A", text: "Por estado" }, { key: "B", text: "Por correo" }, { key: "C", text: "Únicamente por edicto" }, { key: "D", text: "Por conducta concluyente" }] },
      ],
      explanation: "El artículo 826 regula el contenido del mandamiento, la citación por diez días y la notificación subsidiaria por correo.",
    },
    {
      provision: { id: "provision-et-828", number: "Artículo 828", title: "Títulos ejecutivos", content: "Prestan mérito ejecutivo las liquidaciones privadas y sus correcciones desde el vencimiento para pagar, las liquidaciones oficiales ejecutoriadas, otros actos ejecutoriados que fijen sumas líquidas a favor del fisco, determinadas garantías y cauciones, y decisiones jurisdiccionales ejecutoriadas." },
      objective: { id: "objective-titulos-ejecutivos", name: "Reconocer los títulos ejecutivos", description: "Distinguir los documentos que prestan mérito ejecutivo", order: 3 },
      concept: { id: "concept-merito-ejecutivo", name: "Mérito ejecutivo", description: "Aptitud jurídica del documento para permitir el cobro de una obligación exigible." },
      topicId: topic.id,
      errorType: "CONCEPT_CONFUSION",
      questions: [
        { id: "question-et-828-1", difficulty: 0.45, stem: "¿Cuál de los siguientes documentos presta mérito ejecutivo según el artículo 828?", correctAnswer: "A", options: [{ key: "A", text: "Una liquidación oficial ejecutoriada" }, { key: "B", text: "Un proyecto de liquidación sin notificar" }, { key: "C", text: "Una consulta tributaria informal" }, { key: "D", text: "Una estimación interna sin acto administrativo" }] },
        { id: "question-et-828-2", difficulty: 0.55, stem: "¿Desde qué momento presta mérito ejecutivo una liquidación privada contenida en una declaración tributaria?", correctAnswer: "D", options: [{ key: "A", text: "Desde su elaboración" }, { key: "B", text: "Desde el inicio de una fiscalización" }, { key: "C", text: "Desde la expedición del RUT" }, { key: "D", text: "Desde el vencimiento de la fecha para su cancelación" }] },
        { id: "question-et-828-3", difficulty: 0.65, stem: "Para que otro acto de la Administración preste mérito ejecutivo, ¿qué condición destaca el artículo 828?", correctAnswer: "C", options: [{ key: "A", text: "Que sea verbal" }, { key: "B", text: "Que no determine suma alguna" }, { key: "C", text: "Que esté ejecutoriado y fije una suma líquida a favor del fisco" }, { key: "D", text: "Que haya sido solicitado por el contribuyente" }] },
      ],
      explanation: "El artículo 828 enumera taxativamente documentos que prestan mérito ejecutivo y exige ejecutoria en varios de sus supuestos.",
    },
    {
      provision: { id: "provision-et-837", number: "Artículo 837", title: "Medidas preventivas", content: "Previa o simultáneamente con el mandamiento de pago, el funcionario podrá decretar el embargo y secuestro preventivo de bienes que se hayan establecido como propiedad del deudor." },
      objective: { id: "objective-medidas-preventivas", name: "Aplicar las medidas preventivas", description: "Reconocer oportunidad y alcance del embargo y secuestro", order: 4 },
      concept: { id: "concept-medidas-preventivas", name: "Embargo y secuestro preventivo", description: "Medidas sobre bienes del deudor que pueden decretarse antes o junto al mandamiento de pago." },
      topicId: measuresTopic.id,
      errorType: "MISSED_EXCEPTION",
      questions: [
        { id: "question-et-837-1", difficulty: 0.4, stem: "¿Cuándo pueden decretarse embargo y secuestro preventivo según el artículo 837?", correctAnswer: "B", options: [{ key: "A", text: "Solo después del remate" }, { key: "B", text: "Previa o simultáneamente con el mandamiento de pago" }, { key: "C", text: "Únicamente al terminar el proceso" }, { key: "D", text: "Solo después de una sentencia judicial" }] },
        { id: "question-et-837-2", difficulty: 0.55, stem: "¿Sobre qué bienes pueden recaer inicialmente las medidas preventivas del artículo 837?", correctAnswer: "A", options: [{ key: "A", text: "Bienes establecidos como propiedad del deudor" }, { key: "B", text: "Cualquier bien de sus familiares" }, { key: "C", text: "Bienes públicos sin identificación" }, { key: "D", text: "Todo bien mencionado por un tercero" }] },
        { id: "question-et-837-3", difficulty: 0.6, stem: "¿Qué medidas preventivas menciona expresamente el primer inciso del artículo 837?", correctAnswer: "D", options: [{ key: "A", text: "Conciliación y arbitraje" }, { key: "B", text: "Multa y clausura" }, { key: "C", text: "Intervención y liquidación" }, { key: "D", text: "Embargo y secuestro preventivo" }] },
      ],
      explanation: "El artículo 837 permite decretar embargo y secuestro preventivo antes o al mismo tiempo que el mandamiento, respecto de bienes del deudor.",
    },
  ];

  for (const item of additionalContent) {
    const itemObjective = await prisma.learningObjective.upsert({
      where: { id: item.objective.id }, update: { topicId: item.topicId },
      create: { ...item.objective, topicId: item.topicId },
    });
    const itemProvision = await prisma.legalProvision.upsert({
      where: { id: item.provision.id }, update: { versionId: version.id, anchor: item.provision.number.toLowerCase().replaceAll(" ", "-"), validationStatus: "approved", editorialStatus: "published" },
      create: { ...item.provision, documentId: document.id, versionId: version.id, unitType: "article", anchor: item.provision.number.toLowerCase().replaceAll(" ", "-"), order: Number(item.provision.number.replace(/\D/g, "")), validationStatus: "approved", editorialStatus: "published", citation: `Estatuto Tributario, ${item.provision.number.toLowerCase()}`, effectiveFrom: new Date("1989-03-30T00:00:00Z") },
    });
    const itemEvidence = await prisma.evidence.upsert({
      where: { id: `evidence-${item.provision.id}` }, update: {},
      create: { id: `evidence-${item.provision.id}`, provisionId: itemProvision.id, citation: `Estatuto Tributario, ${item.provision.number.toLowerCase()}`, content: itemProvision.content },
    });
    const itemConcept = await prisma.concept.upsert({
      where: { id: item.concept.id }, update: { objectiveId: itemObjective.id, name: item.concept.name, description: item.concept.description },
      create: { ...item.concept, objectiveId: itemObjective.id },
    });
    await prisma.conceptEvidence.upsert({
      where: { conceptId_evidenceId: { conceptId: itemConcept.id, evidenceId: itemEvidence.id } }, update: {},
      create: { conceptId: itemConcept.id, evidenceId: itemEvidence.id },
    });
    for (const itemQuestion of item.questions) {
      const created = await prisma.question.upsert({
        where: { id: itemQuestion.id }, update: { errorType: item.errorType },
        create: { ...itemQuestion, objectiveId: itemObjective.id, type: "multiple_choice", explanation: item.explanation, errorType: item.errorType, editorialStatus: "published", reviewedBy: student.id, reviewedAt: new Date() },
      });
      await prisma.questionEvidence.upsert({
        where: { questionId_evidenceId: { questionId: created.id, evidenceId: itemEvidence.id } }, update: {},
        create: { questionId: created.id, evidenceId: itemEvidence.id },
      });
    }
  }
  await prisma.legalRelation.upsert({
    where: { id: "relation-et-837-references-et-826" },
    update: { description: "El artículo 837 sitúa el embargo y el secuestro preventivo antes o simultáneamente con el mandamiento de pago regulado por el artículo 826." },
    create: {
      id: "relation-et-837-references-et-826", sourceProvisionId: "provision-et-837", targetProvisionId: "provision-et-826", type: "REFERENCES",
      description: "El artículo 837 sitúa el embargo y el secuestro preventivo antes o simultáneamente con el mandamiento de pago regulado por el artículo 826.",
    },
  });
  for (const [index, itemTopic] of [topic, notificationTopic, measuresTopic].entries()) {
    await prisma.topicProgress.upsert({
      where: { studentId_topicId: { studentId: student.id, topicId: itemTopic.id } },
      update: {},
      create: { studentId: student.id, topicId: itemTopic.id, state: index === 0 ? "AVAILABLE" : "LOCKED", unlockedAt: index === 0 ? new Date() : null },
    });
  }
  console.log({ studentId: student.id, competencyId: competency.id, questionId: question.id });
}

main().finally(() => prisma.$disconnect());
