export interface ComposerItem {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  group?: string;
  keywords?: string[];
}
export interface RichComposerProps {
  placeholder?: string;
  /** @-mention items, inserted as atomic chips */
  mentions?: ComposerItem[];
  /** /-command items, executed via onCommand */
  commands?: ComposerItem[];
  hint?: React.ReactNode;
  /** Left toolbar slot */
  actions?: React.ReactNode;
  disabled?: boolean;
  autoFocus?: boolean;
  onSubmit?: (value: { text: string; mentions: { id: string; label: string }[] }) => void;
  onCommand?: (item: ComposerItem) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function RichComposer(props: RichComposerProps): React.JSX.Element;
