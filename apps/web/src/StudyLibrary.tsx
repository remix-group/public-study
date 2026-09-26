import { useEffect, useState, type FormEvent } from "react";
import { getStudyLibrary } from "./api";
import type { StudyLibrary as StudyLibraryData } from "./types";

export function StudyLibrary({ onClose }: { onClose: () => void }) {
  const [library, setLibrary] = useState<StudyLibraryData | null>(null);
  const [documentId, setDocumentId] = useState<string>();
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); setError("");
    getStudyLibrary(documentId, activeQuery, page)
      .then((result) => { setLibrary(result); if (!documentId && result.selectedDocument) setDocumentId(result.selectedDocument.id); })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "No se pudo cargar la biblioteca."))
      .finally(() => setLoading(false));
  }, [documentId, activeQuery, page]);

  function search(event: FormEvent) {
    event.preventDefault(); setPage(1); setActiveQuery(query.trim());
  }

  const activeDocument = library?.documents.find((document) => document.id === documentId) ?? library?.documents[0];
  return <main className="library-page">
    <header className="library-header"><div><span className="eyebrow">Biblioteca de estudio</span><h1>Todo el material de la OPEC 236828</h1><p>Consulta documentos, normas, cartillas y extracciones incorporadas al Knowledge Core.</p></div><button className="text-button" onClick={onClose}>← Volver a mi ruta</button></header>
    <div className="library-layout">
      <aside className="library-documents"><div><strong>{library?.documents.length ?? 0} documentos</strong><small>Material importado · revisión editorial progresiva</small></div>{library?.documents.map((document) => <button className={activeDocument?.id === document.id ? "active" : ""} key={document.id} onClick={() => { setDocumentId(document.id); setPage(1); setQuery(""); setActiveQuery(""); }}><span>{document.documentType.replaceAll("_", " ")}</span><strong>{document.title}</strong><small>{document.unitCount.toLocaleString("es-CO")} unidades · {document.pipelineStatus.replaceAll("_", " ")}</small></button>)}</aside>
      <section className="library-content">
        {activeDocument && <div className="library-document-heading"><div><span>{activeDocument.pipelineStatus.replaceAll("_", " ")}</span><h2>{activeDocument.title}</h2><p>{activeDocument.authority} · {activeDocument.unitCount.toLocaleString("es-CO")} unidades disponibles</p></div>{activeDocument.contentHash && <code>SHA-256 {activeDocument.contentHash.slice(0, 20)}…</code>}</div>}
        <form className="library-search" onSubmit={search}><label htmlFor="material-search">Buscar por número o título</label><div><input id="material-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. artículo 823, medidas cautelares…"/><button className="button primary">Buscar</button></div></form>
        {error && <div className="alert">{error}</div>}
        {loading ? <div className="library-loading"><div className="loader"/><p>Cargando material…</p></div> : <div className="library-units">{library?.units.length ? library.units.map((unit) => <article key={unit.id}><header><div><span>{unit.unitType.replaceAll("_", " ")}</span><h3>{unit.number} · {unit.title}</h3></div><small>{unit.validationStatus === "approved" && unit.editorialStatus === "published" ? "Revisado" : "Pendiente de revisión"}</small></header><pre>{unit.content || "Esta unidad no contiene texto extraído."}</pre><footer>{unit.citation}</footer></article>) : <div className="empty-library"><h3>Sin coincidencias</h3><p>Prueba otro número o título dentro de este documento.</p></div>}</div>}
        {!!library?.totalPages && <nav className="library-pagination" aria-label="Paginación"><button disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>← Anterior</button><span>Página {library.page} de {library.totalPages} · {library.totalUnits.toLocaleString("es-CO")} unidades</span><button disabled={page >= library.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Siguiente →</button></nav>}
      </section>
    </div>
  </main>;
}
