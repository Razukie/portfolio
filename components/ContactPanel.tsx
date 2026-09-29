"use client";

import { CSSProperties, FormEvent, useState } from "react";
import { SectionContent } from "@/lib/content";
import { socialIcons } from "@/lib/socialIcons";
import { CAN_SEND_DIRECT, mailtoHref, sendMessage } from "@/lib/sendMessage";

type Field = "name" | "email" | "subject" | "message";
type Status = "idle" | "sending" | "sent" | "error";

const EMPTY: Record<Field, string> = { name: "", email: "", subject: "", message: "" };

const ENDPOINT = CAN_SEND_DIRECT;

function validate(v: Record<Field, string>) {
  const errors: Partial<Record<Field, string>> = {};
  if (!v.name.trim()) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) errors.email = "Please enter a valid email address.";
  if (!v.subject.trim()) errors.subject = "Please add a subject.";
  if (v.message.trim().length < 10) errors.message = "Please write a message (at least 10 characters).";
  return errors;
}

export default function ContactPanel({ data }: { data: SectionContent }) {
  const { to, socials } = data.contactForm!;
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const mailto = () => mailtoHref({ ...values, to });

  const update = (field: Field) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    if (!ENDPOINT) {
      window.location.href = mailto();
      setStatus("sent");
      return;
    }

    setStatus("sending");
    try {
      setStatus((await sendMessage({ ...values, to })) ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setStatus("idle");
  };

  const channels = (data.contactLinks ?? []).filter((l) => l.href);

  const field = (name: Field, label: string, i: number, input: JSX.Element) => (
    <div className={`cf-field${errors[name] ? " invalid" : ""}`} style={{ "--k": i } as CSSProperties}>
      <label htmlFor={`cf-${name}`}>{label}</label>
      {input}
      {errors[name] && (
        <span className="cf-error" id={`cf-${name}-error`} role="alert">
          {errors[name]}
        </span>
      )}
    </div>
  );

  const aria = (name: Field) => ({
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `cf-${name}-error` : undefined,
  });

  return (
    <div className="panel-inner contact-panel">
      <aside className="contact-info">
        <div className="eyebrow">{data.eyebrow}</div>
        <h2>{data.title}</h2>
        {data.paragraphs?.map((p) => (
          <p key={p} className="contact-intro">
            {p}
          </p>
        ))}

        <ul className="contact-channels">
          {channels.map((c) => (
            <li key={c.label}>
              <span>{c.label}</span>
              <a className="contact-link" href={c.href}>
                {c.value}
              </a>
            </li>
          ))}
        </ul>

        <div className="contact-social-label">FIND ME ON</div>
        <ul className="contact-socials">
          {socials.map((s, i) => {
            const icon = socialIcons[s.icon];
            return (
              <li key={s.icon} style={{ "--k": i, "--brand": icon.color } as CSSProperties}>
                <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} title={s.label}>
                  <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
                    <path d={icon.path} fill="currentColor" />
                  </svg>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="contact-availability">
          <i /> AVAILABLE FOR FREELANCE WORK
        </div>
      </aside>

      {status === "sent" ? (
        <div className="cf-done" role="status">
          <span className="cf-done-icon" aria-hidden="true" />
          <h3>{ENDPOINT ? "Message sent" : "Message ready"}</h3>
          <p>
            {ENDPOINT
              ? "Thanks for reaching out — I'll get back to you as soon as possible."
              : "Your email app should now be open with the message filled in. Press send there to deliver it."}
          </p>
          {!ENDPOINT && (
            <p className="cf-fallback">
              Nothing opened? Email me directly at{" "}
              <a className="contact-link" href={`mailto:${to}`}>
                {to}
              </a>
            </p>
          )}
          <button type="button" className="cf-secondary" onClick={reset}>
            WRITE ANOTHER MESSAGE
          </button>
        </div>
      ) : (
        <form className="contact-form" onSubmit={onSubmit} noValidate>
          <div className="cf-row">
            {field(
              "name",
              "Name",
              0,
              <input
                id="cf-name"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                value={values.name}
                onChange={update("name")}
                {...aria("name")}
              />
            )}
            {field(
              "email",
              "Email",
              1,
              <input
                id="cf-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={update("email")}
                {...aria("email")}
              />
            )}
          </div>
          {field(
            "subject",
            "Subject",
            2,
            <input
              id="cf-subject"
              name="subject"
              placeholder="What's this about?"
              value={values.subject}
              onChange={update("subject")}
              {...aria("subject")}
            />
          )}
          {field(
            "message",
            "Message",
            3,
            <textarea
              id="cf-message"
              name="message"
              rows={6}
              placeholder="Tell me about your project or idea…"
              value={values.message}
              onChange={update("message")}
              {...aria("message")}
            />
          )}

          {status === "error" && (
            <p className="cf-error cf-send-error" role="alert">
              The message couldn&apos;t be sent.{" "}
              <a className="contact-link" href={mailto()}>
                Send it with your email app instead
              </a>
              .
            </p>
          )}

          <button type="submit" className="cf-submit" disabled={status === "sending"}>
            {status === "sending" ? "SENDING…" : "SEND MESSAGE"}
            <span aria-hidden="true">→</span>
          </button>
        </form>
      )}
    </div>
  );
}
