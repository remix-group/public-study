import { masteryPercent } from "./format";
import type { Dashboard } from "./types";

type Props = {
  dashboard: Dashboard | null;
  studentName: string;
  expandedBlockId?: string;
  expandedTopicId?: string;
  onBlockChange: (id?: string) => void;
  onTopicChange: (id?: string) => void;
  onLibrary: () => void;
  onGuide: (objectiveId: string) => void;
  onPractice: (objectiveId: string, mode: "PRACTICE" | "REVIEW") => void;
  onMap: (topicId: string) => void;
};

function stateLabel(value: string) {
  const labels: Record<string, string> = { LOCKED: "Bloqueado", AVAILABLE: "Disponible", IN_PROGRESS: "En progreso", COMPLETED: "Completado", MASTERED: "Dominado" };
  return labels[value] ?? value.replaceAll("_", " ");
}

function blockState(topics: Dashboard["route"][number]["topics"]) {
  if (topics.length && topics.every((topic) => topic.state === "MASTERED")) return "Dominado";
  if (topics.length && topics.every((topic) => ["COMPLETED", "MASTERED"].includes(topic.state))) return "Completado";
  if (topics.some((topic) => topic.state === "IN_PROGRESS" || topic.mastery > 0)) return "En progreso";
  if (topics.some((topic) => topic.accessible)) return "Disponible";
  return "Bloqueado";
}

export function GuidedHome({ dashboard, studentName, expandedBlockId, expandedTopicId, onBlockChange, onTopicChange, onLibrary, onGuide, onPractice, onMap }: Props) {
  const recommended = dashboard?.recommendedObjective;
  const allTopics = dashboard?.route.flatMap((block) => block.topics.map((topic) => ({ ...topic, block }))) ?? [];
  const currentTopic = allTopics.find((topic) => topic.id === recommended?.topicId) ?? allTopics.find((topic) => topic.accessible);
  const currentIndex = currentTopic ? allTopics.findIndex((topic) => topic.id === currentTopic.id) : -1;
  const nextTopic = currentIndex >= 0 ? allTopics[currentIndex + 1] : undefined;
  const unlockedTopics = allTopics.filter((topic) => topic.accessible).length;
  const routeProgress = allTopics.length ? Math.round((unlockedTopics / allTopics.length) * 100) : 0;
  const actionLabel = recommended?.action === "REVIEW" ? "Repasar" : recommended?.action === "PRACTICE" ? "Practicar" : "Aprender tema";

  function startRecommended() {
    if (!recommended) return;
    if (recommended.action === "LEARN" || !recommended.questionCount) onGuide(recommended.objectiveId);
    else onPractice(recommended.objectiveId, recommended.action === "REVIEW" ? "REVIEW" : "PRACTICE");
  }

  return <main className="student-home guided-home">
    <section className="guided-greeting"><div><span className="eyebrow">Analista I · OPEC 236828</span><h1>Hola, {studentName.split(" ")[0]}.</h1><p>Tu ruta te muestra primero qué hacer y después el contenido que puedes explorar.</p></div><button className="text-button" onClick={onLibrary}>Abrir biblioteca →</button></section>

    <section className="next-step" aria-labelledby="next-step-title">
      <div className="next-step-copy"><span className="next-step-label">Siguiente paso · {recommended?.action ?? "LEARN"}</span><small>{recommended ? `${recommended.block} · ${recommended.topic}` : "Ruta integral OPEC 236828"}</small><h2 id="next-step-title">{recommended?.objective ?? "Explora tu material de estudio"}</h2><p>{recommended?.description ?? "Consulta el corpus incorporado y reconoce la estructura de tu ruta."}</p>{recommended?.reason && <div className="recommendation-reason">Por qué: {recommended.reason}</div>}<div className="next-step-meta"><span>5–10 minutos</span><span>{recommended?.questionCount ?? 0} preguntas revisadas</span><span>{masteryPercent(recommended?.mastery ?? 0)} % de dominio estimado</span></div><button className="button primary" disabled={!recommended} onClick={startRecommended}>{actionLabel} →</button></div>
      <aside><small>Tu dominio estimado</small><strong>{masteryPercent(recommended?.mastery ?? 0)}%</strong><div><span style={{ width: `${masteryPercent(recommended?.mastery ?? 0)}%` }}/></div><p>{recommended?.action === "REVIEW" ? "Este objetivo tiene un repaso pendiente." : dashboard?.pendingReviews.some((review) => review.due) ? "Hay un repaso pendiente en otro punto de tu ruta." : "Se ajusta después de cada respuesta."}</p></aside>
    </section>

    <section className="guided-summary" aria-label="Resumen de progreso"><article><small>Dominio global</small><strong>{masteryPercent(dashboard?.overallMastery ?? 0)}%</strong></article><article><small>Objetivos con actividad</small><strong>{dashboard?.objectives.filter((item) => item.totalAttempts > 0).length ?? 0}<span>/{dashboard?.objectives.length ?? 0}</span></strong></article><article><small>Repasos pendientes</small><strong>{dashboard?.pendingReviews.filter((item) => item.due).length ?? 0}</strong></article></section>

    <section className="route-context"><div><span className="eyebrow">Dónde estás</span><strong>{currentTopic ? `${currentTopic.block.name} · ${currentTopic.name}` : "Primer tema de la ruta"}</strong><p>{currentTopic?.description}</p></div><div><small>Avance de desbloqueo</small><strong>{routeProgress}%</strong><span>{unlockedTopics} de {allTopics.length} temas accesibles</span></div><div><small>Qué sigue</small><strong>{nextTopic?.name ?? "Cierre de la ruta"}</strong><span>{nextTopic?.accessible ? "Ya está disponible" : `Se desbloquea al alcanzar ${Math.round((currentTopic?.block.threshold ?? .7) * 100)} %`}</span></div></section>

    <details className="study-method"><summary><span><strong>Así vas a aprender</strong><small>Recupera, comprende, practica, aplica y repasa.</small></span><b>Ver método</b></summary><ol>{["Recuperación inicial", "Lectura y contraste con la fuente", "Práctica con preguntas", "Aplicación a situaciones", "Revisión programada"].map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol></details>

    <section className="guided-route"><div className="section-heading"><div><span className="eyebrow">Tu ruta de aprendizaje</span><h2>Seis bloques, revelados a tu ritmo</h2></div><span>{routeProgress}% desbloqueado</span></div>
      <div className="route-accordion">{dashboard?.route.map((block, blockIndex) => {
        const expanded = expandedBlockId === block.id;
        const average = block.topics.length ? block.topics.reduce((sum, topic) => sum + topic.mastery, 0) / block.topics.length : 0;
        return <article key={block.id} className={expanded ? "expanded" : ""}>
          <button className="route-block-toggle" aria-expanded={expanded} aria-controls={`block-${block.id}`} onClick={() => onBlockChange(expanded ? undefined : block.id)}><span className="route-block-number">{String(blockIndex + 1).padStart(2, "0")}</span><span><small>{blockState(block.topics)}</small><strong>{block.name}</strong><em>{block.description}</em></span><span className="route-block-progress"><b>{masteryPercent(average)}%</b><small>{block.topics.length} temas</small></span><i aria-hidden="true">{expanded ? "−" : "+"}</i></button>
          {expanded && <div className="route-block-content" id={`block-${block.id}`}>{block.topics.map((topic) => {
            const topicExpanded = expandedTopicId === topic.id;
            return <article className={`guided-topic ${topic.state.toLowerCase()}`} key={topic.id}>
              <button className="guided-topic-toggle" aria-expanded={topicExpanded} aria-controls={`topic-${topic.id}`} onClick={() => onTopicChange(topicExpanded ? undefined : topic.id)}><span className="route-index">{["COMPLETED", "MASTERED"].includes(topic.state) ? "✓" : topic.order}</span><span><small>{stateLabel(topic.state)}</small><strong>{topic.name}</strong><em>{topic.description}</em></span><b>{masteryPercent(topic.mastery)}%</b><i aria-hidden="true">{topicExpanded ? "−" : "+"}</i></button>
              {topicExpanded && <div className="guided-topic-detail" id={`topic-${topic.id}`}><div className="topic-context-actions"><button onClick={() => onMap(topic.id)}>Abrir mapa jurídico</button>{!topic.accessible && <span>Desbloqueado al alcanzar {Math.round(block.threshold * 100)} % en el tema anterior.</span>}</div>{topic.objectives.map((objective) => <article key={objective.objectiveId}><div><small>Objetivo de aprendizaje</small><strong>{objective.objective}</strong><p>{objective.description}</p></div><div><span>{masteryPercent(objective.mastery)}% · {objective.questionCount} preguntas</span><button disabled={!objective.accessible} onClick={() => objective.questionCount && objective.totalAttempts ? onPractice(objective.objectiveId, "PRACTICE") : onGuide(objective.objectiveId)}>{!objective.accessible ? "Bloqueado" : objective.questionCount && objective.totalAttempts ? "Practicar" : objective.questionCount ? "Aprender" : "Consultar material"}</button></div></article>)}</div>}
            </article>;
          })}</div>}
        </article>;
      })}</div>
    </section>

    <details className="recent-activity"><summary>Actividad reciente · {dashboard?.recentSessions.length ?? 0} sesiones completadas</summary><div>{dashboard?.recentSessions.length ? dashboard.recentSessions.map((session) => <span key={session.id}>{new Date(session.startedAt).toLocaleDateString("es-CO")} · {session.correctAnswers}/{session.totalQuestions} respuestas correctas</span>) : <span>Aún no hay sesiones completadas.</span>}</div></details>
    <section className="student-trust"><div><strong>Tu progreso se ajusta con tus respuestas</strong><p>Cada explicación confiable se vincula con evidencia jurídica revisada. El material pendiente permanece claramente identificado.</p></div><button className="text-button" onClick={onLibrary}>Consultar biblioteca →</button></section>
  </main>;
}
