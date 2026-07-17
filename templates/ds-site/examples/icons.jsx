// Meridian docs demos — icons.

// @demo Icon Names, sizes, stroke
export function IconDemo() {
  const { Icon } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)' }}>
        {['bot', 'sparkles', 'database', 'terminal', 'credit-card', 'shield-check', 'zap', 'globe'].map(n => <Icon key={n} name={n} size={20} />)}
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: 'var(--text-primary)' }}>
        <Icon name="rocket" size={16} />
        <Icon name="rocket" size={24} />
        <Icon name="rocket" size={32} />
        <Icon name="rocket" size={32} strokeWidth={1} />
      </div>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>90 Lucide icons, 1.5px stroke by default.</span>
    </div>
  );
}
