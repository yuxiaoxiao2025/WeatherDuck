import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Icon } from '@/components/Icon'

describe('Icon', () => {
  it('renders lucide icon and is aria-hidden', () => {
    const { container } = render(<Icon name="Cloud" />)
    const el = container.querySelector('svg')!
    expect(el).toHaveAttribute('aria-hidden', 'true')
  })
})
