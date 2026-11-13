import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider, useSidebar } from '../components/navigation/Sidebar.jsx';

// Cmd/Ctrl+B is bold in every text field and rich-text editor. The sidebar
// listened on window and took the key from all of them.
function State() { return <output data-testid="state">{useSidebar().state}</output>; }

describe('Sidebar Cmd/Ctrl+B leaves editable targets alone', () => {
  it.each([
    ['input', () => <input aria-label="field" />],
    ['textarea', () => <textarea aria-label="field" />],
    ['select', () => <select aria-label="field"><option>a</option></select>],
    ['contenteditable', () => <div aria-label="field" contentEditable suppressContentEditableWarning><b>rich</b></div>],
  ])('%s', (_kind, field) => {
    render(<SidebarProvider><State />{field()}</SidebarProvider>);
    const target = screen.getByLabelText('field');
    const inner = target.querySelector('b') || target;
    const event = fireEvent.keyDown(inner, { key: 'b', ctrlKey: true });
    expect(screen.getByTestId('state').textContent).toBe('expanded');
    expect(event).toBe(true); // not prevented: the editor still gets its bold
  });

  it('still toggles from anywhere else', () => {
    render(<SidebarProvider><State /><button type="button">x</button></SidebarProvider>);
    fireEvent.keyDown(screen.getByText('x'), { key: 'b', metaKey: true });
    expect(screen.getByTestId('state').textContent).toBe('collapsed');
  });

  it('contenteditable="false" is not editable', () => {
    render(<SidebarProvider><State /><div data-testid="off" contentEditable={false}>x</div></SidebarProvider>);
    fireEvent.keyDown(screen.getByTestId('off'), { key: 'b', ctrlKey: true });
    expect(screen.getByTestId('state').textContent).toBe('collapsed');
  });
});
