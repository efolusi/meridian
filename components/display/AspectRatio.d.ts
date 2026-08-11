export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Required width / height ratio. */
  ratio: number;
  children?: React.ReactNode;
}
export declare const AspectRatio: React.ForwardRefExoticComponent<AspectRatioProps & React.RefAttributes<HTMLDivElement>>;
