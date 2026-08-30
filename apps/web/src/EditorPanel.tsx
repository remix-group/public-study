import { useEffect, useState, type FormEvent } from "react";
import { createEditorialQuestion, getEditorialCatalog, setQuestionPublication } from "./api";
import type { EditorialCatalog, EditorialQuestionInput } from "./types";

const initial: EditorialQuestionInput = {
  objectiveId: "", difficulty: 0.5, stem: "",
  options: ["A", "B", "C", "D"].map((key) => ({ key, text: "" })),
  correctAnswer: "A", explanation: "", evidenceIds: [],
};

export function EditorPanel({ onClose }: { onClose: () => void }) {
  const [catalog, setCatalog] = useState<EditorialCatalog | null>(null);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const result = await getEditorialCatalog();
    setCatalog(result);
    setForm((current) => ({ ...current, objectiveId: current.objectiveId || result.objectives[0]?.id || "", evidenceIds: current.evidenceIds.length ? current.evidenceIds : result.evidences[0] ? [result.evidences[0].id] : [] }));
  }
  useEffect(() => { refresh().catch((caught) => setError(caught instanceof Error ? caught.message : "No se pudo cargar el catálogo.")); }, []);

  async function create(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await createEditorialQuestion(form); setMessage("Borrador creado. Revísalo en la bandeja antes de publicarlo.");
      setForm((current) => ({ ...initial, objectiveId: current.objectiveId, evidenceIds: current.evidenceIds }));
      await refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "No fue posible crear el borrador."); }
    finally { setBusy(false); }
  }

  async function toggle(id: string, publish: boolean) {
    setBusy(true); setError("");
    try { await setQuestionPublication(id, publish); await refresh(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No fue posible cambiar la publicación."); }
    finally { setBusy(false); }
  }

  return (
    <main className="editor-page">
      <div className="editor-header"><div><div className="eyebrow">Herramientas internas</div><h1>Contenido editorial</h1><p>Todo contenido nuevo nace como borrador y necesita aprobación humana.</p></div><button className="text-button" onClick={onClose}>← Volver al estudio</button></div>
      {error && <div className="alert" role="alert">{error}</div>}{message && <div className="success-alert">{message}</div>}
      <div className="editor-grid">
        <section className="editor-form-card"><h2>Nueva pregunta</h2><form onSubmit={create}>
          <label>Objetivo<select value={form.objectiveId} onChange={(e) => setForm({ ...form, objectiveId: e.target.value })}>{catalog?.objectives.map((item) => <option value={item.id} key={item.id}>{item.topic.name} · {item.name}</option>)}</select></label>
          <label>Enunciado<textarea rows={3} value={form.stem} onChange={(e) => setForm({ ...form, stem: e.target.value })} required minLength={10}/></label>
          <div className="option-editor">{form.options.map((option, index) => <label key={option.key}><span>{option.key}</span><input value={option.text} onChange={(e) => { const options = [...form.options]; options[index] = { ...option, text: e.target.value }; setForm({ ...form, options }); }} required/></label>)}</div>
          <div className="form-row"><label>Respuesta correcta<select value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}>{form.options.map(({ key }) => <option key={key}>{key}</option>)}</select></label><label>Dificultad <strong>{Math.round(form.difficulty * 100)}%</strong><input type="range" min="0" max="1" step="0.1" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })}/></label></div>
          <label>Explicación<textarea rows={3} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} required minLength={10}/></label>
          <label>Evidencia jurídica<select value={form.evidenceIds[0] ?? ""} onChange={(e) => setForm({ ...form, evidenceIds: [e.target.value] })}>{catalog?.evidences.map((item) => <option value={item.id} key={item.id}>{item.citation}</option>)}</select></label>
          <button className="button primary wide" disabled={busy}>Guardar como borrador</button>
        </form></section>
        <section className="editor-list"><div className="editor-list-title"><h2>Bandeja de revisión</h2><span>{catalog?.questions.length ?? 0} preguntas</span></div>
          {catalog?.questions.map((question) => <article className="editor-question" key={question.id}><div className="editor-question-meta"><span className={`publication ${question.editorialStatus}`}>{question.editorialStatus === "published" ? "Publicada" : "Borrador"}</span><span>{question.objective.name}</span></div><h3>{question.stem}</h3><p>{question.evidences.map(({ evidence }) => evidence.citation).join(" · ")}</p><div><span>Respuesta: <strong>{question.correctAnswer}</strong></span><button disabled={busy} onClick={() => toggle(question.id, question.editorialStatus !== "published")}>{question.editorialStatus === "published" ? "Retirar" : "Revisar y publicar"}</button></div></article>)}
        </section>
      </div>
    </main>
  );
}
