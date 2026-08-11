import React from 'react';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../forms/Button.jsx';
import { NativeSelect, NativeSelectOption } from '../forms/NativeSelect.jsx';
import { useDirection } from '../display/Direction.jsx';

const CSS = `
.ef-cal{width:max-content;min-width:280px;user-select:none;color:var(--text-primary)}
.ef-cal__months{display:flex;gap:18px;flex-wrap:wrap}
.ef-cal__month-wrap{width:280px}
.ef-cal__head{display:flex;min-height:34px;align-items:center;gap:6px;margin-bottom:8px}
.ef-cal__caption{flex:1;text-align:center;font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.ef-cal__dropdowns{display:flex;flex:1;justify-content:center;gap:5px}.ef-cal__dropdowns .ef-native-select{width:auto}.ef-cal__dropdowns select{height:30px}
.ef-cal__grid{display:grid;grid-template-columns:repeat(7,36px);gap:2px}
.ef-cal__row{display:contents}
.ef-cal__dow{text-align:center;font-size:10px;font-weight:var(--weight-semibold);letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted);padding:5px 0}
.ef-cal__day{position:relative;display:grid;width:36px;height:34px;place-items:center;border:1px solid transparent;border-radius:var(--radius-sm);background:none;color:var(--text-primary);font:inherit;font-size:var(--text-sm);cursor:pointer}
.ef-cal__day:hover:not(:disabled){background:var(--surface-sunken)}
.ef-cal__day:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-cal__day:disabled{cursor:not-allowed;opacity:.35}
.ef-cal__day[data-outside="true"]{color:var(--text-muted)}
.ef-cal__day[data-today="true"]{border-color:var(--border-strong)}
.ef-cal__day[data-selected="true"]{background:var(--accent);color:var(--accent-contrast);font-weight:var(--weight-semibold)}
.ef-cal__day[data-range-middle="true"]{border-radius:0;background:var(--brand-100);color:var(--brand-950)}
.ef-cal__day[data-range-start="true"]{border-start-end-radius:0;border-end-end-radius:0}
.ef-cal__day[data-range-end="true"]{border-start-start-radius:0;border-end-start-radius:0}
`;
const sameDay = (a, b) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startDay = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date, amount) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);
const dayKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const normalizeLocale = locale => typeof locale === 'string' ? locale : locale?.code;
const matcherHit = (matcher, date) => {
  if (!matcher) return false;
  if (Array.isArray(matcher)) return matcher.some(item => matcherHit(item, date));
  if (typeof matcher === 'function') return !!matcher(date);
  if (matcher instanceof Date) return sameDay(matcher, date);
  if (matcher.before && date < startDay(matcher.before)) return true;
  if (matcher.after && date > startDay(matcher.after)) return true;
  if (matcher.from && matcher.to && date >= startDay(matcher.from) && date <= startDay(matcher.to)) return true;
  if (matcher.dayOfWeek?.includes(date.getDay())) return true;
  return false;
};

export const CalendarDayButton = React.forwardRef(function CalendarDayButton({ day, modifiers = {}, locale, className, children, ...props }, ref) {
  const date = day?.date || day;
  return <button {...props} ref={ref} type="button" data-day={date?.toLocaleDateString(normalizeLocale(locale))} data-selected={modifiers.selected || undefined} data-today={modifiers.today || undefined} data-outside={modifiers.outside || undefined} data-range-start={modifiers.range_start || undefined} data-range-middle={modifiers.range_middle || undefined} data-range-end={modifiers.range_end || undefined} className={`ef-cal__day${className ? ` ${className}` : ''}`}>{children ?? date?.getDate()}</button>;
});

export function Calendar({
  mode = 'single', selected, onSelect, month: controlledMonth, defaultMonth, onMonthChange,
  disabled, required = false, showOutsideDays = true, fixedWeeks = true, numberOfMonths = 1,
  captionLayout = 'label', startMonth, endMonth, locale, dir, className, classNames = {},
  formatters = {}, components = {}, buttonVariant, style, ...rest
}) {
  injectEfCss('ef-css-cal', CSS);
  const contextDirection = useDirection();
  const direction = dir || contextDirection;
  const localeCode = normalizeLocale(locale);
  const selectedMonth = mode === 'range' ? selected?.from : mode === 'multiple' ? selected?.[0] : selected;
  const initial = controlledMonth || defaultMonth || selectedMonth || new Date();
  const [innerMonth, setInnerMonth] = React.useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1));
  const visibleMonth = controlledMonth || innerMonth;
  const DayButton = components.DayButton || CalendarDayButton;
  const gridRef = React.useRef(null);
  const selectedStart = mode === 'range' ? selected?.from : mode === 'multiple' ? selected?.[0] : selected;
  const [focusDate, setFocusDate] = React.useState(() => startDay(selectedStart || new Date()));
  const setMonth = next => {
    const bounded = startMonth && next < new Date(startMonth.getFullYear(), startMonth.getMonth(), 1) ? new Date(startMonth.getFullYear(), startMonth.getMonth(), 1)
      : endMonth && next > new Date(endMonth.getFullYear(), endMonth.getMonth(), 1) ? new Date(endMonth.getFullYear(), endMonth.getMonth(), 1) : next;
    if (!controlledMonth) setInnerMonth(bounded);
    onMonthChange?.(bounded);
  };
  const pick = date => {
    if (matcherHit(disabled, date)) return;
    setFocusDate(date);
    if (mode === 'range') {
      const from = selected?.from;
      const to = selected?.to;
      if (!from || to) onSelect?.({ from: date, to: undefined }, date, {}, null);
      else if (date < from) onSelect?.({ from: date, to: from }, date, {}, null);
      else onSelect?.({ from, to: date }, date, {}, null);
    } else if (mode === 'multiple') {
      const values = selected || [];
      const exists = values.some(item => sameDay(item, date));
      onSelect?.(exists ? (required && values.length === 1 ? values : values.filter(item => !sameDay(item, date))) : [...values, date], date, {}, null);
    } else onSelect?.(sameDay(selected, date) && !required ? undefined : date, date, {}, null);
  };
  const isSelected = date => mode === 'range' ? sameDay(date, selected?.from) || sameDay(date, selected?.to) : mode === 'multiple' ? (selected || []).some(item => sameDay(item, date)) : sameDay(date, selected);
  const monthViews = Array.from({ length: numberOfMonths }, (_, index) => addMonths(visibleMonth, index));
  const moveFocus = amount => {
    const next = addDays(focusDate, amount);
    setFocusDate(next);
    if (next.getMonth() !== visibleMonth.getMonth() || next.getFullYear() !== visibleMonth.getFullYear()) setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  };
  React.useEffect(() => {
    const target = gridRef.current?.querySelector(`[data-key="${dayKey(focusDate)}"]`);
    if (target && (gridRef.current.contains(document.activeElement) || document.activeElement === document.body)) target.focus();
  }, [focusDate, visibleMonth]);
  const keydown = event => {
    const horizontal = direction === 'rtl' ? { ArrowLeft: 1, ArrowRight: -1 } : { ArrowLeft: -1, ArrowRight: 1 };
    if (horizontal[event.key]) { event.preventDefault(); moveFocus(horizontal[event.key]); }
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); moveFocus(event.key === 'ArrowUp' ? -7 : 7); }
    else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); moveFocus((event.key === 'Home' ? 0 : 6) - focusDate.getDay()); }
    else if (event.key === 'PageUp' || event.key === 'PageDown') { event.preventDefault(); const next = addMonths(focusDate, event.key === 'PageUp' ? -1 : 1); setFocusDate(new Date(next.getFullYear(), next.getMonth(), Math.min(focusDate.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()))); setMonth(next); }
  };
  const monthLabel = date => formatters.formatCaption?.(date) || new Intl.DateTimeFormat(localeCode, { month: 'long', year: 'numeric' }).format(date);
  const weekday = date => formatters.formatWeekdayName?.(date) || new Intl.DateTimeFormat(localeCode, { weekday: 'short' }).format(date);
  const years = Array.from({ length: (endMonth?.getFullYear() || visibleMonth.getFullYear() + 10) - (startMonth?.getFullYear() || visibleMonth.getFullYear() - 100) + 1 }, (_, i) => (startMonth?.getFullYear() || visibleMonth.getFullYear() - 100) + i);
  return (
    <div {...rest} dir={direction} data-slot="calendar" className={`ef-cal${className ? ` ${className}` : ''}`} style={style}>
      <div className={`ef-cal__months${classNames.months ? ` ${classNames.months}` : ''}`}>
        {monthViews.map((view, viewIndex) => {
          const first = new Date(view.getFullYear(), view.getMonth(), 1);
          const nextDisabled = !!endMonth && view.getTime() >= new Date(endMonth.getFullYear(), endMonth.getMonth(), 1).getTime();
          const start = addDays(first, -first.getDay());
          const count = fixedWeeks ? 42 : Math.ceil((first.getDay() + new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()) / 7) * 7;
          const cells = Array.from({ length: count }, (_, index) => addDays(start, index));
          return <div className="ef-cal__month-wrap" key={dayKey(view)}>
            <div className="ef-cal__head">
              {viewIndex === 0 ? <IconButton icon={direction === 'rtl' ? 'chevron-right' : 'chevron-left'} label="Previous month" size="sm" disabled={!!startMonth && view <= new Date(startMonth.getFullYear(), startMonth.getMonth(), 1)} onClick={() => setMonth(addMonths(visibleMonth, -1))} /> : null}
              {captionLayout === 'dropdown' || captionLayout === 'dropdown-months' || captionLayout === 'dropdown-years' ? <div className="ef-cal__dropdowns">
                {captionLayout !== 'dropdown-years' ? <NativeSelect aria-label="Month" value={String(view.getMonth())} onChange={event => setMonth(new Date(view.getFullYear(), Number(event.target.value), 1))}>{Array.from({ length: 12 }, (_, index) => <NativeSelectOption key={index} value={String(index)}>{new Intl.DateTimeFormat(localeCode, { month: 'short' }).format(new Date(2024, index, 1))}</NativeSelectOption>)}</NativeSelect> : null}
                {captionLayout !== 'dropdown-months' ? <NativeSelect aria-label="Year" value={String(view.getFullYear())} onChange={event => setMonth(new Date(Number(event.target.value), view.getMonth(), 1))}>{years.map(year => <NativeSelectOption key={year} value={String(year)}>{year}</NativeSelectOption>)}</NativeSelect> : null}
              </div> : <div className="ef-cal__caption" aria-live="polite">{monthLabel(view)}</div>}
              {viewIndex === monthViews.length - 1 ? (
                <IconButton
                  icon={direction === 'rtl' ? 'chevron-left' : 'chevron-right'}
                  label="Next month"
                  size="sm"
                  disabled={nextDisabled}
                  onClick={() => setMonth(addMonths(visibleMonth, 1))}
                />
              ) : null}
            </div>
            <div role="grid" ref={viewIndex === 0 ? gridRef : undefined} onKeyDown={keydown} aria-label={monthLabel(view)} className="ef-cal__grid">
              <div role="row" className="ef-cal__row">{Array.from({ length: 7 }, (_, index) => { const date = addDays(new Date(2024, 0, 7), index); return <span key={index} role="columnheader" className="ef-cal__dow">{weekday(date)}</span>; })}</div>
              {Array.from({ length: count / 7 }, (_, row) => <div role="row" className="ef-cal__row" key={row}>{cells.slice(row * 7, row * 7 + 7).map(date => {
                const outside = date.getMonth() !== view.getMonth();
                if (outside && !showOutsideDays) return <span key={dayKey(date)} />;
                const rangeStart = mode === 'range' && sameDay(date, selected?.from);
                const rangeEnd = mode === 'range' && sameDay(date, selected?.to);
                const rangeMiddle = mode === 'range' && selected?.from && selected?.to && date > selected.from && date < selected.to;
                const modifiers = { selected: isSelected(date), today: sameDay(date, new Date()), outside, disabled: matcherHit(disabled, date), range_start: rangeStart, range_end: rangeEnd, range_middle: rangeMiddle };
                return <DayButton key={dayKey(date)} day={{ date }} modifiers={modifiers} locale={locale} role="gridcell" data-key={dayKey(date)} tabIndex={sameDay(date, focusDate) ? 0 : -1} aria-label={date.toLocaleDateString(localeCode, { dateStyle: 'long' })} aria-selected={modifiers.selected || undefined} disabled={modifiers.disabled} onClick={() => pick(date)}>{date.getDate()}</DayButton>;
              })}</div>)}
            </div>
          </div>;
        })}
      </div>
    </div>
  );
}
