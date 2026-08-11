// Meridian docs demos — dates.

// @demo Calendar Month grid
export function CalendarDemo() {
  const { Calendar } = window.EfolusiDesignSystem_4ffc3d;
  const [d, setD] = React.useState(new Date(2026, 6, 17));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <Calendar mode="single" selected={d} onSelect={setD} />
      <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{d?.toLocaleDateString()}</span>
    </div>
  );
}

// @demo Calendar Range selection
export function CalendarRangeDemo() {
  const { Calendar } = window.EfolusiDesignSystem_4ffc3d;
  const [r, setR] = React.useState({ from: new Date(2026, 6, 14), to: new Date(2026, 6, 21) });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <Calendar mode="range" selected={r} onSelect={setR} />
      <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{(r?.from?.toLocaleDateString() || '…') + ' → ' + (r?.to?.toLocaleDateString() || '…')}</span>
    </div>
  );
}

// @demo Calendar Date picker composition
export function CalendarDatePickerDemo() {
  const { Button, Calendar, Field, FieldLabel, Popover, PopoverContent, PopoverTrigger } = window.EfolusiDesignSystem_4ffc3d;
  const [d, setD] = React.useState();
  return (
    <Field style={{ width: 260 }}><FieldLabel htmlFor="renewal-date">Renewal date</FieldLabel><Popover><PopoverTrigger asChild><Button id="renewal-date" variant="outline" iconLeft="calendar">{d ? d.toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Pick a date'}</Button></PopoverTrigger><PopoverContent style={{ width: 'auto', padding: 12 }}><Calendar mode="single" selected={d} onSelect={setD} /></PopoverContent></Popover></Field>
  );
}

// @demo TimePicker Time slots
export function TimePickerDemo() {
  const { TimePicker } = window.EfolusiDesignSystem_4ffc3d;
  const [t, setT] = React.useState('09:30');
  const [t2, setT2] = React.useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 240 }}>
      <TimePicker label="Starts at" value={t} onChange={setT} minTime="08:00" maxTime="18:00" />
      <TimePicker label="Reminder" format24={false} stepMinutes={15} value={t2} onChange={setT2} placeholder="Pick a time" />
    </div>
  );
}
