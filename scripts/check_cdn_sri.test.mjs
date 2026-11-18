import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readPins, scan, sri } from './check_cdn_sri.mjs'

const URL_A = 'https://unpkg.com/react@18.3.1/umd/react.production.min.js'
const HASH_A = 'sha384-AAAA'
const pins = new Map([[URL_A, HASH_A]])

test('readPins pairs each *_URL with the *_SRI that follows it', () => {
  const src = `var REACT_URL = "${URL_A}";\n  var REACT_SRI = "${HASH_A}";\n  var OTHER_URL = "x";`
  assert.deepEqual([...readPins(src)], [[URL_A, HASH_A]])
})

test('a tag with the pinned hash and crossorigin passes, attribute order aside', () => {
  assert.deepEqual(scan(`<script src="${URL_A}" integrity="${HASH_A}" crossorigin="anonymous"></script>`, pins), [])
  assert.deepEqual(scan(`<script crossorigin="anonymous" integrity="${HASH_A}" src="${URL_A}"></script>`, pins), [])
})

test('the concatenated snippet form used by the docs pages is checked too', () => {
  const ok = `'<' + SC + ' src="${URL_A}" integrity="${HASH_A}" crossorigin="anonymous"></' + SC + '>'`
  const bad = `'<' + SC + ' src="${URL_A}"></' + SC + '>'`
  assert.deepEqual(scan(ok, pins), [])
  assert.deepEqual(scan(bad, pins).map((p) => p.problem), ['missing integrity=', 'missing crossorigin="anonymous"'])
})

test('a wrong hash, an unpinned URL and a missing crossorigin each fail', () => {
  const wrong = scan(`<script src="${URL_A}" integrity="sha384-BBBB" crossorigin="anonymous"></script>`, pins)
  assert.match(wrong[0].problem, /does not match/)
  const unpinned = scan('<script src="https://cdn.jsdelivr.net/npm/x@1/x.js" integrity="sha384-C" crossorigin="anonymous"></script>', pins)
  assert.match(unpinned[0].problem, /not pinned/)
  const noCors = scan(`<script src="${URL_A}" integrity="${HASH_A}"></script>`, pins)
  assert.deepEqual(noCors.map((p) => p.problem), ['missing crossorigin="anonymous"'])
})

test('non-CDN hosts and the problem line number', () => {
  assert.deepEqual(scan('<script src="https://meridian.efolusi.com/_ds_bundle.js"></script>', pins), [])
  assert.equal(scan(`line one\n<script src="${URL_A}"></script>`, pins)[0].line, 2)
})

test('sri matches openssl dgst -sha384 -binary | base64', () => {
  assert.equal(sri(Buffer.from('abc')), 'sha384-ywB1P0WjXou1oD1pmsZQBycsMqsO3tFjGotgWkP/W+2AhgcroefMI1i67KE0yCWn')
})
