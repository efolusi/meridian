export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** `band` paints the section on the brand ground with light text. @default 'default' */
  tone?: 'default' | 'band';
  /** Draws a hairline above the section. @default false */
  ruled?: boolean;
}
export declare const Section: React.ForwardRefExoticComponent<SectionProps & React.RefAttributes<HTMLElement>>;

export interface SectionHeadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Short mono label above the title. */
  eyebrow?: React.ReactNode;
  /** The section title. */
  title: React.ReactNode;
  /** One or two sentences under the title. */
  lede?: React.ReactNode;
  /** @default 'start' */
  align?: 'start' | 'center';
  /** Heading element for the title. @default 'h2' */
  as?: 'h1' | 'h2' | 'h3';
}
export declare const SectionHead: React.ForwardRefExoticComponent<SectionHeadProps & React.RefAttributes<HTMLDivElement>>;
