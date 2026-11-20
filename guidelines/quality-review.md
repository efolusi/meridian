# Quality review

Where Meridian breaks its own design-system rules, and the fix for each. Nothing is removed: every component stays, used or not. Written 2026-11-18 against main after 1.23.0, with antislop, antislop-ui, antislop-human, antislop-layoutmobile and design-taste-frontend.

## Status

Counted on main after 1.24.0 and the spacing integration (#150), 2026-11-19.

| Finding | Status | Where |
|---|---|---|
| Spacing on the token scale | done | #121, #150 (every group) |
| Status names in four vocabularies; `danger` and `destructive`; Button `secondary` and `outline` | held for 1.25.0 | #120, with the product apps' PRs |
| Button `xs` and icon `xs` off the control tokens | done | #134 (`--control-h-xs`) |
| Avatar and Sidebar sizes | done | #134 (`--avatar-*`, `--sidebar-width*`) |
| Focus styles | done | #119, #123 |
| Decorative gradients | done | PaymentCard chip and GeneratedImage dot grid are flat (#139, #140); the other eight mark a state, a cut-off or a scroll edge |
| Blur | done: functional | TopNav (one sticky bar, within the R-10 dose) and GeneratedImage (its action buttons over the image): each keeps its controls readable over changing content |
| Icons missing from the visual baselines | done | #149 |
| README "accessible" claim | done | the README names the checks behind it |
| Raw border-radius | done | #152 (`--radius-*`, a test keeps raw radii out) |
| Padding that clears an icon | done | #153 (`calc()` of space, icon and control-height tokens) |
| Raw font-size | done | #154 (`--text-*`; off-scale sizes snapped); sizes below 11px stay in px, see Open |

## Open

| Kind | Where | Count | Severity |
|---|---|---|---|
| Font sizes below 11px stay in px | Citation, ModelSelector, WebPreview, BarChart, Avatar, FileTypeIcon, PaymentCard (network mark), Sidebar | 10 values | low; waits for a smaller `--text-*` step in design-tokens |
| Raw width and height | most component files; some have a token (control heights, icons, dots), many are component geometry | 277 values | medium |

Left as px on purpose: `1px` hairline borders and one-pixel optical nudges.

All raw px together: 877 values in 113 of 123 component files. Counted with:

```sh
git grep -hoE "[0-9]+(\.[0-9]+)?px" -- 'components/*.jsx' | wc -l
```

## Order of the open fixes

One small PR each, built on main, green, with any visual change in the CHANGELOG:

1. Widths and heights: the ones a token covers (PR 5), with the border-compensation px in the same rules as `calc(var(--space-*) - 1px)`.
2. Font sizes below 11px, once design-tokens has a smaller step.

## Appendix: consumer search

Kept from the first pass, to show what is unused today. Unused is not a reason to remove a component.

### How the consumers were searched

- Repos searched (git grep, tracked files): cuwan, efolusi, komando, kongkow, pay, sso, toolips, toolips-cloud, trady. komando-cloud web and the -apps repos have no Meridian reference.
- A component counts as used when a repo has `<Name` or imports `Name` from Meridian. A product with its own component of the same name can show as a false "used"; a dynamic import can show as a false "unused".

### Components with no consumer

49 of 123 component files have no consumer. Every one stays (owner, 2026-11-18).

| Item | Kind | What it is | Used by |
|---|---|---|---|
| ai/AgentRun, ai/ToolCall, ai/Todo, ai/PromptSteps | component | Agent-trace widgets built for a demo; no product shows agent runs | none |
| ai/GeneratedImage, ai/ModelSelector, ai/UsageMeter, ai/FeedbackBar | component | Chatbot-product furniture (image result, model picker, token meter, thumbs) | none |
| ai/Citation, ai/SourceCard, ai/DocumentCard, ai/WebPreview, ai/SelectionQuote | component | Answer-engine pieces; no product cites sources | none |
| ai/Bubble, ai/RichComposer | component | Duplicate `Message` and `PromptComposer` | none |
| ai/PromptComposer, ai/MessageScroller | component | Unused today, but kongkow, toolips and cuwan render chats with `Message` and `Conversation` | none |
| forms/ButtonTile, forms/Questionnaire | component | Onboarding-quiz pieces from a showcase | none |
| navigation/PageControl | component | Mobile dot pager; Meridian is web | none |
| navigation/Menubar | component | Desktop app menubar; no web product has one | none |
| display/Carousel | component | Carousels hide content and are a template tell | none |
| finance/PaymentCard | component | Card-number display; pay may need it | none |
| forms/InputOTP | component | sso will need one-time codes | none |
| files/FileTile, files/FileTypeIcon, code/EnvList, display/TreeList, navigation/NavigationMenu | component | Unused, but plausible for toolips, komando web and docs | none |
| forms/Checkbox, Radio, Combobox, NumberInput, InputGroup, ButtonGroup; overlay/Sheet, ContextMenu, HoverCard; display/Collapsible, Kbd, Resizable, Toolbar, Direction; feedback/Loader; navigation/Sidebar; code/CodeBlock; data/Chart, BarChart, DonutChart | component | Basic controls and charts every product will need | none yet |

