export interface HeroProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The page title. Wrap one word in `HeroAccent` to underline it. */
  title: React.ReactNode;
  /** One or two sentences under the title. */
  sub?: React.ReactNode;
  /** Calls to action, usually `Button shape="pill"`. At 640px and below they stack in one column as wide as the widest button (every set of actions, short pairs included; a child that is not a button is stretched to that width). */
  actions?: React.ReactNode;
  /** A short proof line under the actions, such as a status dot and a fact. */
  proof?: React.ReactNode;
  /** @default 'center' */
  align?: 'center' | 'start';
  /** Heading element for the title. @default 'h1' */
  as?: 'h1' | 'h2';
}
export declare const Hero: React.ForwardRefExoticComponent<HeroProps & React.RefAttributes<HTMLElement>>;

export interface HeroAccentProps extends React.HTMLAttributes<HTMLSpanElement> {}
/** A hand-drawn underline that draws itself once; static with reduced motion. */
export declare function HeroAccent(props: HeroAccentProps): React.ReactElement;
