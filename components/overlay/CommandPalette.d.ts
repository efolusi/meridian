export interface CommandItem {
  id: string;
  label: string;
  /** Lucide icon name */
  icon?: string;
  /** Right-aligned hint, e.g. a shortcut or product name */
  hint?: string;
}
export interface CommandGroup {
  group: string;
  items: CommandItem[];
}
export interface CommandPaletteProps {
  open: boolean;
  onClose?: () => void;
  groups: CommandGroup[];
  onSelect?: (id: string) => void;
  /** @default 'Type a command or search…' */
  placeholder?: string;
}
export declare function CommandPalette(props: CommandPaletteProps): React.JSX.Element;
