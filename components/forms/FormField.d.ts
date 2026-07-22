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
export declare function FormField(props: FormFieldProps): React.JSX.Element;

/** What `field(name)` returns: spread it on a control, or wire prop-by-prop. */
export interface FormFieldControl<V = unknown> {
  value: V;
  /** Accepts a change event (reads `target.value`, or `target.checked` for checkboxes) or a raw value. */
  onChange: (eventOrValue: unknown) => void;
  /** Marks the field touched, which lets its error surface. */
  onBlur: () => void;
  invalid: boolean;
  /** Only set after the field was touched or a submit attempt (guidelines/forms.md timing). */
  error: string | undefined;
}
export interface UseFormStateOptions<T extends Record<string, any>> {
  /** Seed values. Read once, on the first render. */
  initial: T;
  /** Returns `{ field: 'message' }` for invalid fields; empty object = valid. */
  validate?: (values: T) => Partial<Record<keyof T & string, string>>;
}
export interface UseFormStateReturn<T extends Record<string, any>> {
  values: T;
  /** The raw `validate(values)` result — not gated by touch. `field().error` is. */
  errors: Partial<Record<keyof T & string, string>>;
  touched: Partial<Record<keyof T & string, boolean>>;
  set: <K extends keyof T & string>(name: K, value: T[K]) => void;
  field: <K extends keyof T & string>(name: K) => FormFieldControl<T[K]>;
  /** True while an async submit handler is in flight. */
  submitting: boolean;
  /**
   * Wraps a submit handler: validates everything, marks all fields touched,
   * and only calls `fn(values)` when clean. An async `fn` sets `submitting`
   * around its promise.
   */
  handleSubmit: (fn?: (values: T) => unknown | Promise<unknown>) => (e?: React.SyntheticEvent) => unknown;
  /** Back to `initial`, untouched, not submitting. */
  reset: () => void;
}
/**
 * Zero-dependency form state. Published as a static — `FormField.useFormState()`
 * — because only capitalised exports reach the global namespace.
 */
export declare namespace FormField {
  function useFormState<T extends Record<string, any>>(options: UseFormStateOptions<T>): UseFormStateReturn<T>;
}
