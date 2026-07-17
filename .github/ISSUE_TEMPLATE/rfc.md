---
name: RFC — API or system change
about: Propose a change to component APIs, tokens, structure, or conventions before writing code
labels: rfc
---

**Summary**
One paragraph: what changes and why now.

**Motivation**
What can't be done today, or what inconsistency this removes. Link issues if any.

**Design**
The proposed API/tokens/structure, with a usage example. Name the alternatives you rejected and why.

**Compatibility**
What breaks, what gets deprecated (aliases live one major, per governance.md), what a migration looks like.

**Scope check**
- [ ] Follows STYLEGUIDE.md conventions (or proposes changing them explicitly)
- [ ] Respects ARCHITECTURE.md invariants (bundle lockstep, path depth, root contract)
- [ ] Works with semantic tokens only (light + dark + compact for free)
