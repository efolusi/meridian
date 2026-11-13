import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Owner decision 2026-11-13: the website showcase drops links that go nowhere
// instead of shipping href="#" placeholders, the 404 block's way home is the
// site root, and the newsletter field has a label people can see.
const website = readFileSync('showcases/website/Sections.jsx', 'utf8')
const notFound = readFileSync('blocks/not-found.html', 'utf8')

describe('apps: links and labels', () => {
  it('website showcase has no href="#" links', () => {
    expect(website.match(/href="#"|\|\| '#'/g) || []).toEqual([])
  })

  it('404 block sends "Back to home" to the site root', () => {
    expect(notFound).toMatch(/<a href="\/"[^>]*>Back to home<\/a>/)
  })

  it('newsletter email field has a visible label tied to it', () => {
    const input = (website.match(/<Input\b[^>]*type="email"[^>]*>/) || [''])[0]
    const id = (input.match(/\bid="([^"]+)"/) || [])[1]
    expect(id).toBeTruthy()
    expect(website).toMatch(new RegExp(`<label htmlFor="${id}"`))
  })
})
