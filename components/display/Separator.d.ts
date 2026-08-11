export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Axis of the dividing rule. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** Remove separator semantics when the rule is only visual. @default true */
  decorative?: boolean;
}
export declare const Separator: React.ForwardRefExoticComponent<
  SeparatorProps & React.RefAttributes<HTMLDivElement>
>;
