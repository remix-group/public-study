import { useEffect, useState } from "react";
import { finishSession, getCurrentStudent, getDashboard, getNextCase, getNextQuestion, logout, startSession, submitAttempt, submitCaseAttempt } from "./api";
import { difficultyLabel, formatReviewDate, masteryPercent } from "./format";
import type { AttemptResponse, AuthStudent, CaseAttemptResponse, CaseExercise, Dashboard, LearningObjective, Question, SessionStartResponse, SessionSummary } from "./types";
import { AuthScreen } from "./AuthScreen";
import { EditorPanel } from "./EditorPanel";
import { KnowledgePanel } from "./KnowledgePanel";
import { GuidedStudy } from "./GuidedStudy";
import { TopicKnowledgeMap } from "./TopicKnowledgeMap";
import { StudyLibrary } from "./StudyLibrary";
import { GuidedHome } from "./GuidedHome";
import { InstitutionalMap } from "./InstitutionalMap";

type Screen = "checking" | "auth" | "welcome" | "guide" | "map" | "institutional" | "library" | "loading" | "question" | "feedback" | "case" | "case-feedback" | "summary" | "editor" | "knowledge" | "empty";

function Brand() {
  return (
    <div className="brand" aria-label="DIAN Estudio">
      <span className="brand-mark" aria-hidden="true"><span>D</span></span>
      <span><strong>DIAN</strong><small>Estudio</small></span>
    </div>
  );
}

function Icon({ name }: { name: "book" | "target" | "clock" | "shield" }) {
  const paths = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v15h4.5a2.5 2.5 0 0 1 2.5 2.5z"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="m15 9 5-5M17 4h3v3"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.5 2.7 8 7 10 4.3-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/></>,
  };
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{paths[name]}</svg>;
}

export function App() {
  const [screen, setScreen] = useState<Screen>("checking");
  const [student, setStudent] = useState<AuthStudent | null>(null);
  const [sessionData, setSessionData] = useState<SessionStartResponse | null>(null);
  const [objective, setObjective] = useState<LearningObjective | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState("");
  const [confidence, setConfidence] = useState(0.5);
  const [feedback, setFeedback] = useState<AttemptResponse | null>(null);
  const [caseExercise, setCaseExercise] = useState<CaseExercise | null>(null);
  const [caseAnswer, setCaseAnswer] = useState("");
  const [caseFeedback, setCaseFeedback] = useState<CaseAttemptResponse | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [sessionQuestionTarget, setSessionQuestionTarget] = useState(10);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [focusObjectiveId, setFocusObjectiveId] = useState<string | undefined>();
  const [guideObjectiveId, setGuideObjectiveId] = useState<string | undefined>();
  const [mapTopicId, setMapTopicId] = useState<string | undefined>();
  const [expandedBlockId, setExpandedBlockId] = useState<string | undefined>();
  const [expandedTopicId, setExpandedTopicId] = useState<string | undefined>();
  const [librarySource, setLibrarySource] = useState<{ documentId: string; provisionId: string }>();

  function openGuide(objectiveId?: string) {
    if (!objectiveId) { begin(); return; }
    setGuideObjectiveId(objectiveId); setScreen("guide");
  }

  function openMap(topicId: string) {
    setMapTopicId(topicId); setScreen("map");
  }

  function openSourceMaterial(documentId: string, provisionId: string) {
    setLibrarySource({ documentId, provisionId }); setScreen("library");
  }

  function openLibrary() {
    setLibrarySource(undefined); setScreen("library");
  }

  useEffect(() => {
    if (screen === "question" || screen === "case") setStartedAt(Date.now());
  }, [screen, question?.id]);

  useEffect(() => {
    const recommendation = dashboard?.recommendedObjective;
    if (!recommendation) return;
    setExpandedBlockId(recommendation.blockId);
    setExpandedTopicId(recommendation.topicId);
  }, [dashboard?.recommendedObjective?.objectiveId]);

  const caseAnswerLength = caseAnswer.trim().length;
  const caseAnswerReady = caseAnswerLength >= 80;
  const caseAnswerProgress = Math.min(100, Math.round((caseAnswerLength / 80) * 100));

  useEffect(() => {
    getCurrentStudent().then(({ student: current }) => {
      setStudent(current); setScreen("welcome"); getDashboard().then(setDashboard).catch(() => undefined);
    }).catch(() => setScreen("auth"));
  }, []);

  function authenticated(current: AuthStudent) {
    setStudent(current); setScreen("welcome"); getDashboard().then(setDashboard).catch(() => undefined);
  }

  async function signOut() {
    await logout().catch(() => undefined); setStudent(null); setDashboard(null); setScreen("auth");
  }

  async function begin(objectiveId?: string, mode: "LEARN" | "PRACTICE" | "ASSESS" | "REVIEW" | "CASE" = "PRACTICE") {
    setScreen("loading"); setError("");
    try {
      setFocusObjectiveId(objectiveId);
      const objectiveQuestionCount = objectiveId
        ? dashboard?.objectives.find((item) => item.objectiveId === objectiveId)?.questionCount
        : undefined;
      setSessionQuestionTarget(Math.max(1, objectiveQuestionCount ?? 10));
      const data = await startSession(mode, objectiveId);
      setSessionData(data);
      const next = await getNextQuestion(data.session.id, objectiveId);
      if (!next) { setScreen("empty"); return; }
      setObjective(next.objective);
      setQuestion(next.question);
      setQuestionNumber(1);
      setScreen("question");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ocurrió un error inesperado.");
      setScreen("welcome");
    }
  }

  async function beginCase(objectiveId: string) {
    setScreen("loading"); setError("");
    try {
      setFocusObjectiveId(objectiveId);
      const data = await startSession("CASE", objectiveId);
      setSessionData(data);
      const next = await getNextCase(data.session.id, objectiveId);
      if (!next) { setScreen("empty"); return; }
      setObjective(next.objective); setCaseExercise(next.case); setCaseAnswer(""); setCaseFeedback(null); setScreen("case");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos preparar el caso situacional."); setScreen("welcome");
    }
  }

  async function continueSession() {
    if (!sessionData) return;
    setScreen("loading"); setError("");
    try {
      if (questionNumber >= sessionQuestionTarget) {
        const result = await finishSession(sessionData.session.id);
        setSummary(result); setScreen("summary");
        getDashboard().then(setDashboard).catch(() => undefined);
        return;
      }
      const next = await getNextQuestion(sessionData.session.id, focusObjectiveId);
      if (next) {
        setQuestion(next.question); setObjective(next.objective); setSelected(""); setConfidence(0.5);
        setFeedback(null); setQuestionNumber((value) => value + 1); setScreen("question");
        return;
      }
      const result = await finishSession(sessionData.session.id);
      setSummary(result); setScreen("summary");
      getDashboard().then(setDashboard).catch(() => undefined);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos continuar la sesión.");
      setScreen("feedback");
    }
  }

  async function answer() {
    if (!selected || !question || !sessionData) return;
    setSubmitting(true); setError("");
    try {
      const result = await submitAttempt({
        sessionId: sessionData.session.id,
        questionId: question.id,
        answer: selected,
        timeSpentMs: Math.max(1, Date.now() - startedAt),
        confidence,
      });
      setFeedback(result);
      setScreen("feedback");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos registrar tu respuesta.");
    } finally { setSubmitting(false); }
  }

  async function answerCase() {
    if (!caseExercise || !sessionData || caseAnswer.trim().length < 80) return;
    setSubmitting(true); setError("");
    try {
      const result = await submitCaseAttempt({ sessionId: sessionData.session.id, caseId: caseExercise.id, response: caseAnswer, timeSpentMs: Math.max(1, Date.now() - startedAt) });
      setCaseFeedback(result); setScreen("case-feedback");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos registrar tu análisis.");
    } finally { setSubmitting(false); }
  }

  async function finishCase() {
    if (!sessionData) return;
    const result = await finishSession(sessionData.session.id); setSummary(result); setScreen("summary");
    getDashboard().then(setDashboard).catch(() => undefined);
  }

  function restart() {
    setSessionData(null); setObjective(null); setQuestion(null); setSelected("");
    setFeedback(null); setCaseExercise(null); setCaseAnswer(""); setCaseFeedback(null); setSummary(null); setConfidence(0.5); setFocusObjectiveId(undefined); setSessionQuestionTarget(10); setScreen("welcome");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Brand />
        {student ? <div className="account-actions"><button className="editor-link" onClick={() => setScreen("institutional")}>Instituciones</button><button className="editor-link" onClick={openLibrary}>Biblioteca</button>{student.role === "editor" && <><button className="editor-link" onClick={() => setScreen("knowledge")}>Fuentes</button><button className="editor-link" onClick={() => setScreen("editor")}>Preguntas</button></>}<button className="account-button" onClick={signOut}><span>{student.name.slice(0, 1).toUpperCase()}</span><span>{student.name}<small>Cerrar sesión</small></span></button></div> : <div className="topbar-meta">
          <span className="status-dot" /> Contenido con respaldo normativo
        </div>}
      </header>

      {screen === "checking" && <main className="center-state"><div className="loader"/><p>Verificando sesión…</p></main>}
      {screen === "auth" && <AuthScreen onAuthenticated={authenticated}/>}
      {screen === "editor" && <EditorPanel onClose={() => setScreen("welcome")}/>}
      {screen === "knowledge" && <KnowledgePanel onClose={() => setScreen("welcome")}/>}
      {screen === "library" && <StudyLibrary initialDocumentId={librarySource?.documentId} initialUnitId={librarySource?.provisionId} onClose={() => { setLibrarySource(undefined); setScreen("welcome"); }}/>} 
      {screen === "institutional" && <InstitutionalMap onClose={() => setScreen("welcome")}/>} 
      {screen === "guide" && guideObjectiveId && <GuidedStudy objectiveId={guideObjectiveId} onBack={() => setScreen("welcome")} onPractice={() => begin(guideObjectiveId, "PRACTICE")} onCase={() => beginCase(guideObjectiveId)} onOpenSource={openSourceMaterial}/>}
      {screen === "map" && mapTopicId && <TopicKnowledgeMap topicId={mapTopicId} onBack={() => setScreen("welcome")}/>}

      {screen === "welcome" && <><GuidedHome dashboard={dashboard} studentName={student?.name ?? "Estudiante"} expandedBlockId={expandedBlockId} expandedTopicId={expandedTopicId} onBlockChange={setExpandedBlockId} onTopicChange={setExpandedTopicId} onLibrary={openLibrary} onGuide={openGuide} onPractice={(objectiveId, mode) => begin(objectiveId, mode)} onMap={openMap}/>{error && <div className="home-alert alert" role="alert">{error}</div>}</>}

      {screen === "loading" && <main className="center-state"><div className="loader"/><h2>Preparando tu sesión</h2><p>Organizando objetivos y evidencia jurídica…</p></main>}

      {(screen === "case" || screen === "case-feedback") && caseExercise && objective && (
        <main className="study-layout">
          <aside className="study-sidebar">
            <button className="text-button" onClick={restart}>← Salir del caso</button>
            <div className="session-label">Caso situacional</div>
            <h2>{sessionData?.competency.name}</h2>
            <div className="objective-card"><span>01</span><div><small>Objetivo de aprendizaje</small><strong>{objective.name}</strong></div></div>
            <div className="sidebar-note"><Icon name="shield"/><span>La respuesta se registra para autoevaluación; no se califica automáticamente una interpretación jurídica abierta.</span></div>
          </aside>
          <section className="study-main">
            {screen === "case" ? <div className="question-wrap case-question-wrap">
              <div className="question-meta"><span>Análisis aplicado</span><span className="difficulty">{difficultyLabel(caseExercise.difficulty)}</span></div>
              <h1>Examina la situación y sustenta tu respuesta</h1>
              <section className="case-scenario" aria-labelledby="case-scenario-title">
                <header><Icon name="target"/><div><small>Situación planteada</small><strong id="case-scenario-title">Identifica el problema antes de responder</strong></div></header>
                <p>{caseExercise.scenario}</p>
              </section>
              <section className={`case-response-card ${caseAnswerReady ? "ready" : ""}`} aria-labelledby="case-response-title">
                <header className="case-response-heading">
                  <div><span>Tu respuesta</span><label id="case-response-title" htmlFor="case-response">Análisis jurídico sustentado</label></div>
                  <strong>{caseAnswerReady ? "Extensión mínima alcanzada" : `${Math.max(0, 80 - caseAnswerLength)} caracteres por completar`}</strong>
                </header>
                <p className="case-response-help" id="case-response-help">Construye una respuesta clara y razonada. La estructura sugerida sirve como guía, pero puedes redactar con tus propias palabras.</p>
                <div className="case-response-guide" aria-label="Estructura sugerida para la respuesta">
                  <span><b>1</b> Hechos relevantes</span><span><b>2</b> Norma aplicable</span><span><b>3</b> Análisis</span><span><b>4</b> Conclusión</span>
                </div>
                <textarea id="case-response" rows={12} value={caseAnswer} onChange={(event) => setCaseAnswer(event.target.value)} aria-describedby="case-response-help case-response-count" placeholder="Ejemplo de inicio: En esta situación, los hechos relevantes son… La norma aplicable establece… Por lo tanto…" spellCheck="true"/>
                <footer className="case-response-footer">
                  <div className="case-character-progress" aria-hidden="true"><span style={{ width: `${caseAnswerProgress}%` }}/></div>
                  <small id="case-response-count"><b>{caseAnswerLength}</b> caracteres · mínimo 80</small>
                </footer>
              </section>
              {error && <div className="alert" role="alert">{error}</div>}
              <button className="button primary wide case-submit" disabled={!caseAnswerReady || submitting} onClick={answerCase}>{submitting ? "Registrando…" : "Registrar y contrastar análisis"}</button>
            </div> : caseFeedback && <div className="feedback-wrap">
              <div className="result-badge correct">Respuesta registrada</div>
              <h1>Contrasta tu razonamiento.</h1>
              <p className="explanation">Este ejercicio no usa una calificación automática. Compara tu análisis con la referencia editorial y las fuentes antes de cerrar.</p>
              <div className="diagnosis-card"><small>Referencia editorial</small><strong>{caseFeedback.expectedAnalysis}</strong></div>
              {caseFeedback.evidence.map((evidence) => <article className="evidence-card" key={evidence.evidenceId}><div className="evidence-heading"><Icon name="book"/><div><small>Fundamento jurídico</small><strong>{evidence.citation}</strong></div></div><blockquote>{evidence.content}</blockquote></article>)}
              <div className="review-card"><Icon name="clock"/><div><small>Próxima revisión sugerida</small><strong>{formatReviewDate(caseFeedback.nextReviewDate)}</strong></div></div>
              <button className="button primary wide" onClick={finishCase}>Finalizar caso <span aria-hidden="true">→</span></button>
            </div>}
          </section>
        </main>
      )}

      {(screen === "question" || screen === "feedback") && question && objective && (
        <main className="study-layout">
          <aside className="study-sidebar">
            <button className="text-button" onClick={restart}>← Salir de la sesión</button>
            <div className="session-label">Sesión actual</div>
            <h2>{sessionData?.competency.name}</h2>
            <div className="progress-copy"><span>Pregunta {questionNumber} de {sessionQuestionTarget}</span><span>{Math.min(100, Math.round((questionNumber / sessionQuestionTarget) * 100))}%</span></div>
            <div className="progress-track"><span style={{ width: `${Math.min(100, (questionNumber / sessionQuestionTarget) * 100)}%` }}/></div>
            <div className="objective-card"><span>01</span><div><small>Objetivo de aprendizaje</small><strong>{objective.name}</strong></div></div>
            <div className="sidebar-note"><Icon name="shield"/><span>La evaluación usa evidencia jurídica almacenada y trazable.</span></div>
          </aside>

          <section className="study-main">
            {screen === "question" ? (
              <div className="question-wrap">
                <div className="question-meta"><span>Pregunta {questionNumber} de {sessionQuestionTarget}</span><span className="difficulty">{difficultyLabel(question.difficulty)}</span></div>
                <h1>{question.stem}</h1>
                <div className="options" role="radiogroup" aria-label="Opciones de respuesta">
                  {question.options?.map((option) => (
                    <button key={option.key} role="radio" aria-checked={selected === option.key} className={`option ${selected === option.key ? "selected" : ""}`} onClick={() => setSelected(option.key)} onKeyDown={(event) => {
                      if (!question.options?.length || !["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) return;
                      event.preventDefault();
                      const index = question.options.findIndex(({ key }) => key === option.key);
                      const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
                      const nextIndex = (index + direction + question.options.length) % question.options.length;
                      setSelected(question.options[nextIndex].key);
                      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=radio]")[nextIndex]?.focus();
                    }}>
                      <span>{option.key}</span><strong>{option.text}</strong>
                    </button>
                  ))}
                </div>
                <div className="confidence-block">
                  <label htmlFor="confidence"><span>¿Qué tan seguro estás?</span><strong>{Math.round(confidence * 100)}%</strong></label>
                  <input id="confidence" type="range" min="0" max="1" step="0.1" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))}/>
                  <div><span>Nada seguro</span><span>Muy seguro</span></div>
                </div>
                {error && <div className="alert" role="alert">{error}</div>}
                <button className="button primary wide" disabled={!selected || submitting} onClick={answer}>{submitting ? "Evaluando…" : "Comprobar respuesta"}</button>
              </div>
            ) : feedback && (
              <div className="feedback-wrap">
                <div className={`result-badge ${feedback.isCorrect ? "correct" : "incorrect"}`}>{feedback.isCorrect ? "✓ Respuesta correcta" : "× Respuesta por reforzar"}</div>
                <h1>{feedback.isCorrect ? "Buen trabajo." : "Este punto merece otro repaso."}</h1>
                <p className="explanation">{feedback.explanation}</p>
                {feedback.mistakes.map((mistake) => <div className="diagnosis-card" key={mistake.id}><small>Diagnóstico · {mistake.type.replaceAll("_", " ")}</small><strong>{mistake.description}</strong><p>El siguiente ejercicio y el repaso se ajustarán a este patrón.</p></div>)}
                <div className="mastery-card">
                  <div className="mastery-ring" style={{ "--value": `${masteryPercent(feedback.mastery) * 3.6}deg` } as React.CSSProperties}><span>{masteryPercent(feedback.mastery)}<small>%</small></span></div>
                  <div><small>Dominio estimado del objetivo</small><strong>{feedback.masteryDelta >= 0 ? "+" : ""}{Math.round(feedback.masteryDelta * 100)} puntos en esta respuesta</strong><p>Este valor se ajusta con cada intento y no representa una calificación definitiva.</p></div>
                </div>
                <div className="dimension-grid">{Object.entries(feedback.masteryDimensions).map(([name, value]) => <div key={name}><span>{name.replace("sourceAwareness", "fuentes")}</span><strong>{masteryPercent(value)}</strong><i><b style={{ width: `${masteryPercent(value)}%` }}/></i></div>)}</div>
                {feedback.evidence.map((evidence) => (
                  <article className="evidence-card" key={evidence.evidenceId}>
                    <div className="evidence-heading"><Icon name="book"/><div><small>Fundamento jurídico</small><strong>{evidence.citation}</strong></div></div>
                    <blockquote>{evidence.content}</blockquote>
                  </article>
                ))}
                <div className="review-card"><Icon name="clock"/><div><small>Próxima revisión sugerida</small><strong>{formatReviewDate(feedback.nextReviewDate)}</strong></div></div>
                {error && <div className="alert" role="alert">{error}</div>}
                <button className="button primary wide" onClick={continueSession}>{questionNumber >= sessionQuestionTarget ? "Finalizar sesión" : "Siguiente pregunta"} <span aria-hidden="true">→</span></button>
              </div>
            )}
          </section>
        </main>
      )}

      {screen === "summary" && summary && (
        <main className="summary-page">
          <div className="summary-heading"><div className="result-badge correct">Sesión completada</div><h1>Una práctica más,<br/>un vacío menos.</h1><p>Revisa tu resultado y vuelve cuando llegue la próxima revisión programada.</p></div>
          <section className="summary-stats">
            <article><small>Resultado</small><strong>{Math.round(summary.accuracy * 100)}%</strong><span>{summary.session.correctAnswers} de {summary.session.totalQuestions} correctas</span></article>
            <article><small>Preguntas</small><strong>{summary.session.totalQuestions}</strong><span>Objetivos de Cobro Coactivo</span></article>
            <article><small>Dominio global</small><strong>{masteryPercent(dashboard?.overallMastery ?? 0)}%</strong><span>Estimación adaptativa actual</span></article>
          </section>
          <section className="attempt-review"><h2>Resumen de respuestas</h2>{summary.attempts.map((attempt, index) => <div key={attempt.id}><span className={attempt.result === "correct" ? "ok" : "bad"}>{attempt.result === "correct" ? "✓" : "×"}</span><span><small>{attempt.objective}</small><strong>{index + 1}. {attempt.question}</strong></span></div>)}</section>
          <button className="button primary" onClick={restart}>Volver al inicio</button>
        </main>
      )}

      {screen === "empty" && <main className="center-state"><h2>Aún no hay práctica disponible</h2><p>La competencia no tiene preguntas activas para este objetivo.</p><button className="button primary" onClick={restart}>Volver al inicio</button></main>}
    </div>
  );
}
