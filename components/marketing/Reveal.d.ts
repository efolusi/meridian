export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render. @default 'div' */
  as?: keyof React.JSX.IntrinsicElements;
  /** Delay each Reveal by 70ms per Reveal sibling before it. @default true */
  stagger?: boolean;
}
/** Fades and lifts its content in once it scrolls into view. Visible without JavaScript and with reduced motion. */
export declare const Reveal: React.ForwardRefExoticComponent<RevealProps & React.RefAttributes<HTMLElement>>;
