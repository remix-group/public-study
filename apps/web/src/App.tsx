import { useEffect, useState } from "react";
import { finishSession, getCurrentStudent, getDashboard, getNextQuestion, logout, startSession, submitAttempt } from "./api";
import { difficultyLabel, formatReviewDate, masteryPercent } from "./format";
import type { AttemptResponse, AuthStudent, Dashboard, LearningObjective, Question, SessionStartResponse, SessionSummary } from "./types";
import { AuthScreen } from "./AuthScreen";
import { EditorPanel } from "./EditorPanel";

type Screen = "checking" | "auth" | "welcome" | "loading" | "question" | "feedback" | "summary" | "editor" | "empty";

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
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    if (screen === "question") setStartedAt(Date.now());
  }, [screen, question?.id]);

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

  async function begin() {
    setScreen("loading"); setError("");
    try {
      const data = await startSession();
      setSessionData(data);
      const next = await getNextQuestion(data.session.id);
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

  async function continueSession() {
    if (!sessionData) return;
    setScreen("loading"); setError("");
    try {
      const next = await getNextQuestion(sessionData.session.id);
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

  function restart() {
    setSessionData(null); setObjective(null); setQuestion(null); setSelected("");
    setFeedback(null); setSummary(null); setConfidence(0.5); setScreen("welcome");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Brand />
        {student ? <div className="account-actions">{student.role === "editor" && <button className="editor-link" onClick={() => setScreen("editor")}>Panel editorial</button>}<button className="account-button" onClick={signOut}><span>{student.name.slice(0, 1).toUpperCase()}</span><span>{student.name}<small>Cerrar sesión</small></span></button></div> : <div className="topbar-meta">
          <span className="status-dot" /> Contenido con respaldo normativo
        </div>}
      </header>

      {screen === "checking" && <main className="center-state"><div className="loader"/><p>Verificando sesión…</p></main>}
      {screen === "auth" && <AuthScreen onAuthenticated={authenticated}/>}
      {screen === "editor" && <EditorPanel onClose={() => setScreen("welcome")}/>}

      {screen === "welcome" && (
        <main className="welcome">
          <section className="hero">
            <div className="eyebrow">Preparación concurso de méritos</div>
            <h1>Domina Cobro Coactivo<br/><em>con práctica inteligente.</em></h1>
            <p className="hero-copy">Entrena sobre situaciones concretas, entiende tus errores y repasa justo cuando lo necesitas. Cada respuesta está respaldada por normativa oficial.</p>
            {error && <div className="alert" role="alert">{error} <small>Comprueba que la API y PostgreSQL estén activos.</small></div>}
            <button className="button primary" onClick={begin}>Comenzar sesión <span aria-hidden="true">→</span></button>
            <p className="demo-note">Sesión de demostración · 5–10 minutos</p>
          </section>
          <section className="preview-card" aria-label="Resumen del entrenamiento">
            <div className="preview-top"><span>Tu ruta de hoy</span><span className="pill">{dashboard ? `${masteryPercent(dashboard.overallMastery)}% dominio` : "MVP"}</span></div>
            <div className="preview-title"><Icon name="target"/><div><small>Competencia funcional</small><strong>Cobro Coactivo</strong></div></div>
            <div className="route-line"><span className="route-step active">1</span><div><strong>Fundamentos del procedimiento</strong><small>Artículo 823 · Estatuto Tributario</small></div></div>
            <div className="route-line muted"><span className="route-step">2</span><div><strong>Mandamiento de pago</strong><small>Próximamente</small></div></div>
            <div className="route-line muted"><span className="route-step">3</span><div><strong>Medidas preventivas</strong><small>Próximamente</small></div></div>
            <div className="legal-seal"><Icon name="shield"/><span><strong>Evidencia verificable</strong><small>Fuentes jurídicas asociadas a cada respuesta</small></span></div>
          </section>
          <section className="benefits">
            <article><Icon name="book"/><div><strong>Aprende con contexto</strong><p>No memorices respuestas aisladas. Comprende la norma que las sustenta.</p></div></article>
            <article><Icon name="target"/><div><strong>Detecta tus vacíos</strong><p>Cada error ajusta tu nivel de dominio y orienta el siguiente repaso.</p></div></article>
            <article><Icon name="clock"/><div><strong>Repasa a tiempo</strong><p>El sistema programa revisiones para fortalecer la retención.</p></div></article>
          </section>
          {dashboard && dashboard.recentSessions.length > 0 && (
            <section className="dashboard-strip">
              <div><small>Progreso acumulado</small><strong>{masteryPercent(dashboard.overallMastery)}%</strong></div>
              <div><small>Objetivos practicados</small><strong>{dashboard.objectives.length}</strong></div>
              <div><small>Revisiones pendientes</small><strong>{dashboard.pendingReviews.length}</strong></div>
              <div><small>Sesiones completadas</small><strong>{dashboard.recentSessions.length}</strong></div>
            </section>
          )}
        </main>
      )}

      {screen === "loading" && <main className="center-state"><div className="loader"/><h2>Preparando tu sesión</h2><p>Organizando objetivos y evidencia jurídica…</p></main>}

      {(screen === "question" || screen === "feedback") && question && objective && (
        <main className="study-layout">
          <aside className="study-sidebar">
            <button className="text-button" onClick={restart}>← Salir de la sesión</button>
            <div className="session-label">Sesión actual</div>
            <h2>{sessionData?.competency.name}</h2>
            <div className="progress-copy"><span>Pregunta {questionNumber} de 10</span><span>{questionNumber * 10}%</span></div>
            <div className="progress-track"><span style={{ width: `${questionNumber * 10}%` }}/></div>
            <div className="objective-card"><span>01</span><div><small>Objetivo de aprendizaje</small><strong>{objective.name}</strong></div></div>
            <div className="sidebar-note"><Icon name="shield"/><span>La evaluación usa evidencia jurídica almacenada y trazable.</span></div>
          </aside>

          <section className="study-main">
            {screen === "question" ? (
              <div className="question-wrap">
                <div className="question-meta"><span>Pregunta {questionNumber} de 10</span><span className="difficulty">{difficultyLabel(question.difficulty)}</span></div>
                <h1>{question.stem}</h1>
                <div className="options" role="radiogroup" aria-label="Opciones de respuesta">
                  {question.options?.map((option) => (
                    <button key={option.key} role="radio" aria-checked={selected === option.key} className={`option ${selected === option.key ? "selected" : ""}`} onClick={() => setSelected(option.key)}>
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
                <div className="mastery-card">
                  <div className="mastery-ring" style={{ "--value": `${masteryPercent(feedback.mastery) * 3.6}deg` } as React.CSSProperties}><span>{masteryPercent(feedback.mastery)}<small>%</small></span></div>
                  <div><small>Dominio estimado del objetivo</small><strong>{feedback.masteryDelta >= 0 ? "+" : ""}{Math.round(feedback.masteryDelta * 100)} puntos en esta respuesta</strong><p>Este valor se ajusta con cada intento y no representa una calificación definitiva.</p></div>
                </div>
                {feedback.evidence.map((evidence) => (
                  <article className="evidence-card" key={evidence.evidenceId}>
                    <div className="evidence-heading"><Icon name="book"/><div><small>Fundamento jurídico</small><strong>{evidence.citation}</strong></div></div>
                    <blockquote>{evidence.content}</blockquote>
                  </article>
                ))}
                <div className="review-card"><Icon name="clock"/><div><small>Próxima revisión sugerida</small><strong>{formatReviewDate(feedback.nextReviewDate)}</strong></div></div>
                {error && <div className="alert" role="alert">{error}</div>}
                <button className="button primary wide" onClick={continueSession}>Siguiente pregunta <span aria-hidden="true">→</span></button>
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
