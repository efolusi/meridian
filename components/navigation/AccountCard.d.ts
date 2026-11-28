export interface AccountCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Display name. Without it the card shows the email on the first line only. */
  name?: string | null;
  email: string;
  /** Profile picture URL. Initials show when it is missing or fails to load. */
  image?: string | null;
  /** The avatar alone inside the same bordered card (the collapsed rail). The name and email stay in the DOM for screen readers. @default false */
  compact?: boolean;
}
/** The signed-in person in one bordered card: avatar, name, email. Static, not a control. `SideNav` draws it at the foot of the rail. */
export declare const AccountCard: React.ForwardRefExoticComponent<AccountCardProps & React.RefAttributes<HTMLDivElement>>;
