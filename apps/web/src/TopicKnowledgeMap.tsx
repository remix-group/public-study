import { useEffect, useMemo, useState } from "react";
import { getTopicKnowledgeGraph } from "./api";
import type { KnowledgeGraphEdge, KnowledgeGraphNode, KnowledgeGraphNodeKind, TopicKnowledgeGraph } from "./types";

const layerOrder: KnowledgeGraphNodeKind[] = ["topic", "objective", "concept", "provision", "document"];
const layerLabels: Record<KnowledgeGraphNodeKind, string> = {
  topic: "Tema", objective: "Objetivo", concept: "Concepto", provision: "Norma", document: "Documento",
};
const legalTypes = new Set(["MODIFIES", "ADDS", "REPEALS", "REPLACES", "REFERENCES", "REGULATES"]);

interface Position { x: number; y: number }

function layoutGraph(nodes: KnowledgeGraphNode[]) {
  const layers = layerOrder.map((kind) => nodes.filter((node) => node.kind === kind));
  const widest = Math.max(1, ...layers.map((layer) => layer.length));
  const width = Math.max(980, widest * 235 + 120);
  const yByKind: Record<KnowledgeGraphNodeKind, number> = { topic: 70, objective: 205, concept: 340, provision: 485, document: 625 };
  const positions = new Map<string, Position>();
  for (const layer of layers) layer.forEach((node, index) => positions.set(node.id, { x: width * (index + 1) / (layer.length + 1), y: yByKind[node.kind] }));
  return { width, height: 710, positions };
}

function graphPath(edge: KnowledgeGraphEdge, source: Position, target: Position) {
  if (legalTypes.has(edge.type) && Math.abs(source.y - target.y) < 5) {
    const curve = Math.min(85, Math.max(42, Math.abs(target.x - source.x) * .25));
    return `M ${source.x} ${source.y} Q ${(source.x + target.x) / 2} ${source.y - curve} ${target.x} ${target.y}`;
  }
  return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
}

function NodeDetail({ node }: { node: KnowledgeGraphNode }) {
  return <aside className={`graph-detail ${node.kind}`}>
    <div><span>{layerLabels[node.kind]}</span>{node.status && <small className={`norm-status ${node.status}`}>{node.status}</small>}</div>
    <h2>{node.label}</h2>
    <strong>{node.subtitle}</strong>
    <p>{node.description}</p>
    {node.content && <blockquote>{node.content}</blockquote>}
    {node.citation && <small className="graph-citation">{node.citation}</small>}
    {node.officialUrl && <a href={node.officialUrl} target="_blank" rel="noreferrer">Abrir fuente oficial ↗</a>}
  </aside>;
}

export function TopicKnowledgeMap({ topicId, onBack }: { topicId: string; onBack: () => void }) {
  const [graph, setGraph] = useState<TopicKnowledgeGraph | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    setGraph(null); setError(""); setSelectedId("");
    getTopicKnowledgeGraph(topicId).then((result) => {
      setGraph(result); setSelectedId(`topic:${result.topic.id}`);
    }).catch((caught) => setError(caught instanceof Error ? caught.message : "No se pudo cargar el mapa jurídico."));
  }, [topicId]);

  const layout = useMemo(() => layoutGraph(graph?.nodes ?? []), [graph]);
  const selected = graph?.nodes.find((node) => node.id === selectedId) ?? graph?.nodes[0];

  if (error) return <main className="center-state"><div className="alert">{error}</div><button className="button primary" onClick={onBack}>Volver a la ruta</button></main>;
  if (!graph) return <main className="center-state"><div className="loader"/><h2>Construyendo el mapa jurídico</h2><p>Conectando objetivos, normas y fuentes oficiales…</p></main>;

  return <main className="knowledge-map-page">
    <button className="text-button guide-back" onClick={onBack}>← Volver a mi ruta</button>
    <header className="knowledge-map-header">
      <div><span className="eyebrow">Mapa jurídico del tema</span><h1>{graph.topic.name}</h1><p>{graph.topic.description}</p></div>
      <div className="graph-summary"><span><strong>{graph.summary.objectives}</strong> objetivos</span><span><strong>{graph.summary.provisions}</strong> normas</span><span><strong>{graph.summary.legalRelations}</strong> relaciones</span></div>
    </header>
    <section className="graph-legend" aria-label="Tipos de nodo">{layerOrder.map((kind) => <span className={kind} key={kind}><i/>{layerLabels[kind]}</span>)}</section>
    <div className="knowledge-map-layout">
      <section className="graph-panel">
        <div className="graph-help"><strong>Explora las conexiones</strong><span>Selecciona un nodo para leer su detalle. Desplázate horizontalmente si el mapa crece.</span></div>
        <div className="graph-scroll">
          <div className="graph-canvas" style={{ width: layout.width, height: layout.height }}>
            <svg viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
              <defs><marker id="graph-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z"/></marker></defs>
              {graph.edges.map((edge) => {
                const source = layout.positions.get(edge.source); const target = layout.positions.get(edge.target);
                if (!source || !target) return null;
                return <g key={edge.id} className={legalTypes.has(edge.type) ? "legal-edge" : "learning-edge"}>
                  <path d={graphPath(edge, source, target)} markerEnd="url(#graph-arrow)"/>
                  {legalTypes.has(edge.type) && <text x={(source.x + target.x) / 2} y={source.y - 48}>{edge.label}</text>}
                </g>;
              })}
            </svg>
            {graph.nodes.map((node) => {
              const position = layout.positions.get(node.id); if (!position) return null;
              return <button key={node.id} className={`graph-node ${node.kind} ${selected?.id === node.id ? "selected" : ""}`} style={{ left: position.x, top: position.y }} onClick={() => setSelectedId(node.id)} aria-pressed={selected?.id === node.id}>
                <small>{layerLabels[node.kind]}{node.status ? ` · ${node.status}` : ""}</small><strong>{node.label}</strong><span>{node.subtitle}</span>
              </button>;
            })}
          </div>
        </div>
      </section>
      {selected && <NodeDetail node={selected}/>}
    </div>
  </main>;
}
