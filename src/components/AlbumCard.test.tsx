import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AlbumCard from './AlbumCard'

describe('AlbumCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders album name', async () => {
    const props = {
      id: '1',
      name: 'Summer Vacation',
      createdAt: new Date('2023-06-01'),
      href: '/albums/1',
    }
    render(<AlbumCard {...props} />)
    expect(screen.getByText('Summer Vacation')).toBeInTheDocument()
  })

  it('renders formatted date as MMM d yyyy', async () => {
    const props = {
      id: '1',
      name: 'Summer Vacation',
      createdAt: new Date('2023-06-01T12:00:00'),
      href: '/albums/1',
    }
    render(<AlbumCard {...props} />)
    expect(screen.getByText('Jun 1, 2023')).toBeInTheDocument()
  })

  it('album-link href matches href prop', async () => {
    const props = {
      id: '1',
      name: 'Summer Vacation',
      createdAt: new Date('2023-06-01'),
      href: '/albums/1',
    }
    render(<AlbumCard {...props} />)
    const link = screen.getByTestId('album-link')
    expect(link).toHaveAttribute('href', '/albums/1')
  })
})
