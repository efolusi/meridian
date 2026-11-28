export interface AccountCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** Display name. Without it the card shows the email on the first line only. */
  name?: string | null;
  email: string;
  /** Profile picture URL. Initials show when it is missing or fails to load. */
  image?: string | null;
  /** The avatar alone inside the same bordered card (the collapsed rail). The name and email stay in the DOM for screen readers. @default false */
  compact?: boolean;
  /** Draws the card as a `button` with a small chevron, for a card that opens something (the account menu of `SideNav`). Pass the trigger props (`aria-haspopup`, `aria-expanded`, `onClick`) yourself, or wrap it in `DropdownMenuTrigger asChild`. @default false */
  interactive?: boolean;
}
/** The signed-in person in one bordered card: avatar, name, email. Static by default; `interactive` makes it a button. `SideNav` draws it at the foot of the rail as the trigger of the account menu. */
export declare const AccountCard: React.ForwardRefExoticComponent<AccountCardProps & React.RefAttributes<HTMLElement>>;
