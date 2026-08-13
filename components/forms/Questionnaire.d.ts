import * as React from 'react';
export type QuestionnaireItemStatus = 'unanswered' | 'answered' | 'skipped';
export interface QuestionnaireItemDefinition { name: string; required?: boolean; multiple?: boolean; disabled?: boolean; choices?: Array<{ value: string; disabled?: boolean }>; }
export interface QuestionnaireProps extends React.FormHTMLAttributes<HTMLFormElement> { items?: QuestionnaireItemDefinition[]; item?: string; defaultItem?: string; onItemChange?: (item: string) => void; shortcuts?: 'letters' | 'numbers'; }
export declare const Questionnaire: React.ForwardRefExoticComponent<QuestionnaireProps & React.RefAttributes<HTMLFormElement>>;
export declare const QuestionnaireProgress: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export interface QuestionnaireItemProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> { name: string; multiple?: boolean; invalid?: boolean; onStatusChange?: (status: QuestionnaireItemStatus) => void; }
export declare const QuestionnaireItem: React.ForwardRefExoticComponent<QuestionnaireItemProps & React.RefAttributes<HTMLFieldSetElement>>;
export declare const QuestionnaireTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLLegendElement> & React.RefAttributes<HTMLLegendElement>>;
export declare const QuestionnaireDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
export declare const QuestionnaireChoices: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export interface QuestionnaireChoiceProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'onChange'> { value: string; checked?: boolean; defaultChecked?: boolean; disabled?: boolean; onChange?: React.ChangeEventHandler<HTMLInputElement>; }
export declare const QuestionnaireChoice: React.ForwardRefExoticComponent<QuestionnaireChoiceProps & React.RefAttributes<HTMLInputElement>>;
export declare const QuestionnaireInput: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>;
export declare const QuestionnaireError: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
export declare const QuestionnaireActions: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const QuestionnairePrevious: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export declare const QuestionnaireSkip: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export declare const QuestionnaireNext: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export declare const QuestionnaireSubmit: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
