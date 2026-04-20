import { describe, expect, it } from 'vitest'
import { resolvePromptValue } from './github-helper'

describe('resolvePromptValue', () => {
  it('uses the explicit message when one is provided', () => {
    expect(resolvePromptValue('default title', 'custom message', true)).toBe(
      'custom message',
    )
  })

  it('uses the default message in non-interactive mode', () => {
    expect(resolvePromptValue('default title', null, true)).toBe('default title')
  })

  it('returns null when interactive mode still needs user input', () => {
    expect(resolvePromptValue('default title', null, false)).toBeNull()
  })
})
