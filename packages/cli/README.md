# Meridian CLI

Copies Meridian components into your project as source you own: the `.jsx`
file, its `.d.ts` types and its `.prompt.md` usage notes, plus every Meridian
item it imports. Files come from the public registry at
`https://meridian.efolusi.com/site/registry/`.

The CLI has no runtime dependencies. It needs Node.js 20.10 or newer.

## Usage

```sh
npx @efolusi/meridian-cli add button
npx @efolusi/meridian-cli add dialog tabs --dir src/ui
npx @efolusi/meridian-cli list
```

Installed as a development dependency, the command is `meridian`:

```sh
npm install --save-dev @efolusi/meridian-cli
npx meridian add button --dry-run
```

`add` reads each item's `registryDependencies` and adds those items too, so
`add button` also writes the shared stylesheet and tokens (`meridian-base`) and
`Icon`. Files keep their registry paths under `--dir`, for example
`components/forms/Button.jsx`, because the components import each other by
relative path. When it finishes, `add` prints the npm packages the files
import. It does not run `npm install` for you.

Two files differ from the repository so they work in a bundled app.
`components/icons/Icon.jsx` reads every glyph from the generated
`components/icons/_svg.js` instead of fetching SVG files. `tokens/fonts.css`
loads the brand fonts from the published `@efolusi/meridian-tokens` package
on jsDelivr, pinned to the release. To self-host the fonts, copy that package's
`assets/fonts/` into your app and change the `url()`s.

## Options

| Option | Effect |
|---|---|
| `--registry <url\|dir>` | Where to read items. An `http://` or `https://` URL of the folder that holds `<name>.json`, or a local directory with the same layout. Default: the hosted registry. |
| `--dir <path>` | Where files are written. Default: the current directory. |
| `--dry-run` | Print what `add` would write and write nothing. |
| `--overwrite` | Replace files that exist with different content. |
| `-h`, `--help` | Show help. |
| `-v`, `--version` | Show the CLI version. |

`list` reads the index `registry.json` that sits next to the item folder
(`/site/registry.json` on the hosted site). A local directory without that file
is listed by reading its items.

To work offline, point `--registry` at a checkout of the Meridian repository:

```sh
npx @efolusi/meridian-cli add button --registry ../meridian/site/registry
```

## Existing files

By default `add` writes nothing if any file it needs already exists with
different content. It lists those files and exits with code `1`. A file that
already has the same content is reported as `unchanged` and left alone. Pass
`--overwrite` to replace the differing files, or `--dir` to write somewhere
else.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Done (or the dry run finished). |
| `1` | Files exist with different content. Nothing was written. |
| `2` | Usage error: unknown command or option, missing item name, unsupported `--registry` scheme. |
| `3` | Registry error: unreachable, item not found, invalid JSON, or an item with unsafe content. |
| `4` | File system error, or a target that would leave `--dir` through a symlink. |

## What the CLI refuses

The CLI treats registry JSON as untrusted input. It stops with an error, and
writes nothing, when:

- an item name is anything other than lowercase letters, digits and hyphens;
- a file target is absolute, starts with a drive letter, contains `..`, `.`,
  an empty segment, a backslash, or a control character such as NUL;
- a folder or file name in a target uses anything other than ASCII letters,
  digits and `. _ @ + -` (this rules out `%2e%2e`, lookalike dots and slashes,
  bidi and zero-width characters, and `:`), ends in `.`, is `.git`, or is a
  Windows device name such as `nul` or `com1`;
- a target would resolve outside `--dir`, including through a symlinked folder
  inside it, or the target file is itself a symlink (writes also open the file
  with `O_NOFOLLOW`, so a link swapped in after the check fails the write);
- an item names itself differently from the file it came from, or lists an
  npm dependency that is not a plain package name;
- a `registryDependencies` URL points anywhere other than the registry in use or
  Meridian's hosted registry;
- two items write the same path with different content;
- a response is larger than 4 MiB, or a server redirects to a different origin.
  Same-origin redirects are followed, up to five.

`--registry` accepts only `http://`, `https://` or a local directory.

Registry text that reaches your terminal (`list` descriptions, error messages)
has control, bidi and zero-width characters replaced with spaces. In the
printed `npm install` line, a version range with shell operators such as
`>=1 <2` is wrapped in double quotes.

## License

MIT. Copied component files are yours to edit; no attribution is required.
