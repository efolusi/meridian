import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoices,
  QuestionnaireDescription, QuestionnaireError, QuestionnaireInput, QuestionnaireItem,
  QuestionnaireNext, QuestionnairePrevious, QuestionnaireProgress, QuestionnaireSkip,
  QuestionnaireSubmit, QuestionnaireTitle,
} from '../components/forms/Questionnaire.jsx';

const items = [
  { name: 'scope', required: true, choices: [{ value: 'small' }, { value: 'full' }] },
  { name: 'detail', required: false, choices: [{ value: 'tests' }] },
];

function Fixture({ onSubmit = event => event.preventDefault(), ...rootProps }) {
  return <Questionnaire items={items} onSubmit={onSubmit} {...rootProps}>
    <QuestionnaireProgress />
    <QuestionnaireItem name="scope" required>
      <QuestionnaireTitle>Choose scope</QuestionnaireTitle>
      <QuestionnaireDescription>One answer is required.</QuestionnaireDescription>
      <QuestionnaireChoices>
        <QuestionnaireChoice value="small">Small patch</QuestionnaireChoice>
        <QuestionnaireChoice value="full">Complete area</QuestionnaireChoice>
      </QuestionnaireChoices>
      <QuestionnaireError />
    </QuestionnaireItem>
    <QuestionnaireItem name="detail">
      <QuestionnaireTitle>Add detail</QuestionnaireTitle>
      <QuestionnaireChoices><QuestionnaireChoice value="tests">Tests</QuestionnaireChoice><QuestionnaireInput aria-label="Other detail" /></QuestionnaireChoices>
      <QuestionnaireError />
    </QuestionnaireItem>
    <QuestionnaireActions><QuestionnairePrevious /><QuestionnaireSkip /><QuestionnaireNext /><QuestionnaireSubmit /></QuestionnaireActions>
  </Questionnaire>;
}

describe('Questionnaire compatibility contract', () => {
  it('renders semantic progress, fieldset, legend, and native choices', () => {
    render(<Fixture />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('1');
    expect(screen.getByRole('group', { name: 'Choose scope' }).hidden).toBe(false);
    expect(screen.getByRole('radio', { name: 'Small patch' }).getAttribute('name')).toBe('scope');
  });

  it('validates before navigation and then advances after an answer', () => {
    render(<Fixture />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('alert').textContent).toContain('Choose an answer');
    fireEvent.click(screen.getByRole('radio', { name: 'Complete area' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('group', { name: 'Add detail' }).hidden).toBe(false);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('2');
  });

  it('supports explicit skip, previous navigation, and submit', () => {
    const submit = vi.fn(event => event.preventDefault());
    render(<Fixture onSubmit={submit} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Small patch' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(submit).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByRole('group', { name: 'Choose scope' }).hidden).toBe(false);
  });

  it('supports controlled navigation', () => {
    const change = vi.fn();
    render(<Fixture item="detail" onItemChange={change} />);
    expect(screen.getByRole('group', { name: 'Add detail' }).hidden).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(change).toHaveBeenCalledWith('scope');
  });
});
