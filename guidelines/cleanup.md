# Cleanup list

What Meridian keeps, merges, rewrites or removes, and why. Written 2026-11-18 against dev after 1.23.0.

## How the consumers were searched

- Repos searched (git grep, tracked files): cuwan, efolusi, komando, kongkow, pay, sso, toolips, toolips-cloud, trady. komando-cloud web and the -apps repos have no Meridian reference.
- A component counts as used when a repo has `<Name` or imports `Name` from Meridian. A product with its own component of the same name can show as a false "used"; a dynamic import can show as a false "unused". Every remove row below was checked by hand.
- Breaking means it removes a public export of a 1.x package. Those wait for 2.0.0.

## Components

49 of 123 component files have no consumer. Not every unused file goes: a design system keeps the basic controls a product will need.

| Item | Kind | Why | Used by | Action | Breaks export |
|---|---|---|---|---|---|
| ai/AgentRun, ai/ToolCall, ai/Todo, ai/PromptSteps | component | Agent-trace widgets built for a demo; no product shows agent runs | none | remove | yes |
| ai/GeneratedImage, ai/ModelSelector, ai/UsageMeter, ai/FeedbackBar | component | Chatbot-product furniture (image result, model picker, token meter, thumbs) | none | remove | yes |
| ai/Citation, ai/SourceCard, ai/DocumentCard, ai/WebPreview, ai/SelectionQuote | component | Answer-engine pieces; no product cites sources | none | remove | yes |
| ai/Bubble, ai/RichComposer | component | Duplicate `Message` and `PromptComposer` | none | remove | yes |
| ai/PromptComposer, ai/MessageScroller | component | Unused today, but kongkow, toolips and cuwan render chats with `Message` and `Conversation` | none | keep (unsure: ask kongkow and toolips) | no |
| forms/ButtonTile, forms/Questionnaire | component | Onboarding-quiz pieces from a showcase | none | remove | yes |
| navigation/PageControl | component | Mobile dot pager; Meridian is web | none | remove | yes |
| navigation/Menubar | component | Desktop app menubar; no web product has one | none | remove | yes |
| display/Carousel | component | Carousels hide content and are a template tell | none | remove | yes |
| finance/PaymentCard | component | Card-number display; pay may need it | none | keep (unsure: ask pay) | no |
| forms/InputOTP | component | sso will need one-time codes | none | keep | no |
| files/FileTile, files/FileTypeIcon, code/EnvList, display/TreeList, navigation/NavigationMenu | component | Unused, but plausible for toolips, komando web and docs | none | keep (unsure) | no |
| forms/Checkbox, Radio, Combobox, NumberInput, InputGroup, ButtonGroup; overlay/Sheet, ContextMenu, HoverCard; display/Collapsible, Kbd, Resizable, Toolbar, Direction; feedback/Loader; navigation/Sidebar; code/CodeBlock; data/Chart, BarChart, DonutChart | component | Basic controls and charts every product will need | none yet | keep | no |

## Packages

| Item | Kind | Why | Used by | Action | Breaks export |
|---|---|---|---|---|---|
| `@efolusi/meridian` | package | The product | efolusi, sso, pay, toolips, trady, cuwan, kongkow, komando | keep | no |
| `@efolusi/meridian-guard` | package | Lint for Meridian usage | cuwan, komando | keep | no |
| `@efolusi/meridian-tokens` | package | Tokens for non-React users; matches design-tokens | none | keep (the token path) | no |
| `@efolusi/meridian-cli` | package | Copy-in installs; first published 2026-11-18 | none | keep | no |
| `@efolusi/meridian-icons` | package | The icons ship inside the main package too | none | merge into the main package (unsure: check its own npm downloads) | yes |
| `@efolusi/meridian-mcp` | package | Agent access to the docs; fits the "people and AI agents" goal | none | keep | no |

## Repo content

| Item | Kind | Why | Used by | Action | Breaks export |
|---|---|---|---|---|---|
| `blocks/` (12 pages: hero, pricing, faq, stats-dashboard, …) | site page | Template landing sections (hero plus pricing plus FAQ); the shapes antislop R-05 rejects | none | remove, with `site/Blocks.dc.html` and its nav entry | no |
| `starters/` (9 apps, 1 MB) | site page | Demo apps with fictional companies and invented numbers | none | remove, with `scripts/smoke_starters.mjs` | no |
| `showcases/` (8) | site page | Same: fictional products shown off | none | remove, with the site pages that embed them | no |
| `compatibility/catalog.json`, `guidelines/compatibility.md`, gate "Compatibility inventory" | doc, gate | Lists third-party libraries Meridian "works with"; an unverified claim list | none | remove (the gate guards only this file) | no |
| `site/descriptions.id.json`, gate "Indonesian descriptions cover the registry" | generated output, gate | Indonesian registry descriptions; the docs site shows them | the docs site | keep (unsure: the owner reads Indonesian; ask before removing) | no |
| `guidelines/*.html` (21 spec pages) | doc | May repeat the docs site | the docs site | review in a later pass | no |
| `llms.txt`, `llms-full.txt`, `skills/SKILL.md` | doc | Agent entry points; fit the product goal | agents | keep | no |

## Gates

No gate is loosened. A gate goes only with the thing it alone guards.

| Gate | Guards | Action |
|---|---|---|
| Compatibility inventory | `compatibility/catalog.json` only | remove with the catalog |
| Starters smoke (`smoke_starters.mjs`) | `starters/` only | remove with the starters |
| Every other gate | Live code, tokens, docs or packages | keep |

## Breaking removals for 2.0.0

The AI widgets (15 files), ButtonTile, Questionnaire, PageControl, Menubar, Carousel, and the icons package merge. They wait for one 2.0.0 decision by the owner.

## Order

1. Non-breaking: `blocks/`, `starters/`, `showcases/`, the compatibility catalog and their gates and site pages. Ships as 1.24.0.
2. Breaking: the component removals and the icons merge. Ships as 2.0.0 after the owner's yes.
