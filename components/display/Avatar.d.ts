export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Optional legacy name used to derive initials and a deterministic tone. */
  name?: string;
  /** Optional legacy image shortcut. Prefer AvatarImage for composition. */
  src?: string;
  /** Named contract sizes or a legacy pixel value. @default "default" */
  size?: 'default' | 'sm' | 'lg' | number;
}
export declare const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLSpanElement>>;

export type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>;
export declare const AvatarImage: React.ForwardRefExoticComponent<AvatarImageProps & React.RefAttributes<HTMLImageElement>>;

export type AvatarFallbackProps = React.HTMLAttributes<HTMLSpanElement>;
export declare const AvatarFallback: React.ForwardRefExoticComponent<AvatarFallbackProps & React.RefAttributes<HTMLSpanElement>>;

export type AvatarBadgeProps = React.HTMLAttributes<HTMLSpanElement>;
export declare const AvatarBadge: React.ForwardRefExoticComponent<AvatarBadgeProps & React.RefAttributes<HTMLSpanElement>>;

export type AvatarGroupProps = React.HTMLAttributes<HTMLDivElement>;
export declare const AvatarGroup: React.ForwardRefExoticComponent<AvatarGroupProps & React.RefAttributes<HTMLDivElement>>;

export type AvatarGroupCountProps = React.HTMLAttributes<HTMLSpanElement>;
export declare const AvatarGroupCount: React.ForwardRefExoticComponent<AvatarGroupCountProps & React.RefAttributes<HTMLSpanElement>>;
