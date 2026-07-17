export interface PaymentCardProps {
  /** @default 'ADA OBI' */
  name?: string;
  /** Masked number @default '•••• •••• •••• 4242' */
  number?: string;
  /** @default '09/29' */
  expiry?: string;
  /** Top-left brand text @default 'Efolusi' */
  network?: string;
  /** @default 'espresso' */
  variant?: 'espresso' | 'caramel' | 'paper';
  /** Grayscale frozen state */
  frozen?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function PaymentCard(props: PaymentCardProps): JSX.Element;
