export interface InputGroupProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'|'size'> { label?: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; prefix?: React.ReactNode; suffix?: React.ReactNode; size?: 'sm'|'md'|'lg'; }
export declare const InputGroup: React.ForwardRefExoticComponent<InputGroupProps & React.RefAttributes<HTMLElement>>;
export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> { align?: 'inline-start'|'inline-end'|'block-start'|'block-end'; }
export declare const InputGroupAddon: React.ForwardRefExoticComponent<InputGroupAddonProps & React.RefAttributes<HTMLDivElement>>;
export interface InputGroupButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { size?: 'xs'|'icon-xs'|'sm'|'icon-sm'; variant?: 'default'|'destructive'|'outline'|'secondary'|'ghost'|'link'; }
export declare const InputGroupButton: React.ForwardRefExoticComponent<InputGroupButtonProps & React.RefAttributes<HTMLButtonElement>>;
export declare const InputGroupInput: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>;
export declare const InputGroupTextarea: React.ForwardRefExoticComponent<React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.RefAttributes<HTMLTextAreaElement>>;
export declare const InputGroupText: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
