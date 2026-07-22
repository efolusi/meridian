// Meridian docs demos — dates.

// @demo Calendar Month grid
export function CalendarDemo() {
  const { Calendar } = window.EfolusiDesignSystem_4ffc3d;
  const [d, setD] = React.useState('2026-07-17');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <Calendar value={d} onChange={setD} />
      <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{d}</span>
    </div>
  );
}

// @demo Calendar Range selection
export function CalendarRangeDemo() {
  const { Calendar } = window.EfolusiDesignSystem_4ffc3d;
  const [r, setR] = React.useState({ from: '2026-07-14', to: '2026-07-21' });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <Calendar range value={r} onChange={setR} />
      <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{(r.from || '…') + ' → ' + (r.to || '…')}</span>
    </div>
  );
}

// @demo DatePicker Input with calendar
export function DatePickerDemo() {
  const { DatePicker } = window.EfolusiDesignSystem_4ffc3d;
  const [d, setD] = React.useState('');
  return (
    <div style={{ width: 260 }}>
      <DatePicker label="Renewal date" value={d} onChange={setD} placeholder="Pick a date" />
    </div>
  );
}

// @demo DateRangePicker Check-in to check-out
export function DateRangePickerDemo() {
  const { DateRangePicker } = window.EfolusiDesignSystem_4ffc3d;
  const [r, setR] = React.useState({ from: null, to: null });
  return (
    <div style={{ width: 300 }}>
      <DateRangePicker label="Stay" hint="Check-in to check-out." value={r} onChange={setR} placeholder="Pick a range" />
    </div>
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
