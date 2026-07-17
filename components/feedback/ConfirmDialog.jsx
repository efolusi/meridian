import React from 'react';
import { Dialog } from './Dialog.jsx';
import { Button } from '../forms/Button.jsx';
import { Input } from '../forms/Input.jsx';
export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Delete', cancelLabel = 'Cancel', tone = 'danger', typeToConfirm, children }) {
  const [typed, setTyped] = React.useState('');
  React.useEffect(() => { if (!open) setTyped(''); }, [open]);
  const blocked = typeToConfirm ? typed !== typeToConfirm : false;
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}
      footer={
        <React.Fragment>
          <Button variant="ghost" onClick={onClose}>{cancelLabel}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} disabled={blocked} onClick={() => { if (onConfirm) onConfirm(); if (onClose) onClose(); }}>{confirmLabel}</Button>
        </React.Fragment>
      }>
      {children}
      {typeToConfirm ? (
        <Input label={`Type “${typeToConfirm}” to confirm`} value={typed} onChange={e => setTyped(e.target.value)} placeholder={typeToConfirm} style={children ? { marginTop: 14 } : undefined} />
      ) : null}
    </Dialog>
  );
}
