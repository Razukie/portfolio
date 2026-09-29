"use client";

import Image from "next/image";
import { CSSProperties } from "react";
import { ResumeData, SectionContent } from "@/lib/content";

const CONTACT_ICONS: Record<ResumeData["contact"][number]["kind"], string> = {
  phone:
    "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z",
  email: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm0 1.5 8 6 8-6",
  location: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
};

export default function ResumeView({ data }: { data: SectionContent }) {
  const r = data.resume!;
  let k = 0;
  const step = () => ({ "--k": k++ }) as CSSProperties;

  return (
    <div className="panel-inner resume-panel">
      <div className="resume-toolbar">
        <div className="eyebrow">{data.eyebrow}</div>
        <a className="resume-download" href={r.pdf} target="_blank" rel="noreferrer" download>
          <svg viewBox="0 0 24 24" width={15} height={15} aria-hidden="true">
            <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          DOWNLOAD PDF
        </a>
      </div>

      <header className="resume-header" style={step()}>
        <div className="resume-photo">
          <Image src={r.photo} alt={`Portrait of ${r.name}`} fill sizes="96px" />
        </div>
        <div>
          <h2 className="resume-name">{r.name}</h2>
          <div className="resume-headline">{r.headline}</div>
          <ul className="resume-contact">
            {r.contact.map((c) => (
              <li key={c.kind}>
                <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true">
                  <path d={CONTACT_ICONS[c.kind]} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
                </svg>
                {c.href ? <a href={c.href}>{c.value}</a> : c.value}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="resume-grid">
        <main className="resume-main">
          <section className="resume-section" style={step()}>
            <h3>Profile</h3>
            <p className="resume-profile">{r.profile}</p>
          </section>

          <section className="resume-section">
            <h3 style={step()}>Experience</h3>
            <ol className="resume-timeline">
              {r.experience.map((job) => (
                <li key={job.role + job.org} style={step()}>
                  <div className="rt-head">
                    <strong>{job.role}</strong>
                    <span className={`rt-period${job.period === "Present" ? " now" : ""}`}>{job.period}</span>
                  </div>
                  <div className="rt-org">{job.org}</div>
                  {job.summary && <p className="rt-summary">{job.summary}</p>}
                  <ul className="rt-items">
                    {job.items.map((it) => (
                      <li key={it.name}>
                        <b>{it.name}</b> — {it.text}
                        {it.tech && (
                          <span className="rt-tech">
                            {it.tech.map((t) => (
                              <code key={t}>{t}</code>
                            ))}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        </main>

        <aside className="resume-side">
          <section className="resume-section" style={step()}>
            <h3>Education</h3>
            <ul className="resume-edu">
              {r.education.map((e) => (
                <li key={e.title}>
                  <strong>{e.title}</strong>
                  {e.lines?.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                  <small>{e.period}</small>
                </li>
              ))}
            </ul>
          </section>

          <section className="resume-section" style={step()}>
            <h3>Technical Skills</h3>
            {r.skills.map((g) => (
              <div key={g.group} className="resume-skill-group">
                <div className="rs-label">{g.group}</div>
                <ul className="resume-chips">
                  {g.items.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="resume-section" style={step()}>
            <h3>Soft Skills</h3>
            <ul className="resume-chips soft">
              {r.softSkills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
