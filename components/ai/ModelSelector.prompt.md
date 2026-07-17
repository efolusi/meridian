# ModelSelector

Compact model picker for composers: current model + provider on the trigger, panel with hint lines and badges.

`<ModelSelector value={m} onChange={setM} models={[{ id: 'ef-2', name: 'Efolusi 2', provider: 'Efolusi', hint: 'Best for agent runs', badge: 'New' }]} />`

Panel opens upward by default (composers sit at the bottom); side="down" for toolbars. For arbitrary options use Select.