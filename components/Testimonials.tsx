"use client";

import { CSSProperties, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { SectionContent, findProject, projectTitles } from "@/lib/content";
import { CAN_SEND_DIRECT, mailtoHref, sendMessage } from "@/lib/sendMessage";

const STAR =
  "M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8L12 2.8z";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** Read-only stars; supports fractions for averages (e.g. 4.5) */
function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="star" style={{ width: size, height: size }}>
            <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
              <path d={STAR} className="star-empty" />
            </svg>
            <span className="star-fill" style={{ width: `${fill * 100}%` }}>
              <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
                <path d={STAR} />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

type Status = "idle" | "sending" | "sent" | "error";

const EMPTY_FORM = { project: "", name: "", role: "", email: "", comment: "" };

const RATED_KEY = "rated-projects";

/** "IDTS", "idts " and "I.D.T.S." all compare equal */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const blockedText = (project: string, reason: "published" | "local") =>
  reason === "published"
    ? `${project.trim()} has already been rated by its client, so it can't be rated again.`
    : `You've already rated ${project.trim()}. Thank you for your feedback!`;

export default function Testimonials({ data }: { data: SectionContent }) {
  const t = data.testimonials!;
  const [activeId, setActiveId] = useState(t.systems[0].id);
  const active = t.systems.find((s) => s.id === activeId)!;
  const reviews = t.reviews.filter((r) => r.system === activeId);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const firstField = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const statsFor = (id: string) => {
    const list = t.reviews.filter((r) => r.system === id);
    const avg = list.length ? list.reduce((sum, r) => sum + r.rating, 0) / list.length : 0;
    return { count: list.length, avg };
  };

  // ---- One rating per project ----
  // Published: a project whose client review is already on the page.
  const publishedRated = new Set(
    t.systems.filter((s) => statsFor(s.id).count > 0).flatMap((s) => [norm(s.name), norm(s.project)])
  );
  // Local: projects this visitor already rated from this browser.
  const [locallyRated, setLocallyRated] = useState<string[]>([]);
  useEffect(() => {
    try {
      setLocallyRated(JSON.parse(localStorage.getItem(RATED_KEY) ?? "[]"));
    } catch {
      // storage unavailable — fall back to published-only checks
    }
  }, []);

  const ratedReason = (project: string): "published" | "local" | null => {
    const key = norm(project);
    if (!key) return null;
    if (publishedRated.has(key)) return "published";
    if (locallyRated.includes(key)) return "local";
    return null;
  };

  const rememberRated = (project: string) => {
    const next = Array.from(new Set([...locallyRated, norm(project)]));
    setLocallyRated(next);
    try {
      localStorage.setItem(RATED_KEY, JSON.stringify(next));
    } catch {
      // not persisted; still blocked for this visit
    }
  };

  const suggestions = projectTitles().filter((title) => !ratedReason(title));

  const openForm = (e: { currentTarget: HTMLButtonElement }) => {
    opener.current = e.currentTarget;
    setForm({ ...EMPTY_FORM, project: ratedReason(active.name) ? "" : active.name });
    setRating(0);
    setError("");
    setStatus("idle");
    setOpen(true);
  };

  const closeForm = () => {
    setOpen(false);
    opener.current?.focus();
  };

  useEffect(() => {
    if (open) firstField.current?.focus();
  }, [open]);

  // Escape closes only the dialog, not the whole panel behind it
  const onDialogKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closeForm();
    }
  };

  const message = () => ({
    to: t.to,
    name: form.name,
    email: form.email,
    subject: `Rating: ${form.project.trim()} — ${rating}/5`,
    message: [
      `Project: ${form.project.trim()}`,
      `Rating: ${"★".repeat(rating)}${"☆".repeat(5 - rating)} ${rating}/5 — ${LABELS[rating]}`,
      `From: ${form.name.trim()}${form.role.trim() ? `, ${form.role.trim()}` : ""}`,
      "",
      form.comment.trim(),
    ].join("\n"),
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.project.trim()) return setError("Please enter the project name.");
    if (ratedReason(form.project)) return setError(blockedText(form.project, ratedReason(form.project)!));
    if (!rating) return setError("Please choose a star rating.");
    if (!form.name.trim()) return setError("Please enter your name.");
    if (form.comment.trim().length < 10) return setError("Please write a short comment (at least 10 characters).");
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return setError("That email address doesn't look right.");
    setError("");

    if (!CAN_SEND_DIRECT) {
      window.location.href = mailtoHref(message());
      rememberRated(form.project);
      setStatus("sent");
      return;
    }
    setStatus("sending");
    try {
      const ok = await sendMessage(message());
      if (ok) rememberRated(form.project);
      setStatus(ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  const projectBlocked = ratedReason(form.project);

  const shown = hover || rating;
  const activeStats = statsFor(activeId);

  return (
    <div className="panel-inner testimonials-panel">
      <header className="tm-head">
        <div>
          <div className="eyebrow">{data.eyebrow}</div>
          <h2>{data.title}</h2>
          {data.paragraphs?.map((p) => (
            <p key={p} className="tm-intro">
              {p}
            </p>
          ))}
        </div>
        <button type="button" className="tm-cta" onClick={openForm} aria-haspopup="dialog">
          <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true">
            <path d={STAR} />
          </svg>
          Give feedback
        </button>
      </header>

      <div className="tm-tabs" role="tablist" aria-label="Systems">
        {t.systems.map((s) => {
          const { count, avg } = statsFor(s.id);
          const logo = findProject(s.project)?.logo;
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={s.id === activeId}
              className={`tm-tab${s.id === activeId ? " active" : ""}`}
              onClick={() => setActiveId(s.id)}
            >
              {logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" />
              )}
              {s.name}
              {count > 0 && <span className="tm-tab-score">★ {avg.toFixed(1)}</span>}
            </button>
          );
        })}
      </div>

      <div className="tm-stage" key={activeId} role="tabpanel" aria-label={`Feedback for ${active.name}`}>
        <aside className="tm-summary">
          <div className="tm-summary-context">{active.context}</div>
          <div className={`tm-big-score${activeStats.count ? "" : " empty"}`}>
            {activeStats.count ? activeStats.avg.toFixed(1) : "—"}
          </div>
          <Stars value={activeStats.avg} size={18} />
          <p className="tm-summary-count">
            {activeStats.count
              ? `Based on ${activeStats.count} review${activeStats.count === 1 ? "" : "s"}`
              : "No reviews yet"}
          </p>
          {ratedReason(active.name) ? (
            <span className="tm-rated-badge">
              <svg viewBox="0 0 24 24" width={13} height={13} aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {ratedReason(active.name) === "published" ? "Rated by client" : "You rated this"}
            </span>
          ) : (
            <button type="button" className="tm-link" onClick={openForm} aria-haspopup="dialog">
              Rate {active.name} <span aria-hidden="true">→</span>
            </button>
          )}
        </aside>

        <section className="tm-reviews">
          {reviews.length ? (
            reviews.map((r, i) => (
              <figure key={i} className="tm-review" style={{ "--k": i } as CSSProperties}>
                <span className="tm-quote-mark" aria-hidden="true">
                  “
                </span>
                <blockquote>
                  {r.quote.split(/\n{2,}/).map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </blockquote>
                <figcaption>
                  <span className="tm-avatar" aria-hidden="true">
                    {initials(r.author)}
                  </span>
                  <span className="tm-author">
                    <strong>{r.author}</strong>
                    {(r.role || r.date) && <small>{[r.role, r.date].filter(Boolean).join(" · ")}</small>}
                  </span>
                  <Stars value={r.rating} size={14} />
                </figcaption>
              </figure>
            ))
          ) : (
            <div className="tm-empty">
              <p className="tm-empty-title">No reviews for {active.name} yet</p>
              <p>If you&apos;ve used it, your feedback helps future clients know what it&apos;s like to work with me.</p>
            </div>
          )}
        </section>
      </div>

      {open && (
        <div
          className="tm-dialog-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div
            className="tm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tm-dialog-title"
            onKeyDown={onDialogKey}
          >
            <button type="button" className="tm-dialog-close" onClick={closeForm} aria-label="Close feedback form">
              ×
            </button>

            {status === "sent" ? (
              <div className="cf-done" role="status">
                <span className="cf-done-icon" aria-hidden="true" />
                <h3 id="tm-dialog-title">Thank you!</h3>
                <p>
                  {CAN_SEND_DIRECT
                    ? `Your feedback for ${form.project.trim()} was sent. It will appear here once it's reviewed.`
                    : "Your email app should now be open with the feedback filled in. Press send there to deliver it."}
                </p>
                <button type="button" className="cf-secondary" onClick={closeForm}>
                  DONE
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <div className="tm-dialog-head">
                  <h3 id="tm-dialog-title" className="tm-rate-title">
                    Rate your experience
                  </h3>
                  <p>Your feedback helps future clients know what it&apos;s like to work with me.</p>
                </div>

                <div className={`cf-field${projectBlocked ? " invalid" : ""}`}>
                  <label htmlFor="tm-project">Project name</label>
                  <input
                    id="tm-project"
                    ref={firstField}
                    list="tm-project-options"
                    placeholder="Which project did I build for you?"
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                    aria-invalid={!!projectBlocked}
                    aria-describedby={projectBlocked ? "tm-project-note" : undefined}
                  />
                  <datalist id="tm-project-options">
                    {suggestions.map((title) => (
                      <option key={title} value={title} />
                    ))}
                  </datalist>
                  {projectBlocked && (
                    <span className="cf-error" id="tm-project-note" role="alert">
                      {blockedText(form.project, projectBlocked)}
                    </span>
                  )}
                </div>

                <div className="tm-rating-block">
                  <div className="tm-picker" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating === n}
                        aria-label={`${n} star${n === 1 ? "" : "s"} — ${LABELS[n]}`}
                        className={n <= shown ? "on" : ""}
                        onMouseEnter={() => setHover(n)}
                        onFocus={() => setHover(n)}
                        onBlur={() => setHover(0)}
                        onClick={() => setRating(n)}
                      >
                        <svg viewBox="0 0 24 24" width={34} height={34} aria-hidden="true">
                          <path d={STAR} />
                        </svg>
                      </button>
                    ))}
                    <span className="tm-picker-label">{shown ? LABELS[shown] : "Tap to rate"}</span>
                  </div>
                </div>

                <div className="cf-row">
                  <div className="cf-field">
                    <label htmlFor="tm-name">Name</label>
                    <input
                      id="tm-name"
                      autoComplete="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="cf-field">
                    <label htmlFor="tm-role">Role / organization</label>
                    <input
                      id="tm-role"
                      placeholder="Optional"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    />
                  </div>
                </div>
                <div className="cf-field">
                  <label htmlFor="tm-email">Email</label>
                  <input
                    id="tm-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Optional — only used if I need to follow up"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="cf-field">
                  <label htmlFor="tm-comment">Feedback</label>
                  <textarea
                    id="tm-comment"
                    rows={4}
                    placeholder="What was it like working with me and using the system?"
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  />
                </div>

                {error && (
                  <p className="cf-error" role="alert">
                    {error}
                  </p>
                )}
                {status === "error" && (
                  <p className="cf-error" role="alert">
                    The feedback couldn&apos;t be sent.{" "}
                    <a className="contact-link" href={mailtoHref(message())}>
                      Send it with your email app instead
                    </a>
                    .
                  </p>
                )}

                <button type="submit" className="cf-submit" disabled={status === "sending" || !!projectBlocked}>
                  {status === "sending" ? "SENDING…" : "SUBMIT RATING"}
                  <span aria-hidden="true">→</span>
                </button>
                <p className="tm-note">Feedback is reviewed before it&apos;s published.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
