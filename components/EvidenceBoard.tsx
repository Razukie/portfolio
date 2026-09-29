"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { SectionContent, findProject } from "@/lib/content";

const caseId = (i: number) => `EV-${String(i + 1).padStart(2, "0")}`;

export default function EvidenceBoard({ data }: { data: SectionContent }) {
  const { nodes, links } = data.evidence!;
  const [selectedId, setSelectedId] = useState(nodes[0].id);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // On narrow screens the board scrolls sideways — open it centred on the subject
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    el.scrollLeft = (el.scrollWidth * nodes[0].x) / 100 - el.clientWidth / 2;
  }, [nodes]);

  const byId = (id: string) => nodes.find((n) => n.id === id)!;
  const focusId = hoverId ?? selectedId;
  const touches = (id: string) =>
    links.filter((l) => l.from === id || l.to === id);
  const neighbours = new Set(touches(focusId).flatMap((l) => [l.from, l.to]));

  const selectedIndex = nodes.findIndex((n) => n.id === selectedId);
  const selected = nodes[selectedIndex];
  const project = selected.project ? findProject(selected.project) : undefined;
  const logo = selected.logo ?? project?.logo;
  const notes = selected.notes ?? project?.description;
  const selectedLinks = touches(selected.id);


  return (
    <div className="panel-inner evidence-panel">
      <header>
        <div className="eyebrow">{data.eyebrow}</div>
        <h2>{data.title}</h2>
        {data.paragraphs?.map((p) => (
          <p key={p} className="evidence-hint">
            {p}
          </p>
        ))}
      </header>

      <div className="evidence-layout">
        <p className="evidence-swipe" aria-hidden="true">
          ← Swipe to explore the board →
        </p>
        <div className="evidence-scroll" ref={scrollRef}>
          <div className="evidence-board" data-count={nodes.length}>
            <svg className="evidence-links" aria-hidden="true">
              {links.map((l, i) => {
                const a = byId(l.from);
                const b = byId(l.to);
                const lit = l.from === focusId || l.to === focusId;
                return (
                  <g key={`${l.from}-${l.to}`} className={lit ? "lit" : ""} style={{ "--k": i } as CSSProperties}>
                    <line x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`} pathLength={1} className="ev-link" />
                    {lit && (
                      <line
                        key={focusId}
                        x1={`${a.x}%`}
                        y1={`${a.y}%`}
                        x2={`${b.x}%`}
                        y2={`${b.y}%`}
                        pathLength={1}
                        className="ev-flow"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {links.map((l, i) => {
              if (l.quiet) return null;
              const a = byId(l.from);
              const b = byId(l.to);
              const lit = l.from === focusId || l.to === focusId;
              return (
                <span
                  key={`${l.from}-${l.to}-label`}
                  className={`ev-link-label${lit ? " lit" : ""}`}
                  style={
                    {
                      left: `${a.x + (b.x - a.x) * (l.at ?? 0.5)}%`,
                      top: `${a.y + (b.y - a.y) * (l.at ?? 0.5)}%`,
                      "--k": i,
                    } as CSSProperties
                  }
                >
                  {l.label}
                </span>
              );
            })}

            {nodes.map((n, i) => {
              const state =
                n.id === selectedId ? " selected" : neighbours.has(n.id) ? " linked" : " dim";
              const img = n.logo;
              return (
                <button
                  key={n.id}
                  className={`ev-node type-${n.type.toLowerCase()}${state}`}
                  style={{ left: `${n.x}%`, top: `${n.y}%`, "--k": i } as CSSProperties}
                  onClick={() => setSelectedId(n.id)}
                  onMouseEnter={() => setHoverId(n.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(n.id)}
                  onBlur={() => setHoverId(null)}
                  aria-pressed={n.id === selectedId}
                >
                  <span className="ev-marker">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" />
                    ) : n.type === "SUBJECT" ? (
                      <b>AR</b>
                    ) : null}
                  </span>
                  <span className="ev-label">
                    <strong>{n.label}</strong>
                    <small>
                      {n.type}
                      {n.roles && ` · ${n.roles.length} ROLES`}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* keyed so the analysis sequence replays for every entity */}
        <section className="case-file" key={selected.id} aria-live="polite">
          <div className="case-bar">
            <span>
              {caseId(selectedIndex)} <b>//</b> {selected.type}
            </span>
            <span className="case-state">
              <span className="analyzing">ANALYZING…</span>
              <span className="found">
                <i /> {selectedLinks.length} LINK{selectedLinks.length === 1 ? "" : "S"} FOUND
              </span>
            </span>
          </div>

          <div className="case-body">
            <div className="case-heading">
              {logo && (
                <span className="console-logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo} alt={`${selected.label} logo`} />
                </span>
              )}
              <div>
                <h3>{project?.title ?? selected.label}</h3>
                {selected.sub && <div className="case-sub">{selected.sub}</div>}
              </div>
            </div>

            {notes && <p className="case-notes">{notes}</p>}

            {selected.roles && (
              <>
                <div className="case-label">ROLES HELD [{selected.roles.length}]</div>
                <ul className="case-roles">
                  {selected.roles.map((r, i) => (
                    <li key={r} style={{ "--k": i } as CSSProperties}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="case-label">LINKED ENTITIES [{selectedLinks.length}]</div>
            <ul className="case-links">
              {selectedLinks.map((l, i) => {
                const other = byId(l.from === selected.id ? l.to : l.from);
                return (
                  <li key={other.id} style={{ "--k": i } as CSSProperties}>
                    <button onClick={() => setSelectedId(other.id)}>
                      <span>{l.label}</span>
                      <strong>{other.label}</strong>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
