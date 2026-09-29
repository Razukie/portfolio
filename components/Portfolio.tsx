"use client";

import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import Loader from "./Loader";
import Panel from "./Panel";
import RoomTransition, { RoomEntry } from "./RoomTransition";
import {
  ServerRackIcon,
  RobotIcon,
  TerminalIcon,
  WorkstationIcon,
  DocumentIcon,
  OrbIcon,
  HologramIcon,
  PortalIcon,
} from "./StationIcons";
import { Section, LinePoint } from "@/lib/types";

interface StationConfig {
  section: Section;
  label: string;
  Icon: () => JSX.Element;
}

const STATIONS: StationConfig[] = [
  { section: "works", label: "WORKS", Icon: ServerRackIcon },
  { section: "skills", label: "SKILLS", Icon: RobotIcon },
  { section: "experience", label: "EXPERIENCE", Icon: TerminalIcon },
  { section: "about", label: "ABOUT ME", Icon: WorkstationIcon },
  { section: "resume", label: "RESUME", Icon: DocumentIcon },
  { section: "contact", label: "CONTACT", Icon: OrbIcon },
  { section: "testimonials", label: "TESTIMONIALS", Icon: HologramIcon },
  { section: "system", label: "SYSTEM", Icon: PortalIcon },
];

export default function Portfolio() {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [entered, setEntered] = useState(false);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [hoveredSection, setHoveredSection] = useState<Section | null>(null);
  const [lines, setLines] = useState<LinePoint[]>([]);
  const [lightMode, setLightMode] = useState(false);

  const sceneRef = useRef<HTMLElement | null>(null);
  const coreRef = useRef<HTMLButtonElement | null>(null);
  const stationRefs = useRef<Partial<Record<Section, HTMLButtonElement | null>>>({});

  // ---- Loading progress ----
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = p + (Math.floor(Math.random() * 8) + 4);
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, 120);
    return () => clearInterval(timer);
  }, []);

  // ---- Compute the core -> station connections ----
  // Coordinates are the *actual* rendered center of the core and every
  // station (getBoundingClientRect), so the SVG lines always land exactly
  // where the elements are — independent of the 3D tilt, skew, hover
  // scale, or parallax transform applied to them.
  const computeLines = useCallback(() => {
    const scene = sceneRef.current;
    const core = coreRef.current;
    if (!scene || !core) return;

    const sceneRect = scene.getBoundingClientRect();
    const coreRect = core.getBoundingClientRect();

    const coreX = coreRect.left + coreRect.width / 2 - sceneRect.left;
    const coreY = coreRect.top + coreRect.height / 2 - sceneRect.top;

    // Every trace is two isometric legs: one along A = (1, .5) and one along
    // B = (1, -.5). Any offset (dx, dy) splits uniquely into a·A + b·B.
    // The longer leg leaves the core first, so stations in the same
    // quadrant run side by side out of the chip like a PCB bus.
    const routes = STATIONS.map(({ section }) => {
      const el = stationRefs.current[section];
      if (!el) return null;
      // Aim at the label's inner edge (facing the core), not the icon
      const labelRect = (el.querySelector("label") ?? el).getBoundingClientRect();
      const labelCx = labelRect.left + labelRect.width / 2 - sceneRect.left;
      const end = {
        x: (labelCx >= coreX ? labelRect.left - 10 : labelRect.right + 10) - sceneRect.left,
        y: labelRect.top + labelRect.height / 2 - sceneRect.top,
      };
      const dx = end.x - coreX;
      const dy = end.y - coreY;
      const a = (dx + 2 * dy) / 2;
      const b = (dx - 2 * dy) / 2;
      const legA = { x: a, y: a / 2 };
      const legB = { x: b, y: -b / 2 };
      // Prefer the longer leg first, but if its bend would land off-screen
      // (common on narrow portrait phones) take the other order instead.
      const inView = (leg: { x: number; y: number }) => {
        const x = coreX + leg.x;
        const y = coreY + leg.y;
        return x >= 12 && x <= sceneRect.width - 12 && y >= 12 && y <= sceneRect.height - 12;
      };
      const preferred: [typeof legA, typeof legA] = Math.abs(a) >= Math.abs(b) ? [legA, legB] : [legB, legA];
      const [first, second] =
        inView(preferred[0]) || !inView(preferred[1]) ? preferred : [preferred[1], preferred[0]];
      const firstLen = Math.hypot(first.x, first.y);
      const secondLen = Math.hypot(second.x, second.y) || 1;
      const unit = { x: second.x / secondLen, y: second.y / secondLen };
      return { section, end, first, second, firstLen, secondLen, unit };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    const LANE_GAP = 9;
    const key = (v: { x: number; y: number }) => `${Math.sign(v.x)}${Math.sign(v.y)}`;

    const next: LinePoint[] = routes.map((r) => {
      // Shift the trace sideways (toward the direction it turns) so parallel
      // traces never overlap. Traces that turn off earlier sit further out,
      // which keeps them from crossing their neighbours.
      const longer = routes.filter(
        (o) =>
          o !== r &&
          key(o.first) === key(r.first) &&
          key(o.second) === key(r.second) &&
          o.firstLen > r.firstLen
      ).length;
      const shift = Math.min(LANE_GAP * (0.5 + longer), r.secondLen - 12);
      const start = { x: coreX + r.unit.x * shift, y: coreY + r.unit.y * shift };
      const bend = { x: start.x + r.first.x, y: start.y + r.first.y };
      return { section: r.section, points: [start, bend, r.end] };
    });

    setLines(next);
  }, []);

  // ---- Responsive scale: stations + core shrink/grow with the viewport ----
  // Landscape screens are sized against a 1500×900 reference, portrait ones
  // (phones, upright tablets) against 720×1250; CSS picks the matching layout.
  const applyScale = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const s = w / h >= 0.9 ? Math.min(w / 1500, h / 900) : Math.min(w / 720, h / 1250);
    scene.style.setProperty("--s", Math.max(0.42, Math.min(1.1, s)).toFixed(3));
  }, []);

  useEffect(() => {
    applyScale();
  }, [applyScale]);

  // ---- Enter system ----
  const handleEnter = () => {
    setFading(true);
    setTimeout(() => {
      applyScale();
      setEntered(true);
      // Wait two frames so the scene has actually painted before measuring
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          computeLines();
        });
      });
    }, 800);
  };

  // ---- Recalculate on resize / rotation ----
  useEffect(() => {
    if (!entered) return;
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      applyScale();
      clearTimeout(resizeTimer);
      // wait for the stations' scale transition (.35s) before measuring
      resizeTimer = setTimeout(computeLines, 400);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [entered, computeLines]);

  // ---- Mouse parallax (direct DOM write — avoids a re-render per pixel) ----
  useEffect(() => {
    if (!entered) return;
    const onMove = (event: MouseEvent) => {
      const scene = sceneRef.current;
      if (!scene) return;
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      scene.style.transform = `translate(${x * -7}px, ${y * -5}px)`;
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, [entered]);

  // ---- Theme: layout.tsx applies the saved choice before paint; sync state to it ----
  useEffect(() => {
    setLightMode(document.documentElement.dataset.theme === "light");
  }, []);

  const toggleLightMode = (on: boolean) => {
    setLightMode(on);
    document.documentElement.dataset.theme = on ? "light" : "dark";
    try {
      localStorage.setItem("theme", on ? "light" : "dark");
    } catch {
      // storage unavailable (private mode) — the choice just won't persist
    }
  };

  // ---- Escape closes the panel ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // a dialog inside a panel handles its own Escape and marks it defaultPrevented
      if (e.key === "Escape" && !e.defaultPrevented) setActiveSection(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ---- Room entry transition: zoom + iris cover → loading card → doors open ----
  const [entry, setEntry] = useState<RoomEntry | null>(null);
  const entryTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => entryTimers.current.forEach(clearTimeout), []);

  const enterSection = (section: Section, el: HTMLElement) => {
    if (entry) return; // a transition is already running
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveSection(section);
      return;
    }
    const rect = el.getBoundingClientRect();
    const index = STATIONS.findIndex((s) => s.section === section);
    const base = {
      label: STATIONS[index]?.label ?? section.toUpperCase(),
      code: `RM-${String(index + 1).padStart(2, "0")}`,
      x: ((rect.left + rect.width / 2) / window.innerWidth) * 100,
      y: ((rect.top + rect.height / 2) / window.innerHeight) * 100,
    };
    const at = (ms: number, fn: () => void) => entryTimers.current.push(setTimeout(fn, ms));

    setHoveredSection(null);
    setEntry({ ...base, phase: "cover" });
    at(560, () => setEntry({ ...base, phase: "load" }));
    at(1180, () => {
      setActiveSection(section);
      setEntry({ ...base, phase: "open" });
    });
    at(1720, () => {
      setEntry(null);
      entryTimers.current = [];
    });
  };

  return (
    <>
      {!entered && (
        <Loader progress={progress} canEnter={progress >= 100} fading={fading} onEnter={handleEnter} />
      )}

      <main
        className={`app${entered ? "" : " hidden"}${entry && entry.phase !== "open" ? " zooming" : ""}`}
        style={entry ? ({ "--zx": `${entry.x}%`, "--zy": `${entry.y}%` } as CSSProperties) : undefined}
      >
        <header className="hud top-left">
          <strong>ABDUL RAZAK TOCALO MURIPAGA</strong>
          <span>SOFTWARE DEVELOPER / WEB DEVELOPER</span>
        </header>

        <div className="hud top-right">
          <span>SYSTEM STATUS</span>
          <b>
            <i></i> ONLINE
          </b>
        </div>

        <section className="scene" id="scene" ref={sceneRef}>
          <div className="floor"></div>

          <svg className="network-svg" aria-hidden="true">
            <defs>
              <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g>
              {lines.map(({ section, points }, index) => {
                const active = hoveredSection === section;
                const d = points
                  .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
                  .join(" ");
                const end = points[points.length - 1];
                return (
                  <g key={section}>
                    <path d={d} className={`network-path-glow${active ? " active" : ""}`} />
                    <path d={d} className={`network-path${active ? " active" : ""}`} />
                    <circle cx={end.x} cy={end.y} r={3} className={`network-node${active ? " active" : ""}`} />
                    <circle r={2.5} className="network-pulse">
                      <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        begin={`${index * 0.35}s`}
                        path={d}
                      />
                    </circle>
                  </g>
                );
              })}
            </g>
          </svg>

          <button
            className="core"
            ref={coreRef}
            onClick={(e) => enterSection("about", e.currentTarget)}
            aria-label="RAZAK.DEV system core — open About me"
          >
            <span className="core-glow"></span>
            <span className="core-chip"></span>
          </button>
          {/* caption sits outside the tilted chip so it never overlaps it */}
          <div className="core-caption" aria-hidden="true">
            <span>RAZAK.DEV</span>
            <small>SYSTEM CORE</small>
          </div>

          {STATIONS.map(({ section, label, Icon }) => (
            <button
              key={section}
              className={`station ${section}`}
              ref={(el) => {
                stationRefs.current[section] = el;
              }}
              onClick={(e) => enterSection(section, e.currentTarget)}
              onMouseEnter={() => setHoveredSection(section)}
              onMouseLeave={() => setHoveredSection((s) => (s === section ? null : s))}
            >
              <Icon />
              <label>
                &lt; {label} &gt;
              </label>
            </button>
          ))}

          <div className="data-particle p1"></div>
          <div className="data-particle p2"></div>
          <div className="data-particle p3"></div>
          <div className="data-particle p4"></div>
        </section>

        <footer className="hud bottom-left">
          <label>
            <input type="checkbox" defaultChecked /> HIGH QUALITY
          </label>
          <label>
            <input type="checkbox" defaultChecked /> SOUND EFFECTS
          </label>
          <label className="light-toggle">
            <input
              type="checkbox"
              checked={lightMode}
              onChange={(e) => toggleLightMode(e.target.checked)}
            />{" "}
            LIGHT MODE
          </label>
        </footer>

        <footer className="bottom-center">
          <span>© 2026</span>
          <a href="https://github.com/Razukie" target="_blank" rel="noreferrer">
            GITHUB
          </a>
          <a
            href="https://www.linkedin.com/in/abdul-razak-t-muripaga-97a0742b4/"
            target="_blank"
            rel="noreferrer"
          >
            LINKEDIN
          </a>
          <a href="mailto:muripaga.at07@msumain.edu.ph">EMAIL</a>
        </footer>

        <button className="work-btn" onClick={(e) => enterSection("contact", e.currentTarget)}>
          OPEN TO WORK
        </button>
      </main>

      <Panel activeSection={activeSection} onClose={() => setActiveSection(null)} />
      {entry && <RoomTransition entry={entry} />}
    </>
  );
}
