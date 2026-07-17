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
