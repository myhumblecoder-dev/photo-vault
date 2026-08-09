import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Page from './page'

// next/font's loader only exists inside the Next build; under vitest
// `Geist(...)` is not a function and the suite dies at module load.
vi.mock('next/font/google', () => new Proxy({}, {
  get: () => () => ({ variable: 'mock-font-variable', className: 'mock-font' }),
}))

describe('Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the getting started heading', async () => {
    render(<Page />)
    const heading = screen.getByRole('heading', { name: /to get started, edit the page\.tsx file\./i })
    expect(heading).toBeInTheDocument()
  })

  it('links to the Next.js templates page', async () => {
    render(<Page />)
    const link = screen.getByRole('link', { name: 'Templates' })
    expect(link).toHaveAttribute('href', 'https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app')
  })
})
