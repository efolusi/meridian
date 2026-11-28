export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
  /** Lucide icon name rendered in a round bubble at the end of the button, for the one hero or closing call to action (`arrow-right`). The bubble takes the label colour and the arrow takes the button colour, so both read in light and dark. It makes the button a pill, replaces `iconRight`, and draws only at sizes `md`, `lg` and `xl` and not on `ghost` or `link`; anywhere else the glyph is a plain trailing icon. */
  iconBubble?: string;
  fullWidth?: boolean;
  /** Shows a spinner and disables the button */
  loading?: boolean;
  children?: React.ReactNode;
}
export declare function buttonVariants(options?: Pick<ButtonProps, 'variant' | 'size' | 'shape' | 'fullWidth'> & { /** Adds the pill and bubble classes; the markup is `<span className="ef-btn__bubble" aria-hidden="true"><Icon name="arrow-right" size={20} /></span>` after the label (size 16 at `md`). */ bubble?: boolean; className?: string }): string;
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
