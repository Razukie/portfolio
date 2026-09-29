interface LoaderProps {
  progress: number;
  canEnter: boolean;
  fading: boolean;
  onEnter: () => void;
}

export default function Loader({ progress, canEnter, fading, onEnter }: LoaderProps) {
  return (
    <div
      className="loader"
      style={{ transition: "opacity .8s ease", opacity: fading ? 0 : 1 }}
    >
      <div className="loader-core"></div>
      <div className="loader-title">RAZAK.DEV</div>
      <div className="loader-subtitle">INITIALIZING DIGITAL ENVIRONMENT...</div>
      <div className="progress">
        <span style={{ width: `${progress}%` }}></span>
      </div>
      <div>{progress}%</div>
      <button className="enter-btn" disabled={!canEnter} onClick={onEnter}>
        {canEnter ? "ENTER SYSTEM" : "LOADING..."}
      </button>
    </div>
  );
}
