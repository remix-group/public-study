import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getStudyLibrary } from "./api";
import type { StudyLibrary as StudyLibraryData } from "./types";

function formatDate(value: string | null | undefined) {
  if (!value) return "Sin fecha verificada";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(value));
}

function humanStatus(value: string) {
  return value.replaceAll("_", " ").toLocaleLowerCase("es-CO");
}

export function StudyLibrary({ onClose, initialDocumentId, initialUnitId }: { onClose: () => void; initialDocumentId?: string; initialUnitId?: string }) {
  const [library, setLibrary] = useState<StudyLibraryData | null>(null);
  const [documentId, setDocumentId] = useState<string | undefined>(initialDocumentId);
  const [versionId, setVersionId] = useState<string>();
  const [directUnitId, setDirectUnitId] = useState<string | undefined>(initialUnitId);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [unitType, setUnitType] = useState("");
  const [validationStatus, setValidationStatus] = useState("");
  const [status, setStatus] = useState("");
  const [withIssues, setWithIssues] = useState(false);
  const [showHash, setShowHash] = useState(false);
  const [page, setPage] = useState(1);
  const [jumpTo, setJumpTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDocumentId(initialDocumentId); setVersionId(undefined); setDirectUnitId(initialUnitId); setPage(1);
    setQuery(""); setActiveQuery(""); setUnitType(""); setValidationStatus(""); setStatus(""); setWithIssues(false);
  }, [initialDocumentId, initialUnitId]);

  useEffect(() => {
    setLoading(true); setError("");
    getStudyLibrary({ documentId, versionId, unitId: directUnitId, query: activeQuery, page, unitType, validationStatus, status, withIssues })
      .then((result) => {
        setLibrary(result);
        if (!documentId && result.selectedDocument) setDocumentId(result.selectedDocument.id);
        if (!versionId && result.selectedVersionId) setVersionId(result.selectedVersionId);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "No se pudo cargar la biblioteca."))
      .finally(() => setLoading(false));
  }, [documentId, versionId, directUnitId, activeQuery, page, unitType, validationStatus, status, withIssues]);

  function search(event: FormEvent) {
    event.preventDefault(); setDirectUnitId(undefined); setPage(1); setActiveQuery(query.trim());
  }

  function resetDocument(nextId: string) {
    setDocumentId(nextId); setVersionId(undefined); setDirectUnitId(undefined); setPage(1); setQuery(""); setActiveQuery("");
    setUnitType(""); setValidationStatus(""); setStatus(""); setWithIssues(false); setShowHash(false);
  }

  function jump(event: FormEvent) {
    event.preventDefault();
    const position = Number(jumpTo);
    if (!Number.isFinite(position) || position < 1) return;
    setPage(Math.ceil(position / (library?.pageSize ?? 12)));
  }

  const activeDocument = library?.selectedDocument;
  const visibleDocuments = useMemo(() => {
    const needle = catalogQuery.trim().toLocaleLowerCase("es-CO");
    if (!needle) return library?.documents ?? [];
    return (library?.documents ?? []).filter((document) => `${document.originalFileName ?? ""} ${document.title} ${document.authority}`.toLocaleLowerCase("es-CO").includes(needle));
  }, [catalogQuery, library?.documents]);

  return <main className="library-page">
    <header className="library-header"><div><span className="eyebrow">Biblioteca documental</span><h1>Corpus verificable de la OPEC 236828</h1><p>Lee la transcripción almacenada, comprueba su procedencia y distingue el contenido derivado.</p></div><button className="text-button" onClick={onClose}>← Volver a mi ruta</button></header>
    <div className="library-layout">
      <aside className="library-documents" aria-label="Catálogo documental">
        <div><strong>{library?.documents.length ?? 0} documentos</strong><small>Nombre original · revisión progresiva</small><input aria-label="Filtrar documentos" value={catalogQuery} onChange={(event) => setCatalogQuery(event.target.value)} placeholder="Filtrar catálogo…"/></div>
        {visibleDocuments.map((document) => <button className={activeDocument?.id === document.id ? "active" : ""} key={document.id} onClick={() => resetDocument(document.id)}><span>{document.documentType.replaceAll("_", " ")}</span><strong>{document.originalFileName || document.title}</strong>{document.originalFileName && <em>{document.title}</em>}<small>{document.unitCount.toLocaleString("es-CO")} unidades · {humanStatus(document.pipelineStatus)}</small></button>)}
      </aside>
      <section className="library-content">
        {activeDocument && <div className="library-document-heading">
          <div className="library-provenance-main"><span>{humanStatus(activeDocument.pipelineStatus)}</span><h2>{activeDocument.originalFileName || activeDocument.title}</h2>{activeDocument.originalFileName && <h3>{activeDocument.title}</h3>}<p>{activeDocument.authority} · {activeDocument.documentType.replaceAll("_", " ")} · incorporado {formatDate(activeDocument.createdAt)}</p></div>
          <div className="library-provenance-actions">
            {activeDocument.officialUrl && <a href={activeDocument.officialUrl} target="_blank" rel="noreferrer">Abrir fuente oficial ↗</a>}
            <button onClick={() => setShowHash((current) => !current)}>{showHash ? "Ocultar hash" : "Ver hash"}</button>
            <button className={withIssues ? "active" : ""} onClick={() => { setWithIssues((current) => !current); setPage(1); }}>Mostrar incidencias</button>
          </div>
          <dl className="library-provenance">
            <div><dt>Versión consultada</dt><dd><select value={versionId ?? library?.selectedVersionId ?? ""} onChange={(event) => { setVersionId(event.target.value); setPage(1); }}>{activeDocument.versions.map((version) => <option key={version.id} value={version.id}>{version.label}{version.isCurrent ? " · actual" : " · histórica"}</option>)}</select></dd></div>
            <div><dt>Vigencia</dt><dd>{formatDate(activeDocument.effectiveFrom)} · {activeDocument.status}</dd></div>
            <div><dt>Archivo preservado</dt><dd>{activeDocument.originalFileName ? "Sí" : "No informado"}</dd></div>
            <div><dt>Estado editorial</dt><dd>{humanStatus(activeDocument.pipelineStatus)}</dd></div>
          </dl>
          {showHash && <code className="library-hash">SHA-256 {activeDocument.contentHash || "No disponible"}</code>}
        </div>}

        <form className="library-search" onSubmit={search}><label htmlFor="material-search">Buscar en número, título o transcripción</label><div><input id="material-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. artículo 823, medidas cautelares, término…"/><button className="button primary">Buscar</button></div>{directUnitId && <small className="library-direct-link">Mostrando la unidad vinculada desde el extracto.</small>}<div className="library-filters"><select aria-label="Tipo de unidad" value={unitType} onChange={(event) => { setDirectUnitId(undefined); setUnitType(event.target.value); setPage(1); }}><option value="">Todos los tipos</option>{library?.unitTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select><select aria-label="Estado de revisión" value={validationStatus} onChange={(event) => { setDirectUnitId(undefined); setValidationStatus(event.target.value); setPage(1); }}><option value="">Toda revisión</option><option value="pending">Pendiente</option><option value="approved">Aprobado</option><option value="rejected">Rechazado</option></select><select aria-label="Estado de vigencia" value={status} onChange={(event) => { setDirectUnitId(undefined); setStatus(event.target.value); setPage(1); }}><option value="">Toda vigencia</option><option value="vigente">Vigente</option><option value="pending_review">Sin verificar</option><option value="modificado">Modificado</option><option value="derogado">Derogado</option></select></div></form>

        {error && <div className="alert">{error}</div>}
        {loading ? <div className="library-loading"><div className="loader"/><p>Cargando material…</p></div> : <div className="library-units">{library?.units.length ? library.units.map((unit) => {
          const reviewed = unit.validationStatus === "approved" && unit.editorialStatus === "published";
          return <article key={unit.id} id={`unit-${unit.id}`}>
            <header><div><span>{unit.contentLayer === "original" ? "Transcripción original" : "Contenido derivado"} · {unit.unitType.replaceAll("_", " ")}</span><h3>{unit.number}{unit.title && unit.title !== unit.number ? ` · ${unit.title}` : ""}</h3>{unit.parent && <p className="library-hierarchy">Dentro de {unit.parent.number} · {unit.parent.title}</p>}</div><div className="library-unit-status"><small>{reviewed ? "Revisado" : "Pendiente de revisión"}</small><b>Unidad {unit.position ?? "—"} de {library.totalDocumentUnits.toLocaleString("es-CO")}</b></div></header>
            <div className={`library-layer ${unit.contentLayer}`}><strong>{unit.contentLayer === "original" ? "Texto almacenado sin correcciones" : "Material separado de la fuente original"}</strong><span>{unit.version?.label ?? "Versión sin identificar"}</span></div>
            <pre>{unit.content || "Esta unidad no contiene texto extraído."}</pre>
            {!!unit.extractionIssues?.length && <aside className="library-issues"><strong>Incidencias detectadas</strong><ul>{unit.extractionIssues.map((issue) => <li key={issue.code}>{issue.label}</li>)}</ul></aside>}
            <footer><span>{unit.citation}</span><code>anchor: {unit.anchor}</code>{unit.childCount > 0 && <span>{unit.childCount} unidades subordinadas</span>}</footer>
          </article>;
        }) : <div className="empty-library"><h3>Sin coincidencias</h3><p>Prueba otro término o modifica los filtros dentro de este documento.</p></div>}</div>}
        {!!library?.totalPages && <nav className="library-pagination" aria-label="Navegación lineal"><button disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>← Unidad anterior</button><form onSubmit={jump}><span>Página {library.page} de {library.totalPages} · {library.totalUnits.toLocaleString("es-CO")} resultados</span><label>Ir a unidad <input inputMode="numeric" value={jumpTo} onChange={(event) => setJumpTo(event.target.value)} aria-label="Número de unidad"/><button>Ir</button></label></form><button disabled={page >= library.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Unidad siguiente →</button></nav>}
      </section>
    </div>
  </main>;
}
