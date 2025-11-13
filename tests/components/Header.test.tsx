import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '@/components/Layout'

describe('Header', () => {
  it('calls onRefresh when refresh button clicked', async () => {
    const onRefresh = vi.fn()
    const user = userEvent.setup()
    render(<Header onRefresh={onRefresh} />)
    await user.click(screen.getByLabelText('刷新天气'))
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('calls onSettings when settings button clicked', async () => {
    const onSettings = vi.fn()
    const user = userEvent.setup()
    render(<Header onSettings={onSettings} />)
    await user.click(screen.getByLabelText('打开设置'))
    expect(onSettings).toHaveBeenCalledTimes(1)
  })
})
