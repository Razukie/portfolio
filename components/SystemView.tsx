"use client";

import { CSSProperties, useEffect, useState } from "react";
import { SectionContent, content, projectTitles } from "@/lib/content";
import { SECTIONS } from "@/lib/types";
import { Logo } from "./SkillMatrix";

/** Counts up from 0 to `value` once on mount (skipped for reduced motion) */
function useCountUp(value: number, duration = 800) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setShown(value * (1 - Math.pow(1 - p, 3))); // ease-out cubic
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return shown;
}

function Stat({ value, decimals = 0, label, note, k }: { value: number; decimals?: number; label: string; note?: string; k: number }) {
  const shown = useCountUp(value);
  return (
    <div className="sys-stat" style={{ "--k": k } as CSSProperties}>
      <span className="sys-stat-value">{shown.toFixed(decimals)}</span>
      <span className="sys-stat-label">{label}</span>
      {note && <span className="sys-stat-note">{note}</span>}
    </div>
  );
}

/** Live values read from the visitor's own browser */
function useLiveStatus() {
  const [time, setTime] = useState("");
  const [theme, setTheme] = useState("Dark");
  const [loadTime, setLoadTime] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () =>
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    updateTime();
    const clock = setInterval(updateTime, 15_000);

    const root = document.documentElement;
    const readTheme = () => setTheme(root.dataset.theme === "light" ? "Light" : "Dark");
    readTheme();
    const observer = new MutationObserver(readTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav && nav.loadEventEnd > 0) setLoadTime(`${(nav.loadEventEnd / 1000).toFixed(2)}s`);

    return () => {
      clearInterval(clock);
      observer.disconnect();
    };
  }, []);

  return { time, theme, loadTime };
}

export default function SystemView({ data }: { data: SectionContent }) {
  const info = data.systemInfo!;
  const { time, theme, loadTime } = useLiveStatus();

  // Every number below is counted from the site's real content
  const technologies = new Set(content.skills.skillRooms?.flatMap((r) => r.stack) ?? []).size;
  const reviews = content.testimonials.testimonials?.reviews ?? [];
  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="panel-inner system-panel">
      <header className="sys-head">
        <div className="eyebrow">{data.eyebrow}</div>
        <h2>{data.title}</h2>
        {data.paragraphs?.map((p) => (
          <p key={p} className="sys-intro">
            {p}
          </p>
        ))}
      </header>

      <div className="sys-status" role="status">
        <span className="sys-status-main">
          <i aria-hidden="true" /> All systems operational
        </span>
        <span className="sys-status-meta">
          <span>
            <small>Local time</small>
            {time}
          </span>
          <span>
            <small>Theme</small>
            {theme}
          </span>
          {loadTime && (
            <span>
              <small>Loaded in</small>
              {loadTime}
            </span>
          )}
        </span>
      </div>

      <div className="sys-stats">
        <Stat k={0} value={SECTIONS.length} label="Rooms" note="interactive sections" />
        <Stat k={1} value={projectTitles().length} label="Projects" note="in the server room" />
        <Stat k={2} value={technologies} label="Technologies" note="in the skill matrix" />
        <Stat
          k={3}
          value={avgRating}
          decimals={1}
          label="Client rating"
          note={`${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
        />
      </div>

      <div className="sys-grid">
        <section className="sys-block">
          <h3>Built with</h3>
          <ul className="sys-stack">
            {info.stack.map((s, i) => (
              <li key={s.name} style={{ "--k": i } as CSSProperties}>
                <span className="sys-stack-icon">
                  <Logo name={s.icon} size={18} />
                </span>
                <span className="sys-stack-text">
                  <strong>{s.name}</strong>
                  <small>{s.role}</small>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="sys-block">
          <h3>Design principles</h3>
          <ol className="sys-principles">
            {info.principles.map((p, i) => (
              <li key={p.title} style={{ "--k": i } as CSSProperties}>
                <span className="sys-principle-num">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{p.title}</strong>
                  <small>{p.text}</small>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <footer className="sys-foot">
        <span>RAZAK.DEV {info.version}</span>
        <span>Designed &amp; built by Abdul Razak Tocalo Muripaga · © {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
