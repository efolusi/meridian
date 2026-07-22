# ModelSelector

Compact model picker for composers: current model + provider on the trigger, panel with hint lines and badges.

`<ModelSelector value={m} onChange={setM} models={[{ id: 'ef-2', name: 'Efolusi 2', provider: 'Efolusi', hint: 'Best for agent runs', badge: 'New' }]} />`

Panel opens upward by default (composers sit at the bottom); side="bottom" for toolbars. For arbitrary options use Select.

Vocabulary: state-carrying selection fires `onChange`; command menus fire `onSelect`; placement is `side` (top/bottom/left/right). The `side` values 'up'/'down' are deprecated aliases for 'top'/'bottom' (one major).
