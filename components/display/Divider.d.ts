export interface DividerProps {
  /** Small uppercase label centered in the rule */
  label?: string;
  /** Vertical rule (stretches to container height) */
  vertical?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Divider(props: DividerProps): React.JSX.Element;
