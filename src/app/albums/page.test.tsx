import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Page from './page'
import { auth } from '@/auth'
import { listAlbums } from '@/app/actions/listAlbums'
import AlbumCard from '@/components/AlbumCard'
import CreateAlbumForm from '@/components/CreateAlbumForm'

// next/font's loader only exists inside the Next build; under vitest
// `Geist(...)` is not a function and the suite dies at module load.
vi.mock('next/font/google', () => new Proxy({}, {
  get: () => () => ({ variable: 'mock-font-variable', className: 'mock-font' }),
}))

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

// `auth` is overloaded in Auth.js, so vi.mocked(auth) resolves
// the middleware overload and rejects a session. Drive it via:
//   mockAuth.mockResolvedValue({ user: { id: 'u1' } })
const mockAuth = vi.mocked(auth as unknown as () => Promise<unknown>)
const list = vi.mocked(listAlbums)

describe('Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('authenticated user with albums sees AlbumCard for each album', async () => {
    const mockAlbums = [
      { id: '1', name: 'Album 1', createdAt: new Date(), userId: 'u1', updatedAt: new Date() },
      { id: '2', name: 'Album 2', createdAt: new Date(), userId: 'u1', updatedAt: new Date() },
    ]
    mockAuth.mockResolvedValue({ user: { id: 'u1' } } as any)
    list.mockResolvedValue(mockAlbums as any)

    render(await Page())

    expect(screen.getByRole('heading', { name: 'My Albums' })).toBeInTheDocument()
    expect(screen.getAllByTestId('album-card')).toHaveLength(2)
    expect(screen.getByText('Album 1')).toBeInTheDocument()
    expect(screen.getByText('Album 2')).toBeInTheDocument()
  })

  it('CreateAlbumForm is rendered for authenticated user with albums', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } } as any)
    list.mockResolvedValue([{ id: '1', name: 'Album 1', createdAt: new Date(), userId: 'u1', updatedAt: new Date() }] as any)

    render(await Page())

    expect(screen.getByTestId('create-album-form')).toBeInTheDocument()
  })
})
