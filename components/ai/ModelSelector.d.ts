export interface ModelOption {
  id: string;
  name: string;
  /** Shown muted next to the name */
  provider?: string;
  /** Second line in the list */
  hint?: string;
  /** Small uppercase tag, e.g. 'New' */
  badge?: string;
}
export interface ModelSelectorProps {
  models: ModelOption[];
  /** Selected model id */
  value?: string;
  onChange?: (id: string) => void;
  /** Panel direction @default 'top'. 'up'/'down' are deprecated aliases for 'top'/'bottom' (one major). */
  side?: 'top' | 'bottom' | 'up' | 'down';
  style?: React.CSSProperties;
  className?: string;
}
export declare function ModelSelector(props: ModelSelectorProps): React.JSX.Element;
