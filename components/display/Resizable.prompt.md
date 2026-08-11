# Resizable

Build two-or-more pane workspaces with accessible, draggable separators.

```jsx
<ResizablePanelGroup orientation="horizontal">
  <ResizablePanel defaultSize={35} minSize={20}><FileTree /></ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel><Editor /></ResizablePanel>
</ResizablePanelGroup>
```

The group needs a bounded height. Separators support pointer dragging and arrow-key resizing.
