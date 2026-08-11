import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './Dialog.jsx';
import { Button } from '../forms/Button.jsx';
import { Input } from '../forms/Input.jsx';
export function ConfirmDialog({ open, onOpenChange, onConfirm, title, description, confirmLabel = 'Delete', cancelLabel = 'Cancel', tone = 'danger', typeToConfirm, children, ...rest }) {
  const [typed, setTyped] = React.useState('');
  React.useEffect(() => { if (!open) setTyped(''); }, [open]);
  const blocked = typeToConfirm ? typed !== typeToConfirm : false;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...rest}>
        <DialogHeader><DialogTitle>{title}</DialogTitle>{description ? <DialogDescription>{description}</DialogDescription> : null}</DialogHeader>
        <div className="ef-dialog__body">
          {children}
          {typeToConfirm ? (
            <Input label={`Type “${typeToConfirm}” to confirm`} value={typed} onChange={e => setTyped(e.target.value)} placeholder={typeToConfirm} style={children ? { marginTop: 14 } : undefined} />
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>{cancelLabel}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} disabled={blocked} onClick={() => { onConfirm?.(); onOpenChange?.(false); }}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
