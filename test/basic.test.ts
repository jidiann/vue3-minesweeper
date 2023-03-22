import { describe, expect, it } from 'vitest'

describe('TEST', () => {
  it('exported', () => {
    expect(5 + 8).toMatchInlineSnapshot('13')
  })
})
