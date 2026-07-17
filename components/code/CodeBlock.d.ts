export interface CodeBlockProps {
  /** Shown in the header, e.g. "bash" */
  lang?: string;
  /** Overrides lang in the header, e.g. a filename */
  title?: string;
  /** Scroll beyond this height */
  maxHeight?: number | string;
  /** The code text */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function CodeBlock(props: CodeBlockProps): JSX.Element;
