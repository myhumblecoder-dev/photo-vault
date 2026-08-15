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

  it('successful submit clears the input field and calls onCreated with returned album', async () => {
    const onCreated = vi.fn()
    create.mockResolvedValue({ id: 'album-7', name: 'Trip' })

    const user = userEvent.setup()
    render(<CreateAlbumForm onCreated={onCreated} />)
    const input = screen.getByPlaceholderText('Album name')
    await user.type(input, 'Trip')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith({
      id: 'album-7',
      name: 'Trip',
    }))
    expect(create).toHaveBeenCalledWith('Trip')
    expect(input).toHaveValue('')
  })

  it('error from action is displayed in album-error element', async () => {
    create.mockRejectedValue(new Error('Album name already exists'))

    const user = userEvent.setup()
    render(<CreateAlbumForm />)
    await user.type(screen.getByPlaceholderText('Album name'), 'Holiday')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    const error = await screen.findByTestId('album-error')
    expect(error).toHaveTextContent('Album name already exists')
  })
})
