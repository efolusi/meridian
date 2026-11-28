# Motion

The one page of the motion rule. The numbers are the tokens of `tokens/effects.css` (design-tokens v0.9.0, [docs/motion.md](https://github.com/efolusi/design-tokens/blob/main/docs/motion.md)); `tests/md120-motion-guideline.test.mjs` reads this page against that file, so a changed token fails until the page says so. A component takes a duration and a curve from the tokens and never writes its own: `scripts/check_motion.mjs` fails a literal.

## When to animate

Often the answer is no. Motion confirms an action; it never plays for its own sake.

| Moment | Rule |
|---|---|
| A keystroke, a row hover, the content behind a tab | At once, or a colour or opacity transition of `--dur-fast` or less. |
| A menu people open many times a day | No opening animation; an exit at most. |
| A view's first load, a success, an empty state | The few moments that deserve a short entrance. |
| Anything that changes state | Leaves a static cue too: a colour, an icon or a label. Motion is never the only feedback. |
| An action revealed by hover (message actions, row buttons, a sort arrow) | Hidden at rest only where a pointer can hover: inside `@media (hover: hover)` it is revealed by `:hover` and `:focus-within`. Where nothing hovers, `@media (hover: none), (pointer: coarse)`, it is shown at rest: an action a touch user cannot reach is a defect. |
| Interactive state | A transition, so it can reverse mid-flight. Keyframes only for a sequence that runs once. |
| What may animate | `opacity` and `transform`; a measured height. Name the properties: never `transition: all`. |

## Duration

Small things are fast, large things take longer.

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 120 ms | A hover or focus colour, a symbol swap, a tooltip. Also the reduced-motion fade. |
| `--dur-base` | 200 ms | Something arriving or leaving in place: a menu, a notice, a card state. |
| `--dur-slow` | 250 ms | A panel opening in place, and the exit of a modal. |
| `--dur-modal` | 400 ms | A modal, a drawer or a panel arriving: `Dialog`, `AlertDialog`, `Drawer`, `Sheet`. The one long duration. |
| `--dur-progress` | 250 ms | A bar moving to a new value, with `linear`. |
| `--dur-loop`, `--dur-loop-slow` | 1400 ms, 1600 ms | One turn of a loop, with `linear`: a skeleton pulse over `--dur-loop`, a skeleton shimmer over `--dur-loop-slow`. |
| `--dur-spin` | 800 ms | One turn of a rotating spinner, with `linear`: `Spinner`, the `Button` spinner, the glyph spinners of `AgentRun`, `Sandbox`, `Todo` and `ToolCall`. Defined in `tokens/base.css` until design-tokens carries it. |

Product UI never runs longer than 250 ms, except a modal, a drawer or a panel arriving.

## Easing

| Token | Use |
|---|---|
| `--ease-enter` | Every enter, exit and state change: ease-out, fast start, no overshoot. |
| `--ease-exit` | The same curve as `--ease-enter`: an exit takes ease-out too. |
| `--ease-standard` | A change in place. |
| `--ease-emphasised` | The Switch thumb only, the one control that has weight and travels. It overshoots 4 percent, so nothing else uses it. |

There is no bounce. A loop takes `linear`. A colour or opacity change never takes a spring. A test fails any component other than the `Switch` thumb that names `--ease-emphasised`.

## Enter scale and travel

The larger the surface, the smaller the scale it enters from, because a big surface scaling from 0.95 changes too much of the screen.

| Token | Value | Use |
|---|---|---|
| `--motion-enter-scale-sm` | 0.97 | `Tooltip`, `DropdownMenu`, `ContextMenu`, `Toast`. |
| `--motion-enter-scale-lg` | 0.98 | `Dialog`, `AlertDialog`, the `NavigationMenu` panel. |

A popup scales from the side that faces its trigger, never from the centre, where the component knows that side: `Tooltip` at its arrow, `DropdownMenu` by `data-side`. A dialog centred on the screen keeps the centre.

| Token | Value | Use |
|---|---|---|
| `--shift-sm` | 4 px | A text swap, a hover lift. |
| `--shift-md` | 8 px | How far a page or a small element arrives. |
| `--shift-lg` | 16 px | A card or a reveal-on-scroll lift. |
| `--shift-xl` | 32 px | A long travel: a page, a section, a sheet or side panel entering. |

Travel only as far as shows where the thing came from.

## Exits

An exit is one step shorter than its enter, on `--ease-exit`:

| Enter | Exit |
|---|---|
| `--dur-fast` (120 ms) | `--dur-fast`: nothing is shorter. |
| `--dur-base` (200 ms) | `--dur-fast` (120 ms) |
| `--dur-slow` (250 ms) | `--dur-base` (200 ms) |
| `--dur-modal` (400 ms) | `--dur-slow` (250 ms) |

Slide fully out only where the destination carries meaning, as a drawer closing does.

Every overlay that animates in animates out: `Popover`, `HoverCard`, `Tooltip`, `DropdownMenu`, `ContextMenu`, `Select`, `Combobox`, `TimePicker`, `ModelSelector`, `Citation`, the jump button of `Conversation`, `Toast`, `Dialog`, `AlertDialog`, `Drawer`, `Sheet`. The overlay stays mounted, with `data-state="closed"`, until its `ef-*-out` animation has ended, then unmounts; where no exit runs it goes at once. A product writes no exit and no unmount delay of its own.

| Kind | Exit |
|---|---|
| A panel on a solid surface (`Select`, `Combobox`, `TimePicker`, `ModelSelector`, `Citation`, `Tooltip`, `Toast`, `Dialog`, `AlertDialog`) and the jump button | Opacity to 0 and back to the value the enter started from (scale, shift). The scrim of a dialog lets go over `--dur-fast`, so the panel inside stays visible for its own exit. |
| A panel on thick glass (`Popover`, `HoverCard`, `DropdownMenu`, `ContextMenu`) | The enter's transform backwards, no opacity: glass never fades (design-tokens docs/glass.md). |
| A sheet or drawer on glass | Slides fully out the way it came, no opacity. |
| Under reduced motion | A solid panel fades out over `--dur-fast`. A glass panel goes at once. |

## Press

A control that scales down while pressed (press 0.98, fast 120: the house values) reads `--motion-press` (0.98) over `transform var(--dur-fast) var(--ease-enter)`: `Button`, `IconButton`, the `Input` file button, `Checkbox`, `Radio`, the composer send button. `tests/md123-press.test.mjs` fails any other scale-down on `:active`. A disabled control never presses. `--motion-lift` (1.012) is the hover lift of a card, not a press. A hover fill is written inside `@media (hover: hover)`, so a touch screen never keeps it.

## Reduced motion

Under `prefers-reduced-motion: reduce` the tokens swap themselves, so a component needs no query of its own: `--dur-base`, `--dur-slow` and `--dur-modal` become the `--dur-fast` fade, `--shift-*` is 0, the enter scales are 1, `--dur-progress` is 0 and `--ease-emphasised` becomes `--ease-standard`. Movement, blur and scale are gone; opacity stays: an enter or an exit is a short cross-fade. The press stays, because it is brief feedback and not travel. `--ef-motion-guard` is the animation duration under reduce (0.01 ms for every element, so a looping animation stops); an overlay entrance or exit sets it to `--dur-fast` with `animation-name: ef-reduce-fade` (`ef-reduce-fade-out` for the closed state). A JavaScript animation checks `matchMedia('(prefers-reduced-motion: reduce)')` itself.

| Under reduce | What happens | Where |
|---|---|---|
| A loop that signals loading (`Spinner`, the `Button` spinner, `Skeleton`, `Loader`, an indeterminate `Progress`, a stream pulse) | Keeps running at its own duration and curve. A frozen spinner reads as a hung page. | Left out of the guard by name in `tokens/base.css`. |
| Any other loop (a caret, a marquee, a growing ring, a scaling bar) | Stops: one iteration, no delay. | The guard. |
| A transition that moves (a chevron turning, a tick or a dot scaling in) | Does not run; the new state shows at once. Opacity stays and fades over `--dur-fast`. | One rule in `tokens/base.css`. |
| The press scale | Stays. | Not touched. |

A product does not write its own reduce rule for any of this, and does not set `--ef-motion-guard` on a loop.

A page change (`@view-transition`, `document.startViewTransition`) cross-fades the old and the new snapshot. Under reduce `tokens/base.css` already runs that fade over `--dur-fast` and stops the groups, so a page writes no `::view-transition` reduce rule: `animation: none` there turns the fade into a hard cut. Under no-preference a page that people change many times a day sets `::view-transition-old(root), ::view-transition-new(root)` to `animation-duration: var(--dur-fast)` on `--ease-enter`, as the docs site does, instead of the browser's 250 ms `ease`.

## Theme switch

A theme swap changes every colour at once, so every transition is off for it. `swapTheme(fn)` (called by `ThemeToggle` and `browser/marketing.js`) sets `data-theme-switching` on `<html>`, runs the swap, and removes the attribute after two animation frames; the rule in `tokens/base.css` is `[data-theme-switching] * { transition: none !important }`. See the Swap row of the Theme contract in [theming.md](theming.md#theme-contract). A product deletes any local copy.
