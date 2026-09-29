import { Section } from "@/lib/types";
import Image from "next/image";
import { content, SectionContent } from "@/lib/content";
import SkillMatrix from "./SkillMatrix";
import { asset } from "@/lib/asset";
import ServerRoom from "./ServerRoom";
import EvidenceBoard from "./EvidenceBoard";
import ContactPanel from "./ContactPanel";
import ResumeView from "./ResumeView";
import Testimonials from "./Testimonials";
import SystemView from "./SystemView";

interface PanelProps {
  activeSection: Section | null;
  onClose: () => void;
}

function downloadResume() {
  window.open(asset("/assets/abdul-razak-resume.pdf"), "_blank");
}

function ProfileView({ data }: { data: SectionContent }) {
  const profile = data.profile!;
  return (
    <div className="panel-inner profile-panel">
      <figure className="profile-photo">
        <Image
          src={profile.photo}
          alt={`Portrait of ${profile.name}`}
          fill
          sizes="(max-width: 700px) 90vw, 320px"
          priority
        />
        <span className="scan-grid" aria-hidden="true" />
        <span className="scan-beam" aria-hidden="true" />
        <span className="face-lock" aria-hidden="true" />
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <figcaption>
          <span className="scan-status scanning">SCANNING…</span>
          <span className="scan-status verified">
            <i /> ID VERIFIED
          </span>
        </figcaption>
      </figure>

      <div className="profile-body">
        <div className="eyebrow">{data.eyebrow}</div>
        <h2 className="profile-name">{profile.name}</h2>
        <div className="profile-role">{profile.role}</div>

        {data.paragraphs?.map((p, i) => (
          <p key={i} className="profile-bio">
            {p}
          </p>
        ))}

        <dl className="profile-facts">
          {profile.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>

        <ul className="profile-focus">
          {profile.focus.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Panel({ activeSection, onClose }: PanelProps) {
  const data = activeSection ? content[activeSection] : null;

  return (
    <div
      className={`panel${activeSection ? " active" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button className="close-panel" onClick={onClose} aria-label="Close panel">
        ×
      </button>

      {data?.profile && <ProfileView data={data} />}
      {data?.skillRooms && <SkillMatrix data={data} />}
      {data?.serverRoom && <ServerRoom data={data} />}
      {data?.evidence && <EvidenceBoard data={data} />}
      {data?.contactForm && <ContactPanel data={data} />}
      {data?.resume && <ResumeView data={data} />}
      {data?.testimonials && <Testimonials data={data} />}
      {data?.systemInfo && <SystemView data={data} />}

      {data && !data.profile && !data.skillRooms && !data.serverRoom && !data.evidence && !data.contactForm && !data.resume && !data.testimonials && !data.systemInfo && (
        <div className="panel-inner">
          <h2>{data.title}</h2>
          <div className="eyebrow">{data.eyebrow}</div>

          {data.paragraphs?.map((p, i) => (
            <p key={i} style={{ marginTop: i === 0 ? 0 : 16 }}>
              {p}
            </p>
          ))}

          {data.projects && (
            <div className="project-list">
              {data.projects.map((project) => (
                <div className="project" key={project.title}>
                  <strong>{project.title}</strong>
                  <span className="tags">{project.tags}</span>
                </div>
              ))}
            </div>
          )}

          {data.contactLinks && (
            <div style={{ marginTop: 16 }}>
              {data.contactLinks.map((link) => (
                <p key={link.label}>
                  <strong>{link.label}:</strong>{" "}
                  {link.href ? (
                    <a className="contact-link" href={link.href}>
                      {link.value}
                    </a>
                  ) : (
                    link.value
                  )}
                </p>
              ))}
            </div>
          )}

          {data.footerTag && (
            <p className="tags" style={{ marginTop: 16 }}>
              {data.footerTag}
            </p>
          )}

          {data.showResumeButton && (
            <button className="enter-btn" onClick={downloadResume} style={{ marginTop: 16 }}>
              DOWNLOAD RESUME
            </button>
          )}
        </div>
      )}
    </div>
  );
}
