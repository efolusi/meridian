export interface PlayerHandle {
  jumpTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
}
export interface PlayerProps {
  src?: string;
  title?: React.ReactNode;
  meta?: React.ReactNode;
  /** Normalized 0–1 waveform peaks; deterministic placeholder bars if omitted */
  peaks?: number[];
  /** Bar count when peaks omitted. Default 72 */
  samples?: number;
  onTimeChange?: (seconds: number) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare const Player: React.ForwardRefExoticComponent<PlayerProps & React.RefAttributes<PlayerHandle>>;
