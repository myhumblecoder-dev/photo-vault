import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auth } from '@/auth'

import NavBar from './NavBar'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// `auth` is overloaded in Auth.js, so vi.mocked(auth) resolves the middleware
// overload and rejects a session. Drive it through this handle instead.
const mockAuth = vi.mocked(auth as unknown as () => Promise<unknown>)

// NavBar is an async server component: await it to get the element tree, which
// is what a server render does before anything reaches the client.
async function renderNavBar() {
  render(await NavBar())
}

describe('NavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue(null)
  })

  it('renders Photo Vault brand link and My Albums link', async () => {
    await renderNavBar()
    expect(screen.getByRole('link', { name: 'Photo Vault' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'My Albums' })).toHaveAttribute('href', '/albums')
  })

  it('unauthenticated state shows Sign in button', async () => {
    await renderNavBar()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.queryByTestId('user-name')).not.toBeInTheDocument()
  })

  it('authenticated state shows user name and Sign out button', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1', name: 'Thomas' } })
    await renderNavBar()
    expect(screen.getByTestId('user-name')).toHaveTextContent('Thomas')
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument()
  })
})
