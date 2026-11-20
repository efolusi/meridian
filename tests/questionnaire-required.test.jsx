import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoices, QuestionnaireError,
  QuestionnaireItem, QuestionnaireNext, QuestionnaireTitle,
} from '../components/forms/Questionnaire.jsx';

// MD19 (#181): the fieldset may not carry aria-required, so a required item says so in its
// legend, which names the group for screen readers, and shows an error when left empty.
const items = [
  { name: 'tools', required: true, multiple: true, choices: [{ value: 'git' }, { value: 'ci' }] },
  { name: 'note', choices: [{ value: 'none' }] },
];

function Fixture({ lang, labels }) {
  return (
    <Questionnaire items={items} onSubmit={(e) => e.preventDefault()}>
      <QuestionnaireItem name="tools" required multiple>
        <QuestionnaireTitle lang={lang} labels={labels}>Which tools do you use?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="git">Git</QuestionnaireChoice>
          <QuestionnaireChoice value="ci">CI</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError>Choose at least one tool.</QuestionnaireError>
      </QuestionnaireItem>
      <QuestionnaireItem name="note"><QuestionnaireTitle>Anything else?</QuestionnaireTitle></QuestionnaireItem>
      <QuestionnaireActions><QuestionnaireNext /></QuestionnaireActions>
    </Questionnaire>
  );
}

describe('Questionnaire required items', () => {
  it('names a required checkbox group with a visible required mark in its legend', () => {
    render(<Fixture />);
    expect(screen.getByRole('group', { name: 'Which tools do you use? (required)' })).toBeTruthy();
  });

  it('takes the mark in Indonesian', () => {
    render(<Fixture lang="id" />);
    expect(screen.getByRole('group', { name: 'Which tools do you use? (wajib)' })).toBeTruthy();
  });

  it('lets labels replace the whole suffix, brackets included', () => {
    render(<Fixture labels={{ required: ' [required]' }} />);
    expect(screen.getByRole('group', { name: 'Which tools do you use? [required]' })).toBeTruthy();
  });

  it('adds no mark to an optional item', () => {
    const { container } = render(<Fixture />);
    expect(container.querySelectorAll('.ef-questionnaire__required')).toHaveLength(1);
  });

  it('shows the error when the required checkbox item is left empty', () => {
    render(<Fixture />);
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('alert').textContent).toBe('Choose at least one tool.');
  });
});
