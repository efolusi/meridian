export interface SuggestionItem { label: string; /** Lucide icon */ icon?: string; }
export interface SuggestionsProps {
  /** Strings or { label, icon } */
  items: Array<string | SuggestionItem>;
  /** Fires with the picked label */
  onSelect?: (label: string, index: number) => void;
  /** @deprecated Use `onSelect`. Alias kept for one major; `onSelect` wins when both are passed. */
  onPick?: (label: string, index: number) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Suggestions(props: SuggestionsProps): React.JSX.Element;
