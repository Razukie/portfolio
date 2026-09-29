export const SECTIONS = [
  "works",
  "skills",
  "experience",
  "about",
  "resume",
  "contact",
  "testimonials",
  "system",
] as const;

export type Section = (typeof SECTIONS)[number];

export interface Point {
  x: number;
  y: number;
}

export interface LinePoint {
  section: Section;
  /** Polyline from the core to the station label, routed along isometric axes */
  points: Point[];
}
