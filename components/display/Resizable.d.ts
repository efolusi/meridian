export interface ResizablePanelGroupProps extends React.HTMLAttributes<HTMLDivElement> { orientation?: 'horizontal' | 'vertical'; direction?: 'ltr' | 'rtl'; onLayoutChange?: (sizes: number[]) => void; }
export interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> { defaultSize?: number | string; minSize?: number | string; maxSize?: number | string; }
export interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> { withHandle?: boolean; disabled?: boolean; }
export declare const ResizablePanelGroup: React.ForwardRefExoticComponent<ResizablePanelGroupProps & React.RefAttributes<HTMLDivElement>>;
export declare const ResizablePanel: React.ForwardRefExoticComponent<ResizablePanelProps & React.RefAttributes<HTMLDivElement>>;
export declare const ResizableHandle: React.ForwardRefExoticComponent<ResizableHandleProps & React.RefAttributes<HTMLDivElement>>;
