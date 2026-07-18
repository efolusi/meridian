const { Button, Input, Checkbox, Icon, Badge } = window.EfolusiDesignSystem_4ffc3d;
// Skip autofocus when embedded in a docs preview iframe (it would scroll the parent gallery).
const standalone = typeof window !== 'undefined' && window.top === window.self;

function BrandPanel() {
  return (
    <div style={{ flex: 1, background: 'var(--brand-950)', color: 'var(--cream-50)', display: 'flex', flexDirection: 'column', padding: 48, position: 'relative', overflow: 'hidden' }}>
      <a href="../website/index.html" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--cream-50)' }}>
        <img src="../../assets/logo.png" alt="" style={{ width: 36, height: 36 }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 680, letterSpacing: '-0.02em', fontSize: 24 }}>Efolusi</span>
      </a>
      <div style={{ marginTop: 'auto', maxWidth: 420 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em', fontSize: 34, lineHeight: 1.15 }}>One account for your whole workspace.</div>
        <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.6, color: 'color-mix(in srgb, var(--cream-50) 75%, transparent)' }}>Every surface your team runs, one workspace, one bill, one login. Pick up right where you left off.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <Badge tone="brand">SOC 2 Type II</Badge>
          <Badge tone="brand">SSO & SCIM</Badge>
        </div>
      </div>
      </div>
  );
}

function AuthDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', fontSize: 12 }}>
      <span style={{ flex: 1, height: 1, background: 'var(--border-default)' }}></span>or<span style={{ flex: 1, height: 1, background: 'var(--border-default)' }}></span>
    </div>
  );
}

function AuthForm({ mode, onSwitch, onMode, onDone }) {
  const [busy, setBusy] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const signup = mode === 'signup';
  const submit = e => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => { setBusy(false); onDone(signup); }, 1200);
  };
  return (
    <div style={{ width: 360 }}>
      <h1 style={{ fontSize: 26, fontWeight: 680 }}>{signup ? 'Create your account' : 'Welcome back'}</h1>
      <p style={{ marginTop: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
        {signup ? 'Free for 14 days. No card needed.' : 'Sign in to your workspace.'}
      </p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
        {signup && <Input size="lg" label="Full name" placeholder="Ada Obi" autoFocus={standalone} autoComplete="off" />}
        <Input size="lg" label="Work email" type="email" placeholder="you@company.com" iconLeft="mail" autoFocus={standalone && !signup} autoComplete="off" />
        <div style={{ position: 'relative' }}>
          <Input size="lg" label="Password" type={show ? 'text' : 'password'} placeholder={signup ? '12+ characters' : '••••••••••••'} iconLeft="lock" hint={signup ? 'At least 12 characters.' : undefined} autoComplete="off" />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}
            style={{ position: 'absolute', right: 10, top: 36, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex', padding: 4 }}>
            <Icon name={show ? 'eye-off' : 'eye'} size={18} />
          </button>
        </div>
        {!signup && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Checkbox defaultChecked label="Keep me signed in" />
            <a href="#" onClick={e => { e.preventDefault(); onMode && onMode('forgot'); }} style={{ fontSize: 13, fontWeight: 600 }}>Forgot password?</a>
          </div>
        )}
        <Button size="lg" fullWidth loading={busy} iconRight={busy ? undefined : 'arrow-right'} type="submit">
          {signup ? 'Create account' : 'Sign in'}
        </Button>
        <AuthDivider />
        <Button size="lg" fullWidth variant="secondary" iconLeft="shield-check" type="button" onClick={() => onDone && onDone('sso')}>Continue with SSO</Button>
        <Button size="lg" fullWidth variant="secondary" iconLeft="mail" type="button" onClick={() => onMode && onMode('magic')}>Email me a magic link</Button>
      </form>
      <p style={{ marginTop: 22, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
        {signup ? 'Already have an account? ' : 'New to Efolusi? '}
        <a href="#" onClick={e => { e.preventDefault(); onSwitch(); }} style={{ fontWeight: 600 }}>{signup ? 'Sign in' : 'Create one'}</a>
      </p>
      {signup && <p style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>By continuing you agree to the Terms of Service and Privacy Policy.</p>}
    </div>
  );
}

Object.assign(window, { BrandPanel, AuthForm, ForgotForm, MagicForm });

function SentNotice({ title, email, hint, onBack }) {
  const [resent, setResent] = React.useState(false);
  return (
    <div style={{ width: 360, textAlign: 'center' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 'var(--radius-full)', background: 'var(--sand-950)', color: 'var(--sand-50)' }}><Icon name="mail" size={22} /></span>
      <h1 style={{ fontSize: 24, fontWeight: 680, marginTop: 18 }}>{title}</h1>
      <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>We sent it to <strong>{email}</strong>.<br />{hint}</p>
      <Button size="lg" fullWidth variant="secondary" iconLeft={resent ? 'check' : 'refresh-cw'} style={{ marginTop: 22 }} onClick={() => { setResent(true); setTimeout(() => setResent(false), 2500); }}>{resent ? 'Sent again' : 'Resend email'}</Button>
      <p style={{ marginTop: 18, fontSize: 13 }}>
        <a href="#" onClick={e => { e.preventDefault(); onBack(); }} style={{ fontWeight: 600 }}>← Back to sign in</a>
      </p>
    </div>
  );
}

function ForgotForm({ onBack }) {
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [email, setEmail] = React.useState('');
  if (sent) return <SentNotice title="Check your inbox" email={email || 'your email'} hint="The reset link expires in 15 minutes." onBack={onBack} />;
  const submit = e => { e.preventDefault(); setBusy(true); setTimeout(() => { setBusy(false); setSent(true); }, 1000); };
  return (
    <div style={{ width: 360 }}>
      <h1 style={{ fontSize: 26, fontWeight: 680 }}>Reset your password</h1>
      <p style={{ marginTop: 6, fontSize: 14, color: 'var(--text-secondary)' }}>Tell us your work email and we'll send a reset link.</p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
        <Input size="lg" label="Work email" type="email" placeholder="you@company.com" iconLeft="mail" autoFocus value={email} onChange={e => setEmail(e.target.value)} />
        <Button size="lg" fullWidth loading={busy} iconRight={busy ? undefined : 'arrow-right'} type="submit">Send reset link</Button>
      </form>
      <p style={{ marginTop: 22, fontSize: 13, textAlign: 'center' }}>
        <a href="#" onClick={e => { e.preventDefault(); onBack(); }} style={{ fontWeight: 600 }}>← Back to sign in</a>
      </p>
    </div>
  );
}

function MagicForm({ onBack }) {
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [email, setEmail] = React.useState('');
  if (sent) return <SentNotice title="Magic link sent" email={email || 'your email'} hint="Click it on this device to sign in — no password needed." onBack={onBack} />;
  const submit = e => { e.preventDefault(); setBusy(true); setTimeout(() => { setBusy(false); setSent(true); }, 1000); };
  return (
    <div style={{ width: 360 }}>
      <h1 style={{ fontSize: 26, fontWeight: 680 }}>Sign in with a magic link</h1>
      <p style={{ marginTop: 6, fontSize: 14, color: 'var(--text-secondary)' }}>No password — we'll email you a one-time sign-in link.</p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
        <Input size="lg" label="Work email" type="email" placeholder="you@company.com" iconLeft="mail" autoFocus value={email} onChange={e => setEmail(e.target.value)} />
        <Button size="lg" fullWidth loading={busy} iconRight={busy ? undefined : 'send'} type="submit">Email me a magic link</Button>
      </form>
      <p style={{ marginTop: 22, fontSize: 13, textAlign: 'center' }}>
        <a href="#" onClick={e => { e.preventDefault(); onBack(); }} style={{ fontWeight: 600 }}>← Back to sign in</a>
      </p>
    </div>
  );
}
