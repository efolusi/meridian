# Efolusi Docs — product demo

docs.efolusi.com: top bar with search, left nav tree, article with code blocks + callout, right table of contents. Interactive: sidebar switches between articles, copy buttons on code.

- `index.html` — interactive entry
- `DocsScreen.jsx` — DocsHeader, DocsNav, Article, Toc

Article prose 16px on `--container-text` measure; code blocks on espresso (`--surface-inverse`).

Starter twin: `starters/docs-page/` is the copyable multi-page journey for this category; this kit shows the layout as liftable plain JSX. When the layout changes in one, update the other.
