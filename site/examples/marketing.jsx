// Meridian docs demos — marketing.

// @demo Section Section with a heading
export function SectionDemo() {
  const { Section, SectionHead, Button } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <Section ruled style={{ paddingBlock: 'var(--space-12)' }}>
      <SectionHead
        eyebrow="Products"
        title="Tools that run on your own machine"
        lede="Open source, self-hosted and private by default."
        align="center"
      >
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
          <Button shape="pill" size="xl" iconRight="arrow-right">Start free</Button>
          <Button shape="pill" size="lg" variant="secondary">Read the docs</Button>
        </div>
      </SectionHead>
    </Section>
  );
}

// @demo Section Band tone
export function SectionBand() {
  const { Section, SectionHead } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <Section tone="band" style={{ paddingBlock: 'var(--space-12)' }}>
      <SectionHead eyebrow="Made in Indonesia" title="Built in Indonesia, used everywhere." lede="Every label comes from your own dictionary, in Indonesian and English." />
    </Section>
  );
}

// @demo Button Pill shape
export function ButtonPill() {
  const { Button } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button shape="pill" size="sm">Get in touch</Button>
      <Button shape="pill">Sign in</Button>
      <Button shape="pill" size="xl" iconRight="arrow-right">Start free</Button>
      <Button shape="pill" variant="brand">Join the waitlist</Button>
    </div>
  );
}

// @demo Hero Centred hero with an accent word
export function HeroDemo() {
  const { Hero, HeroAccent, Button, StatusDot } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <Hero
      style={{ paddingBlock: 'var(--space-12)' }}
      title={<>Tools that run on <HeroAccent>your own</HeroAccent> machine</>}
      sub="Open source, self-hosted and private by default. Every word comes from your own dictionary."
      actions={<><Button shape="pill" size="xl" iconRight="arrow-right">Start free</Button><Button shape="pill" size="xl" variant="secondary">Read the docs</Button></>}
      proof={<><StatusDot status="success" /><span>All services running</span></>}
    />
  );
}

// @demo FeatureCard Three tones in a grid
export function FeatureCardDemo() {
  const { FeatureGrid, FeatureCard } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <FeatureGrid>
      <FeatureCard tone="peach" icon="package" title="Products" body="Seven tools, one account, all running on your machine." cta="See the portfolio" href="#products" />
      <FeatureCard tone="band" icon="coins" title="Token" body="Buyback and burn, visible on chain." cta="Read more" href="#token" />
      <FeatureCard tone="amber" icon="sparkles" title="Standard" body="Open source, self-hosted, private and secure." cta="About us" href="#about" />
    </FeatureGrid>
  );
}

// @demo Marquee Labels with a pause button
export function MarqueeDemo() {
  const { Marquee } = window.EfolusiDesignSystem_4ffc3d;
  return <Marquee label="What we build" items={['Open source', 'Self-hosted', 'Private', 'Secure', 'Cloud', 'Commercial']} />;
}

// @demo Reveal Staggered cards
export function RevealDemo() {
  const { Reveal, FeatureGrid, FeatureCard } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <FeatureGrid>
      <Reveal><FeatureCard tone="peach" icon="package" title="Products" body="Seven tools, one account." /></Reveal>
      <Reveal><FeatureCard tone="band" icon="coins" title="Token" body="Buyback and burn." /></Reveal>
      <Reveal><FeatureCard tone="amber" icon="sparkles" title="Standard" body="Open source first." /></Reveal>
    </FeatureGrid>
  );
}

// @demo Counter Stat figures that count up
export function CounterDemo() {
  const { Counter } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap', fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)' }}>
      <Counter value={12400} locale="en" />
      <Counter value={0.98} format={{ style: 'percent' }} locale="en" />
      <Counter value={7} />
    </div>
  );
}

// @demo ThemeToggle One button, three states
export function ThemeToggleDemo() {
  const { ThemeToggle } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
      <ThemeToggle />
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Click to switch between Light and Dark. The page theme changes with it.</span>
    </div>
  );
}

// @demo LanguageSwitch Two languages, the current one marked, two sizes
export function LanguageSwitchDemo() {
  const { LanguageSwitch } = window.EfolusiDesignSystem_4ffc3d;
  const languages = [
    { code: 'id', label: 'ID', href: '#id', name: 'Bahasa Indonesia' },
    { code: 'en', label: 'EN', href: '#en', name: 'English' },
  ];
  return (
    <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', flexWrap: 'wrap' }}>
      <LanguageSwitch languages={languages} current="en" />
      <LanguageSwitch languages={languages} current="id" size="sm" lang="id" />
    </div>
  );
}

// @demo SiteHeader Links, language switch and actions
export function SiteHeaderDemo() {
  const { SiteHeader, Button, ThemeToggle } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <SiteHeader
      style={{ position: 'relative' }}
      brand="Komando"
      brandHref="#"
      links={[{ label: 'Docs', href: '#docs', current: true }, { label: 'Pricing', href: '#pricing' }, { label: 'Changelog', href: '#changelog' }]}
      languageSwitch={{ label: 'ID', href: '#id', hrefLang: 'id', ariaLabel: 'Bahasa Indonesia' }}
      actions={<><ThemeToggle /><Button shape="pill" size="sm">Get in touch</Button></>}
      skipHref="#docs"
    />
  );
}

// @demo SiteFooter Columns, socials, legal row and language switch
export function SiteFooterDemo() {
  const { SiteFooter, LanguageSwitch, Icon } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <SiteFooter
      brand="Komando"
      brandHref="#"
      tagline="Manage servers safely, from the terminal or your agent."
      socials={[{ label: 'GitHub', href: 'https://github.com/efolusi', icon: <Icon name="github" size={20} aria-hidden="true" /> }]}
      columns={[{ heading: 'Product', links: [{ label: 'Docs', href: '#docs' }, { label: 'Pricing', href: '#pricing' }] }]}
      name="Efolusi"
      legal={[{ label: 'Terms', href: '#terms' }, { label: 'Privacy notice', href: '#privacy' }]}
      languageSwitch={<LanguageSwitch size="sm" current="en" languages={[{ code: 'id', label: 'ID', href: '#id', name: 'Bahasa Indonesia' }, { code: 'en', label: 'EN', href: '#en', name: 'English' }]} />}
      bottom={<span>Apache-2.0 licensed.</span>}
    />
  );
}

// @demo LegalDocument Terms with contents
export function LegalDocumentDemo() {
  const { LegalDocument } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <LegalDocument
      lang="en"
      title="Terms"
      meta="Effective 20 November 2026"
      contentsLabel="Contents"
      backLink={{ label: 'Back to home', href: '#' }}
      intro={['These terms cover your use of the service. Payments are handled by **pay**, see [refunds](#refunds).']}
      sections={[
        { id: 'accounts', head: 'Your account', blocks: ['You keep your sign-in details private.'] },
        { id: 'refunds', head: 'Refunds', blocks: [{ ul: ['Ask within 14 days.', 'We answer within 3 working days.'] }] },
      ]}
    />
  );
}
