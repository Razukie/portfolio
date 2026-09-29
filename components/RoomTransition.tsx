import { CSSProperties } from "react";

export type RoomPhase = "cover" | "load" | "open";

export interface RoomEntry {
  label: string;
  code: string;
  /** Where the click happened, in % of the viewport — the iris grows from here */
  x: number;
  y: number;
  phase: RoomPhase;
}

/**
 * Full-screen "entering a room" sequence:
 * cover (iris wipe from the station) → load (room card + progress) → open (doors slide apart).
 * Timing lives in Portfolio.tsx; this component only renders the current phase.
 */
export default function RoomTransition({ entry }: { entry: RoomEntry }) {
  return (
    <div
      className={`room-tx phase-${entry.phase}`}
      style={{ "--x": `${entry.x}%`, "--y": `${entry.y}%` } as CSSProperties}
      aria-hidden="true"
    >
      <div className="room-tx-door left" />
      <div className="room-tx-door right" />
      <span className="room-tx-seam" />

      <div className="room-tx-content">
        <span className="room-tx-code">{entry.code}</span>
        <div className="room-tx-title">{entry.label}</div>
        <div className="room-tx-bar">
          <span />
        </div>
        <div className="room-tx-status">
          <span className="checking">Entering room</span>
          <span className="granted">
            <i /> Access granted
          </span>
        </div>
      </div>
    </div>
  );
}
