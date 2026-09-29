"use client";

import { CSSProperties, useState } from "react";
import { SectionContent } from "@/lib/content";
import { TechIcon, TechIconKey, techIcons } from "@/lib/techIcons";

export function Logo({ name, size = 24 }: { name: TechIconKey; size?: number }) {
  const icon: TechIcon = techIcons[name];
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={icon.title}>
      {icon.path ? (
        <path d={icon.path} fill="currentColor" />
      ) : (
        icon.strokes?.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))
      )}
    </svg>
  );
}

const MAX_PROPS = 5;

export default function SkillMatrix({ data }: { data: SectionContent }) {
  const rooms = data.skillRooms!;
  const [activeId, setActiveId] = useState(rooms[0].id);
  const activeIndex = rooms.findIndex((r) => r.id === activeId);
  const active = rooms[activeIndex];
  const code = (i: number) => `RM-${String(i + 1).padStart(2, "0")}`;

  return (
    <div className="panel-inner skills-panel">
      <header className="skills-head">
        <div className="eyebrow">{data.eyebrow}</div>
        <h2>{data.title}</h2>
        {data.paragraphs?.map((p) => (
          <p key={p} className="skills-hint">
            {p}
          </p>
        ))}
      </header>

      <div className="room-select" role="tablist" aria-label="Skill rooms">
        {rooms.map((room, i) => (
          <button
            key={room.id}
            role="tab"
            aria-selected={room.id === activeId}
            className={`room${room.id === activeId ? " active" : ""}`}
            onClick={() => setActiveId(room.id)}
          >
            <span className="room-visual" aria-hidden="true">
              <span className="room-floor" />
              <span className="room-props">
                {room.stack.slice(0, MAX_PROPS).map((key) => (
                  <Logo key={key} name={key} size={14} />
                ))}
                {room.stack.length > MAX_PROPS && <em>+{room.stack.length - MAX_PROPS}</em>}
              </span>
            </span>
            <span className="room-meta">
              <small>{code(i)}</small>
              <strong>{room.title}</strong>
              <small>{room.stack.length} MODULES</small>
            </span>
          </button>
        ))}
      </div>

      {/* keyed by room so the scan sequence replays on every selection */}
      <section className="chamber" key={active.id} role="tabpanel" aria-label={active.title}>
        <span className="chamber-floor" aria-hidden="true" />
        <span className="chamber-scan" aria-hidden="true" />

        <div className="chamber-head">
          <span>
            {code(activeIndex)} <b>//</b> {active.title}
          </span>
          <span className="chamber-status">
            <span className="scanning">SCANNING ROOM…</span>
            <span className="done">
              <i /> {active.stack.length} MODULES ONLINE
            </span>
          </span>
        </div>
        <p className="chamber-desc">{active.description}</p>

        <ul className="tech-grid">
          {active.stack.map((key, i) => {
            const icon: TechIcon = techIcons[key];
            return (
              <li
                key={key}
                className="tech-tile"
                style={{ "--i": i, "--brand": icon.color } as CSSProperties}
              >
                <span className="tech-logo">
                  <Logo name={key} size={34} />
                </span>
                <span className="tech-name">{icon.title}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
