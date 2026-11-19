/** A paragraph string, a subheading, or a list. Strings read [label](href) and **strong**; nothing renders as HTML. */
export type LegalBlock = string | { h3: string; id?: string } | { ul: string[] };
export interface LegalDocumentProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: React.ReactNode;
  /** The line under the title, such as the effective date. */
  meta?: React.ReactNode;
  intro?: LegalBlock[];
  /** Each id is a stable link target (/terms#refunds). */
  sections?: { id: string; head: string; blocks: LegalBlock[] }[];
  /** Name of the contents list; the list shows only when this is given. */
  contentsLabel?: string;
  backLink?: { label: React.ReactNode; href: string };
  /** Replaces "{lang}" in link hrefs. */
  lang?: string;
}
/** The shared body of a terms or privacy page, as an <article>; the page keeps its own <main>. */
export declare const LegalDocument: React.ForwardRefExoticComponent<LegalDocumentProps & React.RefAttributes<HTMLElement>>;
export declare function parseLegalInline(text: string, lang?: string): ({ type: 'text' | 'strong'; text: string } | { type: 'link'; text: string; href: string })[];
