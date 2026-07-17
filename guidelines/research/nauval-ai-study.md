# Study: nauvalazhar/ai — architecture & UX patterns
Deep-read of component source (2026-07-17). Reference for building Meridian's AI-component gap. Values below are theirs; translate to Meridian tokens when building.

## Philosophy (their CONVENTIONS.md)
- **No data contract.** Components know layout + visual state only — never message shape or SDK types. Consumers compose: `<Message><Markdown>{text}</Markdown></Message>`.
- **Heavy renderers are siblings** (Markdown, CodeBlock), never internals — don't pay for what you don't render.
- **Primitives only where real interaction lives** (collapsible, popover, tabs, meter, autocomplete); everything else is styled divs.
- Every part sets `data-slot`; semantic role via `data-role`; transient state via `data-state`; variants (size) via cva only — never state as variant.
- **One radius token.** Inner parts `rounded`; card shells `rounded-outer = radius + padding` (nesting formula). `rounded-full` only for circles.
- Customization ladder: edit file → per-instance class → global `[data-slot=…]` CSS.

## Token vocabulary → Meridian mapping
| theirs | usage | ours |
|---|---|---|
| background/foreground | page | --bg / --text-primary |
| muted / muted-foreground | subtle fill/text | --surface-sunken / --text-muted |
| surface | card shells | --surface |
| surface-elevated | nested wells (code, args, thumbnails) | --surface-sunken (inside cards) |
| border (ring ring-border) | hairlines | --border-default |
| primary | CTA, focus, chips, progress | --accent |
| accent | hover fill | --surface-hover |
| destructive | errors | --danger |
| warning / success | states | --warn / --ok |
| **inflight** (violet) | RUNNING state color — distinct from success/warn | --info (or accent) |
| diff-added / diff-removed | green/red pair, light+dark tuned | --ok / --danger |

## Recurring UX patterns (the real learnings)
1. **Card shell**: `rounded-outer bg-surface ring ring-border`; header row `px-4 h-11 flex items-center gap-2`; body `px-4 pb-3`. Shared by Todo, Document, Env, Exception, Diff, Spec, Transcript, FileTree(p-1), WebPreview(p-1).
2. **Collapsible everywhere**: panel animates height 150–200ms ease-out from 0; chevron `›` rotates 90° (or `⌄` 180°) on open. Open state on the ROOT via data attr so any child can restyle.
3. **Rail lists** (Task, ChainOfThought steps, Action): each row followed by a `w-px h-4 ml-4 bg-border` connector; **last row hides its connector**. Expanded step content gets a full-height rail at the same x (absolute left-4 w-px). Icon slot 16px, default = 8px dot of currentColor.
4. **State ring emphasis** (Tool, Sandbox, AgentRun): running → border+`ring-2` in inflight color at /40–/60 alpha; error → destructive same recipe; approval → primary. The whole card glows, not an icon swap alone. Running icon = spinning arc that REPLACES the tool icon.
5. **Clip + fade + measured expand** (Document 200px, CodeBlock 240px): fixed collapsed height, ResizeObserver measures full height, animate height 500ms `cubic-bezier(0.32,0.72,0,1)`, bottom fade gradient (h-16/20, from-surface) fades out when open. Trigger renders only if actually overflowing.
6. **Stick-to-bottom scroll** (Conversation, Console): atBottom = distance < 24px; ResizeObserver re-pins only if user WAS at bottom; "jump to latest" button keyed off `data-at-bottom`.
7. **Status pill**: dot + label in `rounded-full bg-surface-elevated ring-border`; states neutral/pending/inflight/warning/active/error; optional ping-pulse overlay on dot. Sizes default/sm.
8. **Loader = text treatment**, not spinner: `pulse` (opacity 0.4↔1), `shimmer` (gradient bg-clip-text, bg-pos 200%→-200%), optional 3 staggered dots; tunable `--loader-duration`, `--loader-spread`.
9. **Env masked secrets**: visibility toggled at CONTAINER level; per-var `secret` flag; masked shows `••••••••`; copy always copies real value, `data-copied` flips for 1.2s.
10. **Exception anatomy**: mono type chip (destructive/10 bg) + message + collapsible frames list (mono xs; active frame = left 2px destructive bar + destructive/5 bg; `internal` frames opacity-50) + optional source viewer (header w/ file:line, active line highlighted).
11. **GeneratedImage states** queued/generating/complete/error: img fades in 500ms; loading layer = near-black bg + pulsing radial dot-grid (32px grid, radial mask, 2.8s); slot children (Placeholder/Progress/Error) show per-state via `display:contents`; top/bottom scrim gradients for text legibility; header text goes white over image; error = 30% img + destructive ring.
12. **Prompt = keyboard-first inline wizard**: numbered options (1-9 keys), ↑↓ highlight (hover also highlights), Enter submits, Esc dismisses+resets, ←/Shift+Tab back; "Other" row is an inline text input that auto-focuses when highlighted; container height animates 200ms between steps; answers accumulate `{name: value}`; completes → onComplete + reset.
13. **Citation = hover popover w/ stacked sources**: openOnHover delay 150/close 200; trigger is a small numbered pill; popup w-80 p-1; multiple sources navigated prev/next with direction-aware slide (translateX ±8px, 180ms) + "1/3" indicator; nav hidden when single.
14. **Selection (quote-reply)**: listens to selectionchange + pointerup scoped to a content wrapper; toolbar is a fixed portal at the first range rect — flips top/bottom by available space, clamps to viewport (visualViewport-aware); mousedown prevented so selection survives; buttons receive selected text; Esc/outside-click dismisses.
15. **WebPreview = browser chrome**: address input holds a DRAFT while focused (Enter normalizes to https:// + commits + blurs; Esc reverts); reload = iframe key bump; viewport constraint = named widths, iframe width animates 500ms; bottom panels (console) are collapsible, toggled by panel-trigger buttons (aria-pressed), only active panel renders.
16. **Diff engine in-component**: from/to strings OR unified patch; paired removed+added lines get word-level segments (diffWordsWithSpace) rendered as `DiffWord` marks (bg 35% vs line bg 15%); left edge 2px state bar; 2.5rem line-number gutter colored per state; long unchanged runs collapse to `⋯ skip` rows w/ context=3; per-file collapsible w/ +N −N stats; ignores lockfiles; DiffRich adds shiki tokens per line (falls back gracefully).
17. **Composer**: root context tracks isEmpty/isFocused; registerSubmit lets ANY input implement submit; textarea autosizes to maxRows(8) then scrolls; Enter submits (IME-composition-safe), Shift+Enter newline; Quote block (reply context) w/ 3-line clamp + overflow mask + dismiss; Submit disabled while empty. Focus ring on the whole card (focus-within).
18. **ComposerRich (mentions)**: per-trigger-char config (`@` inserts chip, `/` executes); chips are atomic inline tokens (primary/10 bg, primary text, ring primary/20) that delete as one unit; items can nest (children → submenu frames: → enters, ←/Esc pops); async item fn → loading row; suggestions = fixed portal spanning composer width, flips above/below; group headers; full aria-listbox wiring.
19. **Player**: context exposes currentTime/duration + `subscribeTime/getTime` external-store API so word-level consumers subscribe at 60fps WITHOUT re-rendering the tree; RAF loop only while playing; drag-seek via pointer capture (progress bar AND waveform); waveform = WebAudio-decoded normalized peaks (cached, LRU 16), played bars = primary, loading = staggered scaleY pulse; mute remembers last volume.
20. **Transcript**: items register {start,end}; active = currentTime window (end defaults to next start); auto-scroll active row into view (we must use manual viewport scrollTop math — scrollIntoView is banned in our env); word-level: `data-played` (≤t) + `data-active` (window) via useSyncExternalStore; timestamps click → jumpTo; `interim` italic style for live captions.
21. **UsageMeter**: inline stats (label + tabular value) + meter bar; ≥80% flips fill to destructive; AnimatedNumber = rAF count, cubic ease-out, 300ms, resumes from mid-flight value.
22. **Message**: incoming/outgoing; outgoing = flex-row-reverse; text variant `plain` vs `bubble` (w-fit max-w-75%, surface-elevated, ring); actions row hover-revealed, -mx-2 aligns to plain text.
23. **Markdown streaming trick**: odd number of ``` fences → synthesize a closing fence so half-streamed code renders as a stable block (no layout shift when real fence lands).
24. **Sandbox**: mono-title collapsible run card + state rings; inside: tabs w/ sliding underline indicator (--active-tab-width/left), panels for Output/Code/etc.
25. **Attachment**: `row` (36px media well) vs `card` (64px square) layouts; circular SVG progress (r=10, stroke-dashoffset; indeterminate = 270° arc spinning); dark overlay (foreground/45 + blur) hosts progress/actions on card layout; error state = destructive ring + tinted media well.
26. **Todo**: collapsible card; item icon 16px ring circle → progress: spinning arc (ring-transparent), completed: primary fill + white check, both scale+fade in; completed label line-through + muted. Status is per-item data attr; icon/label restyle via `in-data-[status=…]`.
27. **Source**: link card w/ optional aspect-video thumbnail, favicon+domain row (16px round img), title sm/medium, 2-3 line description; `plain` variant for lists.
28. **ModelSelector**: inline always-open autocomplete (filter input + list) meant to sit inside a popover/dialog; groups, separators, per-item icon/text/meta (badges); highlighted = accent bg.
29. **Console**: mono xs rows `divide-y`; level icon + color (log=fg/70, info=muted, warn=warning, error=red, debug=blue); tabular timestamps; source right-aligned; per-row collapsible stack traces; stick-to-bottom identical to Conversation.
30. **Spec**: grid-cols shared between header/trigger/field rows via context (`cols` prop); rows collapse open → surface-elevated + ring; chevron-down 180°.

## Coverage verdict for Meridian (post deep-read)
- Solid: AgentRun, ChatMessage, Citation(popover nav worth adding), Confirmation, Conversation, FeedbackBar, ModelSelector, PromptComposer, Reasoning, Suggestions, ToolCall, UsageMeter(add AnimatedNumber+bar), CodeBlock(add clip/fade), Diff(add word-level/patch/multi-file/skip), Terminal→Console(add levels/stacks/stick-bottom), TreeList(add kbd nav/guides/rename), FileDrop/FileTile(add progress/error/paste), Spinner/Skeleton(add text Loader), StatusDot(add pill+pulse), Alert, Tag, Menu, Popover, ScrollArea, Select, Switch, Tooltip, Button.
- **Missing to build (14):** Task, Todo, Document, GeneratedImage, WebPreview, Sandbox, Exception, Env, DiffRich(word/syntax level-up of Diff), ComposerRich(mention chips + slash), Selection, Source, Prompt, Transcript+Player.
- Meridian equivalents must: use our tokens/density/theme, injectEfCss pattern, Icon component, 44px touch min where interactive, no scrollIntoView (manual scrollTop), no npm deps (hand-roll diff word pairing? we already have Diff engine; partial-json parse → tolerant JSON display; tiptap → contenteditable-based mentions or simplified chip model).
