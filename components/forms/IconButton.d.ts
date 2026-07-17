export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Lucide icon name */
  icon: string;
  /** Accessible label (required — rendered as aria-label + title) */
  label: string;
  /** @default 'quiet' */
  variant?: 'quiet' | 'outline' | 'solid';
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
