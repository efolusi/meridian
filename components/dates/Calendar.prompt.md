# Calendar

Calendar follows the DayPicker-style contract: `mode`, `selected`, and `onSelect` use JavaScript `Date` values. Use `mode="range"` for `{ from, to }`, `mode="multiple"` for arrays, `captionLayout="dropdown"` for month/year selection, and `disabled` matchers for unavailable days.

```jsx
<Calendar mode="single" selected={date} onSelect={setDate} />
<Calendar mode="range" selected={range} onSelect={setRange} />
```

Date pickers are compositions of `Popover`, `Button`, and `Calendar`; there is no separate picker root. `CalendarDayButton` is exported for custom day rendering.
