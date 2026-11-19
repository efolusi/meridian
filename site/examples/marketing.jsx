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
      <FeatureCard tone="cocoa" icon="coins" title="Token" body="Buyback and burn, visible on chain." cta="Read more" href="#token" />
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
      <Reveal><FeatureCard tone="cocoa" icon="coins" title="Token" body="Buyback and burn." /></Reveal>
      <Reveal><FeatureCard tone="amber" icon="sparkles" title="Standard" body="Open source first." /></Reveal>
    </FeatureGrid>
  );
}
