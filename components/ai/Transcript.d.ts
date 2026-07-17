export interface TranscriptWord {
  /** Start time of the word in seconds */
  t: number;
  w: string;
}
export interface TranscriptItem {
  start: number;
  end?: number;
  speaker?: string;
  text?: React.ReactNode;
  /** Word-level timings for karaoke highlight */
  words?: TranscriptWord[];
  /** Italic live-caption styling */
  interim?: boolean;
}
export interface TranscriptProps {
  title?: string;
  items: TranscriptItem[];
  /** Drive from Player onTimeChange */
  currentTime?: number;
  onJump?: (seconds: number) => void;
  height?: number;
  defaultAutoScroll?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Transcript(props: TranscriptProps): JSX.Element;
