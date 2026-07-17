# FeedbackBar

Quiet action row under an assistant message: thumbs up/down (toggle), copy, regenerate.

`<FeedbackBar copyText={msg} onFeedback={log} onRetry={rerun} note="gpt-answer · 2.1s" />`

Keep it ghost-quiet — it should disappear until hovered in dense threads. Wire onFeedback to your telemetry, not a toast.