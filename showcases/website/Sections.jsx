const { Button, Badge, Icon, Card, Avatar, AvatarGroup, Input } = window.EfolusiDesignSystem_4ffc3d;
const wrap = { maxWidth: 1200, margin: '0 auto', padding: '0 32px' };

function SiteHeader() {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'color-mix(in srgb, var(--surface-page) 85%, transparent)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-default)' }}>
      <div style={{ ...wrap, display: 'flex', alignItems: 'center', gap: 28, height: 64 }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)', textDecoration: 'none' }}>
          <img src="../../assets/logo.png" alt="" style={{ width: 30, height: 30 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 680, letterSpacing: '-0.02em', fontSize: 20 }}>Efolusi</span>
        </a>
        <nav style={{ display: 'flex', gap: 4 }}>
          {[['Products', '#products'], ['Pricing', '#pricing'], ['Docs', '../docs/index.html'], ['Console', '../console/index.html']].map(([l, href]) => (
            <a key={l} href={href} style={{ padding: '7px 12px', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--sand-100)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-secondary)'; }}>{l}</a>
          ))}
        </nav>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Button variant="ghost" onClick={() => { window.location.href = '../auth/index.html'; }}>Sign in</Button>
          <Button iconRight="arrow-right" onClick={() => { window.location.href = '../auth/index.html'; }}>Start free</Button>
        </div>
      </div>
    </header>
  );
}

function MiniConsole() {
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--border-default)', background: 'var(--sand-25)' }}>
        <span style={{ width: 10, height: 10, borderRadius: 99, background: 'var(--sand-200)' }}></span>
        <span style={{ width: 10, height: 10, borderRadius: 99, background: 'var(--sand-200)' }}></span>
        <span style={{ width: 10, height: 10, borderRadius: 99, background: 'var(--sand-200)' }}></span>
        <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>console.efolusi.com</span>
      </div>
      <div style={{ display: 'flex', gap: 14, padding: 18 }}>
        {[['MRR', '$48.2k', '↑ 12.4%', 'success'], ['Customers', '1,284', '↑ 3.1%', 'success'], ['Requests', '16.3M', '↑ 8.9%', 'success']].map(([l, v, d, t]) => (
          <div key={l} style={{ flex: 1, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{l}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 19, fontWeight: 600, marginTop: 3 }}>{v}</div>
            <Badge tone={t} style={{ marginTop: 6 }}>{d}</Badge>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 90, padding: '0 18px 18px' }}>
        {[42, 55, 48, 61, 58, 72, 66, 80, 74, 88, 92, 84, 96, 104, 98, 112, 118, 124, 130, 138, 144, 150].map((v, i) => (
          <div key={i} style={{ flex: 1, height: (v / 150 * 100) + '%', borderRadius: '2px 2px 0 0', background: i > 17 ? 'var(--brand-900)' : 'var(--sand-200)' }} />
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section style={{ background: 'var(--surface-page)', paddingTop: 88, paddingBottom: 96 }}>
      <div style={{ ...wrap, display: 'flex', gap: 64, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>One workspace, every surface</div>
          <h1 style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.04, marginTop: 18 }}>Do more with fewer tabs.</h1>
          <p style={{ fontSize: 19, lineHeight: 1.6, color: 'var(--text-secondary)', marginTop: 20, maxWidth: 460 }}>
            One account for every surface your team builds: AI agents, infrastructure, automation, file tools, and trading, in a single workspace.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <Button size="lg" iconRight="arrow-right" onClick={() => { window.location.href = '../auth/index.html'; }}>Start free</Button>
            <Button size="lg" variant="secondary" iconLeft="book-open" onClick={() => { window.location.href = '../docs/index.html'; }}>Read the docs</Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 28 }}>
            <AvatarGroup>
              <Avatar name="Ada Obi" size={28} /><Avatar name="Femi Alade" size={28} /><Avatar name="June Park" size={28} /><Avatar name="Sol Reyes" size={28} />
            </AvatarGroup>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>4,200+ teams ship with Efolusi</span>
          </div>
        </div>
        <div style={{ flex: 1.1 }}><MiniConsole /></div>
      </div>
    </section>
  );
}

const PRODUCTS = [
  ['bot', 'AI agents', 'An autonomous operator that plans, runs tools, and ships work you review, not prompts you babysit.', '../agent/index.html'],
  ['server', 'Infrastructure', 'Every cloud, SSH box, database, cache, cert, domain, and DNS record in one control plane.', '../infra/index.html'],
  ['sparkles', 'Automation', 'Node-based workflows that scale content across text, image, audio, and video.', '../docs/index.html'],
  ['package', 'File tools', 'Convert, encode, decode, and scan any file: one toolbox instead of forty tabs.', '../tools/index.html'],
  ['chart-candlestick', 'Trading', 'A trading desk with guardrails: strategies you set, risk you cap, logs you can audit.', '../trader/index.html'],
  ['wallet', 'Finance', 'Shared portfolios and social signals with real accounting underneath.', '../trader/index.html'],
];
function Products() {
  return (
    <section id="products" style={{ padding: '96px 0', background: 'var(--surface-page)', scrollMarginTop: 64 }}>
      <div style={wrap}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>The platform</div>
        <h2 style={{ fontSize: 40, fontWeight: 680, marginTop: 10, maxWidth: 560 }}>Every surface, one account</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginTop: 40 }}>
          {PRODUCTS.map(([icon, name, desc, href]) => (
            <Card key={name} interactive padding={24} onClick={() => { window.location.href = href; }}>
              <span style={{ display: 'inline-flex', color: 'var(--text-primary)' }}>
                <Icon name={icon} size={22} />
              </span>
              <h3 style={{ fontSize: 21, fontWeight: 700, marginTop: 16 }}>{name}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-secondary)', marginTop: 8 }}>{desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 14, fontWeight: 600, color: 'var(--text-link)' }}>
                Explore {name} <Icon name="arrow-right" size={15} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandBand() {
  return (
    <section style={{ background: 'var(--cocoa-700)', color: 'var(--cream-50)', padding: '88px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ ...wrap, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3, maxWidth: 760, margin: '0 auto' }}>
          “We deleted 40k lines of billing code the week we adopted Efolusi. I'm still a little emotional about it.”
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24 }}>
          <Avatar name="June Park" size={36} />
          <span style={{ fontSize: 14, color: 'color-mix(in srgb, var(--cream-50) 75%, transparent)' }}><strong style={{ color: 'var(--cream-50)' }}>June Park</strong> · CTO, Bloom Health</span>
        </div>
      </div>
    </section>
  );
}

const TIERS = [
  ['Starter', '$0', 'For side projects and tinkering', ['1 surface', '2 seats', '10k requests/mo', 'Community support'], 'secondary'],
  ['Growth', '$12', 'Per seat — most teams start here', ['Every surface', 'Unlimited seats', '1M requests/mo', 'Email support', 'SSO'], 'primary'],
  ['Scale', 'Custom', 'For platforms and regulated teams', ['Everything in Growth', 'Unlimited requests', 'SCIM & audit log', 'Dedicated support'], 'brand'],
];
function Pricing() {
  return (
    <section id="pricing" style={{ padding: '96px 0', background: 'var(--surface-page)', scrollMarginTop: 64 }}>
      <div style={{ ...wrap, textAlign: 'center' }}>
        <h2 style={{ fontSize: 40, fontWeight: 680 }}>Pricing that stays boring</h2>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 10 }}>No usage cliffs, no surprise line items. Cancel anytime.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginTop: 44, textAlign: 'left' }}>
          {TIERS.map(([name, price, desc, feats, cta]) => (
            <Card key={name} padding={28} elevated={cta === 'primary'} style={cta === 'primary' ? { borderColor: 'var(--accent)' } : {}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{name}</h3>
                {cta === 'primary' && <Badge tone="accent">Popular</Badge>}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 14 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 680, letterSpacing: '-0.02em' }}>{price}</span>
                {price === '$12' && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/seat/mo</span>}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, margin: '20px 0 24px' }}>
                {feats.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
                    <span style={{ color: 'var(--sand-600)', display: 'inline-flex' }}><Icon name="check" size={15} /></span>{f}
                  </div>
                ))}
              </div>
              <Button fullWidth variant={cta} iconRight="arrow-right" onClick={() => { window.location.href = price === 'Custom' ? 'mailto:hello@efolusi.com' : '../auth/index.html'; }}>{price === 'Custom' ? 'Talk to us' : 'Start free'}</Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [done, setDone] = React.useState(false);
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Stay in the loop</div>
      {done ? (
        <p style={{ fontSize: 13, color: 'var(--success-600)', marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="circle-check" size={15} />You're in — see you next month.</p>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <Input size="sm" placeholder="you@company.com" style={{ flex: 1 }} />
          <Button size="sm" onClick={() => setDone(true)}>Subscribe</Button>
        </div>
      )}
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>One email a month. No launches missed.</p>
    </div>
  );
}

function SiteFooter() {
  const col = (title, links) => (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
        {links.map(l => <a key={l} href="#" style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none' }}>{l}</a>)}
      </div>
    </div>
  );
  return (
    <footer style={{ borderTop: '1px solid var(--border-default)', background: 'var(--sand-25)', padding: '56px 0 40px' }}>
      <div style={{ ...wrap, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.4fr', gap: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="../../assets/logo.png" alt="" style={{ width: 28, height: 28 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 680, letterSpacing: '-0.02em', fontSize: 18 }}>Efolusi</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12, maxWidth: 220, lineHeight: 1.55 }}>The boring parts of SaaS, shipped for you. Made with care in Lagos & Lisbon.</p>
        </div>
        {col('Platform', ['AI agents', 'Infrastructure', 'Automation', 'File tools', 'Trading', 'Pricing'])}
        {col('Company', ['About', 'Blog', 'Careers', 'Brand'])}
        {col('Resources', ['Docs', 'API status', 'Changelog', 'Support'])}
        <Newsletter />
      </div>
      <div style={{ ...wrap, marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--border-default)', display: 'flex', fontSize: 12, color: 'var(--text-muted)' }}>
        <span>© 2026 Efolusi, Inc.</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Security</a>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { SiteHeader, Hero, Products, BrandBand, Pricing, SiteFooter, Newsletter });
