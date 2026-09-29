"use client";

import { CSSProperties, useState } from "react";
import { SectionContent } from "@/lib/content";

const UNITS = 7;

const serverId = (i: number) => `SRV-${String(i + 1).padStart(2, "0")}`;
const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export default function ServerRoom({ data }: { data: SectionContent }) {
  const projects = data.projects ?? [];
  const [active, setActive] = useState(0);
  const project = projects[active];
  const modules = project.tags.split("/").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="panel-inner works-panel">
      <header>
        <div className="eyebrow">{data.eyebrow}</div>
        <h2>{data.title}</h2>
        {data.paragraphs?.map((p) => (
          <p key={p} className="works-intro">
            {p}
          </p>
        ))}
      </header>

      <div className="server-room" role="tablist" aria-label="Projects">
        <span className="server-floor" aria-hidden="true" />
        {projects.map((p, i) => (
          <button
            key={p.title}
            role="tab"
            aria-selected={i === active}
            className={`server${i === active ? " active" : ""}`}
            style={{ "--i": i } as CSSProperties}
            onClick={() => setActive(i)}
          >
            <span className="server-cabinet" aria-hidden="true">
              {Array.from({ length: UNITS }, (_, u) => (
                <span key={u} className={`server-unit ${(u + i) % 3 === 0 ? "bays" : "vent"}`}>
                  <b />
                  <b />
                </span>
              ))}
              <span className="server-plate">{serverId(i)}</span>
              {/* remounted on selection so the beam replays */}
              {i === active && <span key={active} className="server-beam" />}
            </span>
            <span className="server-name">{p.title}</span>
          </button>
        ))}
      </div>

      {/* keyed so the connect sequence replays for every server */}
      <section className="console" key={active} role="tabpanel" aria-label={project.title}>
        <div className="console-bar">
          <span>
            {serverId(active)} <b>//</b> {slug(project.title)}
          </span>
          <span className="console-state">
            <span className="connecting">CONNECTING…</span>
            <span className="online">
              <i /> ONLINE
            </span>
          </span>
        </div>

        <div className="console-body">
          <p className="console-line" style={{ "--l": 0 } as CSSProperties}>
            <span>&gt;</span> ssh root@{serverId(active).toLowerCase()}.razak.dev
          </p>
          <p className="console-line" style={{ "--l": 1 } as CSSProperties}>
            <span>&gt;</span> mounting /projects/{slug(project.title)} … <em>OK</em>
          </p>

          <div className="console-heading" style={{ "--l": 2 } as CSSProperties}>
            {project.logo && (
              <span className="console-logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.logo} alt={`${project.client ?? project.title} logo`} />
              </span>
            )}
            <div>
              <h3 className="console-title">{project.title}</h3>
              {project.client && <div className="console-client">CLIENT // {project.client}</div>}
            </div>
          </div>

          {project.description && (
            <p className="console-desc" style={{ "--l": 3 } as CSSProperties}>
              {project.description}
            </p>
          )}

          <div className="console-label" style={{ "--l": 4 } as CSSProperties}>
            MODULES LOADED [{modules.length}]
          </div>
          <ul className="console-modules">
            {modules.map((m, i) => (
              <li key={m} style={{ "--l": 5 + i * 0.5 } as CSSProperties}>
                {m}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
