# GeneratedImage

Image-generation frame with queued / generating (pulsing dot-grid on dark) / complete (fade-in, scrim, hover actions) / error (retry) states.

```jsx
<GeneratedImage status="generating" prompt="A lighthouse at dawn" aspect="video" />
<GeneratedImage src="/img.jpg" prompt="A lighthouse at dawn" actions={[{ icon: 'download', label: 'Download' }]} />
```
