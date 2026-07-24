import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { Slider } from '../components/forms/Slider.jsx';
import { RichComposer } from '../components/ai/RichComposer.jsx';
import { PromptSteps } from '../components/ai/PromptSteps.jsx';
import { Player } from '../components/ai/Player.jsx';

// onSubmit receives { text, mentions }, not a bare string.
// The three stateful components the keyboard/interaction suite had not yet
// reached. Contracts asserted against observable behaviour: the value a control
// reports, the handler it calls, the state it advances to. No jest-dom matchers
// (this repo does not load them); DOM properties and plain expectations only.

describe('Slider', () => {
  it('reports a number to onChange and updates when uncontrolled', () => {
    const onChange = vi.fn();
    render(<Slider label="Volume" defaultValue={20} min={0} max={100} step={5} onChange={onChange} />);
    const input = screen.getByRole('slider');
    fireEvent.change(input, { target: { value: '40' } });
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toBe(40);
    expect(input.value).toBe('40');
  });

  it('is controllable: onChange fires, the displayed value follows the prop', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Slider value={30} onChange={onChange} />);
    const input = screen.getByRole('slider');
    expect(input.value).toBe('30');
    fireEvent.change(input, { target: { value: '80' } });
    expect(onChange).toHaveBeenCalledWith(80, expect.anything());
    rerender(<Slider value={80} onChange={onChange} />);
    expect(input.value).toBe('80');
  });

  it('forwards min, max, step and disables', () => {
    render(<Slider min={10} max={20} step={2} disabled value={12} onChange={() => {}} />);
    const input = screen.getByRole('slider');
    expect(input.min).toBe('10');
    expect(input.max).toBe('20');
    expect(input.step).toBe('2');
    expect(input.disabled).toBe(true);
  });
});

describe('RichComposer', () => {
  it('send is disabled until there is content, then submits the text', () => {
    const onSubmit = vi.fn();
    render(<RichComposer onSubmit={onSubmit} />);
    const send = screen.getByRole('button', { name: 'Send' });
    expect(send.disabled).toBe(true);
    const editor = screen.getByRole('textbox');
    editor.textContent = 'hello team';
    fireEvent.input(editor);
    expect(send.disabled).toBe(false);
    fireEvent.click(send);
    expect(onSubmit).toHaveBeenCalledWith({ text: 'hello team', mentions: [] });
  });

  it('Enter submits, Shift+Enter does not', () => {
    const onSubmit = vi.fn();
    render(<RichComposer onSubmit={onSubmit} />);
    const editor = screen.getByRole('textbox');
    editor.textContent = 'ship it';
    fireEvent.input(editor);
    fireEvent.keyDown(editor, { key: 'Enter', shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.keyDown(editor, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith({ text: 'ship it', mentions: [] });
  });
});

describe('PromptSteps', () => {
  const steps = [
    { name: 'tone', question: 'Tone?', options: ['Formal', 'Friendly', 'Direct'] },
    { name: 'length', question: 'Length?', options: ['Short', 'Long'] },
  ];

  it('ArrowDown then Enter answers the highlighted option and advances', () => {
    const onAnswer = vi.fn();
    render(<PromptSteps steps={steps} onAnswer={onAnswer} />);
    const root = document.querySelector('.ef-promptsteps');
    root.focus();
    fireEvent.keyDown(root, { key: 'ArrowDown' }); // highlight 0 -> 1 (Friendly)
    fireEvent.keyDown(root, { key: 'Enter' });
    expect(onAnswer).toHaveBeenCalledWith('Friendly', expect.objectContaining({ name: 'tone', stepIndex: 0 }));
    expect(screen.getByText(/Length/)).toBeTruthy(); // advanced to step 2
  });

  it('clicking an option answers it', () => {
    const onAnswer = vi.fn();
    render(<PromptSteps steps={steps} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole('button', { name: /Formal/ }));
    expect(onAnswer).toHaveBeenCalledWith('Formal', expect.anything());
  });

  it('fires onComplete with every answer after the last step', () => {
    const onComplete = vi.fn();
    render(<PromptSteps steps={steps} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /Formal/ }));
    fireEvent.click(screen.getByRole('button', { name: /Short/ }));
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ tone: 'Formal', length: 'Short' }));
  });
});

describe('Player', () => {
  // No src, so no <audio> element and none of jsdom's media gaps; the waveform
  // slider is keyboard-operable on its own. dur is 0 without metadata, and
  // jumpTo's `dur || s` fallback means a keyboard step lands on the raw seconds.
  it('the waveform slider seeks by keyboard', () => {
    const onTimeChange = vi.fn();
    render(<Player title="Clip" peaks={[0.2, 0.5, 0.8]} onTimeChange={onTimeChange} />);
    const wave = screen.getByRole('slider', { name: 'Seek' });
    expect(wave.tabIndex).toBe(0);
    fireEvent.keyDown(wave, { key: 'ArrowRight' });
    expect(onTimeChange).toHaveBeenLastCalledWith(5);
    fireEvent.keyDown(wave, { key: 'ArrowLeft' });
    expect(onTimeChange).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(wave, { key: 'Home' });
    expect(onTimeChange).toHaveBeenLastCalledWith(0);
  });
});
