# Quality review

Where Meridian breaks its own design-system rules, and the fix for each. Nothing is removed: every component stays, used or not. Written 2026-11-18 against main after 1.23.0, with antislop, antislop-ui, antislop-human, antislop-layoutmobile and design-taste-frontend.

## Counts

| Kind | Where | Count | Severity |
|---|---|---|---|
| Raw px instead of a space or size token | 115 of 123 component files | 1,553 values | high |
| Off-scale spacing (not on the 4px scale: 2, 3, 5, 6, 7, 9, 10, 14px) | most component files | about 300 values | high |
| One status meaning, several names (`ok`/`success`, `err`/`error`/`danger`, `warn`/`warning`, `running`/`busy`/`generating`) | StatusDot, Terminal, Console, WebPreview vs Alert, Badge, Toast | 4 vocabularies | high |
| Two variant names for one look (`danger` and `destructive`, `secondary` and `outline` on Button) | Button, Alert, Badge, DropdownMenu, ContextMenu, InputGroup | 6 components | medium |
| Control size outside the size tokens (`--control-h-*`): Button `xs` 28px, icon `xs` 24px | Button, and siblings that copy it | 2 sizes | medium |
| Raw border-radius instead of `--radius-*` | Chart, DonutChart, LineChart, Diff, Tabs, SegmentedControl, Tooltip, Toolbar, Task, Transcript, FileTypeIcon, PaymentCard | 16 values | medium |
| Interactive part with no focus style of its own | ChatMessage, CodeBlock, Console, CopyField, Banner, Toast, Tooltip, FileTile, HoverCard, Popover | 10 components | high (check each: some rely on Button inside) |
| Decorative gradient | GeneratedImage (4), Attachment (2), DocumentCard, CodeBlock, Loader, PaymentCard | 10 | done: the PaymentCard chip and the GeneratedImage dot grid are flat (#139, #140); the other 8 are functional and stay (GeneratedImage mask and 2 text scrims, Attachment upload shimmer and scroll-edge mask, DocumentCard and CodeBlock cut-off fades, Loader shimmer) |
| Blur / glass | TopNav, GeneratedImage | 2 | low (TopNav: one sticky bar is within the R-10 dose) |
| Motion without reduced-motion handling | none: `tokens/base.css` stops all animation under `prefers-reduced-motion` | 0 | none |
| Emoji as icons | none | 0 | none |
| README and docs claims | "123 accessible React components" without a stated test; badge counts | 2 | low |

Raw px counted on dev, 2026-11-18: `git grep -hoE "[0-9]+(\.[0-9]+)?px" origin/dev -- 'components/*.jsx' | wc -l`.

## The ten worst

1. Spacing is not on the token scale: 1,553 raw px values. Fix: replace with `--space-*`, and round off-scale values (6, 10, 14px) to the scale, group by group; each group is a visual change stated in the CHANGELOG.
2. Status names split into four vocabularies. Fix: one set, `success`, `warning`, `danger`, `info`, `neutral`, `busy`, used by every status-bearing component; the old names are removed in 1.24.0 with no aliases (owner, 2026-11-18).
3. Sidebar: 53 raw px values, the most of any component. Fix: tokens, and the 4px scale.
4. Combobox and Input: 32 and 23 raw values, with heights that do not follow `--control-h-*`. Fix: share Input's sizing with Select and Combobox through the control tokens.
5. 11 interactive components with no focus style of their own. Fix: `:focus-visible` with `--focus-ring` on every focusable part; keyboard-test each.
6. Button `xs` and icon `xs` sizes are raw 28px and 24px. Fix: add `--control-h-xs` (and an icon size) in design-tokens, then use it here.
7. `danger` and `destructive` both exist on Button and the menus. Fix: one name, `danger`, across Button, Alert, Badge and the menus.
8. Chart family (Chart, LineChart, DonutChart) uses raw radius and px for legends and tooltips. Fix: radius and space tokens, matching Tooltip and Popover.
9. Avatar: 23 raw px sizes. Fix: an avatar size scale (`--avatar-*`) in design-tokens.
10. Decorative gradients in Attachment, DocumentCard and PaymentCard. Fix: flat surface tokens unless the gradient carries meaning.

## Order of fixes

Each group is one small PR into main, green, sent to the Audit queue, with the visual change written in the CHANGELOG:

1. Status and variant names (2, 7).
2. Focus styles (5).
3. Tokens for controls, avatars and radius, added to design-tokens first (6, 9, 8).
4. Spacing on the scale, one component group per PR (1, 3, 4).
5. Gradients and docs claims (10, and the README counts).

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

