# Transcript

Time-synced transcript — active row derives from `currentTime`, auto-scroll keeps it centered (toggleable), timestamps jump the player, optional word-level highlight via `words`.

```jsx
<Transcript currentTime={t} onJump={s => player.current.jumpTo(s)} items={[
  { start: 0, speaker: 'Ada', text: 'Morning — shall we start?' },
  { start: 4.2, speaker: 'Efe', words: [{ t: 4.2, w: 'Yes,' }, { t: 4.6, w: 'pulling' }, { t: 5.0, w: 'it' }, { t: 5.2, w: 'up.' }] },
]} />
```
