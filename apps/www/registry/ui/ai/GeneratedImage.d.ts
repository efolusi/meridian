export interface GeneratedImageAction {
  icon: string;
  label: string;
  onClick?: () => void;
}
export interface GeneratedImageProps {
  /** 'queued' | 'generating' | 'complete' | 'error' */
  state?: 'queued' | 'generating' | 'complete' | 'error';
  src?: string;
  alt?: string;
  /** Prompt shown top-left over the image */
  prompt?: string;
  /** 'square' | 'video' | 'portrait' */
  aspect?: 'square' | 'video' | 'portrait';
  error?: React.ReactNode;
  onRetry?: () => void;
  /** Hover actions, top-right (e.g. download) */
  actions?: GeneratedImageAction[];
  style?: React.CSSProperties;
  className?: string;
}
export declare function GeneratedImage(props: GeneratedImageProps): JSX.Element;
