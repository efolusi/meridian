export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel' | 'download' | 'hrefLang' | 'referrerPolicy'> {
  /** @default 'default' */
  /** `band` is for a button that sits on a Section `tone="band"` (the cream band in light, the dark band in dark): a cream fill with dark ink, the same in both themes. @default 'default' */
  variant?: 'default' | 'ghost' | 'secondary' | 'link' | 'primary' | 'danger' | 'brand' | 'band';
  /** @default 'default' */
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg' | 'md' | 'xl';
  /** `pill` rounds the ends fully and widens the side padding, for marketing pages. Icon sizes become circles. @default 'default' */
  shape?: 'default' | 'pill';
  /** Lucide icon name rendered before the label */
  iconLeft?: string;
  /** Lucide icon name rendered after the label */
  iconRight?: string;
  /** Lucide icon name rendered in a round bubble at the end of the button, for the one hero or closing call to action (`arrow-right`, or `arrow-up-right`, which turns 45 degrees on hover while any other arrow nudges). The bubble takes the label colour and the arrow takes the button colour, so both read in light and dark. It makes the button a pill, replaces `iconRight`, and draws only at sizes `md`, `lg` and `xl` and not on `ghost` or `link`; anywhere else the glyph is a plain trailing icon. */
  iconBubble?: string;
  fullWidth?: boolean;
  /** Shows a spinner and disables the button. On a link (`href` or `asChild`) it sets `aria-busy` and `aria-disabled`, takes the link out of the tab order and swallows the click. */
  loading?: boolean;
  /** Renders an `<a>` with the same classes, bubble, spinner, focus ring and states as the button. A link has no `disabled` attribute: `disabled` and `loading` set `aria-disabled="true"` and `tabindex="-1"` and block the click and the Enter key; the blocked click also stops there (`stopPropagation`), so a parent's `onClick` does not fire. Space does not activate it (link semantics). `href` is passed to the `<a>` as given and is not sanitised. `target`, `rel`, `download`, `hrefLang` and `referrerPolicy` pass through; `target="_blank"` gets `rel="noopener"` unless you set a `rel`. */
  href?: string;
  /** Gives the classes, state and inner markup to your own link, the single child element (a Next.js `Link` with its locale, a router `Link`), instead of rendering an element. The child keeps its `href`, props and ref. Only `className`, `style`, `onClick` and `onAuxClick` are merged with Button's; on any other prop set on both the child's value wins and Button's is dropped silently, and an `href` set on `Button` is ignored (set it on the child). `disabled`, `loading` and the blocked click work as on `href`. The child must be a link (an `a`), not a `button`. */
  asChild?: boolean;
  children?: React.ReactNode;
}
export declare function buttonVariants(options?: Pick<ButtonProps, 'variant' | 'size' | 'shape' | 'fullWidth'> & { /** Adds the pill and bubble classes; for markup that is not React only: the bubble span is yours to write after the label. Where React renders the link, use `<Button href>` or `<Button asChild>`, which draw the bubble. */ bubble?: boolean; className?: string }): string;
/** With `href` or `asChild` the ref is the link element, so the call has a second signature for it. */
export type ButtonLinkProps = ButtonProps & ({ href: string } | { asChild: true }) & React.RefAttributes<HTMLAnchorElement>;
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>> & ((props: ButtonLinkProps) => React.ReactElement | null);
