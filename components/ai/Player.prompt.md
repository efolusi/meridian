# Player

Audio player — seekable waveform (drag or click), ±10s skip, play/pause, mute, tabular timestamps. Expose a ref for `jumpTo` and pair with Transcript via `onTimeChange`.

```jsx
const ref = React.useRef(null);
<Player ref={ref} src="/call.mp3" title="Call with Voit" meta="12:40" onTimeChange={setT} />
```
