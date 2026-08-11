import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createAlbum } from '@/app/actions/createAlbum'

import CreateAlbumForm from './CreateAlbumForm'

vi.mock('@/app/actions/createAlbum', () => ({
  createAlbum: vi.fn(),
}))

const create = vi.mocked(createAlbum)

describe('CreateAlbumForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    create.mockResolvedValue({ id: 'album-1', name: 'Holiday' })
  })

  it('renders album name input with placeholder Album name', () => {
    render(<CreateAlbumForm />)
    expect(screen.getByPlaceholderText('Album name')).toHaveAttribute(
      'name',
      'albumName',
    )
  })

  it('renders Create button', () => {
    render(<CreateAlbumForm />)
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('submit button shows Creating and is disabled while action is pending', async () => {
    // Hold the action open so the pending state is observable rather than a
    // race — resolving it later is what makes this assertion deterministic.
    let release: (album: { id: string; name: string }) => void = () => {}
    create.mockReturnValue(
      new Promise((resolve) => {
        release = resolve
      }),
    )

    const user = userEvent.setup()
    render(<CreateAlbumForm />)
    await user.type(screen.getByPlaceholderText('Album name'), 'Holiday')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    const button = await screen.findByRole('button', { name: 'Creating…' })
    expect(button).toBeDisabled()

    release({ id: 'album-1', name: 'Holiday' })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled(),
    )
  })
})
