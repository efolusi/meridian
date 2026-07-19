export interface FieldWiring {
  /** The control's id. `null` in `group` mode, where no single child owns it. */
  id: string | null;
  invalid: boolean;
  required: boolean;
  /** Spread on the real control element, after `{...rest}`. */
  controlProps: {
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: true;
    'aria-required'?: true;
  };
}
export interface FormFieldProps {
  /** Rendered as `<label htmlFor>`, or a `<span id>` when `group`. */
  label?: React.ReactNode;
  /** Muted helper text below the control. Hidden while `error` is set. */
  hint?: React.ReactNode;
  /** Error message below the control. Truthy implies invalid. */
  error?: React.ReactNode;
  /** Invalid state with no message. @default false */
  invalid?: boolean;
  /** Red asterisk plus aria-required on the control. @default false */
  required?: boolean;
  /** Label a set of controls: role="group" + aria-labelledby. @default false */
  group?: boolean;
  /** The control's id. Generated with React.useId() when omitted. */
  id?: string;
  /** A control, or a function receiving the wiring to spread yourself. */
  children?: React.ReactNode | ((field: FieldWiring) => React.ReactNode);
  style?: React.CSSProperties;
  className?: string;
}
/**
 * Label / hint / error / required chrome around a control, and the owner of the
 * id linking them. Design-system controls pick the wiring up from context; for
 * anything else, pass a function and spread `controlProps` on the control.
 */
export declare function FormField(props: FormFieldProps): JSX.Element;
