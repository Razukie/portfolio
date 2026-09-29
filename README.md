# RAZAK.DEV — Next.js Portfolio

A Next.js (App Router + TypeScript) port of the cyber-hub portfolio.

## Structure

```
app/
  layout.tsx      Root layout — loads Orbitron/Rajdhani via next/font and globals.css
  page.tsx         Renders <Portfolio />
  globals.css      All visual styling (ported 1:1 from the original style.css)
components/
  Portfolio.tsx    Loader → scene → stations → SVG network lines → panel, all wired with React state
  Loader.tsx       Loading screen (progress bar + Enter System button)
  Panel.tsx        Content overlay, driven by lib/content.ts
  StationIcons.tsx The little server-rack / robot / terminal / etc. visuals for each station
lib/
  content.ts       Structured copy for every section (edit this to change panel text)
  types.ts         Section name + line-point types shared across components
public/
  assets/          Put abdul-razak-resume.pdf here — the RESUME panel's download button expects it at /assets/abdul-razak-resume.pdf
```

## What changed vs. the plain HTML/CSS/JS version

- The core → station connector lines are computed the same way as the fixed vanilla version (real `getBoundingClientRect()` centers, drawn as SVG `<line>`/`<circle>` elements) — but now they live in React state (`lines`) instead of being manually appended/removed from the DOM, and hover highlighting is just a `hoveredSection` state value instead of manual class toggling.
- The loading screen, "enter system" fade, and panel open/close are all React state (`progress`, `fading`, `entered`, `activeSection`) rather than direct DOM class manipulation.
- Mouse parallax still writes `transform` directly to the scene element via a ref (not state) so it doesn't trigger a re-render on every mouse-move — same approach as the original, just inside a `useEffect`.
- Panel copy lives in `lib/content.ts` as structured data instead of HTML template strings, so editing your projects/skills/contact info doesn't require touching any markup.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Before shipping

- Drop your resume PDF at `public/assets/abdul-razak-resume.pdf`.
- Update the GitHub/LinkedIn/email links and contact info in `lib/content.ts` and in `components/Portfolio.tsx`'s footer.
- Swap in real testimonials in `lib/content.ts` before enabling that section for visitors.
- Contact form: without configuration, **Send** only opens the visitor's email app. To receive messages directly, connect EmailJS (free tier: 200 emails/month):

  1. Sign up at https://www.emailjs.com.
  2. **Email Services → Add New Service** → choose Gmail (works for Google Workspace school accounts too) → connect the inbox you want messages in → copy the **Service ID**.
  3. **Email Templates → Create New Template**, set:
     - **To Email:** your address
     - **Subject:** `Portfolio: {{subject}}`
     - **Reply To:** `{{reply_to}}`
     - **Content:** `From: {{from_name}} <{{from_email}}>` then a blank line, then `{{message}}`

     Save and copy the **Template ID**.
  4. **Account → General** → copy your **Public Key**.
  5. Copy `.env.example` to `.env.local`, paste the three values, and restart `npm run dev`.
  6. When deploying (e.g. Vercel), add the same three variables in the host's environment settings and redeploy.

  Formspree also works: leave the EmailJS keys empty and set `NEXT_PUBLIC_CONTACT_ENDPOINT` to your Formspree form URL.
