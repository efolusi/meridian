# ContextMenu

Right-click menu anchored at the cursor. Wrap the target; items share the Menu item shape.

`<ContextMenu items={[{id:"rename",label:"Rename"},"separator",{id:"del",label:"Delete",danger:true}]} onSelect={run}><FileTile …/></ContextMenu>`

Every context-menu action must also exist somewhere visible — right-click is a shortcut, not the only path.