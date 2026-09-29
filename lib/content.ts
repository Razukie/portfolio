import { Section } from "./types";
import { TechIconKey } from "./techIcons";
import { SocialKey } from "./socialIcons";
import { asset } from "./asset";

export interface ProjectItem {
  title: string;
  tags: string;
  description?: string;
  /** Logo image under /public, shown on the rack and in the console */
  logo?: string;
  /** Organisation the project was built for, shown as "CLIENT // …" */
  client?: string;
}

export interface ContactLink {
  label: string;
  value: string;
  /** Makes the value clickable (mailto:, https:, …) */
  href?: string;
}

export interface ProfileFact {
  label: string;
  value: string;
}

export interface Profile {
  photo: string;
  name: string;
  role: string;
  facts: ProfileFact[];
  focus: string[];
}

export interface SkillRoom {
  id: string;
  title: string;
  description: string;
  stack: TechIconKey[];
}

export interface SectionContent {
  title: string;
  eyebrow: string;
  paragraphs?: string[];
  projects?: ProjectItem[];
  footerTag?: string;
  showResumeButton?: boolean;
  contactLinks?: ContactLink[];
  profile?: Profile;
  skillRooms?: SkillRoom[];
  /** Render projects as an interactive server room instead of a card list */
  serverRoom?: boolean;
  evidence?: EvidenceBoard;
  contactForm?: ContactFormConfig;
  resume?: ResumeData;
  testimonials?: TestimonialsData;
  systemInfo?: SystemInfo;
}

export interface SystemInfo {
  version: string;
  stack: { icon: TechIconKey; name: string; role: string }[];
  principles: { title: string; text: string }[];
}

export interface Review {
  /** id of a system in TestimonialsData.systems */
  system: string;
  /** 1–5 stars; decimals allowed (e.g. 4.5 shows a half star) */
  rating: number;
  quote: string;
  author: string;
  role?: string;
  date?: string;
}

export interface TestimonialsData {
  /** Where new ratings are sent */
  to: string;
  systems: { id: string; project: string; name: string; context: string }[];
  reviews: Review[];
}

export interface ResumeData {
  name: string;
  headline: string;
  photo: string;
  /** Downloadable PDF under /public */
  pdf: string;
  contact: { kind: "phone" | "email" | "location"; value: string; href?: string }[];
  profile: string;
  experience: {
    role: string;
    org: string;
    period: string;
    summary?: string;
    items: { name: string; text: string; tech?: string[] }[];
  }[];
  education: { title: string; lines?: string[]; period: string }[];
  skills: { group: string; items: string[] }[];
  softSkills: string[];
}

export interface ContactFormConfig {
  /** Address the message is sent to */
  to: string;
  socials: { icon: SocialKey; label: string; href: string }[];
}

export type EvidenceType = "SUBJECT" | "ORGANIZATION" | "PROJECT" | "EDUCATION" | "ROLE";

export interface EvidenceNode {
  id: string;
  label: string;
  sub?: string;
  type: EvidenceType;
  /** Position on the board, in % of its width / height */
  x: number;
  y: number;
  logo?: string;
  notes?: string;
  /** Positions held there, listed in the case file */
  roles?: string[];
  /** Title of a Works project to pull the description and logo from */
  project?: string;
}

export interface EvidenceLink {
  from: string;
  to: string;
  label: string;
  /** Hide the label on the board (still listed in the case file) */
  quiet?: boolean;
  /** Where the label sits along the link, 0 = from, 1 = to (default .5) */
  at?: number;
}

export interface EvidenceBoard {
  nodes: EvidenceNode[];
  links: EvidenceLink[];
}

export function findProject(title: string): ProjectItem | undefined {
  return workProjects.find((p) => p.title === title);
}

export function projectTitles(): string[] {
  return workProjects.map((p) => p.title);
}

const workProjects: ProjectItem[] = [
  {
    title: "ONEMSU",
    tags: "Sports Management / Real-time Results / Brackets / Medal Tally",
    description:
      "A sports management platform built for MSUSAA 2K26 that brings event brackets, real-time match results and the overall medal tally together in one place.",
    logo: asset("/assets/logos/msu.png"),
    client: "MSU MAIN CAMPUS",
  },
  {
    title: "INTERNAL DOCUMENT TRACKING SYSTEM",
    tags: "Document Routing / Firebase / Workflow Management",
    description:
      "An internal document tracking system for DPWH CAR, built on Firebase, for routing documents between offices, tracking the status of each document and keeping the approval workflow transparent.",
    logo: asset("/assets/logos/dpwh.png"),
    client: "DPWH CAR",
  },
  {
    title: "MSU EVALUATION SYSTEM",
    tags: "Web Application / Student Evaluation / API Integration",
    description:
      "A web application for running student evaluations, with API integration for exchanging evaluation data with other systems.",
    logo: asset("/assets/logos/msu.png"),
    client: "MSU MAIN CAMPUS",
  },
  {
    title: "SEEPARK",
    tags: "Parking System / React / Firebase / QR Workflow",
    description:
      "A parking management system built with React and Firebase, using a QR-based workflow to handle parking access and records.",
    logo: asset("/assets/logos/seepark.svg"),
  },
  {
    title: "MSU ONLINE CLEARANCE",
    tags: "Web Application / Clearance Workflow",
    description:
      "A web application that moves the clearance process online, so students can complete and track their clearance requirements without paper forms.",
    logo: asset("/assets/logos/msu.png"),
    client: "MSU MAIN CAMPUS",
  },
  {
    title: "MEDCLINIC",
    tags: "Booking System / Doctor Availability / Patient Appointments",
    description:
      "An online booking system where patients see which doctors are available and choose their doctor when booking an appointment.",
    logo: asset("/assets/logos/medclinic.svg"),
  },
];

export const content: Record<Section, SectionContent> = {
  works: {
    title: "SELECTED WORKS",
    eyebrow: "PROJECT DATABASE // 2026",
    serverRoom: true,
    paragraphs: [
      "Selected systems and web applications developed for real-world workflows, academic environments and organizational operations.",
    ],
    projects: workProjects,
  },

  about: {
    title: "ABOUT ME",
    eyebrow: "IDENTITY // DEVELOPER PROFILE",
    paragraphs: [
      "I design and develop practical digital solutions that improve how people work, manage information, and interact with technology.",
      "My expertise spans web application development, database management, system workflows, UI implementation, and technical support, with a focus on building reliable and maintainable systems for academic and organizational environments.",
      "I turn real-world requirements into functional, efficient, and user-centered software solutions.",
    ],
    profile: {
      photo: asset("/assets/profile.jpg"),
      name: "Abdul Razak Tocalo Muripaga",
      role: "Software Developer / Web Developer",
      facts: [
        { label: "GRADUATE", value: "Mindanao State University — Main Campus" },
        { label: "COLLEGE", value: "College of Information Communications and Computing Sciences (CICS)" },
        { label: "DEGREE", value: "BS Information Technology — Database" },
        { label: "SPECIALTY", value: "Web Systems & Databases" },
        { label: "STATUS", value: "Freelancer / Computer Programmer" },
      ],
      focus: ["Web Systems", "Databases", "App Development", "UI"],
    },
  },

  skills: {
    title: "SKILL MATRIX",
    eyebrow: "TECHNOLOGY // CAPABILITIES",
    paragraphs: ["Select a room to scan its technology stack."],
    skillRooms: [
      {
        id: "languages",
        title: "LANGUAGES",
        description: "Core programming languages behind the systems I build.",
        stack: ["java", "cpp", "csharp"],
      },
      {
        id: "frontend",
        title: "FRONTEND",
        description: "Interfaces and client-side experiences.",
        stack: ["html", "css", "javascript", "react", "nextjs", "vue", "tailwind", "bootstrap"],
      },
      {
        id: "backend",
        title: "BACKEND",
        description: "Server logic, APIs and integrations.",
        stack: [
          "php",
          "nodejs",
          "rest",
          "graphql",
          "postgresql",
          "aspnetmvc",
          "aspnetwebapi",
          "aspnetwebforms",
          "efcore",
        ],
      },
      {
        id: "database",
        title: "DATABASE",
        description: "Data storage, structure and real-time sync.",
        stack: ["mysql", "firebase", "firebird", "ssms", "sqlite"],
      },
      {
        id: "tools",
        title: "TOOLS",
        description: "Version control, development environment and UI design.",
        stack: ["git", "github", "vscode", "figma"],
      },
    ],
  },

  experience: {
    title: "EXPERIENCE",
    eyebrow: "CASE FILE // EVIDENCE LINK ANALYSIS",
    paragraphs: ["Select an entity to trace its links."],
    evidence: {
      nodes: [
        {
          id: "subject",
          label: "ABDUL RAZAK TOCALO MURIPAGA",
          sub: "Software Developer / Web Developer",
          type: "SUBJECT",
          x: 52,
          y: 48,
          notes:
            "Software and web developer building practical systems for academic and organizational environments, from institutional web applications to document workflows and booking systems.",
        },
        {
          id: "msu",
          label: "MSU MAIN CAMPUS",
          sub: "Mindanao State University",
          type: "ORGANIZATION",
          x: 25,
          y: 30,
          logo: asset("/assets/logos/msu.png"),
          notes:
            "Alma mater, and the institution behind several of the systems on this board: ONEMSU, the MSU Evaluation System and MSU Online Clearance.",
        },
        {
          id: "bsit",
          label: "BS INFORMATION TECHNOLOGY",
          sub: "Database · CICS",
          type: "EDUCATION",
          x: 14,
          y: 78,
          notes:
            "BS Information Technology — Database, College of Information Communications and Computing Sciences (CICS), Mindanao State University — Main Campus. Includes on-the-job training at NCMF North Luzon.",
        },
        {
          id: "dpwh",
          label: "DPWH CAR",
          sub: "Public Works and Highways · Cordillera",
          type: "ORGANIZATION",
          x: 76,
          y: 26,
          logo: asset("/assets/logos/dpwh.png"),
          notes:
            "Department of Public Works and Highways, Cordillera Administrative Region (CAR) — IT work spanning programming, network and database administration, technical support and graphic design, including the Internal Document Tracking System.",
          roles: [
            "Computer Programmer",
            "Network Administrator",
            "Database Administrator",
            "IT Support",
            "Graphic Designer",
          ],
        },
        {
          id: "freelance",
          label: "FREELANCE",
          sub: "Computer Programmer",
          type: "ROLE",
          x: 76,
          y: 70,
          notes:
            "Freelance computer programmer building independent systems, including SeePark and MedClinic.",
        },
        {
          id: "ncmf",
          label: "NCMF NORTH LUZON",
          sub: "National Commission on Muslim Filipinos",
          type: "ORGANIZATION",
          x: 32,
          y: 80,
          logo: asset("/assets/logos/ncmf.png"),
          notes:
            "National Commission on Muslim Filipinos — North Luzon. On-the-job training completed as part of the BS Information Technology program, where I developed NCMF Apps.",
        },
        {
          id: "ncmfapps",
          label: "NCMF APPS",
          sub: "Developed during OJT",
          type: "PROJECT",
          x: 50,
          y: 86,
          notes: "Applications developed for NCMF North Luzon during on-the-job training.",
        },
        { id: "onemsu", label: "ONEMSU", sub: "Sports management", type: "PROJECT", x: 10, y: 10, project: "ONEMSU" },
        { id: "eval", label: "MSU EVALUATION", sub: "Student evaluation", type: "PROJECT", x: 37, y: 9, project: "MSU EVALUATION SYSTEM" },
        { id: "clearance", label: "MSU CLEARANCE", sub: "Online clearance", type: "PROJECT", x: 9, y: 52, project: "MSU ONLINE CLEARANCE" },
        { id: "idts", label: "IDTS", sub: "Internal document tracking", type: "PROJECT", x: 90, y: 9, project: "INTERNAL DOCUMENT TRACKING SYSTEM" },
        { id: "seepark", label: "SEEPARK", sub: "Parking system", type: "PROJECT", x: 91, y: 50, project: "SEEPARK" },
        { id: "medclinic", label: "MEDCLINIC", sub: "Clinic booking", type: "PROJECT", x: 66, y: 88, project: "MEDCLINIC" },
      ],
      links: [
        { from: "subject", to: "msu", label: "ALUMNUS" },
        { from: "subject", to: "bsit", label: "EARNED" },
        { from: "msu", to: "bsit", label: "CICS", at: 0.4 },
        { from: "msu", to: "onemsu", label: "BUILT FOR", at: 0.3 },
        { from: "msu", to: "eval", label: "BUILT FOR", at: 0.45 },
        { from: "msu", to: "clearance", label: "BUILT FOR", at: 0.65 },
        { from: "subject", to: "dpwh", label: "EMPLOYED" },
        { from: "dpwh", to: "idts", label: "INTERNAL SYSTEM", at: 0.35 },
        { from: "bsit", to: "ncmf", label: "OJT" },
        { from: "ncmf", to: "ncmfapps", label: "DEVELOPED", at: 0.6 },
        { from: "subject", to: "freelance", label: "SELF-EMPLOYED", at: 0.62 },
        { from: "freelance", to: "seepark", label: "DEVELOPED", at: 0.35 },
        { from: "freelance", to: "medclinic", label: "DEVELOPED", at: 0.65 },
      ],
    },
  },

  resume: {
    title: "RESUME",
    eyebrow: "DOCUMENT // PROFESSIONAL PROFILE",
    resume: {
      name: "Abdul Razak T. Muripaga",
      headline: "Software & Web Developer · Computer Programmer",
      photo: asset("/assets/profile.jpg"),
      pdf: asset("/assets/abdul-razak-resume.pdf"),
      contact: [
        { kind: "phone", value: "0963 924 4571", href: "tel:+639639244571" },
        { kind: "email", value: "muripaga.at99@s.msumain.edu.ph", href: "mailto:muripaga.at99@s.msumain.edu.ph" },
        { kind: "location", value: "Rapasun, MSU Main Campus, Marawi City" },
      ],
      profile:
        "Software and web developer who builds practical systems that improve how people work and manage information. Experienced in web application development, database management, system workflows, UI implementation and technical support, with a focus on reliable, maintainable systems for academic and government organizations.",
      experience: [
        {
          role: "Developer – Systems for MSU Main Campus",
          org: "Mindanao State University – Main Campus",
          period: "Present",
          items: [
            { name: "ONEMSU", text: "sports management platform for MSUSAA 2K26 with event brackets, real-time match results and the overall medal tally." },
            { name: "MSU Evaluation System", text: "web app for student evaluations, with API integration to exchange evaluation data with other systems." },
            { name: "MSU Online Clearance", text: "moves clearance online so students complete and track requirements without paper forms." },
          ],
        },
        {
          role: "Freelance Computer Programmer",
          org: "Self-employed",
          period: "Dec 2025 – Jul 2026",
          summary: "Built independent systems for clients.",
          items: [
            { name: "SeePark", text: "parking management system using a QR-based workflow for parking access and records.", tech: ["React", "Firebase"] },
            { name: "MedClinic", text: "online booking system where patients see available doctors and choose one when booking." },
          ],
        },
        {
          role: "Computer Programmer",
          org: "DPWH – Cordillera Administrative Region",
          period: "Jun 2025 – Jul 2026",
          summary: "Roles held: Computer Programmer, Network Administrator, Database Administrator, IT Support and Graphic Designer.",
          items: [
            {
              name: "Internal Document Tracking System (IDTS)",
              text: "routes documents between offices, tracks each document's status and keeps the approval workflow transparent.",
              tech: ["Firebase"],
            },
          ],
        },
        {
          role: "Full Stack Developer (OJT)",
          org: "NCMF North Luzon – National Commission on Muslim Filipinos",
          period: "2024 – 2025",
          summary: "On-the-job training completed as part of the BS Information Technology program.",
          items: [
            { name: "NCMF Apps", text: "applications developed for NCMF North Luzon during the OJT.", tech: ["React.js", "Firebase"] },
          ],
        },
      ],
      education: [
        {
          title: "BS Information Technology",
          lines: ["Major in Database", "CICS, Mindanao State University – Main Campus"],
          period: "Graduated Jan 2025",
        },
        { title: "University of the Cordilleras", period: "2017 – 2019" },
        { title: "Siawadato Community High School", lines: ["Service Awardee"], period: "2012 – 2017" },
      ],
      skills: [
        { group: "Languages", items: ["Java", "C++", "C#"] },
        { group: "Front end", items: ["HTML5", "CSS", "JavaScript", "React", "Next.js", "Vue.js", "Tailwind CSS", "Bootstrap"] },
        {
          group: "Back end",
          items: ["PHP", "Node.js", "REST APIs", "GraphQL", "ASP.NET Core MVC", "ASP.NET Web API", "ASP.NET Web Forms", "Entity Framework Core"],
        },
        { group: "Database", items: ["MySQL", "PostgreSQL", "Firebase", "Firebird", "SQLite", "SSMS"] },
        { group: "Tools", items: ["Git", "GitHub", "VS Code", "Figma"] },
        { group: "Other", items: ["Network administration", "IT support", "RFID setup", "Graphic design"] },
      ],
      softSkills: ["Communication", "Teamwork", "Problem solving"],
    },
  },

  contact: {
    title: "GET IN TOUCH",
    eyebrow: "COMMUNICATION // OPEN CHANNEL",
    paragraphs: [
      "Have a project, system idea, or collaboration opportunity? Fill out the form and I'll get back to you as soon as possible.",
    ],
    contactForm: {
      to: "muripaga.at07@msumain.edu.ph",
      socials: [
        { icon: "github", label: "GitHub", href: "https://github.com/Razukie" },
        { icon: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/abdul-razak-t-muripaga-97a0742b4/" },
        { icon: "facebook", label: "Facebook", href: "https://www.facebook.com/itsmerazakie" },
        { icon: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@itsmerazakie" },
      ],
    },
    contactLinks: [
      {
        label: "EMAIL",
        value: "muripaga.at07@msumain.edu.ph",
        href: "mailto:muripaga.at07@msumain.edu.ph",
      },
    ],
  },

  testimonials: {
    title: "TESTIMONIALS",
    eyebrow: "EXTERNAL SIGNALS // FEEDBACK",
    paragraphs: ["Ratings and feedback from the people who use these systems."],
    testimonials: {
      to: "muripaga.at07@msumain.edu.ph",
      systems: [
        { id: "seepark", project: "SEEPARK", name: "SeePark", context: "Freelance" },
        { id: "medclinic", project: "MEDCLINIC", name: "MedClinic", context: "Freelance" },
        { id: "idts", project: "INTERNAL DOCUMENT TRACKING SYSTEM", name: "IDTS", context: "DPWH CAR" },
      ],
      // Add only genuine feedback you have permission to publish, e.g.
      // { system: "seepark", rating: 5, quote: "…", author: "Juan Dela Cruz", role: "Parking Admin", date: "Oct 2026" },
      reviews: [
        {
          system: "medclinic",
          rating: 4.9,
          quote:
            "Abdul did a great job developing our MedClinic system. He understood our requirements and created a system that made our appointment and clinic processes much more organized. He was responsive to our feedback, handled revisions professionally, and was always willing to help when we encountered issues.",
          author: "MedClinic Client",
        },
        {
          system: "idts",
          rating: 4.8,
          quote:
            "Razak demonstrated strong technical competence throughout the development of the Internal Document Tracking System (IDTS). He effectively translated our document routing and monitoring requirements into a structured digital solution that improved the tracking, receiving, and movement of official documents.\n\nHe demonstrated a clear understanding of our workflow, responded professionally to user feedback, and implemented necessary improvements throughout the development process. His attention to detail and ability to develop practical solutions contributed significantly to the successful implementation of the system.",
          author: "IDTS Project Client",
        },
        {
          system: "seepark",
          rating: 4.5,
          quote:
            "Razak demonstrated professionalism and technical expertise in developing the SeePark parking management system. He successfully translated our operational requirements into a functional solution for managing parking transactions, payment processing, and digital receipt generation.\n\nHe was responsive to project requirements, receptive to feedback, and committed to improving the system throughout the development process. His attention to usability and system functionality contributed to a more organized and efficient parking management workflow.",
          author: "SeePark Project Client",
        },
      ],
    },
  },

  system: {
    title: "SYSTEM",
    eyebrow: "PORTFOLIO ARCHITECTURE // STATUS",
    paragraphs: ["How this portfolio is built, and what's running right now."],
    systemInfo: {
      version: "v1.0",
      stack: [
        { icon: "nextjs", name: "Next.js 14", role: "App Router, fonts and image optimisation" },
        { icon: "react", name: "React 18", role: "Scene, rooms and every interaction" },
        { icon: "typescript", name: "TypeScript", role: "Typed content and components" },
        { icon: "css", name: "CSS", role: "3D scene, themes and animation — no UI framework" },
        { icon: "svg", name: "SVG", role: "Network lines, icons and the evidence board" },
        { icon: "emailjs", name: "EmailJS", role: "Contact form and feedback delivery" },
      ],
      principles: [
        { title: "Interactive", text: "Every section is a room you enter, not a page you scroll." },
        { title: "Technical", text: "A HUD-inspired interface that reflects how I think about systems." },
        { title: "Minimal", text: "Quiet colour, clear type and motion that only adds meaning." },
      ],
    },
  },
};
