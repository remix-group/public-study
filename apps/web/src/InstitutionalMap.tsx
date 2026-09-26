import { useEffect, useMemo, useState } from "react";
import { getInstitutionalMap } from "./api";
import type { InstitutionalEntityView, InstitutionalMapView, InstitutionalRelationView } from "./types";

type View = "tree" | "graph" | "profile" | "sources";

const viewLabels: Record<View, string> = {
  tree: "Árbol jerárquico",
  graph: "Relaciones",
  profile: "Ficha de entidad",
  sources: "Explorador jurídico",
};

const relationLabels: Record<string, string> = {
  dependency: "Dependencia",
  coordination: "Coordinación",
  regulation: "Regulación",
  control: "Control",
  cooperation: "Cooperación",
  participation: "Participación",
  reporting: "Rendición de información",
};

function readable(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Status({ status, confidence }: { status: string; confidence?: string }) {
  return <span className={`institution-status ${status}`} title={confidence ? `Confianza: ${confidence}` : undefined}>
    {status === "confirmed" ? "Confirmado" : status === "no_confirmado" ? "No confirmado" : "Pendiente de revisión"}
    {confidence ? ` · ${readable(confidence)}` : ""}
  </span>;
}

function EntityButton({ entity, selected, onSelect }: { entity: InstitutionalEntityView; selected: boolean; onSelect: () => void }) {
  return <button className={`institution-entity-button ${selected ? "active" : ""}`} onClick={onSelect}>
    <span>{readable(entity.entityType)}</span><strong>{entity.officialName}</strong>
    {entity.aliases.length > 0 && <small>{entity.aliases.join(" · ")}</small>}
  </button>;
}

export function InstitutionalMap({ onClose }: { onClose: () => void }) {
  const [map, setMap] = useState<InstitutionalMapView | null>(null);
  const [view, setView] = useState<View>("tree");
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [entityType, setEntityType] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [objectiveId, setObjectiveId] = useState("");
  const [confidence, setConfidence] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getInstitutionalMap().then((result) => {
      setMap(result);
      setSelectedId(result.entities[0]?.id ?? "");
    }).catch((caught) => setError(caught instanceof Error ? caught.message : "No se pudo cargar el mapa institucional."));
  }, []);

  const sourceById = useMemo(() => new Map(map?.sources.map((source) => [source.provisionId, source]) ?? []), [map]);
  const entityById = useMemo(() => new Map(map?.entities.map((entity) => [entity.id, entity]) ?? []), [map]);

  function sourceMatches(sourceProvisionId: string, itemConfidence: string) {
    const source = sourceById.get(sourceProvisionId);
    if (documentId && source?.document.id !== documentId) return false;
    if (objectiveId && source?.objective?.id !== objectiveId) return false;
    if (confidence && itemConfidence !== confidence) return false;
    return true;
  }

  const filteredEntities = useMemo(() => {
    if (!map) return [];
    const normalized = query.trim().toLocaleLowerCase("es");
    return map.entities.filter((entity) => {
      if (entityType && entity.entityType !== entityType) return false;
      if (normalized && ![entity.officialName, entity.description, ...entity.aliases, ...entity.claims.map((claim) => claim.statement)].join(" ").toLocaleLowerCase("es").includes(normalized)) return false;
      const related = map.relations.filter((relation) => relation.sourceEntityId === entity.id || relation.targetEntityId === entity.id);
      if ((documentId || objectiveId || confidence) && !entity.claims.some((claim) => sourceMatches(claim.sourceProvisionId, claim.confidence)) && !related.some((relation) => sourceMatches(relation.sourceProvisionId, relation.confidence))) return false;
      return true;
    });
  }, [map, query, entityType, documentId, objectiveId, confidence, sourceById]);

  const visibleIds = useMemo(() => new Set(filteredEntities.map((entity) => entity.id)), [filteredEntities]);
  const filteredRelations = useMemo(() => (map?.relations ?? []).filter((relation) => visibleIds.has(relation.sourceEntityId) && visibleIds.has(relation.targetEntityId) && sourceMatches(relation.sourceProvisionId, relation.confidence)), [map, visibleIds, documentId, objectiveId, confidence, sourceById]);
  const selected = filteredEntities.find((entity) => entity.id === selectedId) ?? filteredEntities[0];

  function selectEntity(id: string, destination: View = "profile") {
    setSelectedId(id);
    setView(destination);
  }

  const graphLayout = useMemo(() => {
    const width = 900; const height = 560; const radiusX = 340; const radiusY = 205;
    const positions = new Map<string, { x: number; y: number }>();
    filteredEntities.forEach((entity, index) => {
      const angle = (Math.PI * 2 * index / Math.max(1, filteredEntities.length)) - Math.PI / 2;
      positions.set(entity.id, { x: width / 2 + Math.cos(angle) * radiusX, y: height / 2 + Math.sin(angle) * radiusY });
    });
    return { width, height, positions };
  }, [filteredEntities]);

  if (error) return <main className="center-state"><div className="alert">{error}</div><button className="button primary" onClick={onClose}>Volver</button></main>;
  if (!map) return <main className="center-state"><div className="loader"/><h2>Construyendo el mapa institucional</h2><p>Verificando entidades, relaciones y fuentes…</p></main>;

  const hierarchical = filteredRelations.filter((relation) => relation.hierarchical);
  const childIds = new Set(hierarchical.map((relation) => relation.targetEntityId));
  const roots = filteredEntities.filter((entity) => !childIds.has(entity.id));
  const filteredSources = map.sources.filter((source) => {
    if (documentId && source.document.id !== documentId) return false;
    if (objectiveId && source.objective?.id !== objectiveId) return false;
    const usedByEntity = filteredEntities.some((entity) => entity.claims.some((claim) => claim.sourceProvisionId === source.provisionId && sourceMatches(claim.sourceProvisionId, claim.confidence)));
    const usedByRelation = filteredRelations.some((relation) => relation.sourceProvisionId === source.provisionId);
    return usedByEntity || usedByRelation;
  });

  return <main className="institution-map-page">
    <button className="text-button guide-back" onClick={onClose}>← Volver a mi ruta</button>
    <header className="institution-header">
      <div><span className="eyebrow">Corpus institucional DIAN</span><h1>Quién hace qué y con qué fundamento</h1><p>Explora entidades, funciones y relaciones sin confundir coordinación con jerarquía. Cada dato conduce a su disposición de origen.</p></div>
      <div className="institution-summary"><span><strong>{map.summary.entities}</strong> entidades</span><span><strong>{map.summary.relations}</strong> relaciones</span><span><strong>{map.summary.documents}</strong> documentos</span><span className="pending"><strong>{map.summary.pendingReview}</strong> por revisar</span></div>
    </header>

    <section className="institution-filters" aria-label="Filtros del mapa institucional">
      <label className="institution-search"><span>Buscar por nombre, alias o función</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. DIAN, recaudo, archivo…"/></label>
      <label><span>Tipo</span><select value={entityType} onChange={(event) => setEntityType(event.target.value)}><option value="">Todos</option>{map.filters.entityTypes.map((type) => <option key={type} value={type}>{readable(type)}</option>)}</select></label>
      <label><span>Documento</span><select value={documentId} onChange={(event) => setDocumentId(event.target.value)}><option value="">Todos</option>{map.filters.documents.map((document) => <option key={document.id} value={document.id}>{document.title}</option>)}</select></label>
      <label><span>Objetivo OPEC</span><select value={objectiveId} onChange={(event) => setObjectiveId(event.target.value)}><option value="">Todos</option>{map.filters.objectives.map((objective) => <option key={objective.id} value={objective.id}>{objective.name}</option>)}</select></label>
      <label><span>Confianza</span><select value={confidence} onChange={(event) => setConfidence(event.target.value)}><option value="">Todas</option>{map.filters.confidences.map((item) => <option key={item}>{readable(item)}</option>)}</select></label>
    </section>

    <nav className="institution-tabs" aria-label="Vistas del mapa">{(Object.keys(viewLabels) as View[]).map((item) => <button key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>{viewLabels[item]}</button>)}</nav>

    {filteredEntities.length === 0 && <section className="institution-empty"><strong>No hay entidades con estos filtros.</strong><p>Prueba otra combinación; ningún dato se oculta fuera de los criterios elegidos.</p></section>}

    {filteredEntities.length > 0 && view === "tree" && <section className="institution-tree-view">
      <div className="institution-view-heading"><div><span>Jerarquía demostrada</span><h2>Árbol de dependencias</h2></div><p>Solo aparecen aristas marcadas como jerárquicas por una fuente. Las entidades sin dependencia confirmada se conservan como raíces independientes.</p></div>
      <div className="institution-forest">{roots.map((root) => {
        const children = hierarchical.filter((relation) => relation.sourceEntityId === root.id);
        return <article className="institution-tree" key={root.id}><EntityButton entity={root} selected={selected?.id === root.id} onSelect={() => selectEntity(root.id)}/>{children.length > 0 ? <div className="institution-children">{children.map((relation) => {
          const child = entityById.get(relation.targetEntityId); if (!child) return null;
          return <div key={relation.id}><span>{relation.label}</span><EntityButton entity={child} selected={selected?.id === child.id} onSelect={() => selectEntity(child.id)}/><Status status={relation.status} confidence={relation.confidence}/></div>;
        })}</div> : <small className="no-hierarchy">Sin dependencia jerárquica demostrada en el corpus actual.</small>}</article>;
      })}</div>
    </section>}

    {filteredEntities.length > 0 && view === "graph" && <section className="institution-graph-view">
      <div className="institution-view-heading"><div><span>Relaciones no jerárquicas y de dependencia</span><h2>Grafo institucional</h2></div><div className="relation-legend">{[...new Set(filteredRelations.map((relation) => relation.type))].map((type) => <span key={type} className={type}><i/>{relationLabels[type] ?? readable(type)}</span>)}</div></div>
      <div className="institution-graph-canvas" style={{ width: graphLayout.width, height: graphLayout.height }}>
        <svg viewBox={`0 0 ${graphLayout.width} ${graphLayout.height}`} aria-hidden="true"><defs><marker id="institution-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>{filteredRelations.map((relation) => {
          const from = graphLayout.positions.get(relation.sourceEntityId); const to = graphLayout.positions.get(relation.targetEntityId); if (!from || !to) return null;
          return <g key={relation.id} className={`institution-edge ${relation.type}`}><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} markerEnd="url(#institution-arrow)"/><text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 7}>{relation.label}</text></g>;
        })}</svg>{filteredEntities.map((entity) => {
          const position = graphLayout.positions.get(entity.id)!;
          return <button key={entity.id} className={`institution-node ${selected?.id === entity.id ? "selected" : ""}`} style={{ left: position.x, top: position.y }} onClick={() => selectEntity(entity.id)}><small>{readable(entity.entityType)}</small><strong>{entity.aliases[0] ?? entity.officialName}</strong><span>{entity.officialName}</span></button>;
        })}
      </div>
      <div className="institution-relation-list">{filteredRelations.map((relation) => <article key={relation.id}><button onClick={() => selectEntity(relation.sourceEntityId)}>{entityById.get(relation.sourceEntityId)?.officialName}</button><span>{relation.label}</span><button onClick={() => selectEntity(relation.targetEntityId)}>{entityById.get(relation.targetEntityId)?.officialName}</button><p>{relation.description}</p><Status status={relation.status} confidence={relation.confidence}/></article>)}</div>
    </section>}

    {filteredEntities.length > 0 && view === "profile" && <section className="institution-profile-view">
      <aside>{filteredEntities.map((entity) => <EntityButton key={entity.id} entity={entity} selected={selected?.id === entity.id} onSelect={() => setSelectedId(entity.id)}/>)}</aside>
      {selected && <article className="institution-profile"><header><div><span>{readable(selected.entityType)}{selected.level ? ` · ${readable(selected.level)}` : ""}</span><h2>{selected.officialName}</h2><p>{selected.description}</p></div><Status status={selected.status}/></header>{selected.aliases.length > 0 && <div className="institution-aliases"><strong>Alias verificados</strong>{selected.aliases.map((alias) => <span key={alias}>{alias}</span>)}</div>}
        <h3>Funciones y competencias</h3>{selected.claims.some((claim) => sourceMatches(claim.sourceProvisionId, claim.confidence)) ? <div className="institution-claims">{selected.claims.filter((claim) => sourceMatches(claim.sourceProvisionId, claim.confidence)).map((claim) => { const source = sourceById.get(claim.sourceProvisionId); return <article key={claim.id}><div><span>{readable(claim.type)}</span><Status status={claim.status} confidence={claim.confidence}/></div><p>{claim.statement}</p><button onClick={() => setView("sources")}>{source?.citation ?? "Abrir fuente"} →</button></article>; })}</div> : <p className="institution-muted">No hay funciones publicadas para esta entidad con los filtros actuales.</p>}
        <h3>Relaciones</h3><div className="institution-claims">{filteredRelations.filter((relation) => relation.sourceEntityId === selected.id || relation.targetEntityId === selected.id).map((relation) => <article key={relation.id}><div><span>{relationLabels[relation.type] ?? readable(relation.type)}</span><Status status={relation.status} confidence={relation.confidence}/></div><p><strong>{entityById.get(relation.sourceEntityId)?.officialName}</strong> {relation.label} <strong>{entityById.get(relation.targetEntityId)?.officialName}</strong>. {relation.description}</p><button onClick={() => setView("sources")}>{sourceById.get(relation.sourceProvisionId)?.citation ?? "Abrir fuente"} →</button></article>)}</div>
      </article>}
    </section>}

    {filteredEntities.length > 0 && view === "sources" && <section className="institution-source-view">
      <div className="institution-view-heading"><div><span>Trazabilidad jurídica</span><h2>De la afirmación a la disposición</h2></div><p>El estado pendiente corresponde a la revisión editorial del material importado; no equivale a una confirmación jurídica definitiva.</p></div>
      <div className="institution-sources">{filteredSources.map((source) => {
        const claims = filteredEntities.flatMap((entity) => entity.claims.filter((claim) => claim.sourceProvisionId === source.provisionId && sourceMatches(claim.sourceProvisionId, claim.confidence)).map((claim) => ({ entity, claim })));
        const relations = filteredRelations.filter((relation) => relation.sourceProvisionId === source.provisionId);
        return <article key={source.provisionId}><header><div><span>{source.document.title}</span><h3>{source.number} · {source.title}</h3><small>{source.citation}</small></div><Status status={source.validationStatus === "approved" && source.editorialStatus === "published" ? "confirmed" : "pending_review"}/></header><blockquote>{source.content}</blockquote>{source.objective && <div className="source-objective"><span>Objetivo OPEC</span><strong>{source.objective.name}</strong><small>{source.objective.topic.name}</small></div>}<div className="source-uses">{claims.map(({ entity, claim }) => <button key={claim.id} onClick={() => selectEntity(entity.id)}><span>{readable(claim.type)}</span><strong>{entity.officialName}</strong><small>{claim.statement}</small></button>)}{relations.map((relation) => <button key={relation.id} onClick={() => selectEntity(relation.sourceEntityId)}><span>{relationLabels[relation.type] ?? readable(relation.type)}</span><strong>{entityById.get(relation.sourceEntityId)?.officialName} → {entityById.get(relation.targetEntityId)?.officialName}</strong><small>{relation.description}</small></button>)}</div>{source.document.officialUrl && <a href={source.document.officialUrl} target="_blank" rel="noreferrer">Abrir documento oficial ↗</a>}</article>;
      })}</div>
    </section>}
  </main>;
}
