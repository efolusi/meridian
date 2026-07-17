// Meridian docs demos — finance.

// @demo PaymentCard Virtual card
export function PaymentCardDemo() {
  const { PaymentCard } = window.EfolusiDesignSystem_4ffc3d;
  return <PaymentCard name="ADA OBI" number="•••• •••• •••• 4412" expiry="09/29" network="Efolusi" variant="espresso" />;
}

// @demo PaymentCard Variants and frozen
export function PaymentCardVariants() {
  const { PaymentCard } = window.EfolusiDesignSystem_4ffc3d;
  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <PaymentCard name="KOFI MENSAH" number="•••• •••• •••• 8833" expiry="03/28" variant="caramel" />
      <PaymentCard name="TEAM OPS" number="•••• •••• •••• 1201" expiry="11/27" variant="paper" frozen />
    </div>
  );
}
