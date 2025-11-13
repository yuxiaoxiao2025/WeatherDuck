import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Card } from '@/components/Card'

describe('Card snapshot', () => {
  it('default glass variant', () => {
    const { container } = render(<Card>snapshot</Card>)
    expect(container.firstChild).toMatchSnapshot()
  })
})
