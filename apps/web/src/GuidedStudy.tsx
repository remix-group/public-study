import { useEffect, useState } from "react";
import { getStudyGuide } from "./api";
import type { StudyGuide } from "./types";

type Phase = "orientation" | "retrieval" | "lesson";

const readinessLabels: Record<StudyGuide["readiness"], string> = {
  READY: "Listo para estudiar",
  PARTIAL: "Contenido parcial",
  IN_REVIEW: "Material en revisión",
};

const lessonLabels: Record<StudyGuide["lesson"][number]["kind"], string> = {
  central_idea: "Idea central",
  rule: "Regla o procedimiento",
  term: "Término clave",
  condition: "Condición o excepción",
  source: "Fuente",
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function withoutRepeatedHeading(content: string, provisionNumber: string, provisionTitle: string) {
  let remaining = content.trim();
  remaining = remaining.replace(new RegExp(`^${matchableHeading(provisionNumber)}\\s*[.:\\-–—]*\\s*`, "i"), "");
  const title = provisionTitle.trim().replace(/[.:]+$/, "");
  if (title) remaining = remaining.replace(new RegExp(`^${matchableHeading(title)}\\s*[.:\\-–—]*\\s*`, "i"), "");
  return remaining.trim();
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").replace(/\.{3,}/g, ".").trim();
}

function withoutListMarker(value: string) {
  return value.trim().replace(/^(?:[a-z]|\d+(?:\.\d+)*)\s*[.)]\s*/i, "").trim();
}

function listItemTitle(content: string) {
  const labels: Array<[RegExp, string]> = [
    [/^garant[ií]a a favor/i, "Garantía para la devolución"],
    [/^copia del recibo de pago de la prima/i, "Soporte de la garantía"],
    [/^verificar el expediente/i, "Verificación previa del expediente"],
    [/^anticipar y satisfacer/i, "Necesidades del ciudadano"],
    [/^se indicar[aá] al ciudadano/i, "Trámite interno del documento"],
    [/^es necesario que la entidad.*escoger el canal/i, "Elección del canal de atención"],
    [/^el lenguaje para hablar con los ciudadanos/i, "Lenguaje claro y respetuoso"],
  ];
  return labels.find(([pattern]) => pattern.test(content))?.[1];
}

function fallbackSourceTitle(content: string) {
  const titleByTopic: Array<[RegExp, string]> = [
    [/garant|devoluci|compens/i, "Requisitos de devolución y compensación"],
    [/mandamiento de pago|cobro coactivo/i, "Inicio del cobro coactivo"],
    [/embarg|secuestro|inembarg/i, "Embargo y verificación previa"],
    [/negociaci[oó]n|reorganiz/i, "Negociación y reorganización"],
    [/liquidaci[oó]n|acreencia/i, "Liquidación y acreencias"],
    [/normalizaci[oó]n|depuraci[oó]n|cartera/i, "Normalización de saldos"],
    [/control extensivo|amplia cobertura/i, "Control extensivo de obligaciones"],
    [/honestidad|respeto|compromiso|diligencia|justicia|integridad/i, "Valores de integridad"],
    [/mipg|dimensi[oó]n|planeaci[oó]n y gesti[oó]n/i, "Gestión institucional con MIPG"],
    [/tabla de retenci[oó]n|gesti[oó]n documental|archivo/i, "Gestión documental y archivo"],
    [/servicio al ciudadano|relaci[oó]n estado-ciudadano/i, "Servicio al ciudadano"],
    [/escuchar|lenguaje.*claro|orientaci[oó]n/i, "Orientación clara y respetuosa"],
    [/herramientas? inform[aá]ticas?|aplicaciones.*datos/i, "Uso de herramientas informáticas"],
  ];
  return titleByTopic.find(([pattern]) => pattern.test(content))?.[1] ?? "Aspecto clave de la fuente";
}

function documentSourceTitle(documentTitle: string, content: string) {
  const labels: Array<[RegExp, string]> = [
    [/Manual Operativo MIPG/i, "Dimensiones y políticas de gestión"],
    [/C[oó]digo [ÉE]tica DIAN/i, "Valores de integridad DIAN"],
    [/ley-594|AcuerdoAGN/i, "Gestión documental y archivo"],
    [/Lineamientos pol[ií]tica/i, "Política de servicio al ciudadano"],
    [/Manual del servicio|Protocolo de Servicio|ABC Servicio/i, "Orientación y atención al ciudadano"],
    [/Cartilla Insolvencia|GUIA ORIENTACION/i, "Proceso y régimen de insolvencia"],
    [/PR-COT-0372/i, "Normalización de saldos"],
    [/PR-COT-0382/i, "Control extensivo de obligaciones"],
  ];
  return labels.find(([pattern]) => pattern.test(documentTitle))?.[1] ?? fallbackSourceTitle(content);
}

function shouldDisplaySource(evidence: StudyGuide["evidences"][number]) {
  const raw = evidence.content;
  const marker = `${evidence.provisionTitle} ${raw}`.toLowerCase();
  if (/bibliograf|harvard business review|unesco|sanguinetti|secretariado pefa/.test(marker)) return false;
  if (/manual completo|tema 25|tabla de contenido/.test(marker)) return false;
  if (/\.{4,}\s*\d+/.test(raw)) return false;
  return normalizeText(raw).length >= 55;
}

export function sourcePresentation(evidence: StudyGuide["evidences"][number]) {
  const hadListMarker = /^(?:[a-z]|\d+(?:\.\d+)*)\s*[.)]\s*/i.test(evidence.content.trim());
  const rawContent = withoutListMarker(evidence.content);
  const number = withoutListMarker(normalizeText(evidence.provisionNumber));
  const storedTitle = withoutListMarker(normalizeText(evidence.provisionTitle));
  const contentTitle = rawContent.match(new RegExp(`^${matchableHeading(number)}\\s*[.:\\-–—]+\\s*([^.!?\\n]+)`, "i"))?.[1];
  const genericHeading = /^(bibliograf[ií]a|referencias|tabla de contenido|manual completo|extracci[oó]n visual|documentos relacionados|definiciones y siglas)$/i;
  const storedTitleIsUseful = storedTitle.length >= 4 && !genericHeading.test(storedTitle) && !/https?:\/\//i.test(storedTitle);
  const candidate = normalizeText(storedTitleIsUseful ? storedTitle : contentTitle || storedTitle);
  const genericTitle = genericHeading.test(candidate);
  const meaningfulCandidate = !genericTitle && candidate.length >= 4 && !/https?:\/\//i.test(candidate);
  const compactCandidate = candidate.length <= 76 ? candidate : `${candidate.slice(0, 73).replace(/[,;:\s]+\S*$/, "").trim()}…`;
  const title = (hadListMarker ? listItemTitle(rawContent) : undefined) ?? (meaningfulCandidate
    ? compactCandidate.replace(/[.:]+$/, "")
    : documentSourceTitle(evidence.documentTitle, `${storedTitle} ${rawContent}`));
  const fullText = normalizeText(withoutRepeatedHeading(rawContent, number, storedTitle)) || normalizeText(rawContent);
  const previewLimit = 420;
  const cut = fullText.length > previewLimit ? fullText.slice(0, previewLimit).replace(/[,:;\s]+\S*$/, "").trimEnd() : fullText;
  const preview = `${cut}${cut.length < fullText.length ? "…" : ""}` || "Consulta la transcripción completa de esta fuente.";
  const hasArticleNumber = /^(art[ií]culo|t[ií]tulo|cap[ií]tulo)\b/i.test(number);
  return { title: hasArticleNumber ? `${number} · ${title}` : title, preview, fullText };
}

function matchableHeading(value: string) {
  return escapeRegExp(value.trim()).replace(/\s+/g, "\\s+");
}

export function GuidedStudy({ objectiveId, onBack, onPractice, onCase, onOpenSource }: { objectiveId: string; onBack: () => void; onPractice: () => void; onCase: () => void; onOpenSource: (documentId: string, provisionId: string) => void }) {
  const [guide, setGuide] = useState<StudyGuide | null>(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<Phase>("orientation");
  const [recalled, setRecalled] = useState("");
  const [checkAnswers, setCheckAnswers] = useState<Record<string, string>>({});
  const [revealedChecks, setRevealedChecks] = useState<Record<string, boolean>>({});
  const [closureAnswer, setClosureAnswer] = useState("");

  useEffect(() => {
    setGuide(null); setError(""); setPhase("orientation"); setRecalled("");
    setCheckAnswers({}); setRevealedChecks({}); setClosureAnswer("");
    getStudyGuide(objectiveId).then(setGuide).catch((caught) => setError(caught instanceof Error ? caught.message : "No se pudo cargar la lectura."));
  }, [objectiveId]);

  if (error) return <main className="center-state"><div className="alert">{error}</div><button className="button primary" onClick={onBack}>Volver a la ruta</button></main>;
  if (!guide) return <main className="center-state"><div className="loader"/><h2>Preparando el paquete de estudio</h2><p>Reuniendo lectura, actividades y evidencia trazable…</p></main>;

  const sourceById = new Map(guide.evidences.map((evidence) => [evidence.id, evidence]));
  const reviewedSources = guide.evidences.filter((evidence) => evidence.status === "reviewed");
  const pendingSources = guide.evidences.filter((evidence) => evidence.status === "pending");
  const displayedSources = guide.evidences.filter(shouldDisplaySource);
  const lesson = guide.lesson.filter((item) => item.kind !== "source");

  if (phase === "orientation") return <main className="orientation-page">
    <button className="text-button guide-back" onClick={onBack}>← Volver a mi ruta</button>
    <section className="orientation-card">
      <div className="orientation-copy"><span className="eyebrow">Paso 0 · Orientación</span><div className={`readiness-badge ${guide.readiness.toLowerCase()}`}>{readinessLabels[guide.readiness]}</div><h1>{guide.objective.name}</h1><p>{guide.outcome}</p><div className={`material-notice ${guide.readiness.toLowerCase()}`}><strong>{readinessLabels[guide.readiness]}</strong><span>{guide.readinessMessage}</span></div></div>
      <aside><div><small>Tiempo estimado</small><strong>{guide.estimatedMinutes} min</strong></div><div><small>Fuentes revisadas</small><strong>{reviewedSources.length}</strong></div><div><small>Material pendiente</small><strong>{pendingSources.length}</strong></div><div><small>Práctica</small><strong>{guide.practice.available ? `${guide.practice.questionCount} preguntas` : "En preparación"}</strong></div></aside>
      <footer><div><small>Al terminar podrás</small><p>{guide.outcome}</p></div><button className="button primary" onClick={() => setPhase("retrieval")}>Activar lo que sé <span>→</span></button></footer>
    </section>
  </main>;

  if (phase === "retrieval") return <main className="retrieval-page">
    <button className="text-button guide-back" onClick={() => setPhase("orientation")}>← Volver a la orientación</button>
    <div className="retrieval-card"><span className="eyebrow">Paso 1 · Recuperación inicial</span><h1>Antes de leer, ¿qué recuerdas?</h1><p>{guide.retrievalPrompt} No se califica; sirve para activar lo que ya sabes y comparar después.</p><textarea value={recalled} onChange={(event) => setRecalled(event.target.value)} placeholder="Escribe la regla, los pasos o un ejemplo que recuerdes…" rows={7}/><div><small>Puedes continuar aunque no recuerdes nada. Reconocer el vacío también es evidencia útil para estudiar.</small><button className="button primary" onClick={() => setPhase("lesson")}>Abrir lectura guiada <span>→</span></button></div></div>
  </main>;

  return <main className="guide-page">
    <button className="text-button guide-back" onClick={onBack}>← Volver a mi ruta</button>
    <header className="guide-header"><div><div className="eyebrow">{guide.block.name} · {guide.competency.name}</div><h1>{guide.objective.name}</h1><p>{guide.objective.description}</p><div className={`readiness-badge ${guide.readiness.toLowerCase()}`}>{readinessLabels[guide.readiness]}</div></div><aside><small>Tiempo estimado</small><strong>{guide.estimatedMinutes} minutos</strong><span>{guide.practice.questionCount} preguntas revisadas</span></aside></header>
    <section className="process-ribbon">{guide.studyProcess.map((step, index) => <div className={index < 2 ? "active" : ""} key={step.mode}><span>{index + 1}</span><strong>{step.title}</strong><small>{step.description}</small></div>)}</section>
    <section className={`material-notice ${guide.readiness.toLowerCase()}`}><strong>{readinessLabels[guide.readiness]}</strong><span>{guide.readinessMessage}</span></section>
    {recalled && <section className="recall-note"><small>Lo que recordabas antes de leer</small><p>{recalled}</p></section>}
    <div className="guide-layout"><section className="guide-content">
      <article className="guide-intro"><span>01</span><div><small>Propósito y resultado</small><h2>Qué debes poder hacer</h2><p>{guide.outcome}</p></div></article>

      <section className="structured-lesson"><div className="guide-section-title"><span>02</span><div><small>Lectura guiada</small><h2>Comprende la idea, la regla y sus términos</h2></div></div><div className="lesson-blocks">{lesson.length ? lesson.map((item) => <article className={`lesson-block ${item.status}`} key={item.id}><header><span>{lessonLabels[item.kind]}</span><b>{item.status === "reviewed" ? "Respaldado" : "En revisión"}</b></header><h3>{item.title}</h3><p>{item.content}</p>{item.sourceEvidenceIds.length > 0 && <footer>{item.sourceEvidenceIds.map((id) => sourceById.get(id)).filter(Boolean).map((evidence) => <span key={evidence!.id}>{evidence!.citation}</span>)}</footer>}</article>) : <div className="empty-study-state"><strong>La lectura estructurada está en preparación</strong><p>Puedes consultar el material documental asociado sin confundirlo con una explicación jurídica revisada.</p></div>}</div></section>

      <section className="norm-section"><div className="guide-section-title"><span>03</span><div><small>Fuente y procedencia</small><h2>Contrasta cada afirmación con su documento</h2></div></div>{displayedSources.length ? displayedSources.map((evidence) => { const source = sourcePresentation(evidence); return <article className={`guide-evidence ${evidence.status}`} key={evidence.id}><header><div><small>{evidence.documentTitle}</small><strong className="source-title">{source.title}</strong></div><div className="source-actions"><span>{evidence.status === "reviewed" ? "Fuente oficial revisada" : evidence.sourceKind === "pedagogical" ? "Material pedagógico incorporado" : "Material pendiente de revisión"}</span>{evidence.officialUrl && <a href={evidence.officialUrl} target="_blank" rel="noreferrer">Fuente oficial ↗</a>}</div></header><div className="source-extract"><small>Extracto relevante</small><p>{source.preview}</p></div><button className="source-material-link" onClick={() => onOpenSource(evidence.documentId, evidence.provisionId)}>Ver material completo →</button>{source.fullText.length > source.preview.length && <details className="source-transcript"><summary>Ver transcripción completa</summary><blockquote>{source.fullText}</blockquote></details>}<footer>{evidence.citation}</footer></article>; }) : <div className="empty-study-state"><strong>No hay un extracto breve para mostrar</strong><p>La evidencia permanece vinculada al tema y se conserva en sus actividades y citas.</p></div>}</section>

      <section className="worked-section"><div className="guide-section-title"><span>04</span><div><small>Ejemplo trabajado</small><h2>Observa cómo se razona antes de practicar</h2></div></div>{guide.workedExample ? <article className="worked-example"><div><small>Situación</small><p>{guide.workedExample.situation}</p></div><span>↓</span><div><small>Análisis respaldado</small><p>{guide.workedExample.analysis}</p></div><footer>{guide.workedExample.sourceEvidenceIds.map((id) => sourceById.get(id)?.citation).filter(Boolean).join(" · ")}</footer></article> : <div className="empty-study-state"><strong>El ejemplo trabajado aún no está publicado</strong><p>La lectura y las fuentes siguen disponibles. No generamos un caso artificial sin evidencia revisada.</p></div>}</section>

      <section className="checks-section"><div className="guide-section-title"><span>05</span><div><small>Comprobación breve</small><h2>Recupera la idea sin mirar</h2></div></div>{guide.checks.length ? <div className="check-list">{guide.checks.map((check) => <article key={check.id}><span className={`check-status ${check.status}`}>{check.status === "reviewed" ? "Fuente revisada" : "Material en revisión"}</span><strong>{check.prompt}</strong><textarea rows={3} value={checkAnswers[check.id] ?? ""} onChange={(event) => setCheckAnswers((current) => ({ ...current, [check.id]: event.target.value }))} placeholder="Escribe lo que recuerdas…"/><button className="text-button" onClick={() => setRevealedChecks((current) => ({ ...current, [check.id]: true }))}>Comparar mi respuesta</button>{revealedChecks[check.id] && <div className="check-feedback"><small>Retroalimentación</small><p>{check.feedback}</p>{check.sourceEvidenceIds.length > 0 && <span>{check.sourceEvidenceIds.map((id) => sourceById.get(id)?.citation).filter(Boolean).join(" · ")}</span>}</div>}</article>)}</div> : <div className="empty-study-state"><strong>Las comprobaciones están en preparación</strong><p>Repasa la idea central con tus propias palabras antes de continuar.</p></div>}</section>

      <section className="application-section"><div className="guide-section-title"><span>06</span><div><small>Aplicación</small><h2>Lleva la regla a una situación</h2></div></div>{guide.applicationCase ? <article className="application-card"><strong>{guide.applicationCase.scenario}</strong><p>Formula tu análisis antes de consultar la referencia editorial. La respuesta se registra como autoevaluación: el sistema no finge calificar un concepto jurídico abierto.</p><button className="button primary" onClick={onCase}>Resolver caso situacional <span>→</span></button><footer>{guide.applicationCase.sourceEvidenceIds.map((id) => sourceById.get(id)?.citation).filter(Boolean).join(" · ")}</footer></article> : <div className="empty-study-state"><strong>El caso situacional está en preparación</strong><p>Se habilitará cuando tenga hechos explícitos, análisis editorial y evidencia trazable.</p></div>}</section>

      <section className="closure-section"><div className="guide-section-title"><span>07</span><div><small>Cierre y próxima recuperación</small><h2>{guide.closure.title}</h2></div></div><ul>{guide.closure.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul><textarea rows={5} value={closureAnswer} onChange={(event) => setClosureAnswer(event.target.value)} placeholder="Resume aquí sin volver a consultar la lectura…"/><div className="next-review"><span>Próxima revisión</span><strong>{guide.nextReview ? new Date(guide.nextReview).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" }) : "Se programará después de tu primera práctica"}</strong></div></section>

      <section className="guide-ready"><div><small>{guide.practice.available ? "Ahora comprueba tu comprensión" : "Continúa con el material"}</small><h2>{guide.practice.available ? "Practica sin consultar la lectura" : "La práctica está en preparación"}</h2><p>{guide.practice.available ? "Recibirás explicación, diagnóstico y fundamento jurídico después de cada respuesta." : "Puedes volver a la ruta o consultar la biblioteca; no se mostrarán preguntas sin revisión editorial."}</p></div><button className="button primary" disabled={!guide.practice.available} onClick={onPractice}>{guide.practice.available ? <>Comenzar práctica <span>→</span></> : "Sin preguntas revisadas"}</button></section>
    </section><aside className="guide-sidebar"><strong>Tu paquete de estudio</strong><ol><li>Orientación y propósito.</li><li>Recuperación inicial.</li><li>Lectura y fuente separadas.</li><li>Ejemplo y comprobación.</li><li>Aplicación y cierre.</li></ol><div><span>Procedencia</span><p>Las transcripciones se muestran como fuente. Las explicaciones y actividades se rotulan por separado y siempre enlazan su respaldo.</p></div></aside></div>
  </main>;
}
