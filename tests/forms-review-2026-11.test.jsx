// Regression tests for defects found in the 2026-11-12 forms review.
// Each describe block pins one fix; every test failed before its fix landed.
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '../components/forms/Switch.jsx';
import { NumberInput } from '../components/forms/NumberInput.jsx';
import { Slider } from '../components/forms/Slider.jsx';
import { ButtonTile } from '../components/forms/ButtonTile.jsx';
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from '../components/forms/Combobox.jsx';
import {
  Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoices,
  QuestionnaireItem, QuestionnaireNext, QuestionnaireTitle,
} from '../components/forms/Questionnaire.jsx';

describe('Switch label', () => {
  it('names the switch after its label and toggles when the label is clicked', () => {
    const change = vi.fn();
    render(<Switch label="Auto-retry" onCheckedChange={change} />);
    const control = screen.getByRole('switch', { name: 'Auto-retry' });
    fireEvent.click(screen.getByText('Auto-retry'));
    expect(change).toHaveBeenCalledWith(true);
    expect(control.getAttribute('aria-checked')).toBe('true');
  });

  it('does not toggle from the label when disabled', () => {
    const change = vi.fn();
    render(<Switch label="Locked" disabled onCheckedChange={change} />);
    fireEvent.click(screen.getByText('Locked'));
    expect(change).not.toHaveBeenCalled();
  });
});

describe('NumberInput', () => {
  it('wires hint and error to the input with aria-describedby', () => {
    const { rerender } = render(<NumberInput label="Seats" hint="Whole seats only." />);
    const input = screen.getByRole('textbox', { name: 'Seats' });
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.getElementById(input.getAttribute('aria-describedby')).textContent).toBe('Whole seats only.');
    rerender(<NumberInput label="Seats" error="Too many seats." />);
    const ids = screen.getByRole('textbox', { name: 'Seats' }).getAttribute('aria-describedby').split(' ');
    expect(ids.map(id => document.getElementById(id)?.textContent)).toContain('Too many seats.');
    expect(screen.getByRole('alert').textContent).toContain('Too many seats.');
  });

  it('keeps a caller aria-describedby alongside its own note', () => {
    render(<><p id="extra">Extra</p><NumberInput label="Seats" hint="Hint" aria-describedby="extra" /></>);
    expect(screen.getByRole('textbox', { name: 'Seats' }).getAttribute('aria-describedby').split(' ')).toContain('extra');
  });

  it('does not step when readOnly', () => {
    const change = vi.fn();
    render(<NumberInput aria-label="Qty" readOnly defaultValue={3} onChange={change} />);
    const input = screen.getByRole('textbox', { name: 'Qty' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Home' });
    expect(change).not.toHaveBeenCalled();
    expect(input.value).toBe('3');
    for (const button of document.querySelectorAll('.ef-number__step')) expect(button.disabled).toBe(true);
  });

  it('commits the typed draft on Enter so a submit handler sees it', () => {
    const change = vi.fn();
    render(<NumberInput aria-label="Qty" onChange={change} />);
    const input = screen.getByRole('textbox', { name: 'Qty' });
    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(change).toHaveBeenCalledWith(42, expect.anything());
  });
});

describe('Slider', () => {
  it('puts the id on the first thumb only', () => {
    render(<Slider id="price" defaultValue={[10, 60]} aria-label="Price" />);
    expect(document.querySelectorAll('#price')).toHaveLength(1);
  });

  it('commits on PageUp and PageDown like the other step keys', () => {
    const commit = vi.fn();
    render(<Slider defaultValue={[10]} aria-label="Level" onValueCommit={commit} />);
    const thumb = screen.getByRole('slider', { name: 'Level' });
    fireEvent.keyUp(thumb, { key: 'PageUp' });
    fireEvent.keyUp(thumb, { key: 'PageDown' });
    expect(commit).toHaveBeenCalledTimes(2);
  });
});

describe('ButtonTile', () => {
  it('does not submit the surrounding form', () => {
    const submit = vi.fn(event => event.preventDefault());
    render(<form onSubmit={submit}><ButtonTile title="Team" selected={false} onClick={() => {}} /></form>);
    fireEvent.click(screen.getByRole('button', { name: /Team/ }));
    expect(submit).not.toHaveBeenCalled();
  });

  it('still lets a caller opt into submit', () => {
    const submit = vi.fn(event => event.preventDefault());
    render(<form onSubmit={submit}><ButtonTile type="submit" title="Team" /></form>);
    fireEvent.click(screen.getByRole('button', { name: /Team/ }));
    expect(submit).toHaveBeenCalledTimes(1);
  });
});

function Fruit(props) {
  return <Combobox items={['Apple', 'Banana', 'Cherry']} {...props}>
    <ComboboxInput aria-label="Fruit" />
    <ComboboxContent><ComboboxList>{item => <ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent>
  </Combobox>;
}

describe('Combobox', () => {
  it('ignores Enter while an IME composition is in progress', () => {
    const change = vi.fn();
    render(<Fruit onValueChange={change} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(change).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(change).toHaveBeenCalledWith('Apple');
  });

  it('drops aria-activedescendant while the list is closed', () => {
    render(<Fruit />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    fireEvent.focus(input);
    expect(input.getAttribute('aria-activedescendant')).toBeTruthy();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('shows the new label when a controlled value changes from outside', () => {
    const { rerender } = render(<Fruit value="Apple" />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    expect(input.value).toBe('Apple');
    rerender(<Fruit value="Cherry" />);
    expect(input.value).toBe('Cherry');
    rerender(<Fruit value={null} />);
    expect(input.value).toBe('');
  });

  it('keeps the label after the user picks an item in a controlled combobox', async () => {
    function Controlled() { const [v, setV] = React.useState(null); return <Fruit value={v} onValueChange={setV} />; }
    const user = userEvent.setup();
    render(<Controlled />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(input);
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(input.value).toBe('Banana');
  });
});

describe('Questionnaire letter shortcuts', () => {
  const items = [{ name: 'size', required: true, choices: ['a', 'b', 'c', 'd', 'e'].map(value => ({ value })) }, { name: 'next' }];
  it('only reacts to single-character keys', () => {
    render(<Questionnaire items={items} shortcuts="letters" onSubmit={event => event.preventDefault()}>
      <QuestionnaireItem name="size" required>
        <QuestionnaireTitle>Size</QuestionnaireTitle>
        <QuestionnaireChoices>{items[0].choices.map(choice => <QuestionnaireChoice key={choice.value} value={choice.value}>{choice.value.toUpperCase()}</QuestionnaireChoice>)}</QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireActions><QuestionnaireNext /></QuestionnaireActions>
    </Questionnaire>);
    const next = screen.getByRole('button', { name: 'Next' });
    // 'Enter'.charAt(0) is 'e', 'ArrowDown' starts with 'a': neither may pick a choice.
    fireEvent.keyDown(next, { key: 'Enter' });
    fireEvent.keyDown(next, { key: 'ArrowDown' });
    expect(screen.getByRole('radio', { name: 'E' }).checked).toBe(false);
    expect(screen.getByRole('radio', { name: 'A' }).checked).toBe(false);
    fireEvent.keyDown(next, { key: 'b' });
    expect(screen.getByRole('radio', { name: 'B' }).checked).toBe(true);
  });
});

describe('select padding follows writing direction', () => {
  it('uses logical padding instead of a [dir="rtl"] override', async () => {
    const { NativeSelect } = await import('../components/forms/NativeSelect.jsx');
    const { Select, SelectTrigger, SelectValue } = await import('../components/forms/Select.jsx');
    render(<><NativeSelect aria-label="n"><option>a</option></NativeSelect><Select><SelectTrigger><SelectValue /></SelectTrigger></Select></>);
    for (const id of ['ef-css-native-select', 'ef-css-select']) {
      const css = document.getElementById(id).textContent;
      expect(css).not.toContain('[dir="rtl"]');
      expect(css).toContain('padding-inline:');
    }
  });
});

describe('disabled labels do not advertise a click', () => {
  it('drops the pointer cursor on disabled Checkbox and Switch labels', async () => {
    const { Checkbox } = await import('../components/forms/Checkbox.jsx');
    const { container } = render(<><Checkbox disabled label="Locked check" /><Switch disabled label="Locked switch" /></>);
    expect(document.getElementById('ef-css-check').textContent).toContain('.ef-check--disabled .ef-check__label{cursor:not-allowed}');
    expect(document.getElementById('ef-css-switch').textContent).toContain('.ef-switch-field[data-disabled]{cursor:not-allowed}');
    expect(container.querySelector('.ef-switch-field').hasAttribute('data-disabled')).toBe(true);
  });
});
