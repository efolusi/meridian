export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Full name — initials + deterministic tone derive from it */
  name?: string;
  /** Image URL; falls back to initials */
  src?: string;
  /** Px @default 32 */
  size?: number;
}
export declare function Avatar(props: AvatarProps): JSX.Element;

export interface AvatarGroupProps {
  /** Avatar elements; overlap with white keylines */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function AvatarGroup(props: AvatarGroupProps): JSX.Element;
