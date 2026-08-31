import { useEffect, useState } from "react";
import { getStudyGuide } from "./api";
import type { StudyGuide } from "./types";

export function GuidedStudy({ objectiveId, onBack, onPractice }: { objectiveId: string; onBack: () => void; onPractice: () => void }) {
  const [guide, setGuide] = useState<StudyGuide | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setGuide(null); setError("");
    getStudyGuide(objectiveId).then(setGuide).catch((caught) => setError(caught instanceof Error ? caught.message : "No se pudo cargar la lectura."));
  }, [objectiveId]);

  if (error) return <main className="center-state"><div className="alert">{error}</div><button className="button primary" onClick={onBack}>Volver a la ruta</button></main>;
  if (!guide) return <main className="center-state"><div className="loader"/><h2>Preparando la lectura</h2><p>Reuniendo evidencia jurídica validada…</p></main>;

  return <main className="guide-page">
    <button className="text-button guide-back" onClick={onBack}>← Volver a mi ruta</button>
    <header className="guide-header"><div><div className="eyebrow">Lectura guiada · {guide.competency.name}</div><h1>{guide.objective.name}</h1><p>{guide.objective.description}</p></div><aside><small>Después de esta lectura</small><strong>{guide.questionCount} preguntas</strong><span>Práctica enfocada</span></aside></header>
    <div className="guide-layout"><section className="guide-content">
      <article className="guide-intro"><span>01</span><div><small>Propósito</small><h2>Qué debes poder hacer</h2><p>{guide.objective.description}. Al terminar, intenta explicar la regla con tus propias palabras y reconocerla en un caso práctico.</p></div></article>
      <section className="concept-section"><div className="guide-section-title"><span>02</span><div><small>Ideas esenciales</small><h2>Conceptos que debes retener</h2></div></div><div className="concept-list">{guide.keyConcepts.map((concept, index) => <article key={concept}><strong>{index + 1}</strong><p>{concept}</p></article>)}</div></section>
      <section className="norm-section"><div className="guide-section-title"><span>03</span><div><small>Fuente primaria</small><h2>Lee la norma que lo sustenta</h2></div></div>{guide.evidences.map((evidence) => <article className="guide-evidence" key={evidence.id}><header><div><small>{evidence.documentTitle}</small><h3>{evidence.provisionNumber} · {evidence.provisionTitle}</h3></div>{evidence.officialUrl && <a href={evidence.officialUrl} target="_blank" rel="noreferrer">Fuente oficial ↗</a>}</header><blockquote>{evidence.content}</blockquote><footer>{evidence.citation}</footer></article>)}</section>
      <section className="guide-ready"><div><small>Ahora comprueba tu comprensión</small><h2>Practica sin consultar la lectura</h2><p>Recibirás explicación y fundamento jurídico después de cada respuesta.</p></div><button className="button primary" onClick={onPractice}>Comenzar práctica <span>→</span></button></section>
    </section><aside className="guide-sidebar"><strong>Cómo estudiar esta lectura</strong><ol><li>Identifica quién puede actuar.</li><li>Reconoce la acción o regla principal.</li><li>Ubica términos, condiciones y excepciones.</li><li>Explícala sin mirar el texto.</li></ol><div><span>Consejo</span><p>No memorices el número del artículo de forma aislada. Relaciónalo con la situación que regula.</p></div></aside></div>
  </main>;
}
