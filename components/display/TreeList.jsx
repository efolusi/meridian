import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-tree{display:flex;flex-direction:column;gap:1px;font-size:var(--text-sm)}
.ef-tree__row{display:flex;align-items:center;gap:7px;height:30px;padding:0 8px;border:none;border-radius:var(--radius-sm);background:none;cursor:pointer;text-align:left;font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-secondary);width:100%;transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.ef-tree__row:hover{background:var(--surface-sunken);color:var(--text-primary)}
.ef-tree__row--sel{background:var(--accent-subtle);color:var(--brand-700);font-weight:var(--weight-semibold)}
.ef-tree__row--sel:hover{background:var(--accent-subtle);color:var(--brand-700)}
.ef-tree__row:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-tree__chev{display:inline-flex;color:var(--text-muted);transition:transform var(--dur-fast) var(--ease-out);flex:none}
.ef-tree__chev--open{transform:rotate(90deg)}
.ef-tree__icon{display:inline-flex;flex:none;color:var(--text-muted)}
.ef-tree__row--sel .ef-tree__icon{color:inherit}
.ef-tree__count{margin-left:auto;font-family:var(--font-mono);font-size:11px;color:var(--text-muted)}
`;
function Node({ node, depth, open, sel, toggle, select }) {
  const kids = node.children || [];
  const isOpen = open.includes(node.id);
  return (
    <React.Fragment>
      <button className={`ef-tree__row${sel === node.id ? ' ef-tree__row--sel' : ''}`} style={{ paddingLeft: 8 + depth * 18 }}
        onClick={() => { if (kids.length) toggle(node.id); select(node.id, node); }}>
        {kids.length ? <span className={`ef-tree__chev${isOpen ? ' ef-tree__chev--open' : ''}`}><Icon name="chevron-right" size={13} /></span> : <span style={{ width: 13, flex: 'none' }}></span>}
        {node.icon ? <span className="ef-tree__icon"><Icon name={node.icon} size={15} /></span> : null}
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.label}</span>
        {node.count != null ? <span className="ef-tree__count">{node.count}</span> : null}
      </button>
      {isOpen && kids.map(k => <Node key={k.id} node={k} depth={depth + 1} open={open} sel={sel} toggle={toggle} select={select} />)}
    </React.Fragment>
  );
}
export function TreeList({ nodes, value, onSelect, defaultOpen, style, className, ...rest }) {
  injectEfCss('ef-css-tree', CSS);
  const [open, setOpen] = React.useState(defaultOpen || nodes.filter(n => n.children).map(n => n.id));
  const [innerSel, setInnerSel] = React.useState(null);
  const sel = value != null ? value : innerSel;
  const toggle = id => setOpen(o => o.includes(id) ? o.filter(x => x !== id) : [...o, id]);
  const select = (id, node) => { if (value == null) setInnerSel(id); if (onSelect) onSelect(id, node); };
  return (
    <div {...rest} role="tree" className={`ef-tree${className ? ' ' + className : ''}`} style={style}>
      {nodes.map(n => <Node key={n.id} node={n} depth={0} open={open} sel={sel} toggle={toggle} select={select} />)}
    </div>
  );
}
