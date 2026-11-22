export interface FeatureGridProps extends React.HTMLAttributes<HTMLDivElement> {}
export declare const FeatureGrid: React.ForwardRefExoticComponent<FeatureGridProps & React.RefAttributes<HTMLDivElement>>;

export interface FeatureCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Makes the whole card a link. */
  href?: string;
  /** Lucide icon name shown in the card's top corner. */
  icon?: string;
  /** The card title. */
  title: React.ReactNode;
  /** One or two sentences under the title. */
  body?: React.ReactNode;
  /** Link label at the bottom, with an arrow. */
  cta?: React.ReactNode;
  /** Brand-wide fill from the `--tone-*` tokens. Every tone keeps a 1px hairline. @default 'default' */
  tone?: 'default' | 'peach' | 'band' | 'amber';
  /** Heading element for the title. @default 'h3' */
  as?: 'h2' | 'h3' | 'h4';
}
export declare const FeatureCard: React.ForwardRefExoticComponent<FeatureCardProps & React.RefAttributes<HTMLElement>>;
