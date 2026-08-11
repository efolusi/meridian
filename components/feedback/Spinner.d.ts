export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  /** Meridian legacy pixel-size helper. @default 16 */
  size?: number;
  /** Meridian legacy accessible-label alias. */
  label?: string;
}
export declare const Spinner: React.ForwardRefExoticComponent<SpinnerProps & React.RefAttributes<SVGSVGElement>>;
