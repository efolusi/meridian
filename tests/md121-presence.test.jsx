import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Popover, PopoverContent, PopoverTrigger } from '../components/overlay/Popover.jsx'
import { Dialog, DialogContent, DialogTitle } from '../components/feedback/Dialog.jsx'
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from '../components/feedback/AlertDialog.jsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/feedback/Tooltip.jsx'
import { Toaster, toast } from '../components/feedback/Toast.jsx'

// MD121: an overlay that closes stays mounted, with data-state="closed", until its exit animation has ended, then
// unmounts. jsdom has no animations, so getAnimations is the one browser API faked here: it answers what a browser
// answers for a closed overlay, a CSS animation named ...-out that finishes when the test says so. A loop inside the
// overlay (a spinner) never finishes and must not hold the overlay up. With no running exit (reduced motion off the
// table, or no CSS loaded) the overlay unmounts at once, as it did before.
let exits
const exit = (name = 'ef-popover-out') => {
  let finish
  const finished = new Promise((resolve) => { finish = resolve })
  const animation = { animationName: name, effect: { getComputedTiming: () => ({ iterations: 1 }) }, finished }
  exits.push(animation)
  return { animation, finish }
}
let running
beforeEach(() => {
  exits = []
  running = []
  Element.prototype.getAnimations = function getAnimations() {
    // only an element that is closed, or holds a closed one, is running an exit
    if (this.getAttribute?.('data-state') === 'closed' || this.querySelector?.('[data-state="closed"]')) return running
    return []
  }
})
afterEach(() => { delete Element.prototype.getAnimations })

const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve() })

function PopoverCase({ open }) {
  return <Popover open={open}><PopoverTrigger>trigger</PopoverTrigger><PopoverContent>panel text</PopoverContent></Popover>
}

describe('Popover presence', () => {
  it('stays mounted, closed, while the exit runs, then unmounts', async () => {
    const e = exit()
    running = [e.animation]
    const { rerender } = render(<PopoverCase open />)
    const panel = screen.getByText('panel text')
    expect(panel.closest('[data-slot="popover-content"]').getAttribute('data-state')).toBe('open')
    rerender(<PopoverCase open={false} />)
    const closing = screen.getByText('panel text').closest('[data-slot="popover-content"]')
    expect(closing).toBe(panel.closest('[data-slot="popover-content"]'))
    expect(closing.getAttribute('data-state')).toBe('closed')
    await flush()
    expect(screen.queryByText('panel text')).not.toBeNull()
    e.finish()
    await flush()
    expect(screen.queryByText('panel text')).toBeNull()
  })

  it('unmounts at once when no exit is running', async () => {
    const { rerender } = render(<PopoverCase open />)
    expect(screen.queryByText('panel text')).not.toBeNull()
    rerender(<PopoverCase open={false} />)
    expect(screen.queryByText('panel text')).toBeNull()
  })

  it('ignores a loop: only animations named ...-out hold the overlay', async () => {
    const loop = { animationName: 'ef-spinner', effect: { getComputedTiming: () => ({ iterations: Infinity }) }, finished: new Promise(() => {}) }
    running = [loop]
    const { rerender } = render(<PopoverCase open />)
    rerender(<PopoverCase open={false} />)
    await flush()
    expect(screen.queryByText('panel text')).toBeNull()
  })

  it('a reopen during the exit keeps the same panel, open, and a late finish does not unmount it', async () => {
    const e = exit()
    running = [e.animation]
    const { rerender } = render(<PopoverCase open />)
    const panel = screen.getByText('panel text').closest('[data-slot="popover-content"]')
    rerender(<PopoverCase open={false} />)
    rerender(<PopoverCase open />)
    expect(screen.getByText('panel text').closest('[data-slot="popover-content"]')).toBe(panel)
    expect(panel.getAttribute('data-state')).toBe('open')
    e.finish()
    await flush()
    expect(screen.queryByText('panel text')).not.toBeNull()
  })
})

describe('Dialog presence', () => {
  const DialogCase = ({ open }) => <Dialog open={open}><DialogContent><DialogTitle>dialog title</DialogTitle></DialogContent></Dialog>

  it('the overlay and the panel both say closed while the exit runs, then both go', async () => {
    const e = exit('ef-pop-out')
    running = [e.animation]
    const { rerender } = render(<DialogCase open />)
    expect(document.querySelector('[data-slot="dialog-overlay"]').getAttribute('data-state')).toBe('open')
    rerender(<DialogCase open={false} />)
    expect(document.querySelector('[data-slot="dialog-overlay"]').getAttribute('data-state')).toBe('closed')
    expect(document.querySelector('[data-slot="dialog-content"]').getAttribute('data-state')).toBe('closed')
    e.finish()
    await flush()
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeNull()
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeNull()
  })

  it('unmounts at once when no exit is running', () => {
    const { rerender } = render(<DialogCase open />)
    rerender(<DialogCase open={false} />)
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeNull()
  })
})

describe('AlertDialog presence', () => {
  const Case = ({ open }) => <AlertDialog open={open}><AlertDialogContent><AlertDialogTitle>alert title</AlertDialogTitle></AlertDialogContent></AlertDialog>

  it('stays mounted, closed, until the exit ends', async () => {
    const e = exit('ef-alertdialog-pop-out')
    running = [e.animation]
    const { rerender } = render(<Case open />)
    rerender(<Case open={false} />)
    expect(document.querySelector('[data-slot="alert-dialog-content"]').getAttribute('data-state')).toBe('closed')
    e.finish()
    await flush()
    expect(document.querySelector('[data-slot="alert-dialog-content"]')).toBeNull()
  })
})

describe('Tooltip presence', () => {
  it('a closed tooltip stays until its exit ends', async () => {
    const e = exit('ef-tooltip-out')
    running = [e.animation]
    const Case = ({ open }) => <Tooltip open={open}><TooltipTrigger>tip trigger</TooltipTrigger><TooltipContent>tip text</TooltipContent></Tooltip>
    const { rerender } = render(<Case open />)
    expect(screen.queryByText('tip text')).not.toBeNull()
    rerender(<Case open={false} />)
    expect(screen.getByText('tip text').closest('[data-slot="tooltip-content"]').getAttribute('data-state')).toBe('closed')
    e.finish()
    await flush()
    expect(screen.queryByText('tip text')).toBeNull()
  })
})

describe('Toast presence', () => {
  afterEach(() => { act(() => { toast.close() }) })

  it('a dismissed toast stays, closed, in its place until its exit ends; the others stay open', async () => {
    const e = exit('ef-toast-out')
    render(<Toaster />)
    let first
    act(() => { first = toast.add({ title: 'first notice', duration: 0, type: 'info' }); toast.add({ title: 'second notice', duration: 0 }) })
    expect(screen.getByText('first notice').closest('[data-slot="toast"]').getAttribute('data-state')).toBe('open')
    running = [e.animation]
    act(() => { toast.close(first) })
    const closing = screen.getByText('first notice').closest('[data-slot="toast"]')
    expect(closing.getAttribute('data-state')).toBe('closed')
    expect(screen.getByText('second notice').closest('[data-slot="toast"]').getAttribute('data-state')).toBe('open')
    // still first in the stack: it did not jump
    const order = [...document.querySelectorAll('[data-slot="toast"]')].map((n) => n.textContent)
    expect(order[0]).toContain('first notice')
    e.finish()
    await flush()
    expect(screen.queryByText('first notice')).toBeNull()
    expect(screen.queryByText('second notice')).not.toBeNull()
  })

  it('leaves at once when no exit is running', () => {
    render(<Toaster />)
    let id
    act(() => { id = toast.add({ title: 'quick notice', duration: 0 }) })
    act(() => { toast.close(id) })
    expect(screen.queryByText('quick notice')).toBeNull()
  })
})
