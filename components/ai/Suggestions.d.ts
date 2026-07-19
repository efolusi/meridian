export interface SuggestionItem { label: string; /** Lucide icon */ icon?: string; }
export interface SuggestionsProps {
  /** Strings or { label, icon } */
  items: Array<string | SuggestionItem>;
  /** Fires with the picked label */
  onPick?: (label: string, index: number) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Suggestions(props: SuggestionsProps): React.JSX.Element;
