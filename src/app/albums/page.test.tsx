import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { listAlbums } from '@/app/actions/listAlbums'
import { auth } from '@/auth'

import AlbumsPage from './page'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/app/actions/listAlbums', () => ({
  listAlbums: vi.fn(),
}))

vi.mock('@/components/AlbumCard', () => ({
  default: ({ name }: { name: string }) => <div data-testid="album-card">{name}</div>,
}))

vi.mock('@/components/CreateAlbumForm', () => ({
  default: () => <div data-testid="create-album-form" />,
}))

// `auth` is overloaded in Auth.js, so vi.mocked(auth) resolves the middleware
// overload and rejects a session. Drive it through this handle instead.
const mockAuth = vi.mocked(auth as unknown as () => Promise<unknown>)
const list = vi.mocked(listAlbums)

describe('AlbumsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    list.mockResolvedValue([])
  })

  it('unauthenticated user sees sign-in-prompt', async () => {
    mockAuth.mockResolvedValue(null)
    render(await AlbumsPage())

    expect(screen.getByTestId('sign-in-prompt')).toHaveTextContent(
      'Sign in to see your albums',
    )
    // "renders ONLY the prompt" — the authenticated furniture must be absent.
    expect(screen.queryByRole('heading', { name: 'My Albums' })).not.toBeInTheDocument()
    expect(screen.queryByTestId('create-album-form')).not.toBeInTheDocument()
    expect(list).not.toHaveBeenCalled()
  })

  it('authenticated user with no albums sees empty-state and My Albums heading', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    render(await AlbumsPage())

    expect(screen.getByRole('heading', { name: 'My Albums' })).toBeInTheDocument()
    expect(screen.getByTestId('create-album-form')).toBeInTheDocument()
    expect(screen.getByTestId('empty-state')).toHaveTextContent('No albums yet')
  })
})
