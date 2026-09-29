/**
 * Shared delivery for the site's forms (contact, project ratings).
 *
 * In order of preference:
 * 1. EmailJS — all three NEXT_PUBLIC_EMAILJS_* keys set (see README)
 * 2. A form backend URL such as Formspree — NEXT_PUBLIC_CONTACT_ENDPOINT
 * 3. Neither: callers fall back to opening the visitor's email app
 */
const EMAILJS = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};
const USE_EMAILJS = !!(EMAILJS.serviceId && EMAILJS.templateId && EMAILJS.publicKey);
const FORM_ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

/** True when messages can be sent without the visitor's email app */
export const CAN_SEND_DIRECT = USE_EMAILJS || !!FORM_ENDPOINT;

export interface OutgoingMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  to: string;
}

export function mailtoHref(m: OutgoingMessage) {
  const body = `${m.message.trim()}\n\n— ${m.name.trim()}${m.email.trim() ? `\n${m.email.trim()}` : ""}`;
  return `mailto:${m.to}?subject=${encodeURIComponent(m.subject.trim())}&body=${encodeURIComponent(body)}`;
}

export async function sendMessage(m: OutgoingMessage): Promise<boolean> {
  const name = m.name.trim();
  const email = m.email.trim();
  const subject = m.subject.trim();
  const message = m.message.trim();

  if (USE_EMAILJS) {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS.serviceId,
        template_id: EMAILJS.templateId,
        user_id: EMAILJS.publicKey,
        // available in the EmailJS template as {{from_name}}, {{message}}, …
        template_params: {
          from_name: name,
          from_email: email,
          reply_to: email || m.to,
          subject,
          message,
          to_email: m.to,
          // aliases used by EmailJS's default "Contact Us" template
          name,
          email,
          title: subject,
          time: new Date().toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }),
        },
      }),
    });
    // EmailJS explains failures in plain text (bad key, Gmail permission, …)
    if (!res.ok) console.error("EmailJS:", res.status, await res.text());
    return res.ok;
  }

  const res = await fetch(FORM_ENDPOINT!, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name, email, subject, message, _replyto: email }),
  });
  return res.ok;
}
