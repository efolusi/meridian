export interface MenubarItem { id: string; label: React.ReactNode; /** Lucide icon name */ icon?: string; kbd?: string; danger?: boolean; disabled?: boolean; onClick?: () => void; }
export interface MenubarMenu { label: string; items: Array<MenubarItem | 'separator'>; }
export interface MenubarProps {
  menus: MenubarMenu[];
  /** Fires with the picked item id */
  onSelect?: (id: string) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Menubar(props: MenubarProps): JSX.Element;
