export interface DateRange { from?: Date; to?: Date }
export type DateMatcher = Date | Date[] | ((date: Date) => boolean) | { before?: Date; after?: Date; from?: Date; to?: Date; dayOfWeek?: number[] };
export interface CalendarDayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { day: { date: Date } | Date; modifiers?: Record<string, boolean>; locale?: string | { code?: string } }
export declare const CalendarDayButton: React.ForwardRefExoticComponent<CalendarDayButtonProps & React.RefAttributes<HTMLButtonElement>>;
export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  mode?: 'single' | 'multiple' | 'range'; selected?: Date | Date[] | DateRange; onSelect?: (selected: any, triggerDate: Date, modifiers: Record<string, boolean>, event: unknown) => void;
  month?: Date; defaultMonth?: Date; onMonthChange?: (month: Date) => void; disabled?: DateMatcher; required?: boolean; showOutsideDays?: boolean; fixedWeeks?: boolean; numberOfMonths?: number;
  captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years'; startMonth?: Date; endMonth?: Date; locale?: string | { code?: string }; dir?: 'ltr' | 'rtl'; buttonVariant?: string;
  classNames?: Record<string, string>; formatters?: { formatCaption?: (date: Date) => string; formatWeekdayName?: (date: Date) => string }; components?: { DayButton?: React.ComponentType<CalendarDayButtonProps> };
}
export declare function Calendar(props: CalendarProps): React.JSX.Element;
