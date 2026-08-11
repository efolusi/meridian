// Typography is a styling guide, not a component package. Meridian keeps the
// recipe on semantic HTML and stable design tokens instead of exporting wrappers
// that would make migration less portable.
export const typographyRecipe = {
  elements: ['h1', 'h2', 'h3', 'h4', 'p', 'blockquote', 'table', 'ul', 'code', 'small'],
  roles: ['lead', 'large', 'muted'],
  tokens: ['--font-display', '--font-body', '--font-mono', '--text-primary', '--text-muted'],
};
