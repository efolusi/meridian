export interface PromptStep {
  /** Answer key */
  name: string;
  question: React.ReactNode;
  options: string[];
  /** true, or a placeholder string, adds an "Other" free-text row */
  other?: boolean | string;
}
export interface PromptStepsProps {
  steps: PromptStep[];
  defaultValues?: Record<string, string>;
  onAnswer?: (value: string, ctx: { name: string; stepIndex: number; totalSteps: number }) => void;
  onComplete?: (answers: Record<string, string>) => void;
  onDismiss?: () => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function PromptSteps(props: PromptStepsProps): React.JSX.Element;
