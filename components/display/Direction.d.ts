export interface DirectionProviderProps {
  /** Standard reading-direction prop. */
  dir?: 'ltr' | 'rtl';
  /** Reading direction supplied to direction-aware Meridian components. @default 'ltr' */
  direction?: 'ltr' | 'rtl';
  children?: React.ReactNode;
}

export declare function DirectionProvider(props: DirectionProviderProps): React.JSX.Element;
export declare function useDirection(): 'ltr' | 'rtl';
