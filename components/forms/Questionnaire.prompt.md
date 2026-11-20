Compose a multi-step form with `Questionnaire` and its explicit parts. Pass the same ordered `items` collection to the root that you map into `QuestionnaireItem` children so progress, navigation, validation, shortcuts, and server output agree.

```jsx
<Questionnaire items={items} onSubmit={save}>
  <QuestionnaireProgress />
  {items.map(item => <QuestionnaireItem key={item.name} name={item.name} required={item.required} multiple={item.multiple}>
    <QuestionnaireTitle>{item.prompt}</QuestionnaireTitle>
    <QuestionnaireDescription>{item.description}</QuestionnaireDescription>
    <QuestionnaireChoices>{item.choices.map(choice => <QuestionnaireChoice key={choice.value} value={choice.value}>{choice.label}</QuestionnaireChoice>)}</QuestionnaireChoices>
    <QuestionnaireError />
  </QuestionnaireItem>)}
  <QuestionnaireActions><QuestionnairePrevious /><QuestionnaireSkip /><QuestionnaireNext /><QuestionnaireSubmit /></QuestionnaireActions>
</Questionnaire>
```

Items render semantic `fieldset`/`legend` pairs. Choices are native radios or checkboxes, freeform answers use `QuestionnaireInput`, optional questions can be explicitly skipped, and controlled navigation uses `item` with `onItemChange`.

A `required` item adds " (required)" to its `QuestionnaireTitle`. The mark is part of the legend, so screen readers hear it with the question. Set `lang="id"` for " (wajib)", or `labels={{ required: '...' }}` to replace the whole suffix, brackets included.
