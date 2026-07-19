export interface HoverCardProps {
  /** Hover / focus target */
  trigger: React.ReactNode;
  /** Panel contents */
  children: React.ReactNode;
  /** @default 'bottom' */
  side?: 'top' | 'bottom';
  /** Ms before opening @default 350 */
  openDelay?: number;
  /** Ms before closing @default 150 */
  closeDelay?: number;
  /** Panel width px @default 300 */
  width?: number;
  style?: React.CSSProperties;
  className?: string;
}
export declare function HoverCard(props: HoverCardProps): React.JSX.Element;
