import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders with glass variant by default', () => {
    const { container } = render(<Card>content</Card>)
    expect(container.firstChild).toHaveClass('backdrop-blur-md')
  })

  it('applies hover styles when hoverable', () => {
    const { container } = render(<Card hoverable>content</Card>)
    expect(container.firstChild).toHaveClass('hover:-translate-y-1')
  })
})

