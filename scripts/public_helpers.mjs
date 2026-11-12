// Lowercase exports that are public API. Both builds read this one list: the
// CDN bundle attaches them to the window namespace and the npm build puts them
// on the root barrel. They used to keep separate copies, which drifted, and the
// npm barrel lost three helpers its own types still declared.
export const PUBLIC_HELPERS = Object.freeze([
  'badgeVariants',
  'buttonGroupVariants',
  'buttonVariants',
  'markerVariants',
  'navigationMenuTriggerStyle',
  'toast',
  'toggleVariants',
  'useChart',
  'useComboboxAnchor',
  'useDirection',
  'useMessageScroller',
  'useMessageScrollerScrollable',
  'useMessageScrollerVisibility',
  'useSidebar',
]);
